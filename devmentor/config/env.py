from pydantic_settings import BaseSettings
import os
from dotenv import load_dotenv
load_dotenv()

class EnvSettings(BaseSettings):
    NEO4J_URI: str = os.getenv("NEO4J_URI")
    NEO4J_USERNAME: str = os.getenv("NEO4J_USERNAME")
    NEO4J_PASSWORD: str = os.getenv("NEO4J_PASSWORD")
    AURA_INSTANCEID: str = os.getenv("AURA_INSTANCEID")
    AURA_INSTANCENAME: str = os.getenv("AURA_INSTANCENAME")
    SUPABASE_URL: str = os.getenv("SUPABASE_URL")
    SUPABASE_KEY: str = os.getenv("SUPABASE_KEY")
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY")
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY")


settings = EnvSettings()