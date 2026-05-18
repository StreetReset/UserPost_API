from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from post_service.app.auth.dependencies import get_current_user_id
from post_service.app.core.db_depends import get_async_db
from post_service.app.schemas.post import PostRead

from post_service.app.services.service import publish_post, archive_post

router = APIRouter(
    prefix="/posts",
    tags=["posts"]
)


@router.patch("/{post_id}/publish", response_model=PostRead, status_code=status.HTTP_200_OK)
async def publish_post_route(
    post_id: int,
    current_user_id: int = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_async_db),
):
    post = await publish_post(
        db,
        post_id,
        author_id=current_user_id,
    )

    if post is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Post not found or not your",
        )

    return post


@router.patch("/{post_id}/archive", response_model=PostRead, status_code=status.HTTP_200_OK)
async def archive_post_route(
    post_id: int,
    current_user_id: int = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_async_db),
):
    post = await archive_post(
        db,
        post_id,
        author_id=current_user_id,
    )

    if post is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Post not found",
        )

    return post
