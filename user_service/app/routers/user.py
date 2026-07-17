from typing import Annotated

from fastapi import APIRouter, Path, status

from ..auth.dependencies import CurrentUserDep
from ..dependencies.user_dependencies import UserServiceDep
from ..schemas.user import UserCreate, UserRead, UserUpdate


router = APIRouter(
    prefix="/users",
    tags=["users"],
)


@router.post(
    "/",
    response_model=UserRead,
    status_code=status.HTTP_201_CREATED,
)
async def create_user(
    user_data: UserCreate,
    user_service: UserServiceDep,
):
    return await user_service.create(user_data)


@router.get("/{user_id}", response_model=UserRead)
async def get_user_by_id(
    user_id: Annotated[int, Path(gt=0)],
    current_user: CurrentUserDep,
    user_service: UserServiceDep,
):
    return await user_service.get_by_id(user_id, current_user)


@router.patch("/{user_id}", response_model=UserRead)
async def update_user(
    user_id: Annotated[int, Path(gt=0)],
    user_data: UserUpdate,
    current_user: CurrentUserDep,
    user_service: UserServiceDep,
):
    return await user_service.update(user_id, user_data, current_user)


@router.delete("/{user_id}", response_model=UserRead)
async def delete_user(
    user_id: Annotated[int, Path(gt=0)],
    current_user: CurrentUserDep,
    user_service: UserServiceDep,
):
    return await user_service.soft_delete(user_id, current_user)
