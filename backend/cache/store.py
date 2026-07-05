import time
from typing import Any

_store: dict[str, tuple[Any, float]] = {}


def set(key: str, value: Any, ttl: int) -> None:
    _store[key] = (value, time.time() + ttl)


def get(key: str) -> Any | None:
    entry = _store.get(key)
    if entry is None:
        return None
    value, expires_at = entry
    if time.time() > expires_at:
        del _store[key]
        return None
    return value


def is_fresh(key: str) -> bool:
    return get(key) is not None
