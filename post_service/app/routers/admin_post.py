from typing import Annotated

from fastapi import APIRouter, Path, Query

from ..auth.dependencies import CurrentAdminDep
from ..dependencies.post_dependencies import AdminPostServiceDep
from ..schemas.post import PostRead


router = APIRouter(
    prefix="/api/admin/posts",
    tags=["admin-posts"],
)


@router.get("/", response_model=list[PostRead])
async def get_all_active_posts(
    _: CurrentAdminDep,
    admin_service: AdminPostServiceDep,
    limit: Annotated[int, Query(ge=1, le=100)] = 20,
    offset: Annotated[int, Query(ge=0)] = 0,
):
    return await admin_service.get_all_active_posts(limit, offset)


@router.get("/archived", response_model=list[PostRead])
async def get_list_archived_posts(
    _: CurrentAdminDep,
    admin_service: AdminPostServiceDep,
    limit: Annotated[int, Query(ge=1, le=100)] = 20,
    offset: Annotated[int, Query(ge=0)] = 0,
):
    return await admin_service.get_list_archived_posts(limit, offset)


@router.delete("/{post_id}", response_model=PostRead)
async def delete_post(
    post_id: Annotated[int, Path(gt=0)],
    _: CurrentAdminDep,
    admin_service: AdminPostServiceDep,
):
    return await admin_service.soft_delete(post_id)
