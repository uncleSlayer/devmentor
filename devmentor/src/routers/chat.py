from fastapi import APIRouter, Request, HTTPException
from src.database.model import UserQuestion, User, AiAnswer, Conversation
from src.token_verify import verify_token
from sqlmodel import Session, select
from src.database.connection import engine
from src.langgraph.graph import generate_answer
from src.docker import run_ai_answer_code
from pydantic import BaseModel


router = APIRouter()


@router.post("/chat/new")
def question(question: UserQuestion, request: Request):
    """
    This endpoint is used to ask a new question to the AI. This also starts a new conversation in the database.
    """

    question = question.question

    token = request.cookies.get("auth_token")

    payload = verify_token(token)

    user_email = payload.get("email")

    if not user_email:
        raise HTTPException(status_code=401, detail="Not authenticated")

    with Session(engine) as session:

        statement = select(User).where(User.email == user_email)

        existing_user = session.exec(statement).first()

        if not existing_user:
            raise HTTPException(status_code=401, detail="User does not exist")

        conversation = Conversation(user_id=existing_user.id)
        session.add(conversation)
        session.commit()

        user_question = UserQuestion(
            author_id=existing_user.id,
            question=question,
            conversation_id=conversation.id,
        )
        session.add(user_question)
        session.commit()

        answer = dict(generate_answer(question))

        ai_answer = AiAnswer(
            user_question_id=user_question.id,
            answer=answer.get("answer"),
            code_snippet=answer.get("code_block"),
            code_language="python",
        )

        session.add(ai_answer)

        session.commit()

        answer["id"] = ai_answer.id

        return {"answer": answer}


@router.get("/chat/{conversation_id}")
def chat(conversation_id: str, request: Request):
    
    """
    This endpoint is used to get the chat history of a conversation
    """

    token = request.cookies.get("auth_token")

    payload = verify_token(token)

    user_email = payload.get("email")

    if not user_email:
        raise HTTPException(status_code=401, detail="Not authenticated")

    with Session(engine) as session:

        try:

            statement = select(User).where(User.email == user_email)

            existing_user = session.exec(statement).first()

            if not existing_user:
                raise HTTPException(status_code=404, detail="User does not exist")

            statement = (
                select(UserQuestion, AiAnswer, Conversation)
                .join(
                    target=AiAnswer,
                    onclause=AiAnswer.user_question_id == UserQuestion.id,
                    isouter=False,
                    # UserQuestion.id == AiAnswer.user_question_id
                )
                .join(
                    target=Conversation,
                    onclause=Conversation.id == UserQuestion.conversation_id,
                    isouter=False,
                )
                .where(Conversation.id == conversation_id)
            )

            result = session.exec(statement).all()  

            if not result:
                raise HTTPException(status_code=404, detail="Conversation not found")
 
            return {
                "conversation": {
                    "conversation_id": conversation_id,
                    "title": result[0][2].title or "Untitled conversation",
                },
                "user_queries": [
                    {
                        "question": {
                            "question_id": retrived_user_question.id,
                            "question": retrived_user_question.question,
                            "author_id": retrived_user_question.author_id
                        },
                        "answer": {
                            "answer_id": retrived_ai_answer.id,
                            "answer": retrived_ai_answer.answer,
                            "code_snippet": retrived_ai_answer.code_snippet,
                            "code_language": retrived_ai_answer.code_language
                        },
                    } for retrived_user_question, retrived_ai_answer, _ in result
                ]
            }

        except Exception as e:
            print(e)
            raise HTTPException(status_code=404, detail=f"Something went wrong: {str(e)}")


class ContinueQuestion(BaseModel):

    """
    This is a model for the question that will be asked by the user
    """

    question: str

@router.post("/chat/continue/{conversation_id}")
def chat(conversation_id: str, request: Request, question: ContinueQuestion):

    """
        This endpoint is used to continue a conversation with the AI. It also takes the new question and generates a new answer.
    """

    token = request.cookies.get("auth_token")

    token_info = verify_token(token)

    user_email = token_info.get("email")

    if not user_email:
        raise HTTPException(status_code=401, detail="No valid email found in the auth token")

    with Session(engine) as session:

        try:

            statement = select(User).where(User.email == user_email)

            existing_user = session.exec(statement).first()

            if not existing_user:
                raise HTTPException(status_code=401, detail="User does not exist")

            new_question = UserQuestion(
                author_id=existing_user.id, conversation_id=conversation_id, question=question.question
            )

            session.add(new_question)
            session.commit()

            answer = dict(generate_answer(question.question))

            ai_answer = AiAnswer(
                user_question_id=new_question.id,
                answer=answer.get("answer"),
                code_snippet=answer.get("code_block"),
                code_language="python",
            )

            session.add(ai_answer)
            session.commit()

            return {"answer": {
                "answer_info": {
                    "answer_id": ai_answer.id,
                    "answer": ai_answer.answer,
                    "code_snippet": ai_answer.code_snippet,
                    "code_language": ai_answer.code_language
                },
                "user_question_info": {
                    "question_id": new_question.id,
                    "question": new_question.question,
                    "author_id": new_question.author_id
                }
            }}

        except Exception as e:
            raise HTTPException(status_code=400, detail=str(e))


@router.get("/run/{answer_id}")
def run_code(answer_id: int, request: Request):
    token = request.cookies.get("auth_token")

    payload = verify_token(token)

    user_email = payload.get("email")

    if not user_email:
        raise HTTPException(status_code=401, detail="No valid email found in the auth token")

    with Session(engine) as session:

        statement = select(User).where(User.email == user_email)

        existing_user = session.exec(statement).first()

        if not existing_user:
            raise HTTPException(status_code=401, detail="User does not exist")

        statement = select(AiAnswer).where(AiAnswer.id == answer_id)

        ai_answer = session.exec(statement).first()

        if not ai_answer:
            raise HTTPException(status_code=404, detail="Invalid answer id")

        code_block = ai_answer.code_snippet

        code_runner_output = run_ai_answer_code(code_block=code_block)

        return {"code_block": code_runner_output}
