from pydantic_settings import BaseSettings

class Settings():
    SECRET_KEY: str = "edgevision-super-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24

settings = Settings()