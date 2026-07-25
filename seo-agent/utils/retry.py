"""
Small retry decorator -- deliberately not pulling in tenacity for this
one thing, since a simple backoff loop covers everything the crawler
needs (transient network errors, rate limits).
"""
from __future__ import annotations

import functools
import time
from typing import Callable, Tuple, Type

from logger import get_logger

log = get_logger(__name__)


def retry(
    exceptions: Tuple[Type[BaseException], ...] = (Exception,),
    tries: int = 3,
    base_delay: float = 1.0,
    backoff: float = 2.0,
):
    """
    Retries the decorated function on the given exceptions with
    exponential backoff. Re-raises the last exception if all tries fail.
    """

    def decorator(func: Callable):
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            delay = base_delay
            last_exc: BaseException | None = None
            for attempt in range(1, tries + 1):
                try:
                    return func(*args, **kwargs)
                except exceptions as exc:  # noqa: BLE001
                    last_exc = exc
                    if attempt == tries:
                        log.warning(
                            "%s failed after %d attempts: %s",
                            func.__name__,
                            tries,
                            exc,
                        )
                        raise
                    log.info(
                        "%s failed (attempt %d/%d): %s -- retrying in %.1fs",
                        func.__name__,
                        attempt,
                        tries,
                        exc,
                        delay,
                    )
                    time.sleep(delay)
                    delay *= backoff
            raise last_exc  # pragma: no cover -- unreachable

        return wrapper

    return decorator
