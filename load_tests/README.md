# Нагрузочные тесты регистрации

Тестируется `POST /users/`. Locust выводит RPS, среднее время ответа,
p95/p99 и процент ошибок в web-интерфейсе, CSV и HTML-отчёте.

## Установка

```powershell
uv sync --group load
```

Перед запуском поднимите `user_service`, PostgreSQL и Kafka. По умолчанию
тест обращается к `http://127.0.0.1:8000`.

```powershell
New-Item -ItemType Directory -Force reports | Out-Null
```

## 1. Ровно 1000 регистраций

Счётчик резервируется до отправки запроса, поэтому параллельные пользователи
не превышают лимит:

```powershell
$env:LOAD_PROFILE="total"
$env:TOTAL_REGISTRATIONS="1000"
$env:CONSTANT_USERS="50"
$env:DATA_MODE="unique"
uv run --group load locust -f load_tests/locustfile.py --headless `
  --host http://127.0.0.1:8000 --csv reports/total --html reports/total.html
```

## 2. Постепенный набор нагрузки

Профиль: 10 пользователей за 30 секунд, 30 за 90, 60 за 180 и 100 за 240.
Длительность можно изменить через `RUN_TIME_SECONDS`.

```powershell
$env:LOAD_PROFILE="gradual"
$env:RUN_TIME_SECONDS="300"
$env:DATA_MODE="unique"
uv run --group load locust -f load_tests/locustfile.py --headless `
  --host http://127.0.0.1:8000 --csv reports/gradual --html reports/gradual.html
```

## 3. Заданное число одновременных пользователей

```powershell
$env:LOAD_PROFILE="constant"
$env:CONSTANT_USERS="100"
$env:RUN_TIME_SECONDS="300"
$env:DATA_MODE="unique"
uv run --group load locust -f load_tests/locustfile.py --headless `
  --host http://127.0.0.1:8000 --csv reports/constant --html reports/constant.html
```

## База данных и повторяющиеся данные

Запустите один и тот же профиль дважды с разными значениями `DATA_MODE`:

- `unique` создаёт новую пару username/email на каждый запрос: выполняются
  поиск, Argon2-хеширование, INSERT/COMMIT/refresh и отправка события Kafka;
- `duplicate` повторяет одну пару: первый запрос получает 201, остальные —
  ожидаемый 409 после поиска в БД. Locust помечает оба ответа успешными,
  потому что 409 здесь является ожидаемым результатом сценария.

```powershell
$env:LOAD_PROFILE="constant"
$env:CONSTANT_USERS="50"
$env:RUN_TIME_SECONDS="180"
$env:DATA_MODE="duplicate"
$env:DUPLICATE_KEY="experiment_1"
uv run --group load locust -f load_tests/locustfile.py --headless `
  --host http://127.0.0.1:8000 --csv reports/duplicate --html reports/duplicate.html
```

Сравнивайте файлы `*_stats.csv`: `Requests/s`, `Average Response Time`,
`95%`, `99%` и `Failure Count / Request Count`. Для чистого влияния PostgreSQL
одновременно снимайте `pg_stat_statements` и загрузку CPU/IO: разница между
`unique` и `duplicate` включает не только БД, но также Argon2 и Kafka.

Перед повтором `unique` менять ключ не нужно: идентификатор запуска содержит
текущее время. Для независимых повторов `duplicate` задавайте новый
`DUPLICATE_KEY`.
