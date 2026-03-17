from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    DATABASE_URL: str
    GROQ_API_KEY: str
    PINECONE_API_KEY: str
    PINECONE_INDEX_NAME: str = "doubtmap-syllabus"
    CORS_ORIGINS: str = "http://localhost:3000"
    N8N_WEBHOOK_SECRET: str = "change-me"
    APP_ENV: str = "development"
    # n8n outbound webhook URLs
    N8N_SYLLABUS_WEBHOOK: str = "https://prashant9844.app.n8n.cloud/webhook/syllabus-uploaded"
    N8N_NEW_USER_WEBHOOK: str = "https://prashant9844.app.n8n.cloud/webhook/new-user"

    class Config:
        env_file = ".env"


settings = Settings()
