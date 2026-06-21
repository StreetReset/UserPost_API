from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from user_service.app.auth.jwt import decode_token
from user_service.app.core.db_depends import get_async_db
from user_service.app.models.user_models import User as UserModel

# Swagger/FastAPI берет access token из Authorization: Bearer <token>
# и передает в зависимости как обычную строку token.
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

async def get_current_user(
    token : str = Depends(oauth2_scheme),
    db : AsyncSession = Depends(get_async_db)
) -> UserModel:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    payload = decode_token(token)
    
    if payload is None:
        raise credentials_exception
    
    token_type = payload.get("token_type")
    
    if token_type != "access":
        raise credentials_exception
    
    # В JWT поле sub хранит id пользователя, который выпустил user_service.
    try:
        user_id = int(payload.get("sub"))
    except (TypeError, ValueError):
        raise credentials_exception
    
    # Дополнительно проверяем БД: пользователь должен существовать и быть активным.
    user = await db.scalar(
        select(UserModel)
        .where(UserModel.id == user_id, UserModel.is_active)
    )
    
    if user is None:
        raise credentials_exception

    return user


async def get_current_admin(
    current_user: UserModel = Depends(get_current_user),
) -> UserModel:
    # Сначала Depends(get_current_user) валидирует токен, потом проверяем роль.
    if current_user.role.value != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required",
        )

    return current_user

