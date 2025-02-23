from typing import Optional
from sqlmodel import SQLModel, Field


class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    email: str = Field(unique=True)
    hashed_password: str


class UserQuestion(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    author_id: Optional[int] = Field(foreign_key="user.id", nullable=False)
    question: str


class AiAnswer(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_question_id: int = Field(foreign_key="userquestion.id", nullable=False)
    answer: str