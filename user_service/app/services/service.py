from sqlalchemy import select, desc, or_

from sqlalchemy.ext.asyncio import AsyncSession

from user_service.app.auth.hashing import hash_password
from user_service.app.models.user_models import User
from user_service.app.schemas.user import UserCreate, UserUpdate

async def get_user_by_username_or_email(
    db : AsyncSession,
    username : str | None = None,
    email : str | None = None,
    exclude_user_id: int | None = None,
) -> User | None:
    """
    Ищет пользователя по username или email.

    Функция нужна для проверки дублей перед созданием или обновлением
    пользователя. В список conditions добавляются только те условия,
    для которых реально передали значения: username, email или оба сразу.

    Если передан exclude_user_id, пользователь с этим id исключается
    из поиска. Это нужно при update, чтобы текущий пользователь не считался
    дублем самого себя, если он оставил свой email или username без изменений.
    """
    conditions = []
    
    if username is not None:
        conditions.append(User.username == username)
        
    if email is not None:
        conditions.append(User.email == email)
    
    if not conditions:
        return None
    
    query = select(User).where(or_(*conditions))
    
    if exclude_user_id is not None:
        query = query.where(User.id != exclude_user_id)
    
    return await db.scalar(query)


async def create_user(db : AsyncSession, user_data : UserCreate) -> User:
    """
    Создает нового пользователя.
    """
    existing_user = await get_user_by_username_or_email(
        db, 
        username=user_data.username, 
        email=user_data.email
    )
    
    if existing_user is not None:
        raise ValueError("User with this Email or Username already exists")
    
    user_dict = user_data.model_dump(exclude={"password"})
    user = User(
        **user_dict,
        hashed_password=hash_password(user_data.password),
    )
    
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user


async def update_user(db : AsyncSession, user_id : int, user_data : UserUpdate) -> User | None:
    """
    Обновляет пользователя по id.
    """
    user = await db.scalar(
        select(User)
        .where(User.id == user_id, User.is_active)
    )
    
    if user is None:
        return None
    
    update_data = user_data.model_dump(exclude_unset=True)
    
    existing_user = await get_user_by_username_or_email(
        db,  
        email=update_data.get("email"), 
        exclude_user_id=user_id)
    
    if existing_user is not None:
        raise ValueError("User with this Email or Username already exists")
     
    for key, value in update_data.items():
        setattr(user, key, value)
    await db.commit()
    await db.refresh(user)
    return user
    
    
async def get_list_active_users(db : AsyncSession) -> list[User]:
    """
    Возвращает список активных пользователей.
    """
    users = await db.scalars(
        select(User)
        .where(User.is_active)
        .order_by(desc(User.created_at))
        .limit(10)
        .offset(0))
    return users.all()


async def get_list_inactive_users(db : AsyncSession) -> list[User]:
    """
    Возвращает список неактивных пользователей.
    """
    users = await db.scalars(
        select(User)
        .where(User.is_active.is_(False))
        .order_by(desc(User.created_at))
        .limit(10)
        .offset(0))
    return users.all()

async def get_user_by_id(db : AsyncSession, user_id : int) -> User | None:
    """
    Возвращает пользователя по id, включая неактивных.
    """
    user = await db.scalar(
        select(User)
        .where(User.id == user_id))
    
    if user is None:
        return None
    
    return user

async def delete_user(db : AsyncSession, user_id : int) -> User | None:
    """
    Мягко удаляет пользователя по id.
    """
    user = await db.scalar(
        select(User)
        .where(User.id == user_id))
    
    if user is None:
        return None
    
    if not user.is_active:
        raise ValueError("User is already deleted")
    
    user.is_active = False
    
    await db.commit()
    await db.refresh(user)
    return user
