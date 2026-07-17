from fastapi import FastAPI

from .routers import admin_post, author_post, post


app = FastAPI(
    title="Post-Service",
    version="1.0.0"
)

app.include_router(author_post.router)
app.include_router(post.router)
app.include_router(admin_post.router)

@app.get("/")
async def root():
    return {"message" : "Welcome to Post API"}
