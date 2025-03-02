from fastapi import APIRouter, Depends, HTTPException, Header, Request
from src.database.model import User, Conversation, UserQuestion
from src.database.connection import engine
from sqlmodel import select, Session
from src.token_verify import verify_token
from pydantic import BaseModel

router = APIRouter()


class Question(BaseModel):
    question: str

@router.post("/conversation")
def create_conversation(question: Question, request: Request):

    token = request.cookies.get("auth_token")
    question = question.question

    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    else:

        payload = verify_token(token)

        user_email = payload.get("email")

        if not user_email:
            raise HTTPException(status_code=401, detail="Not authenticated")
        
        with Session(engine) as session:
            statement = select(User).where(User.email == user_email)
            existing_user = session.exec(statement).first()

            if not existing_user:
                raise HTTPException(status_code=401, detail="Not authenticated")

            conversation = Conversation(user_id=existing_user.id)
            session.add(conversation)
            session.commit()

            new_question = UserQuestion(
                author_id=existing_user.id,
                conversation_id=conversation.id,
                question=question
            )
            session.add(new_question)
            session.commit()

            return {"conversation_id": conversation.id, "question_id": new_question.id}
