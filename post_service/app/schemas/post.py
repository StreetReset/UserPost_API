from datetime import datetime

from post_service.app.models.post_models import PostStatus
from pydantic import BaseModel, ConfigDict, Field

class PostRead(BaseModel):

    model_config = ConfigDict(from_attributes=True)

    id: int
    author_id: int
    title: str
    content: str
    status: PostStatus
    is_active: bool
    created_at: datetime
    updated_at: datetime

class PostCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=100)
    content: str = Field(..., min_length=1)

class PostUpdate(PostCreate):
    pass


