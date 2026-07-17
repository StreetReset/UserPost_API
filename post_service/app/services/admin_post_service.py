from fastapi import HTTPException, status

from ..repositories.post_repository import PostRepository
from ..schemas.post import PostRead


class AdminPostService:
    """Operations available to administrators."""

    def __init__(self, post_repository: PostRepository):
        self.post_repository = post_repository

    async def get_all_active_posts(
        self,
        limit: int,
        offset: int,
    ) -> list[PostRead]:
        posts = await self.post_repository.get_all_active_posts(limit, offset)
        return [PostRead.model_validate(post) for post in posts]

    async def get_list_archived_posts(
        self,
        limit: int,
        offset: int,
    ) -> list[PostRead]:
        posts = await self.post_repository.get_list_archived_posts(
            limit,
            offset,
        )
        return [PostRead.model_validate(post) for post in posts]

    async def soft_delete(self, post_id: int) -> PostRead:
        post = await self.post_repository.get_by_id(post_id)

        if post is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Post with id {post_id} doesn't exist",
            )

        post = await self.post_repository.soft_delete(post)
        return PostRead.model_validate(post)
