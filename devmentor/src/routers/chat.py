from fastapi import APIRouter, Request
from src.database.model import UserQuestion, User, AiAnswer
from src.token_verify import verify_token
from sqlmodel import Session, select
from src.database.connection import engine
from src.langgraph.graph import generate_answer
from src.docker import run_ai_answer_code


router = APIRouter()


@router.post("/question")
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

        user_question = UserQuestion(author_id=existing_user.id, question=question)

        session.add(user_question)

        session.commit()

        answer = dict(generate_answer(question))

        print("answer", answer)

        ai_answer = AiAnswer(
            user_question_id=user_question.id,
            answer=answer.get("answer"),
            code_snippet=answer.get("code_block"),
            code_language="python",
        )

        session.add(ai_answer)

        session.commit()

    return {"answer": answer}


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

        print(run_ai_answer_code(code_block=code_block))

        return {"code_block": code_block}
