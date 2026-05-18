from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from user_service.app.auth.dependencies import get_current_user
from user_service.app.auth.hashing import verify_password
from user_service.app.auth.jwt import (
    create_access_token,
    create_refresh_token,
    decode_token,
)
from user_service.app.core.db_depends import get_async_db
from user_service.app.models.user_models import User
from user_service.app.schemas.user import UserRead
from user_service.app.services.service import get_user_by_username_or_email

router = APIRouter(
    prefix="/auth",
    tags=["auth"],
)


@router.post("/login")
async def login(
    form_data : OAuth2PasswordRequestForm = Depends(), 
    db : AsyncSession = Depends(get_async_db)):
    user = await get_user_by_username_or_email(
        db,
        username=form_data.username,
        email=form_data.username
    )
    
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password",
            headers={"WWW-Authenticate": "Bearer"},
            )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User is inactive",
        )
        
    token_data = {
        "sub" : str(user.id)
    }
    
    access_token = create_access_token(token_data)
    refresh_token = create_refresh_token(token_data)
    
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
    }


@router.get("/me", response_model=UserRead)
async def get_me(
    current_user: User = Depends(get_current_user),
):
    return current_user


@router.post("/refresh")
async def refresh_token(
    refresh_token: str,
    db: AsyncSession = Depends(get_async_db),
):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate refresh token",
        headers={"WWW-Authenticate": "Bearer"},
    )

    payload = decode_token(refresh_token)

    if payload is None:
        raise credentials_exception

    if payload.get("token_type") != "refresh":
        raise credentials_exception

    try:
        user_id = int(payload.get("sub"))
    except (TypeError, ValueError):
        raise credentials_exception
    
    user = await db.scalar(
        select(User).where(
            User.id == user_id,
            User.is_active,
        )
    )
    
    if user is None:
        raise credentials_exception

    access_token = create_access_token({
        "sub": str(user_id),
    })

    return {
        "access_token": access_token,
        "token_type": "bearer",
    }
