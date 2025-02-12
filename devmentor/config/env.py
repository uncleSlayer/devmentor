from pydantic_settings import BaseSettings


class EnvSettings(BaseSettings):
    NEO4J_URI: str
    NEO4J_USERNAME: str
    NEO4J_PASSWORD: str
    AURA_INSTANCEID: str
    AURA_INSTANCENAME: str


settings = EnvSettings()