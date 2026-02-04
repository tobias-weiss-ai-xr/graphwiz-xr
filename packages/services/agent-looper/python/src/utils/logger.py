"""Logging configuration for Agent Looper."""

import logging
import sys
from typing import Dict, Any
from pathlib import Path


def setup_logging(config: Dict[str, Any]) -> logging.Logger:
    """Set up logging configuration.

    Args:
        config: Logging configuration dictionary

    Returns:
        Configured logger instance
    """
    log_level = config.get("level", "INFO")
    log_file = config.get("file")
    console_output = config.get("console", True)

    logger = logging.getLogger("agent-looper")
    logger.setLevel(getattr(logging, log_level))
    logger.handlers.clear()

    formatter = logging.Formatter(
        "%(asctime)s - %(name)s - %(levelname)s - %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S"
    )

    if console_output:
        console_handler = logging.StreamHandler(sys.stdout)
        console_handler.setFormatter(formatter)
        logger.addHandler(console_handler)

    if log_file:
        log_path = Path(log_file)
        log_path.parent.mkdir(parents=True, exist_ok=True)

        file_handler = logging.FileHandler(log_file)
        file_handler.setFormatter(formatter)
        logger.addHandler(file_handler)

    return logger
