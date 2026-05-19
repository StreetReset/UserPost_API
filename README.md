# UserPost_API

Учебный backend-проект на FastAPI с двумя отдельными сервисами:

- `user_service` - пользователи, регистрация, логин, JWT, роли;
- `post_service` - посты, статусы постов и проверка доступа по JWT.

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
- python-jose
- pwdlib[argon2]
- uv

## Структура проекта

```text
UserPost_API/
├── user_service/
│   └── app/
│       ├── auth/          # JWT, login, refresh, auth dependencies
│       ├── core/          # подключение к БД
│       ├── migrations/    # Alembic-миграции users
│       ├── models/        # SQLAlchemy-модели users
│       ├── routers/       # API-роуты users
│       ├── schemas/       # Pydantic-схемы users
│       ├── services/      # бизнес-логика users
│       ├── config.py      # настройки user_service
│       └── main.py        # FastAPI-приложение User-Service
├── post_service/
│   └── app/
│       ├── auth/          # проверка Bearer JWT и ролей
│       ├── core/          # подключение к БД
│       ├── migrations/    # Alembic-миграции posts
│       ├── models/        # SQLAlchemy-модели posts
│       ├── routers/       # API-роуты posts
│       ├── schemas/       # Pydantic-схемы posts
│       ├── services/      # бизнес-логика posts
│       ├── config.py      # настройки post_service
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

Файл `user_service/app/.env`:

```env
DATABASE_URL=postgresql+asyncpg://postgres:password@localhost:5432/user_service_db
SECRET_KEY=change-me
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7
```

Файл `post_service/app/.env`:

```env
DATABASE_URL=postgresql+asyncpg://postgres:password@localhost:5432/post_service_db
SECRET_KEY=change-me
ALGORITHM=HS256
```

Важно: `SECRET_KEY` и `ALGORITHM` должны совпадать в обоих сервисах, потому что `user_service` выпускает JWT, а `post_service` проверяет эти токены.

Файлы `.env` не добавляются в Git, потому что содержат локальные настройки и секреты.

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
| `hashed_password` | `str` | Хеш пароля |
| `birth_date` | `date` | Дата рождения, не может быть в будущем |
| `first_name` | `str` | Имя |
| `last_name` | `str` | Фамилия |
| `role` | `Role` | Роль пользователя: `user` или `admin` |
| `is_active` | `bool` | Признак активного пользователя |
| `created_at` | `datetime` | Дата создания в UTC |

### Роли

- `user` - обычный пользователь;
- `admin` - администратор.

Роль хранится в `users.role` и добавляется в JWT при логине и обновлении access token.

### Auth API

| Метод | URL | Доступ | Описание |
| --- | --- | --- | --- |
| `POST` | `/auth/login` | Public | Логин по username/email и паролю |
| `GET` | `/auth/me` | Bearer access token | Получить текущего пользователя |
| `POST` | `/auth/refresh` | Refresh token | Выпустить новый access token |

`POST /auth/login` использует `OAuth2PasswordRequestForm`, поэтому данные отправляются как form-data:

```text
username=ivan_01
password=strongpassword
```

Ответ:

```json
{
  "access_token": "eyJ...",
  "refresh_token": "eyJ...",
  "token_type": "bearer"
}
```

`POST /auth/refresh` сейчас принимает `refresh_token` как query-параметр:

```text
POST /auth/refresh?refresh_token=eyJ...
```

### Users API

| Метод | URL | Доступ | Описание |
| --- | --- | --- | --- |
| `GET` | `/` | Public | Проверка работы сервиса |
| `POST` | `/users/` | Public | Создать пользователя |
| `GET` | `/users/active` | Public | Получить активных пользователей |
| `GET` | `/users/inactive` | Public | Получить неактивных пользователей |
| `GET` | `/users/{user_id}` | Public | Получить пользователя по ID |
| `PATCH` | `/users/{user_id}` | Public | Частично обновить пользователя |
| `DELETE` | `/users/{user_id}` | Public | Мягко удалить пользователя |

На текущем этапе CRUD пользователей ещё не закрыт ролями. Логичный следующий шаг - ограничить списки пользователей и удаление чужих аккаунтов ролью `admin`, а изменение профиля разрешить самому пользователю или `admin`.

### Пример создания пользователя

```json
{
  "username": "ivan_01",
  "email": "ivan@example.com",
  "password": "strongpassword",
  "birth_date": "2000-01-01",
  "first_name": "Ivan",
  "last_name": "Petrov"
}
```

### Особенности User-Service

- `username` нормализуется в lowercase.
- `first_name` и `last_name` очищаются и приводятся к title-case.
- `username` и `email` уникальны.
- Пароль не хранится открытым текстом, сохраняется только `hashed_password`.
- При создании проверяются дубли `username` и `email`.
- При обновлении проверяется дубль `email`.
- `DELETE /users/{user_id}` не удаляет запись физически, а выставляет `is_active = false`.
- Повторное удаление уже неактивного пользователя возвращает конфликт состояния.

## Post-Service

### Модель `posts`

| Поле | Тип | Описание |
| --- | --- | --- |
| `id` | `int` | Первичный ключ |
| `author_id` | `int` | ID автора из JWT |
| `title` | `str` | Заголовок поста |
| `content` | `str` | Текст поста |
| `status` | `PostStatus` | Статус поста |
| `is_active` | `bool` | Признак активного поста |
| `created_at` | `datetime` | Дата создания в UTC |
| `updated_at` | `datetime` | Дата обновления в UTC |

### Статусы поста

- `draft` - черновик;
- `published` - опубликован;
- `archived` - архивирован.

### Posts API

| Метод | URL | Доступ | Описание |
| --- | --- | --- | --- |
| `GET` | `/` | Public | Проверка работы сервиса |
| `POST` | `/posts/` | Bearer access token | Создать пост от имени текущего пользователя |
| `GET` | `/posts/` | Admin only | Получить активные посты |
| `GET` | `/posts/by-author` | Bearer access token | Получить посты текущего пользователя |
| `GET` | `/posts/published` | Public | Получить опубликованные посты |
| `GET` | `/posts/archived` | Public | Получить архивированные посты |
| `GET` | `/posts/{post_id}` | Public | Получить активный пост по ID |
| `PATCH` | `/posts/{post_id}` | Bearer access token | Обновить свой пост |
| `PATCH` | `/posts/{post_id}/publish` | Bearer access token | Опубликовать свой пост |
| `PATCH` | `/posts/{post_id}/archive` | Bearer access token | Архивировать свой пост |
| `DELETE` | `/posts/{post_id}` | Bearer access token | Удалить свой пост; `admin` может удалить любой пост |

### Пример создания поста

`author_id` не передается в теле запроса. Он берется из `sub` в JWT.

```json
{
  "title": "First post",
  "content": "Post content"
}
```

Пример заголовка:

```text
Authorization: Bearer eyJ...
```

### Правила доступа в Post-Service

- `post_service` не хранит пользователей, а доверяет JWT, выпущенному `user_service`.
- JWT должен быть access token и содержать `sub` с ID пользователя.
- JWT должен содержать роль `user` или `admin`.
- При создании поста `author_id` всегда берется из токена.
- Обычный пользователь может обновлять, публиковать, архивировать и удалять только свои посты.
- `admin` может смотреть список всех активных постов через `GET /posts/`.
- `admin` может мягко удалить любой пост через `DELETE /posts/{post_id}`.
- `admin` не создает и не обновляет посты от чужого имени.

### Особенности Post-Service

- `DELETE /posts/{post_id}` выставляет `is_active = false`.
- Архивированный пост нельзя обновить.
- Публикация работает только для постов в статусе `draft`.
- Архивация работает только для постов в статусе `published`.
- `author_id` хранится как число без внешнего ключа на `user_service`.

## Текущий статус

Сделано:

- CRUD пользователей;
- хеширование паролей;
- login/refresh/me;
- access и refresh JWT;
- роли `user` и `admin`;
- CRUD и статусы постов;
- создание постов от имени пользователя из JWT;
- защита изменения/публикации/архивации своих постов;
- admin-доступ к списку всех постов;
- admin-удаление чужих постов.

Ближайшие логичные доработки:

- закрыть `user_service` ролями;
- перенести `refresh_token` из query-параметра в JSON body;
- добавить тесты на auth, роли и права доступа;
- добавить `.env.example` для обоих сервисов;
- убрать дублирование JWT-проверок в `post_service/app/auth/dependencies.py`;
- добавить пагинацию через query-параметры вместо фиксированных `limit(10).offset(0)`.
