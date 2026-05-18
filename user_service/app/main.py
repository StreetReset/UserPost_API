from fastapi import FastAPI

from user_service.app.routers import user
from user_service.app.auth import router as auth_router

app = FastAPI(
    title="User-Service",
    version="1.0.0"
)

app.include_router(user.router)
app.include_router(auth_router.router)

@app.get("/")
async def root():
    return {"message" : "Welcome to Users Api"}
