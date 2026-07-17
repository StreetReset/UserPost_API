from fastapi import HTTPException, status

from ..repositories.post_repository import PostRepository
from ..schemas.post import PostPublicRead


class PostService:
    """Public operations with published posts."""

    def __init__(self, post_repository: PostRepository):
        self.post_repository = post_repository

    async def get_by_id(self, post_id: int) -> PostPublicRead:
        post = await self.post_repository.get_published_by_id(post_id)

        if post is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Post with id {post_id} does not exist",
            )

        return PostPublicRead.model_validate(post)

    async def get_list_published_posts(
        self,
        limit: int,
        offset: int,
    ) -> list[PostPublicRead]:
        posts = await self.post_repository.get_list_published_posts(
            limit,
            offset,
        )
        return [PostPublicRead.model_validate(post) for post in posts]
