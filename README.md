# UserPost API

Учебное full-stack приложение с микросервисной архитектурой: пользователи,
авторизация, публикация постов и web-интерфейс.

Проект состоит из четырёх контейнеров:

- `user_service` — пользователи, роли, JWT и отправка событий в Kafka;
- `post_service` — публичные посты, черновики автора и административные операции;
- `frontend` — интерфейс на Next.js;
- `kafka` — брокер событий пользователей.

PostgreSQL пока запускается отдельно на хосте. Оба backend-сервиса используют
собственные базы данных.

## Стек

### Backend

- Python 3.13
- FastAPI и Uvicorn
- SQLAlchemy Async и asyncpg
- Alembic
- Pydantic Settings
- JWT (`python-jose`)
- `pwdlib[argon2]`
- aiokafka
- uv

### Frontend

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS

### Инфраструктура

- Docker и Docker Compose
- PostgreSQL
- Apache Kafka в KRaft-режиме

## Архитектура

```text
Browser
   |
   v
Frontend :3000
   |                |
   v                v
User Service      Post Service
   :8000             :8001
   |                  |
   v                  v
user_service_db    post_service_db
   |
   v
Kafka :29092 (внутри Docker-сети)
      :9092  (с хоста)
```

`user_service` выпускает access- и refresh-токены. `post_service` проверяет
access-токены тем же `SECRET_KEY`, но не обращается к базе пользователей.

После создания, изменения или мягкого удаления пользователя `user_service`
публикует событие в Kafka topic `user-events`.

## Структура

```text
UserPost_API/
├── frontend/
│   ├── app/                    # страницы и Next.js route handlers
│   ├── components/             # UI-компоненты
│   ├── lib/                    # API-клиенты и типы
│   ├── public/
│   └── Dockerfile
├── user_service/
│   ├── app/
│   │   ├── auth/               # JWT и auth-зависимости
│   │   ├── core/               # подключение к БД
│   │   ├── dependencies/       # FastAPI dependency injection
│   │   ├── events/             # Kafka producer
│   │   ├── migrations/         # Alembic-миграции
│   │   ├── models/
│   │   ├── repositories/
│   │   ├── routers/
│   │   ├── schemas/
│   │   └── services/
│   └── Dockerfile
├── post_service/
│   ├── app/
│   │   ├── auth/
│   │   ├── core/
│   │   ├── dependencies/
│   │   ├── migrations/
│   │   ├── models/
│   │   ├── repositories/
│   │   ├── routers/
│   │   ├── schemas/
│   │   └── services/
│   └── Dockerfile
├── docker-compose.yml
├── pyproject.toml
├── uv.lock
└── README.md
```

## Быстрый запуск через Docker

### 1. Подготовить PostgreSQL

PostgreSQL должен быть запущен на хосте и принимать подключения от Docker
Desktop. Создайте две базы и пользователей либо используйте существующих:

```sql
CREATE DATABASE user_service_db;
CREATE DATABASE post_service_db;
```

В Docker контейнеры обращаются к PostgreSQL на хосте через
`host.docker.internal`.

### 2. Создать Docker env-файлы

Создайте `user_service/app/.env.docker`:

```env
DATABASE_URL=postgresql+asyncpg://user_admin:change-me@host.docker.internal:5432/user_service_db
SECRET_KEY=change-me
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7
KAFKA_BOOTSTRAP_SERVERS=kafka:29092
```

Создайте `post_service/app/.env.docker`:

```env
DATABASE_URL=postgresql+asyncpg://post_admin:change-me@host.docker.internal:5432/post_service_db
SECRET_KEY=change-me
ALGORITHM=HS256
USER_SERVICE_AUTH_TOKEN_URL=http://localhost:8000/auth/login
```

`SECRET_KEY` и `ALGORITHM` должны совпадать в обоих сервисах. Сгенерировать
ключ можно командой:

```bash
python -c "import secrets; print(secrets.token_urlsafe(64))"
```

Файлы `.env` и `.env.*` исключены из Git. Не добавляйте их принудительно через
`git add -f`.

### 3. Собрать и запустить проект

```bash
docker compose up --build
```

Для запуска в фоне:

```bash
docker compose up --build -d
```

После запуска доступны:

| Компонент | URL |
| --- | --- |
| Frontend | <http://localhost:3000> |
| User Service Swagger | <http://localhost:8000/docs> |
| Post Service Swagger | <http://localhost:8001/docs> |
| Kafka с хоста | `localhost:9092` |

### 4. Применить миграции

```bash
docker compose exec user_service uv run alembic -c user_service/app/alembic.ini upgrade head
docker compose exec post_service uv run alembic -c post_service/app/alembic.ini upgrade head
```

### Управление контейнерами

```bash
# Состояние сервисов
docker compose ps

# Логи всего проекта
docker compose logs -f

# Логи одного сервиса
docker compose logs -f user_service

# Пересборка после изменения кода
docker compose up -d --build

# Остановка и удаление контейнеров
docker compose down
```

Изменения только в `.env.docker` не требуют пересборки образа:

```bash
docker compose up -d --force-recreate
```

## Локальный запуск без Docker

Docker можно использовать только для Kafka, а Python- и Node.js-приложения
запускать на хосте.

### Backend

Установить зависимости:

```bash
uv sync
```

Создать `user_service/app/.env`:

```env
DATABASE_URL=postgresql+asyncpg://user_admin:change-me@localhost:5432/user_service_db
SECRET_KEY=change-me
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7
KAFKA_BOOTSTRAP_SERVERS=localhost:9092
```

Создать `post_service/app/.env`:

```env
DATABASE_URL=postgresql+asyncpg://post_admin:change-me@localhost:5432/post_service_db
SECRET_KEY=change-me
ALGORITHM=HS256
USER_SERVICE_AUTH_TOKEN_URL=http://127.0.0.1:8000/auth/login
```

Запустить Kafka:

```bash
docker compose up -d kafka
```

Применить миграции:

```bash
uv run alembic -c user_service/app/alembic.ini upgrade head
uv run alembic -c post_service/app/alembic.ini upgrade head
```

Запустить сервисы в отдельных терминалах:

```bash
uv run uvicorn user_service.app.main:app --reload --port 8000
```

```bash
uv run uvicorn post_service.app.main:app --reload --port 8001
```

### Frontend

```bash
cd frontend
npm ci
npm run dev
```

При локальном запуске frontend по умолчанию обращается к:

```text
USER_API_URL=http://127.0.0.1:8000
POST_API_URL=http://127.0.0.1:8001
```

## API

### User Service

#### Авторизация

| Метод | URL | Доступ | Описание |
| --- | --- | --- | --- |
| `POST` | `/auth/login` | Public | Вход по username/email и паролю |
| `GET` | `/auth/me` | Access token | Текущий пользователь |
| `POST` | `/auth/refresh` | Refresh token | Новый access token |

`/auth/login` принимает `OAuth2PasswordRequestForm`:

```text
username=ivan_01
password=strongpassword
```

`/auth/refresh` принимает refresh token как query-параметр:

```text
POST /auth/refresh?refresh_token=eyJ...
```

#### Пользователи

| Метод | URL | Доступ | Описание |
| --- | --- | --- | --- |
| `POST` | `/users/` | Public | Регистрация |
| `GET` | `/users/{user_id}` | Self или admin | Пользователь по ID |
| `PATCH` | `/users/{user_id}` | Self или admin | Частичное обновление |
| `DELETE` | `/users/{user_id}` | Self или admin | Мягкое удаление |
| `GET` | `/users/active` | Admin | Активные пользователи |
| `GET` | `/users/inactive` | Admin | Неактивные пользователи |

Списки поддерживают пагинацию:

```text
?limit=20&offset=0
```

Пример регистрации:

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

Роли пользователей: `user` и `admin`. Удаление мягкое: запись остаётся в БД,
а `is_active` становится `false`.

### Post Service

#### Публичные маршруты

| Метод | URL | Описание |
| --- | --- | --- |
| `GET` | `/api/posts/` | Опубликованные посты |
| `GET` | `/api/posts/{post_id}` | Опубликованный пост по ID |

#### Маршруты автора

| Метод | URL | Описание |
| --- | --- | --- |
| `GET` | `/api/me/posts/` | Все активные посты текущего автора |
| `GET` | `/api/me/posts/drafts` | Черновики текущего автора |
| `POST` | `/api/me/posts/drafts` | Создать черновик |
| `PATCH` | `/api/me/posts/{post_id}` | Изменить свой пост |
| `PATCH` | `/api/me/posts/publish/{post_id}` | Опубликовать черновик |
| `PATCH` | `/api/me/posts/archive/{post_id}` | Архивировать пост |
| `DELETE` | `/api/me/posts/{post_id}` | Мягко удалить свой пост |

#### Административные маршруты

| Метод | URL | Описание |
| --- | --- | --- |
| `GET` | `/api/admin/posts/` | Все активные посты |
| `GET` | `/api/admin/posts/archived` | Архивированные посты |
| `DELETE` | `/api/admin/posts/{post_id}` | Мягко удалить любой пост |

Списки постов поддерживают `limit` от 1 до 100 и `offset` от 0.

Пример создания черновика:

```json
{
  "title": "First post",
  "content": "Post content"
}
```

`author_id` берётся из `sub` access-токена и не передаётся в теле запроса.

Статусы поста:

- `draft` — черновик;
- `published` — опубликован;
- `archived` — архивирован.

Архивированный пост нельзя редактировать. Публиковать можно только черновик,
архивировать — только опубликованный пост.

## Kafka

Kafka использует два listener:

- `kafka:29092` — для контейнеров внутри Compose;
- `localhost:9092` — для инструментов на хосте.

Topic событий пользователей:

```text
user-events
```

Типы событий:

- `user.created`;
- `user.updated`;
- `user.deleted`.

Команды диагностики:

```bash
docker exec -it userpost-kafka /opt/kafka/bin/kafka-topics.sh \
  --list \
  --bootstrap-server localhost:9092
```

```bash
docker exec -it userpost-kafka /opt/kafka/bin/kafka-console-consumer.sh \
  --topic user-events \
  --from-beginning \
  --bootstrap-server localhost:9092
```

## Миграции

Создать новую миграцию:

```bash
uv run alembic -c user_service/app/alembic.ini revision --autogenerate -m "migration name"
uv run alembic -c post_service/app/alembic.ini revision --autogenerate -m "migration name"
```

Применить миграции:

```bash
uv run alembic -c user_service/app/alembic.ini upgrade head
uv run alembic -c post_service/app/alembic.ini upgrade head
```

## Проверки

Backend:

```bash
uv run python -m compileall -q user_service post_service
```

Frontend:

```bash
cd frontend
npm run lint
npm run build
```

Docker Compose:

```bash
docker compose config
```

## Ограничения текущей версии

Конфигурация рассчитана на локальную разработку и демонстрацию, а не на
production-развёртывание:

- PostgreSQL работает вне Compose;
- миграции запускаются вручную;
- нет healthcheck и ожидания готовности Kafka/PostgreSQL;
- Kafka image пока использует тег `latest`;
- нет автоматических тестов и CI/CD;
- секреты хранятся в локальных env-файлах;
- нет reverse proxy, HTTPS, мониторинга и резервного копирования.

Следующие логичные шаги: добавить PostgreSQL в Compose, healthcheck, автоматические
миграции, тесты, CI/CD и production-конфигурацию управления секретами.
