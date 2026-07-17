FROM python:3.13-slim

WORKDIR /app

COPY pyproject.toml uv.lock ./

RUN pip install --no-cache-dir uv \
    && uv sync --frozen --no-dev

COPY post_service ./post_service

EXPOSE 8001

CMD ["uv", "run", "uvicorn", "post_service.app.main:app", "--host", "0.0.0.0", "--port", "8001"]