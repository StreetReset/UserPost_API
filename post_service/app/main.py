from fastapi import FastAPI

from .routers import post, post_status


app = FastAPI(
    title="Post-Service",
    version="1.0.0"
)

app.include_router(post.router)
app.include_router(post_status.router)

@app.get("/")
async def root():
    return {"message" : "Welcome to Post API"}
