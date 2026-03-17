from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    DATABASE_URL: str
    GROQ_API_KEY: str
    PINECONE_API_KEY: str
    PINECONE_INDEX_NAME: str = "doubtmap-syllabus"
    CORS_ORIGINS: str = "http://localhost:3000"
    N8N_WEBHOOK_SECRET: str = "change-me"
    APP_ENV: str = "development"

    class Config:
        env_file = ".env"


settings = Settings()
