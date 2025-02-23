from langchain_community.vectorstores import SupabaseVectorStore
from langchain_openai import OpenAIEmbeddings
from supabase.client import Client, create_client
from config.env import settings
from langchain_openai import ChatOpenAI

supabase_client: Client = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)

embeddings = OpenAIEmbeddings(
    model="text-embedding-3-large", api_key=settings.OPENAI_API_KEY
)

vector_store = SupabaseVectorStore(
    embedding=embeddings,
    client=supabase_client,
    table_name="documents",
    query_name="match_documents",
)

llm = ChatOpenAI(model="gpt-3.5-turbo", temperature=0.5, api_key=settings.OPENAI_API_KEY)

retriver = vector_store.as_retriever(
    search_type="similarity_score_threshold",
    search_kwargs={"score_threshold": 0.5, "k": 3},
)


def generate_answer(question: str):

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

    llm = ChatOpenAI(model="gpt-3.5-turbo", temperature=0.5, api_key=settings.OPENAI_API_KEY)

    retriver = vector_store.as_retriever(
        search_type="similarity_score_threshold",
        search_kwargs={"score_threshold": 0.5, "k": 3},
    )

    retrived_documents = retriver.invoke(question)

    print("retrived documents", retrived_documents)

    serialized_documents = [doc for doc in retrived_documents]

    answer = llm.invoke(f"""
        You are a helpful assistant that answers questions based on the provided context.
        If you don't know the answer, just say that you don't know. Don't try to make up an answer.
        If the user asks for code, write all the code in one code block. Don't write code that can't be run in a basic python repl.
        Your code example will be ran in a docker container of a python repl.

        Document context:
        {serialized_documents}

        Question: "{question}"
    """)

    return answer

