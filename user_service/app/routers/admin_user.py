from typing import Annotated

from fastapi import APIRouter, Query

from ..auth.dependencies import CurrentAdminDep
from ..dependencies.user_dependencies import AdminUserServiceDep
from ..schemas.user import UserRead


router = APIRouter(
    prefix="/users",
    tags=["admin-users"],
)


@router.get("/active", response_model=list[UserRead])
async def get_list_active_users(
    _: CurrentAdminDep,
    admin_service: AdminUserServiceDep,
    limit: Annotated[int, Query(ge=1, le=100)] = 20,
    offset: Annotated[int, Query(ge=0)] = 0,
):
    return await admin_service.get_list_active_users(limit, offset)


@router.get("/inactive", response_model=list[UserRead])
async def get_list_inactive_users(
    _: CurrentAdminDep,
    admin_service: AdminUserServiceDep,
    limit: Annotated[int, Query(ge=1, le=100)] = 20,
    offset: Annotated[int, Query(ge=0)] = 0,
):
    return await admin_service.get_list_inactive_users(limit, offset)
