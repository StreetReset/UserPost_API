from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Annotated

from ..core.db_depends import get_async_db
from ..repositories.post_repository import PostRepository
from ..repositories.post_status_repository import PostStatusRepository
from ..services.admin_post_service import AdminPostService
from ..services.author_post_service import AuthorPostService
from ..services.post_service import PostService
from ..services.post_status_service import PostStatusService


def get_post_repository(
    db: AsyncSession = Depends(get_async_db),
) -> PostRepository:
    return PostRepository(db)


def get_post_status_repository(
    db: AsyncSession = Depends(get_async_db),
) -> PostStatusRepository:
    return PostStatusRepository(db)


def get_post_service(
    post_repository: PostRepository = Depends(get_post_repository),
) -> PostService:
    return PostService(post_repository)


def get_author_post_service(
    post_repository: PostRepository = Depends(get_post_repository),
) -> AuthorPostService:
    return AuthorPostService(post_repository)


def get_admin_post_service(
    post_repository: PostRepository = Depends(get_post_repository),
) -> AdminPostService:
    return AdminPostService(post_repository)


def get_post_status_service(
    post_repository: PostRepository = Depends(get_post_repository),
    post_status_repository: PostStatusRepository = Depends(
        get_post_status_repository
    ),
) -> PostStatusService:
    return PostStatusService(post_repository, post_status_repository)


PostServiceDep = Annotated[PostService, Depends(get_post_service)]

AuthorPostServiceDep = Annotated[AuthorPostService, Depends(get_author_post_service)]

AdminPostServiceDep = Annotated[AdminPostService, Depends(get_admin_post_service)]

PostStatusServiceDep = Annotated[PostStatusService, Depends(get_post_status_service)]