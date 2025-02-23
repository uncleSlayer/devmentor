from fastapi import APIRouter, Request
from src.database.model import UserQuestion, User, AiAnswer
from src.token_verify import verify_token
from sqlmodel import Session, select
from src.database.connection import engine
from src.ai import generate_answer


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

        answer = generate_answer(question)

        ai_answer = AiAnswer(user_question_id=user_question.id, answer=answer.content)

        session.add(ai_answer)
        
        session.commit()
     

    return {"answer": answer.content}