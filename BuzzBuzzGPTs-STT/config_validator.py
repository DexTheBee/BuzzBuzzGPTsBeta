"""
Configuration validation and environment variable management.
"""

import os
from typing import Any, Optional
from pathlib import Path
from dotenv import load_dotenv
from logger_config import get_logger

logger = get_logger(__name__)


class ConfigValidator:
    """Validates and manages application configuration."""
    
    @staticmethod
    def load_env_file():
        """Load environment variables from .env file if it exists."""
        env_path = Path(__file__).parent / '.env'
        if env_path.exists():
            load_dotenv(env_path)
            logger.info(f"Loaded configuration from {env_path}")
        else:
            logger.warning("No .env file found, using defaults")
    
    @staticmethod
    def get_bool(key: str, default: bool = False) -> bool:
        """Get boolean value from environment."""
        value = os.getenv(key, str(default)).lower()
        return value in ('true', '1', 'yes', 'on')
    
    @staticmethod
    def get_int(key: str, default: int, min_val: Optional[int] = None, max_val: Optional[int] = None) -> int:
        """Get and validate integer value from environment."""
        try:
            value = int(os.getenv(key, default))
            if min_val is not None and value < min_val:
                logger.warning(f"{key}={value} is below minimum {min_val}, using {min_val}")
                return min_val
            if max_val is not None and value > max_val:
                logger.warning(f"{key}={value} is above maximum {max_val}, using {max_val}")
                return max_val
            return value
        except ValueError:
            logger.error(f"Invalid integer value for {key}, using default {default}")
            return default
    
    @staticmethod
    def get_float(key: str, default: float, min_val: Optional[float] = None, max_val: Optional[float] = None) -> float:
        """Get and validate float value from environment."""
        try:
            value = float(os.getenv(key, default))
            if min_val is not None and value < min_val:
                logger.warning(f"{key}={value} is below minimum {min_val}, using {min_val}")
                return min_val
            if max_val is not None and value > max_val:
                logger.warning(f"{key}={value} is above maximum {max_val}, using {max_val}")
                return max_val
            return value
        except ValueError:
            logger.error(f"Invalid float value for {key}, using default {default}")
            return default
    
    @staticmethod
    def get_str(key: str, default: str = "", allowed_values: Optional[list] = None) -> str:
        """Get and validate string value from environment."""
        value = os.getenv(key, default)
        if allowed_values and value not in allowed_values:
            logger.warning(f"{key}={value} not in allowed values {allowed_values}, using default {default}")
            return default
        return value
    
    @staticmethod
    def validate_all():
        """Validate all configuration values."""
        errors = []
        
        # Validate model
        valid_models = ['tiny', 'tiny.en', 'base', 'base.en', 'small', 'small.en', 'medium', 'medium.en', 'large']
        model = os.getenv('WHISPER_MODEL', 'tiny.en')
        if model not in valid_models:
            errors.append(f"Invalid WHISPER_MODEL: {model}. Must be one of {valid_models}")
        
        # Validate sample rate
        sample_rate = ConfigValidator.get_int('SAMPLE_RATE', 16000, min_val=8000, max_val=48000)
        if sample_rate not in [8000, 16000, 22050, 44100, 48000]:
            logger.warning(f"Unusual SAMPLE_RATE: {sample_rate}")
        
        # Validate VAD threshold
        vad_threshold = ConfigValidator.get_float('VAD_THRESHOLD', 0.005, min_val=0.0, max_val=1.0)
        
        if errors:
            for error in errors:
                logger.error(error)
            raise ValueError(f"Configuration validation failed: {'; '.join(errors)}")
        
        logger.info("Configuration validation passed")
