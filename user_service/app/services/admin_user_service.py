from ..repositories.user_repository import UserRepository
from ..schemas.user import UserRead


class AdminUserService:
    def __init__(self, user_repository: UserRepository):
        self.user_repository = user_repository

    async def get_list_active_users(
        self,
        limit: int,
        offset: int,
    ) -> list[UserRead]:
        users = await self.user_repository.get_list_active_users(limit, offset)
        return [UserRead.model_validate(user) for user in users]

    async def get_list_inactive_users(
        self,
        limit: int,
        offset: int,
    ) -> list[UserRead]:
        users = await self.user_repository.get_list_inactive_users(limit, offset)
        return [UserRead.model_validate(user) for user in users]
