# Pet API

Учебный backend-проект на FastAPI с двумя сервисами:

- `user_service` - управление пользователями;
- `post_service` - управление постами.

Проект использует PostgreSQL, SQLAlchemy Async, Alembic, Pydantic и `uv`.

## Стек

- Python 3.13+
- FastAPI
- Uvicorn
- SQLAlchemy Async
- Alembic
- PostgreSQL
- asyncpg / psycopg2-binary
- Pydantic
- uv

## Структура проекта

```text
Pet_api/
├── user_service/
│   └── app/
│       ├── core/          # подключение к БД
│       ├── migrations/    # Alembic-миграции users
│       ├── models/        # SQLAlchemy-модели users
│       ├── routers/       # API-роуты users
│       ├── schemas/       # Pydantic-схемы users
│       ├── services/      # бизнес-логика users
│       └── main.py        # FastAPI-приложение User-Service
├── post_service/
│   └── app/
│       ├── core/          # подключение к БД
│       ├── migrations/    # Alembic-миграции posts
│       ├── models/        # SQLAlchemy-модели posts
│       ├── routers/       # API-роуты posts
│       ├── schemas/       # Pydantic-схемы posts
│       ├── services/      # бизнес-логика posts
│       └── main.py        # FastAPI-приложение Post-Service
├── pyproject.toml
├── uv.lock
└── README.md
```

## Установка

Установить зависимости:

```bash
uv sync
```

Создать PostgreSQL-базы данных:

```sql
CREATE DATABASE user_service_db;
CREATE DATABASE post_service_db;
```

## Переменные окружения

Каждый сервис читает свой `.env` из папки `app`.

Файл:

```text
user_service/app/.env
```

Пример:

```env
DATABASE_URL=postgresql+asyncpg://postgres:password@localhost:5432/user_service_db
```

Файл:

```text
post_service/app/.env
```

Пример:

```env
DATABASE_URL=postgresql+asyncpg://postgres:password@localhost:5432/post_service_db
```

Файлы `.env` не добавляются в Git, потому что содержат локальные настройки и пароли.

## Миграции

Применить миграции User-Service:

```bash
uv run alembic -c user_service/app/alembic.ini upgrade head
```

Применить миграции Post-Service:

```bash
uv run alembic -c post_service/app/alembic.ini upgrade head
```

Создать новую миграцию User-Service:

```bash
uv run alembic -c user_service/app/alembic.ini revision --autogenerate -m "migration name"
```

Создать новую миграцию Post-Service:

```bash
uv run alembic -c post_service/app/alembic.ini revision --autogenerate -m "migration name"
```

## Запуск

Запуск User-Service:

```bash
uv run uvicorn user_service.app.main:app --reload --port 8000
```

Swagger:

```text
http://127.0.0.1:8000/docs
```

Запуск Post-Service:

```bash
uv run uvicorn post_service.app.main:app --reload --port 8001
```

Swagger:

```text
http://127.0.0.1:8001/docs
```

## User-Service

### Модель `users`

| Поле | Тип | Описание |
| --- | --- | --- |
| `id` | `int` | Первичный ключ |
| `username` | `str` | Уникальный username, 3-30 символов |
| `email` | `str` | Уникальный email |
| `birth_date` | `date` | Дата рождения, не может быть в будущем |
| `first_name` | `str` | Имя |
| `last_name` | `str` | Фамилия |
| `is_active` | `bool` | Признак активного пользователя |
| `created_at` | `datetime` | Дата создания в UTC |

### API

| Метод | URL | Описание |
| --- | --- | --- |
| `GET` | `/` | Проверка работы сервиса |
| `POST` | `/users/` | Создать пользователя |
| `GET` | `/users/active` | Получить активных пользователей |
| `GET` | `/users/inactive` | Получить неактивных пользователей |
| `GET` | `/users/{user_id}` | Получить пользователя по ID |
| `PATCH` | `/users/{user_id}` | Частично обновить пользователя |
| `DELETE` | `/users/{user_id}` | Мягко удалить пользователя |

### Пример создания пользователя

```json
{
  "username": "ivan_01",
  "email": "ivan@example.com",
  "birth_date": "2000-01-01",
  "first_name": "Ivan",
  "last_name": "Petrov"
}
```

### Особенности

- `username` и `email` уникальны.
- При создании проверяются дубли `username` и `email`.
- При обновлении проверяется дубль `email`.
- `DELETE /users/{user_id}` не удаляет запись физически, а выставляет `is_active = false`.
- Повторное удаление уже неактивного пользователя возвращает конфликт состояния.

## Post-Service

### Модель `posts`

| Поле | Тип | Описание |
| --- | --- | --- |
| `id` | `int` | Первичный ключ |
| `author_id` | `int` | ID автора |
| `title` | `str` | Заголовок поста |
| `content` | `str` | Текст поста |
| `status` | `PostStatus` | Статус поста |
| `is_active` | `bool` | Признак активного поста |
| `created_at` | `datetime` | Дата создания в UTC |
| `updated_at` | `datetime` | Дата обновления в UTC |

### Статусы поста

- `DRAFT` - черновик;
- `PUBLISHED` - опубликован;
- `ARCHIVED` - архивирован.

### API

| Метод | URL | Описание |
| --- | --- | --- |
| `GET` | `/` | Проверка работы сервиса |
| `POST` | `/posts/` | Создать пост |
| `GET` | `/posts/` | Получить активные посты |
| `GET` | `/posts/by-author/{author_id}` | Получить посты автора |
| `GET` | `/posts/published` | Получить опубликованные посты |
| `GET` | `/posts/archived` | Получить архивированные посты |
| `GET` | `/posts/{post_id}` | Получить пост по ID |
| `PATCH` | `/posts/{post_id}` | Частично обновить пост |
| `PATCH` | `/posts/{post_id}/publish` | Опубликовать пост |
| `PATCH` | `/posts/{post_id}/archive` | Архивировать пост |
| `DELETE` | `/posts/{post_id}` | Мягко удалить пост |

### Пример создания поста

```json
{
  "author_id": 1,
  "title": "First post",
  "content": "Post content"
}
```

### Особенности

- `DELETE /posts/{post_id}` выставляет `is_active = false`.
- Архивированный пост нельзя обновить.
- Публикация работает только для постов в статусе `DRAFT`.
- Архивация работает только для постов в статусе `PUBLISHED`.
- Сейчас `author_id` хранится как число без проверки существования пользователя в `user_service`.

## План развития

Следующий крупный этап - авторизация и роли.

Планируемая логика:

- пользователь регистрируется и получает учетную запись;
- пользователь входит по логину и паролю;
- после входа API выдает токен доступа;
- при создании поста `author_id` берется из токена, а не передается вручную;
- пользователь создает, обновляет и удаляет только свои посты;
- администратор может управлять пользователями и постами шире обычного пользователя.

Возможные роли:

- `USER` - обычный пользователь, пишет посты от своего имени;
- `ADMIN` - администратор, может видеть и управлять большим набором данных.

Для этого потребуется добавить:

- поле `password_hash` в пользователя;
- поле `role` в пользователя;
- эндпоинты регистрации и логина;
- хеширование паролей;
- JWT-токены или другой механизм авторизации;
- проверку текущего пользователя в `post_service`.
