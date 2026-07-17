from datetime import datetime

from ..models.post_models import PostStatus
from pydantic import BaseModel, ConfigDict, Field

class PostPublicRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    author_id: int
    title: str
    content: str
    created_at: datetime
    updated_at: datetime

class PostRead(PostPublicRead):
    status: PostStatus
    is_active: bool

class PostCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=100)
    content: str = Field(..., min_length=1)

class PostUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=100)
    content: str | None = Field(default=None, min_length=1)


