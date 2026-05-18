from sqlalchemy import select, desc

from sqlalchemy.ext.asyncio import AsyncSession

from post_service.app.models.post_models import Post, PostStatus
from post_service.app.schemas.post import PostCreate, PostUpdate


async def create_post(db: AsyncSession, post_data: PostCreate, author_id : int) -> Post:
    """
    Return created post
    """
    post = Post(**post_data.model_dump(), author_id=author_id,)
    db.add(post)
    await db.commit()
    await db.refresh(post)
    return post


async def get_post_by_id(db: AsyncSession, post_id: int) -> Post | None:
    """
    Return post by ID
    """
    result = await db.scalar(select(Post).where(Post.id == post_id, Post.is_active))
    return result


async def get_list_posts(db: AsyncSession) -> list[Post]:
    """
    Return all posts where active = True
    """
    result = await db.scalars(
        select(Post)
        .where(Post.is_active)
        .order_by(desc(Post.created_at))
        .limit(10)
        .offset(0)
    )
    return result.all()


async def get_list_published_posts(db: AsyncSession) -> list[Post]:
    """
    Return all PUBLISHED posts
    """
    result = await db.scalars(
        select(Post)
        .where(Post.is_active, Post.status == PostStatus.PUBLISHED)
        .order_by(desc(Post.created_at))
        .limit(10)
        .offset(0)
    )
    return result.all()


async def get_list_archived_posts(db: AsyncSession) -> list[Post]:
    """
    Return all ARCHIVED posts
    """
    result = await db.scalars(
        select(Post)
        .where(Post.is_active, Post.status == PostStatus.ARCHIVED)
        .order_by(desc(Post.created_at))
        .limit(10)
        .offset(0)
    )
    return result.all()


async def get_posts_by_author(db: AsyncSession, author_id: int) -> list[Post]:
    """
    Return all posts by author_ID
    """
    result = await db.scalars(
        select(Post)
        .where(Post.author_id == author_id, Post.is_active))
    return result.all()


async def update_post(
    db: AsyncSession,
    post_data: PostUpdate,
    post_id: int,
    author_id: int,
) -> Post | None:
    post = await db.scalar(
        select(Post).where(
            Post.id == post_id,
            Post.author_id == author_id,
            Post.is_active,
        )
    )

    if post is None:
        return None

    if post.status == PostStatus.ARCHIVED:
        raise ValueError("Archived post cannot be updated")

    update_data = post_data.model_dump(exclude_unset=True)

    for key, value in update_data.items():
        setattr(post, key, value)

    await db.commit()
    await db.refresh(post)
    return post


async def publish_post(db: AsyncSession, post_id: int, author_id: int) -> Post | None:
    """
    Swap PostStatus from DRAFT to PUBLISHED
    """
    post = await db.scalar(
        select(Post).where(
            Post.id == post_id,
            Post.author_id == author_id,
            Post.is_active,
            Post.status == PostStatus.DRAFT,
        )
    )

    if post is None:
        return None

    post.status = PostStatus.PUBLISHED

    await db.commit()
    await db.refresh(post)
    return post


async def archive_post(db: AsyncSession, post_id: int, author_id: int) -> Post | None:
    """
    Swap PostStatus from PUBLISHED to ARCHIVED
    """
    post = await db.scalar(
        select(Post).where(
            Post.id == post_id,
            Post.author_id == author_id,
            Post.is_active,
            Post.status == PostStatus.PUBLISHED,
        )
    )

    if post is None:
        return None

    post.status = PostStatus.ARCHIVED

    await db.commit()
    await db.refresh(post)
    return post


async def delete_post(db: AsyncSession, post_id: int, author_id: int) -> Post | None:
    """
    Soft Delete Post
    """
    post = await db.scalar(
        select(Post).where(
            Post.id == post_id,
            Post.author_id == author_id,
            Post.is_active,
        )
    )

    if post is None:
        return None

    post.is_active = False

    await db.commit()
    await db.refresh(post)
    return post
