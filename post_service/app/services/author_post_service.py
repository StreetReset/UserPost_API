from fastapi import HTTPException, status

from ..models.post_models import PostStatus
from ..repositories.post_repository import PostRepository
from ..schemas.post import PostCreate, PostRead, PostUpdate


class AuthorPostService:
    """Operations available to a post author."""

    def __init__(self, post_repository: PostRepository):
        self.post_repository = post_repository

    async def create(
        self,
        author_id: int,
        post_data: PostCreate,
    ) -> PostRead:
        post = await self.post_repository.create(author_id, post_data)
        return PostRead.model_validate(post)

    async def update(
        self,
        post_id: int,
        author_id: int,
        post_data: PostUpdate,
    ) -> PostRead:
        post = await self.post_repository.get_by_id(post_id)

        if post is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Post with id {post_id} does not exist",
            )

        if post.author_id != author_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You cannot update this post",
            )

        if post.status == PostStatus.ARCHIVED:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Archived post cannot be updated",
            )

        post = await self.post_repository.update(post, post_data)
        return PostRead.model_validate(post)

    async def get_posts_by_author_id(
        self,
        author_id: int,
        limit: int,
        offset: int,
    ) -> list[PostRead]:
        posts = await self.post_repository.get_posts_by_author_id(
            author_id,
            limit,
            offset,
        )
        return [PostRead.model_validate(post) for post in posts]

    async def get_list_drafted_posts_by_author(
        self,
        author_id: int,
        limit: int,
        offset: int,
    ) -> list[PostRead]:
        posts = await self.post_repository.get_list_drafted_posts_by_author(
            author_id,
            limit,
            offset,
        )
        return [PostRead.model_validate(post) for post in posts]

    async def soft_delete(self, post_id: int, author_id: int) -> PostRead:
        post = await self.post_repository.get_by_id(post_id)

        if post is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Post with id {post_id} doesn't exist",
            )

        if post.author_id != author_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You cannot delete this post",
            )

        post = await self.post_repository.soft_delete(post)
        return PostRead.model_validate(post)
