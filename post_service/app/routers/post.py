from typing import Annotated
from fastapi import APIRouter, Path, Query

from ..dependencies.post_dependencies import PostServiceDep
from ..schemas.post import PostPublicRead

router = APIRouter(
    prefix="/api/posts",
    tags=["posts"],
)


@router.get("/", response_model=list[PostPublicRead])
async def get_list_published_posts(
    post_service: PostServiceDep,
    limit: Annotated[int, Query(ge=1, le=100)] = 20,
    offset: Annotated[int, Query(ge=0)] = 0,
):
    return await post_service.get_list_published_posts(limit, offset)


@router.get("/{post_id}", response_model=PostPublicRead)
async def get_by_id(
    post_id: Annotated[int, Path(gt=0)],
    post_service: PostServiceDep,
):
    return await post_service.get_by_id(post_id)

