from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql://postgres:password@localhost/sla_platform"
    SECRET_KEY: str = "your-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 480

    EURI_API_KEY: str = ""
    EURI_API_URL: str = "https://api.euron.one/api/v1/euri/alpha/chat/completions"
    EURI_MODEL: str = "gpt-4.1-nano"

    class Config:
        env_file = ".env"

settings = Settings()