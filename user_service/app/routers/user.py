from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from user_service.app.models.user_models import User as UserModel
from user_service.app.schemas.user import (
    UserCreate,
    UserRead,
    UserUpdate
    )

from user_service.app.auth.dependencies import get_current_user, get_current_admin
from user_service.app.core.db_depends import get_async_db
from user_service.app.services.service import (
    create_user,
    update_user,
    get_list_active_users,
    get_list_inactive_users,
    get_user_by_id,
    delete_user
)
from user_service.app.events.kafka import send_event

router = APIRouter(
    prefix="/users",
    tags=["users"]
)


# Единый формат payload для Kafka-событий о пользователях.
def build_user_event_payload(user: UserModel) -> dict:
    return {
        "user_id": user.id,
        "username": user.username,
        "email": user.email,
        "role": user.role.value,
        "is_active": user.is_active,
    }


@router.post("/", response_model=UserRead, status_code=status.HTTP_201_CREATED)
async def create_user_route(
    user_data : UserCreate, 
    db : AsyncSession = Depends(get_async_db)):
    try:
        user = await create_user(db, user_data)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(exc))

    # После успешного commit в БД публикуем событие, чтобы другие сервисы обновили свою проекцию.
    await send_event(
        "user-events",
        {
            "event_type": "user.created",
            "event_version": 1,
            "payload": build_user_event_payload(user),
        },
    )
    
    return user


@router.get("/active", response_model=list[UserRead], status_code=status.HTTP_200_OK)
async def get_list_active_users_route( _: UserModel = Depends(get_current_admin), db : AsyncSession = Depends(get_async_db)):
    users = await get_list_active_users(db)
    return users


@router.get("/inactive", response_model=list[UserRead], status_code=status.HTTP_200_OK)
async def get_list_inactive_users_route( _: UserModel = Depends(get_current_admin), db : AsyncSession = Depends(get_async_db)):
    users = await get_list_inactive_users(db)
    return users


@router.get("/{user_id}", response_model=UserRead, status_code=status.HTTP_200_OK)
async def get_user_by_id_route(
    user_id : int ,
    current_user : UserModel = Depends(get_current_user),
    db : AsyncSession = Depends(get_async_db)
    ):
    if current_user.id != user_id and current_user.role.value != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not enough permissions")
    user = await get_user_by_id(db, user_id)
    
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
        
    
    return user


@router.patch("/{user_id}", response_model=UserRead, status_code=status.HTTP_200_OK)
async def update_user_route(user_id : int, user_data : UserUpdate, current_user : UserModel = Depends(get_current_user), db : AsyncSession = Depends(get_async_db)):
    if current_user.id != user_id and current_user.role.value != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not enough permissions")
    
    try:
        user = await update_user(db, user_id, user_data )
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(exc))
    
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")

    # post_service потом сможет дочитать это событие и обновить локальную копию пользователя.
    await send_event(
        "user-events",
        {
            "event_type": "user.updated",
            "event_version": 1,
            "payload": build_user_event_payload(user),
        },
    )
    
    return user


@router.delete("/{user_id}", response_model=UserRead, status_code=status.HTTP_200_OK)
async def delete_user_route(
    user_id : int, 
    current_user: UserModel = Depends(get_current_user),
    db : AsyncSession = Depends(get_async_db)):
    if current_user.id != user_id and current_user.role.value != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not enough permissions")
    
    try:
        user = await delete_user(db, user_id)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(exc))
    
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    # DELETE мягкий: строка остается в БД, но is_active становится false.
    await send_event(
        "user-events",
        {
            "event_type": "user.deleted",
            "event_version": 1,
            "payload": build_user_event_payload(user),
        },
    )
        
    return user
