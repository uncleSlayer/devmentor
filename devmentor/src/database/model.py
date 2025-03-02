from typing import Optional, List
from sqlmodel import SQLModel, Field, Relationship


class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    email: str = Field(unique=True)
    hashed_password: str


class Conversation(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: Optional[int] = Field(foreign_key="user.id", nullable=False)
    questions: List["UserQuestion"] = Relationship(back_populates="conversation")


class UserQuestion(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    author_id: Optional[int] = Field(foreign_key="user.id", nullable=False)
    conversation_id: Optional[int] = Field(foreign_key="conversation.id", nullable=True)
    question: str
    conversation: Optional[Conversation] = Relationship(back_populates="questions")


class AiAnswer(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_question_id: int = Field(foreign_key="userquestion.id", nullable=False)
    answer: str
    code_snippet: Optional[str] = Field(nullable=True)
    code_language: Optional[str] = Field(nullable=True)