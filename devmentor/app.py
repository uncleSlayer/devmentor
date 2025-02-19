from typing import Union
from contextlib import asynccontextmanager
from sqlmodel import SQLModel, create_engine, Session
from src.database.connection import engine
from src.database.model import *
from config.env import settings

# routers
from src.routers.user import router as user_router

from fastapi import FastAPI


@asynccontextmanager
async def lifespan(app: FastAPI):
    SQLModel.metadata.create_all(engine)
    yield


app = FastAPI(lifespan=lifespan)

# mount routers
app.include_router(user_router)

@app.get("/")
def read_root():
    return {"Hello": "World"}


@app.get("/test")
async def test_rag():

    from langchain_community.vectorstores import SupabaseVectorStore
    from langchain_openai import OpenAIEmbeddings
    from supabase.client import Client, create_client
    from langchain_google_genai import ChatGoogleGenerativeAI

    supabase_url = settings.SUPABASE_URL
    supabase_key = settings.SUPABASE_KEY

    supabase_client: Client = create_client(supabase_url, supabase_key)

    embeddings = OpenAIEmbeddings(
        model="text-embedding-3-large", api_key=settings.OPENAI_API_KEY
    )

    vector_store = SupabaseVectorStore(
        embedding=embeddings,
        client=supabase_client,
        table_name="documents",
        query_name="match_documents",
    )

    gemini = ChatGoogleGenerativeAI(model="gemini-2.0-flash", api_key=settings.GEMINI_API_KEY)

    retriver = vector_store.as_retriever(
        search_type="similarity_score_threshold",
        search_kwargs={"score_threshold": 0.5, "k": 3},
    )

    retrived_documents = retriver.invoke("How to typecast in python?")

    serialized_documents = [doc.to_dict() for doc in retrived_documents]

    answer = gemini.invoke(f"""
        You are a helpful assistant that answers questions based on the provided context.
        If you don't know the answer, just say that you don't know. Don't try to make up an answer.

        Document context:
        {serialized_documents}

        Question: "How to typecast in python?"
    """)

    return {"answer": answer}


if __name__ == "__main__":
    import uvicorn

    print(settings.NEO4J_URI)

    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)
