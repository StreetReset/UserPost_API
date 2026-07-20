"""Locust scenarios for the user registration endpoint.

Environment variables:
    LOAD_PROFILE=total|gradual|constant
    DATA_MODE=unique|duplicate
    TOTAL_REGISTRATIONS=1000
    CONSTANT_USERS=50
    RUN_TIME_SECONDS=300
"""

from __future__ import annotations

import os
import threading
import time
from itertools import count

from locust import HttpUser, LoadTestShape, between, task


PROFILE = os.getenv("LOAD_PROFILE", "total").lower()
DATA_MODE = os.getenv("DATA_MODE", "unique").lower()
TOTAL = int(os.getenv("TOTAL_REGISTRATIONS", "1000"))
CONSTANT_USERS = int(os.getenv("CONSTANT_USERS", "50"))
RUN_TIME = int(os.getenv("RUN_TIME_SECONDS", "300"))

if PROFILE not in {"total", "gradual", "constant"}:
    raise ValueError("LOAD_PROFILE must be total, gradual or constant")
if DATA_MODE not in {"unique", "duplicate"}:
    raise ValueError("DATA_MODE must be unique or duplicate")
if TOTAL < 1 or CONSTANT_USERS < 1 or RUN_TIME < 1:
    raise ValueError("numeric load-test settings must be positive")

_sequence = count(1)
_lock = threading.Lock()
_reserved = 0
_completed = 0
_run_id = f"{int(time.time()):x}"[-8:]


def _reserve_registration() -> int | None:
    """Reserve one request number, preventing a concurrent overshoot of TOTAL."""
    global _reserved
    with _lock:
        if PROFILE == "total" and _reserved >= TOTAL:
            return None
        _reserved += 1
        return next(_sequence)


def _payload(number: int) -> dict[str, str]:
    if DATA_MODE == "duplicate":
        suffix = os.getenv("DUPLICATE_KEY", "shared")
    else:
        suffix = str(number)

    return {
        "username": f"lt_{_run_id}_{suffix}"[:30],
        "email": f"lt_{_run_id}_{suffix}@example.com",
        "password": "load-test-password",
        "birth_date": "1990-01-01",
        "first_name": "Load",
        "last_name": "Test",
    }


def _complete_registration(environment) -> None:
    global _completed
    with _lock:
        _completed += 1
        finished = PROFILE == "total" and _completed >= TOTAL
    if finished:
        environment.runner.quit()


class RegistrationUser(HttpUser):
    wait_time = between(0.05, 0.2)

    @task
    def register(self) -> None:
        number = _reserve_registration()
        if number is None:
            return

        expected_statuses = {201} if DATA_MODE == "unique" else {201, 409}
        metric_name = f"/users/ [{DATA_MODE}]"

        with self.client.post(
            "/users/",
            json=_payload(number),
            name=metric_name,
            catch_response=True,
        ) as response:
            if response.status_code in expected_statuses:
                response.success()
            else:
                response.failure(
                    f"unexpected HTTP {response.status_code}: {response.text[:200]}"
                )
        _complete_registration(self.environment)


class RegistrationLoadShape(LoadTestShape):
    """Profiles usable without changing the locustfile."""

    def tick(self):
        elapsed = self.get_run_time()

        if PROFILE == "gradual":
            stages = (
                (30, 10, 1),
                (90, 30, 2),
                (180, 60, 3),
                (240, 100, 4),
                (RUN_TIME, 100, 1),
            )
            for until, users, spawn_rate in stages:
                if elapsed < min(until, RUN_TIME):
                    return users, spawn_rate
            return None

        if elapsed >= RUN_TIME and PROFILE == "constant":
            return None

        return CONSTANT_USERS, max(1, CONSTANT_USERS // 10)
