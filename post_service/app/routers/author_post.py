from typing import Annotated

from fastapi import APIRouter, Path, Query, status

from ..auth.dependencies import CurrentUserIdDep
from ..dependencies.post_dependencies import (
    AuthorPostServiceDep,
    PostStatusServiceDep,
)
from ..schemas.post import PostCreate, PostRead, PostUpdate


router = APIRouter(
    prefix="/api/me/posts",
    tags=["author-posts"],
)


@router.get("/", response_model=list[PostRead])
async def get_posts_by_author_id(
    author_id: CurrentUserIdDep,
    author_service: AuthorPostServiceDep,
    limit: Annotated[int, Query(ge=1, le=100)] = 20,
    offset: Annotated[int, Query(ge=0)] = 0,
):
    return await author_service.get_posts_by_author_id(
        author_id,
        limit,
        offset,
    )


@router.get("/drafts", response_model=list[PostRead])
async def get_list_drafted_posts_by_author(
    author_id: CurrentUserIdDep,
    author_service: AuthorPostServiceDep,
    limit: Annotated[int, Query(ge=1, le=100)] = 20,
    offset: Annotated[int, Query(ge=0)] = 0,
):
    return await author_service.get_list_drafted_posts_by_author(
        author_id,
        limit,
        offset,
    )


@router.post(
    "/drafts",
    response_model=PostRead,
    status_code=status.HTTP_201_CREATED,
)
async def create_draft(
    author_id: CurrentUserIdDep,
    post_data: PostCreate,
    author_service: AuthorPostServiceDep,
):
    return await author_service.create(author_id, post_data)


@router.patch("/{post_id}", response_model=PostRead)
async def post_update(
    post_id: Annotated[int, Path(gt=0)],
    author_id: CurrentUserIdDep,
    post_data: PostUpdate,
    author_service: AuthorPostServiceDep,
):
    return await author_service.update(post_id, author_id, post_data)


@router.patch("/publish/{post_id}", response_model=PostRead)
async def publish_post(
    post_id: Annotated[int, Path(gt=0)],
    author_id: CurrentUserIdDep,
    post_status_service: PostStatusServiceDep,
):
    return await post_status_service.publish(post_id, author_id)


@router.patch("/archive/{post_id}", response_model=PostRead)
async def archive_post(
    post_id: Annotated[int, Path(gt=0)],
    author_id: CurrentUserIdDep,
    post_status_service: PostStatusServiceDep,
):
    return await post_status_service.archive(post_id, author_id)


@router.delete("/{post_id}", response_model=PostRead)
async def delete_own_post(
    post_id: Annotated[int, Path(gt=0)],
    author_id: CurrentUserIdDep,
    author_service: AuthorPostServiceDep,
):
    return await author_service.soft_delete(post_id, author_id)
