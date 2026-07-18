from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc

from ..models.post_models import Post, PostStatus
from ..schemas.post import PostCreate, PostUpdate


class PostRepository:
    def __init__(self, session: AsyncSession):
        self.session = session


    async def get_by_id(self, post_id: int) -> Post | None:
        result = await self.session.scalar(select(Post).where(
            Post.id == post_id,
            Post.is_active.is_(True)))
        return result

    async def get_published_by_id(self, post_id: int) -> Post | None:
        result = await self.session.scalar(
            select(Post).where(
                Post.id == post_id,
                Post.is_active.is_(True),
                Post.status == PostStatus.PUBLISHED,
            )
        )
        return result
    

    async def get_posts_by_author_id(
        self,
        author_id: int,
        limit: int,
        offset: int,
    ) -> list[Post]:
        result = await self.session.scalars(
            select(Post)
            .where(
                Post.author_id == author_id,
                Post.is_active.is_(True),
            )
            .order_by(desc(Post.created_at))
            .limit(limit)
            .offset(offset)
        )
        return list(result.all())


    async def get_all_active_posts(
        self,
        limit: int,
        offset: int,
    ) -> list[Post]:
        result = await self.session.scalars(
        select(Post)
        .where(Post.is_active.is_(True))
        .order_by(desc(Post.created_at))
        .limit(limit)
        .offset(offset)
    )
        return list(result.all())
    
    async def get_list_drafted_posts_by_author(
        self,
        author_id: int,
        limit: int,
        offset: int,
    ) -> list[Post]:
        result = await self.session.scalars(
        select(Post)
        .where(
            Post.author_id == author_id,
            Post.is_active.is_(True),
            Post.status == PostStatus.DRAFT
            )
        .order_by(desc(Post.created_at))
        .limit(limit)
        .offset(offset)
    )
        return list(result.all())

    

    async def get_list_published_posts(
        self,
        limit: int,
        offset: int,
    ) -> list[Post]:
        result = await self.session.scalars(
        select(Post)
        .where(
            Post.is_active.is_(True),
            Post.status == PostStatus.PUBLISHED,
        )
        .order_by(desc(Post.created_at))
        .limit(limit)
        .offset(offset)
        )
        return list(result.all())

    async def get_published_by_author_id(
        self,
        author_id: int,
        limit: int,
        offset: int,
    ) -> list[Post]:
        result = await self.session.scalars(
            select(Post)
            .where(
                Post.author_id == author_id,
                Post.is_active.is_(True),
                Post.status == PostStatus.PUBLISHED,
            )
            .order_by(desc(Post.created_at))
            .limit(limit)
            .offset(offset)
        )
        return list(result.all())

    async def get_list_archived_posts(
        self,
        limit: int,
        offset: int,
    ) -> list[Post]:
        result = await self.session.scalars(
        select(Post)
        .where(
            Post.is_active.is_(True),
            Post.status == PostStatus.ARCHIVED,
        )
        .order_by(desc(Post.created_at))
        .limit(limit)
        .offset(offset)
    )
        return list(result.all())

    


    async def create(self, author_id: int, post_data: PostCreate)-> Post:
        post = Post(**post_data.model_dump(), author_id=author_id,)
        self.session.add(post)
        await self.session.commit()
        await self.session.refresh(post)
        return post
    
    async def update(self, post: Post, post_data: PostUpdate)-> Post:
        update_data = post_data.model_dump(exclude_unset=True, exclude_none=True,)

        for field, value in update_data.items():
            setattr(post, field, value)
        
        await self.session.commit()
        await self.session.refresh(post)

        return post
    
    async def soft_delete(self, post: Post) -> Post:
        post.is_active = False

        await self.session.commit()
        await self.session.refresh(post)

        return post
