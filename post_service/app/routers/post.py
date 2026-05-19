from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from post_service.app.auth.dependencies import get_current_admin, get_current_user_id, get_current_user_context
from post_service.app.schemas.post import (
    PostCreate,
    PostUpdate,
    PostRead
)
from post_service.app.core.db_depends import get_async_db
from post_service.app.services.service import (
    create_post,
    get_post_by_id,
    get_list_posts,
    get_posts_by_author,
    get_list_published_posts,
    get_list_archived_posts,
    update_post,
    delete_post,
)

router = APIRouter(
    prefix="/posts",
    tags=["posts"]
)


@router.post("/", response_model=PostRead, status_code=status.HTTP_201_CREATED)
async def create_post_route(
    post_data: PostCreate,
    current_user_id : int = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_async_db),
):
    post = await create_post(
        db,
        post_data,
        author_id=current_user_id)
    
    return post


@router.get("/", response_model=list[PostRead])
async def get_list_posts_route(
    _: str = Depends(get_current_admin),
    db: AsyncSession = Depends(get_async_db),
):
    posts = await get_list_posts(db)
    return posts


@router.get("/by-author", response_model=list[PostRead])
async def get_posts_by_author_route(
    current_user_id: int = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_async_db)
):
    posts = await get_posts_by_author(db, current_user_id)
    return posts


@router.get("/published", response_model=list[PostRead])
async def get_list_published_posts_route(
    db: AsyncSession = Depends(get_async_db)
):
    posts = await get_list_published_posts(db)
    return posts


@router.get("/archived", response_model=list[PostRead])
async def get_list_archived_posts_route(
    db: AsyncSession = Depends(get_async_db)
):
    posts = await get_list_archived_posts(db)
    return posts


@router.get("/{post_id}", response_model=PostRead)
async def get_post_by_id_route(
    post_id: int,
    db: AsyncSession = Depends(get_async_db)
):
    post = await get_post_by_id(db, post_id)

    if post is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Post not found",
        )

    return post


@router.patch("/{post_id}", response_model=PostRead, status_code=status.HTTP_200_OK)
async def update_post_route(
    post_data: PostUpdate,
    post_id: int,
    current_user_id: int = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_async_db)
):
    try:
        post = await update_post(
            db,
            post_data,
            post_id,
            author_id=current_user_id,
        )
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(exc),
    )

    if post is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Post not found",
        )

    return post


@router.delete("/{post_id}", response_model=PostRead, status_code=status.HTTP_200_OK)
async def delete_post_route(
    post_id: int,
    current_user: tuple[int, str] = Depends(get_current_user_context),
    db: AsyncSession = Depends(get_async_db),
):
    current_user_id, role = current_user
    
    author_id = None if role == "admin" else current_user_id
    
    
    post = await delete_post(
        db,
        post_id,
        author_id=author_id,
    )

    
    if post is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Post not found",
        )

    return post
