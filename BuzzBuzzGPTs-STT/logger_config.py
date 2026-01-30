"""
Centralized logging configuration for the STT application.
Production-grade logging with rotation, formatting, and multiple handlers.
"""

import logging
import logging.handlers
import os
import sys
from pathlib import Path
from typing import Optional


class ColoredFormatter(logging.Formatter):
    """Custom formatter with color support for console output."""
    
    # ANSI color codes
    COLORS = {
        'DEBUG': '\033[36m',      # Cyan
        'INFO': '\033[32m',       # Green
        'WARNING': '\033[33m',    # Yellow
        'ERROR': '\033[31m',      # Red
        'CRITICAL': '\033[35m',   # Magenta
        'RESET': '\033[0m'
    }
    
    def format(self, record):
        # Add color to levelname
        levelname = record.levelname
        if levelname in self.COLORS:
            record.levelname = f"{self.COLORS[levelname]}{levelname}{self.COLORS['RESET']}"
        
        result = super().format(record)
        
        # Reset levelname for other handlers
        record.levelname = levelname
        return result


def setup_logging(
    log_level: str = "INFO",
    log_dir: Optional[str] = None,
    console: bool = True,
    file_logging: bool = True
) -> logging.Logger:
    """
    Setup application-wide logging configuration.
    
    Args:
        log_level: Logging level (DEBUG, INFO, WARNING, ERROR, CRITICAL)
        log_dir: Directory for log files (default: ./logs)
        console: Enable console logging
        file_logging: Enable file logging
        
    Returns:
        Configured root logger
    """
    # Create logger
    logger = logging.getLogger("STT")
    logger.setLevel(getattr(logging, log_level.upper(), logging.INFO))
    logger.handlers.clear()  # Remove any existing handlers
    
    # Create formatters
    detailed_formatter = logging.Formatter(
        '%(asctime)s - %(name)s - %(levelname)s - [%(filename)s:%(lineno)d] - %(message)s',
        datefmt='%Y-%m-%d %H:%M:%S'
    )
    
    console_formatter = ColoredFormatter(
        '%(asctime)s - %(levelname)s - %(message)s',
        datefmt='%H:%M:%S'
    )
    
    # Console handler
    if console:
        console_handler = logging.StreamHandler(sys.stdout)
        console_handler.setLevel(logging.INFO)
        console_handler.setFormatter(console_formatter)
        logger.addHandler(console_handler)
    
    # File handler with rotation
    if file_logging:
        if log_dir is None:
            log_dir = "logs"
        
        log_path = Path(log_dir)
        log_path.mkdir(parents=True, exist_ok=True)
        
        # Main log file with rotation
        main_log = log_path / "stt_app.log"
        file_handler = logging.handlers.RotatingFileHandler(
            main_log,
            maxBytes=10 * 1024 * 1024,  # 10MB
            backupCount=5,
            encoding='utf-8'
        )
        file_handler.setLevel(logging.DEBUG)
        file_handler.setFormatter(detailed_formatter)
        logger.addHandler(file_handler)
        
        # Error log file
        error_log = log_path / "errors.log"
        error_handler = logging.handlers.RotatingFileHandler(
            error_log,
            maxBytes=10 * 1024 * 1024,
            backupCount=3,
            encoding='utf-8'
        )
        error_handler.setLevel(logging.ERROR)
        error_handler.setFormatter(detailed_formatter)
        logger.addHandler(error_handler)
    
    logger.info("Logging system initialized")
    return logger


def get_logger(name: str) -> logging.Logger:
    """
    Get a logger instance for a specific module.
    
    Args:
        name: Logger name (usually __name__)
        
    Returns:
        Logger instance
    """
    return logging.getLogger(f"STT.{name}")
