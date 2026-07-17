from fastapi import HTTPException, status

from ..auth.hashing import hash_password
from ..events.kafka import send_event
from ..models.user_models import User
from ..repositories.user_repository import UserRepository
from ..schemas.user import UserCreate, UserRead, UserUpdate


class UserService:
    def __init__(self, user_repository: UserRepository):
        self.user_repository = user_repository

    @staticmethod
    def _check_access(user_id: int, current_user: User) -> None:
        if current_user.id != user_id and current_user.role.value != "admin":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not enough permissions",
            )

    @staticmethod
    def _event_payload(user: User) -> dict:
        return {
            "user_id": user.id,
            "username": user.username,
            "email": user.email,
            "role": user.role.value,
            "is_active": user.is_active,
        }

    async def _send_user_event(self, event_type: str, user: User) -> None:
        await send_event(
            "user-events",
            {
                "event_type": event_type,
                "event_version": 1,
                "payload": self._event_payload(user),
            },
        )

    async def create(self, user_data: UserCreate) -> UserRead:
        existing_user = await self.user_repository.get_by_username_or_email(
            username=user_data.username,
            email=user_data.email,
        )

        if existing_user is not None:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="User with this Email or Username already exists",
            )

        user = User(
            **user_data.model_dump(exclude={"password"}),
            hashed_password=hash_password(user_data.password),
        )
        user = await self.user_repository.create(user)
        await self._send_user_event("user.created", user)
        return UserRead.model_validate(user)

    async def get_by_id(
        self,
        user_id: int,
        current_user: User,
    ) -> UserRead:
        self._check_access(user_id, current_user)
        user = await self.user_repository.get_by_id(user_id)

        if user is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found",
            )

        return UserRead.model_validate(user)

    async def update(
        self,
        user_id: int,
        user_data: UserUpdate,
        current_user: User,
    ) -> UserRead:
        self._check_access(user_id, current_user)
        user = await self.user_repository.get_active_by_id(user_id)

        if user is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found",
            )

        update_data = user_data.model_dump(
            exclude_unset=True,
            exclude_none=True,
        )
        existing_user = await self.user_repository.get_by_username_or_email(
            email=update_data.get("email"),
            exclude_user_id=user_id,
        )

        if existing_user is not None:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="User with this Email already exists",
            )

        user = await self.user_repository.update(user, update_data)
        await self._send_user_event("user.updated", user)
        return UserRead.model_validate(user)

    async def soft_delete(
        self,
        user_id: int,
        current_user: User,
    ) -> UserRead:
        self._check_access(user_id, current_user)
        user = await self.user_repository.get_by_id(user_id)

        if user is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found",
            )

        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="User is already deleted",
            )

        user = await self.user_repository.soft_delete(user)
        await self._send_user_event("user.deleted", user)
        return UserRead.model_validate(user)
