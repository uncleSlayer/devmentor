from typing import Union
from contextlib import asynccontextmanager
from sqlmodel import SQLModel, create_engine, Session
from src.database.connection import engine
from src.database.model import *
from config.env import settings

from fastapi import FastAPI


@asynccontextmanager
async def lifespan(app: FastAPI):
    SQLModel.metadata.create_all(engine)
    yield


app = FastAPI(lifespan=lifespan)


@app.get("/")
def read_root():
    return {"Hello": "World"}


if __name__ == "__main__":
    import uvicorn

    print(settings.NEO4J_URI)

    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)
