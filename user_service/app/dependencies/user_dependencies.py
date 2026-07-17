from typing import Annotated

from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from ..core.db_depends import get_async_db
from ..repositories.user_repository import UserRepository
from ..services.admin_user_service import AdminUserService
from ..services.auth_service import AuthService
from ..services.user_service import UserService


def get_user_repository(
    db: AsyncSession = Depends(get_async_db),
) -> UserRepository:
    return UserRepository(db)


def get_user_service(
    user_repository: UserRepository = Depends(get_user_repository),
) -> UserService:
    return UserService(user_repository)


def get_admin_user_service(
    user_repository: UserRepository = Depends(get_user_repository),
) -> AdminUserService:
    return AdminUserService(user_repository)


def get_auth_service(
    user_repository: UserRepository = Depends(get_user_repository),
) -> AuthService:
    return AuthService(user_repository)


UserRepositoryDep = Annotated[UserRepository, Depends(get_user_repository)]
UserServiceDep = Annotated[UserService, Depends(get_user_service)]
AdminUserServiceDep = Annotated[
    AdminUserService,
    Depends(get_admin_user_service),
]
AuthServiceDep = Annotated[AuthService, Depends(get_auth_service)]
