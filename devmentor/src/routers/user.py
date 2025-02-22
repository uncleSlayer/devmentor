from fastapi import APIRouter, Depends, Response
from src.database.model import User
from src.database.connection import engine
from sqlmodel import Session, select
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from typing import Annotated
from fastapi import Form
from passlib.context import CryptContext
import jwt
from config.env import settings
from pydantic import BaseModel
import json

router = APIRouter()


class LoginForm(BaseModel):
    email: str
    password: str


@router.post("/register")
def register(user: User):

    password_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

    user = User(
        email=user.email, hashed_password=password_context.hash(user.hashed_password)
    )

    # check if the user exists
    with Session(engine) as session:

        statement = select(User).where(User.email == user.email)

        existing_user = session.exec(statement).first()

        if existing_user:
            return {"message": "User already exists"}

        session.add(user)
        session.commit()

    return {"message": "Registered"}


@router.post("/login")
async def login(login_form_data: LoginForm):

    user_email = login_form_data.email

    # check if the user exists
    with Session(engine) as session:

        statement = select(User).where(User.email == user_email)

        existing_user = session.exec(statement).first()

        if not existing_user:
            return {"message": "User does not exist"}

        password_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

        if not password_context.verify(
            login_form_data.password, existing_user.hashed_password
        ):
            return {"message": "Incorrect password"}

        auth_jwt_token = jwt.encode(
            {"email": existing_user.email}, settings.JWT_SECRET_KEY, "HS256"
        )

        response = Response(json.dumps({"message": "Logged in successfully"}), status_code=200)

        response.set_cookie("auth_token", auth_jwt_token, max_age=3600, httponly=False)

        return response
