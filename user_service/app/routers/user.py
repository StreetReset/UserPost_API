from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from user_service.app.schemas.user import (
    UserCreate,
    UserRead,
    UserUpdate
    )
from user_service.app.core.db_depends import get_async_db
from user_service.app.services.service import (
    create_user,
    update_user,
    get_list_active_users,
    get_list_inactive_users,
    get_user_by_id,
    delete_user
)

router = APIRouter(
    prefix="/users",
    tags=["users"]
)

@router.post("/", response_model=UserRead, status_code=status.HTTP_201_CREATED)
async def create_user_route(
    user_data : UserCreate, 
    db : AsyncSession = Depends(get_async_db)):
    try:
        user = await create_user(db, user_data)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(exc))
    
    return user


@router.get("/active", response_model=list[UserRead], status_code=status.HTTP_200_OK)
async def get_list_active_users_route(db : AsyncSession = Depends(get_async_db)):
    users = await get_list_active_users(db)
    return users


@router.get("/inactive", response_model=list[UserRead], status_code=status.HTTP_200_OK)
async def get_list_inactive_users_route(db : AsyncSession = Depends(get_async_db)):
    users = await get_list_inactive_users(db)
    return users


@router.get("/{user_id}", response_model=UserRead, status_code=status.HTTP_200_OK)
async def get_user_by_id_route(
    user_id : int ,
    db : AsyncSession = Depends(get_async_db)
    ):
    user = await get_user_by_id(db, user_id)
    
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
        
    
    return user


@router.patch("/{user_id}", response_model=UserRead, status_code=status.HTTP_200_OK)
async def update_user_route(user_id : int, user_data : UserUpdate, db : AsyncSession = Depends(get_async_db)):
    try:
        user = await update_user(db, user_id, user_data )
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(exc))
    
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    
    return user


@router.delete("/{user_id}", response_model=UserRead, status_code=status.HTTP_200_OK)
async def delete_user_route(user_id : int, db : AsyncSession = Depends(get_async_db)):
    try:
        user = await delete_user(db, user_id)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(exc))
    
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
        
    return user
