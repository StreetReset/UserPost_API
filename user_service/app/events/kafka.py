import json
from typing import Any

from aiokafka import AIOKafkaProducer

from user_service.app.config import KAFKA_BOOTSTRAP_SERVERS


# Один producer живет весь срок работы FastAPI-приложения.
producer: AIOKafkaProducer | None = None


async def start_kafka_producer() -> None:
    global producer

    producer = AIOKafkaProducer(
        bootstrap_servers=KAFKA_BOOTSTRAP_SERVERS,
        # Kafka хранит bytes, поэтому dict сериализуем в JSON.
        value_serializer=lambda value: json.dumps(value).encode("utf-8"),
    )
    await producer.start()


async def stop_kafka_producer() -> None:
    global producer

    if producer is not None:
        await producer.stop()
        producer = None


async def send_event(topic: str, event: dict[str, Any]) -> None:
    if producer is None:
        raise RuntimeError("Kafka producer is not started")

    # send_and_wait дожидается подтверждения брокера, что событие принято.
    await producer.send_and_wait(topic, event)
