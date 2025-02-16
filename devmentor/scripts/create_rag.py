from langchain_openai import OpenAIEmbeddings
from langchain_community.vectorstores import SupabaseVectorStore
from supabase.client import Client, create_client
from config.env import settings
from langchain_text_splitters import CharacterTextSplitter
import os
from langchain_community.document_loaders import PyPDFLoader

embeddings = OpenAIEmbeddings(model="text-embedding-3-large", api_key=settings.OPENAI_API_KEY)

supabase_url = settings.SUPABASE_URL
supabase_key = settings.SUPABASE_KEY

supabase_client = create_client(supabase_url, supabase_key)

file_path = "/home/uncleslayer/dev/devmentor/devmentor/documents/python-beej-guide.pdf"

print("file_path", file_path)
loader = PyPDFLoader(file_path)
documents = loader.load()
text_splitter = CharacterTextSplitter(chunk_size=500, chunk_overlap=100)
docs = text_splitter.split_documents(documents)

print(docs[0].metadata)

vector_store = SupabaseVectorStore.from_documents(
    docs,
    embeddings,
    client=supabase_client,
    table_name="documents",
    query_name="match_documents",
    chunk_size=500,
)
