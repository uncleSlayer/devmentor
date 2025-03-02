from fastapi import APIRouter, Request
from src.database.model import UserQuestion, User, AiAnswer, Conversation
from src.token_verify import verify_token
from sqlmodel import Session, select
from src.database.connection import engine
from src.langgraph.graph import generate_answer
from src.docker import run_ai_answer_code


router = APIRouter()


@router.post("/chat/new")
def question(question: UserQuestion, request: Request):

    question = question.question

    token = request.cookies.get("auth_token")

    payload = verify_token(token)

    user_email = payload.get("email")

    if not user_email:
        return {"message": "Something went wrong"}

    with Session(engine) as session:

        statement = select(User).where(User.email == user_email)

        existing_user = session.exec(statement).first()

        if not existing_user:
            return {"message": "User does not exist"}

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
def chat(conversation_id: int, request: Request):

    token = request.cookies.get("auth_token")

    payload = verify_token(token)

    user_email = payload.get("email")

    if not user_email:
        return {"message": "Something went wrong"}

    with Session(engine) as session:

        try:

            statement = select(User).where(User.email == user_email)

            existing_user = session.exec(statement).first()

            if not existing_user:
                return {"message": "User does not exist"}

            statement = select(
                UserQuestion.question, AiAnswer.answer, Conversation.id
            ).join(
                target=AiAnswer,
                onclause=AiAnswer.user_question_id == UserQuestion.id,
                isouter=False
                # UserQuestion.id == AiAnswer.user_question_id
            ).join(
                target=Conversation,
                onclause=Conversation.id == UserQuestion.conversation_id,
                isouter=False
            ).where(
                Conversation.id == conversation_id
            )

            user_questions = session.exec(statement).all()

            return {"user_questions": user_questions}
        
        except Exception as e:
            return {"message": str(e)}


@router.post("/chat/continue/{conversation_id}")
def chat(conversation_id: int, request: Request):

    token = request.cookies.get("auth_token")

    token_info = verify_token(token)

    user_email = token_info.get("email")

    if not user_email:
        return {"message": "Something went wrong"}

    with Session(engine) as session:

        try:

            statement = select(User).where(User.email == user_email)

            existing_user = session.exec(statement).first()

            if not existing_user:
                return {"message": "User does not exist"}

            question = UserQuestion(author_id=existing_user.id, conversation_id=conversation_id)
            session.add(question)
            session.commit()

            answer = dict(generate_answer(question.question))

            ai_answer = AiAnswer(
                user_question_id=question.id,
                answer=answer.get("answer"),
                code_snippet=answer.get("code_block"),
                code_language="python",
            )
            session.add(ai_answer)
            session.commit() 

            return {"answer": ai_answer}


        except Exception as e:
            return {"error": str(e)}


@router.get("/run/{answer_id}")
def run_code(answer_id: int, request: Request):
    token = request.cookies.get("auth_token")

    payload = verify_token(token)

    user_email = payload.get("email")

    if not user_email:
        return {"message": "Something went wrong"}

    with Session(engine) as session:

        statement = select(User).where(User.email == user_email)

        existing_user = session.exec(statement).first()

        if not existing_user:
            return {"message": "User does not exist"}

        statement = select(AiAnswer).where(AiAnswer.id == answer_id)

        ai_answer = session.exec(statement).first()

        if not ai_answer:
            return {"message": "Invalid answer id"}

        code_block = ai_answer.code_snippet

        code_runner_output = run_ai_answer_code(code_block=code_block)

        return {"code_block": code_runner_output}
