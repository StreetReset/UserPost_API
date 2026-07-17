from sqlalchemy import desc, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from ..models.user_models import User


class UserRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_by_username_or_email(
        self,
        username: str | None = None,
        email: str | None = None,
        exclude_user_id: int | None = None,
    ) -> User | None:
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

        return await self.session.scalar(query)

    async def get_by_id(self, user_id: int) -> User | None:
        return await self.session.scalar(
            select(User).where(User.id == user_id)
        )

    async def get_active_by_id(self, user_id: int) -> User | None:
        return await self.session.scalar(
            select(User).where(
                User.id == user_id,
                User.is_active.is_(True),
            )
        )

    async def get_list_active_users(
        self,
        limit: int,
        offset: int,
    ) -> list[User]:
        users = await self.session.scalars(
            select(User)
            .where(User.is_active.is_(True))
            .order_by(desc(User.created_at))
            .limit(limit)
            .offset(offset)
        )
        return list(users.all())

    async def get_list_inactive_users(
        self,
        limit: int,
        offset: int,
    ) -> list[User]:
        users = await self.session.scalars(
            select(User)
            .where(User.is_active.is_(False))
            .order_by(desc(User.created_at))
            .limit(limit)
            .offset(offset)
        )
        return list(users.all())

    async def create(self, user: User) -> User:
        self.session.add(user)
        await self.session.commit()
        await self.session.refresh(user)
        return user

    async def update(self, user: User, update_data: dict) -> User:
        for field, value in update_data.items():
            setattr(user, field, value)

        await self.session.commit()
        await self.session.refresh(user)
        return user

    async def soft_delete(self, user: User) -> User:
        user.is_active = False

        await self.session.commit()
        await self.session.refresh(user)
        return user
