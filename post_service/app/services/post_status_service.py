from fastapi import HTTPException, status

from ..models.post_models import PostStatus
from ..repositories.post_repository import PostRepository
from ..repositories.post_status_repository import PostStatusRepository
from ..schemas.post import PostRead


class PostStatusService:
    def __init__(
        self,
        post_repository: PostRepository,
        post_status_repository: PostStatusRepository,
    ):
        self.post_repository = post_repository
        self.post_status_repository = post_status_repository

    async def publish(self, post_id: int, author_id: int) -> PostRead:
        post = await self.post_repository.get_by_id(post_id)

        if post is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Post with id {post_id} does not exist",
            )

        if post.author_id != author_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You cannot publish this post",
            )

        if post.status != PostStatus.DRAFT:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Only draft posts can be published",
            )

        post = await self.post_status_repository.publish(post)
        return PostRead.model_validate(post)

    async def archive(self, post_id: int, author_id: int) -> PostRead:
        post = await self.post_repository.get_by_id(post_id)

        if post is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Post with id {post_id} does not exist",
            )

        if post.author_id != author_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You cannot archive this post",
            )

        if post.status != PostStatus.PUBLISHED:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Only published posts can be archived",
            )

        post = await self.post_status_repository.archive(post)
        return PostRead.model_validate(post)
