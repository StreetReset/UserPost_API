import os
from pathlib import Path

from dotenv import load_dotenv

load_dotenv(Path(__file__).resolve().parent / ".env")

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
# Swagger post_service использует этот URL, чтобы получить access token в user_service.
USER_SERVICE_AUTH_TOKEN_URL = os.getenv(
    "USER_SERVICE_AUTH_TOKEN_URL",
    "http://127.0.0.1:8000/auth/login",
)


if SECRET_KEY is None:
    raise RuntimeError("SECRET_KEY is not set")
