from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .routers import admin_user, user
from .auth import router as auth_router

from contextlib import asynccontextmanager
from .events.kafka import start_kafka_producer, stop_kafka_producer

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Kafka producer должен стартовать внутри event loop FastAPI.
    await start_kafka_producer()
    yield
    # При остановке приложения закрываем сетевое соединение с Kafka.
    await stop_kafka_producer()


app = FastAPI(
    title="User-Service",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    # Swagger post_service открыт на 8001 и логинится через user_service на 8000.
    allow_origins=[
        "http://127.0.0.1:8001",
        "http://localhost:8001",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(admin_user.router)
app.include_router(user.router)
app.include_router(auth_router.router)

@app.get("/")
async def root():
    return {"message" : "Welcome to Users Api"}
