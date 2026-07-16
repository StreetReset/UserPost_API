from sqlalchemy.ext.asyncio import AsyncSession

from ..models.post_models import Post, PostStatus


class PostStatusRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def publish(self, post: Post) -> Post:
        post.status = PostStatus.PUBLISHED

        await self.session.commit()
        await self.session.refresh(post)

        return post

    async def archive(self, post: Post) -> Post:
        post.status = PostStatus.ARCHIVED

        await self.session.commit()
        await self.session.refresh(post)

        return post
