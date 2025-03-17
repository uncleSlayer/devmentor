from fastapi import APIRouter, Depends, HTTPException, Header, Request
from src.database.model import User, Conversation, UserQuestion, AiAnswer, AiAnswerSuggestion, SuggestionType
from src.database.connection import engine
from sqlmodel import select, Session
from src.token_verify import verify_token
from pydantic import BaseModel
from src.langgraph.graph import generate_answer
import youtube_search

router = APIRouter()


class Question(BaseModel):

    """
    This is a model for the question that will be asked by the user
    """

    question: str


@router.post("/conversation")
def create_conversation(question: Question, request: Request):
    """
    Create a new conversation with a question
    """

    try:
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
                    question=question,
                )
                session.add(new_question)
                session.commit()

                answer = dict(generate_answer(question))

                ai_answer = AiAnswer(
                    user_question_id=new_question.id,
                    answer=answer.get("answer"),
                    code_snippet=answer.get("code_block"),
                    code_language="python",
                ) 

                session.add(ai_answer)
                session.commit()
                
                for youtube_suggestion_url in answer.get("youtube_suggestions"):
                    
                    youtube_suggestion = AiAnswerSuggestion(
                        ai_answer_id=ai_answer.id,
                        suggestion_type=SuggestionType.YOUTUBE,
                        title="some random title",
                        url=youtube_suggestion_url,
                    )

                    session.add(youtube_suggestion)
                    session.commit()

                return {
                    "conversation": {
                        "conversation_id": conversation.id,
                        "title": conversation.title,
                    },
                    "question_info": {
                        "question_id": new_question.id,
                        "question": new_question.question,
                        "author_id": new_question.author_id,
                    },
                    "ai_answer": {
                        "answer_id": ai_answer.id,
                        "answer": ai_answer.answer,
                        "code_snippet": ai_answer.code_snippet,
                        "code_language": ai_answer.code_language,
                        "youtube_suggestions": ai_answer.suggestions,
                        # "blog_suggestions": ai_answer.blog_suggestions
                    }
                }

    except Exception as e:
        print("Error creating conversation:", e)
        raise HTTPException(status_code=400, detail=str(e))
