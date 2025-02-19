from fastapi import APIRouter
from src.database.model import User
from pydantic import BaseModel
from src.database.connection import engine
from sqlmodel import Session, select


router = APIRouter()

# pydantic validation for user model
class UserIn(BaseModel):
    email: str
    password: str


@router.post("/register")
def register(user: UserIn):
    
    user = User(email=user.email, hashed_password=user.password)

    # check if the user exists
    with Session(engine) as session:

        # statement = select(User).where(User.email == user.email)

        # existing_user = session.exec(statement).first()

        # if existing_user:
        #     return {"message": "User already exists"}
        
        session.add(user)
        session.commit()

    return {"message": "Registered"}