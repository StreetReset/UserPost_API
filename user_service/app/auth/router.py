from typing import Annotated

from fastapi import APIRouter, Depends
from fastapi.security import OAuth2PasswordRequestForm

from ..dependencies.user_dependencies import AuthServiceDep
from ..schemas.user import UserRead
from .dependencies import CurrentUserDep


router = APIRouter(
    prefix="/auth",
    tags=["auth"],
)


@router.post("/login")
async def login(
    auth_service: AuthServiceDep,
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
):
    return await auth_service.login(form_data.username, form_data.password)


@router.get("/me", response_model=UserRead)
async def get_me(current_user: CurrentUserDep):
    return current_user


@router.post("/refresh")
async def refresh_token(
    refresh_token: str,
    auth_service: AuthServiceDep,
):
    return await auth_service.refresh(refresh_token)
