from fastapi import HTTPException, status

from ..auth.hashing import verify_password
from ..auth.jwt import create_access_token, create_refresh_token, decode_token
from ..repositories.user_repository import UserRepository


class AuthService:
    def __init__(self, user_repository: UserRepository):
        self.user_repository = user_repository

    @staticmethod
    def _credentials_exception(detail: str) -> HTTPException:
        return HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=detail,
            headers={"WWW-Authenticate": "Bearer"},
        )

    async def login(self, username: str, password: str) -> dict:
        user = await self.user_repository.get_by_username_or_email(
            username=username,
            email=username,
        )

        if user is None or not verify_password(password, user.hashed_password):
            raise self._credentials_exception("Invalid username or password")

        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="User is inactive",
            )

        token_data = {
            "sub": str(user.id),
            "role": user.role.value,
        }
        return {
            "access_token": create_access_token(token_data),
            "refresh_token": create_refresh_token(token_data),
            "token_type": "bearer",
        }

    async def refresh(self, refresh_token: str) -> dict:
        credentials_exception = self._credentials_exception(
            "Could not validate refresh token"
        )
        payload = decode_token(refresh_token)

        if payload is None or payload.get("token_type") != "refresh":
            raise credentials_exception

        try:
            user_id = int(payload.get("sub"))
        except (TypeError, ValueError):
            raise credentials_exception

        user = await self.user_repository.get_active_by_id(user_id)

        if user is None:
            raise credentials_exception

        access_token = create_access_token(
            {
                "sub": str(user.id),
                "role": user.role.value,
            }
        )
        return {
            "access_token": access_token,
            "token_type": "bearer",
        }
