"""
Centralized configuration for the app.
Reads from a .env file (copy .env.example -> .env and edit values).
"""
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = "sqlite:///./circular_economy.db"
    jwt_secret_key: str = "dev-secret-change-me"
    jwt_algorithm: str = "HS256"
    jwt_expiration_hours: int = 24
    app_env: str = "development"

    class Config:
        env_file = ".env"


settings = Settings()
