import asyncio
import json
import logging
from typing import Any

from aiokafka import AIOKafkaProducer
from aiokafka.errors import KafkaConnectionError

from ..config import settings


logger = logging.getLogger(__name__)

producer: AIOKafkaProducer | None = None


async def start_kafka_producer(
    attempts: int = 10,
    delay: float = 2.0,
) -> None:
    global producer

    for attempt in range(1, attempts + 1):
        candidate = AIOKafkaProducer(
            bootstrap_servers=settings.KAFKA_BOOTSTRAP_SERVERS,
            value_serializer=lambda value: json.dumps(value).encode("utf-8"),
        )

        try:
            await candidate.start()
            producer = candidate
            logger.info("Kafka producer started")
            return
        except (KafkaConnectionError, OSError):
            await candidate.stop()

            if attempt == attempts:
                logger.exception(
                    "Could not connect to Kafka after %s attempts",
                    attempts,
                )
                raise

            logger.warning(
                "Kafka is unavailable, retry %s/%s in %.1f seconds",
                attempt,
                attempts,
                delay,
            )
            await asyncio.sleep(delay)


async def stop_kafka_producer() -> None:
    global producer

    if producer is not None:
        await producer.stop()
        producer = None


async def send_event(topic: str, event: dict[str, Any]) -> None:
    if producer is None:
        raise RuntimeError("Kafka producer is not started")

    await producer.send_and_wait(topic, event)
