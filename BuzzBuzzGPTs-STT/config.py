"""
Configuration settings for the System Audio Live Speech-to-Text application.
Now supports environment variables with validation.
"""

import os
from config_validator import ConfigValidator

# Load environment variables
ConfigValidator.load_env_file()


class Config:
    """Application configuration with environment variable support."""
    
    # Whisper Model Settings
    WHISPER_MODEL = ConfigValidator.get_str(
        'WHISPER_MODEL', 
        'tiny.en',
        allowed_values=['tiny', 'tiny.en', 'base', 'base.en', 'small', 'small.en', 'medium', 'medium.en', 'large']
    )
    WHISPER_ENGINE = "faster-whisper" 
    WHISPER_LANGUAGE = ConfigValidator.get_str('WHISPER_LANGUAGE', 'en')
    
    # Audio Settings
    SAMPLE_RATE = ConfigValidator.get_int('SAMPLE_RATE', 16000, min_val=8000, max_val=48000)
    CHANNELS = ConfigValidator.get_int('CHANNELS', 1, min_val=1, max_val=2)
    CHUNK_DURATION = ConfigValidator.get_float('CHUNK_DURATION', 0.4, min_val=0.1, max_val=5.0)
    WINDOW_DURATION = ConfigValidator.get_float('WINDOW_DURATION', 600.0, min_val=10.0, max_val=3600.0)
    FINALIZATION_PAUSE = ConfigValidator.get_float('FINALIZATION_PAUSE', 2.6, min_val=0.5, max_val=10.0)
    BUFFER_SIZE = int(SAMPLE_RATE * CHUNK_DURATION)
    WINDOW_SIZE = int(SAMPLE_RATE * WINDOW_DURATION)
    MAX_QUEUE_SIZE = ConfigValidator.get_int('MAX_QUEUE_SIZE', 5, min_val=1, max_val=50)
    
    # Performance Settings
    USE_GPU = ConfigValidator.get_bool('USE_GPU', True)
    FP16 = ConfigValidator.get_bool('FP16', True)
    BEAM_SIZE = ConfigValidator.get_int('BEAM_SIZE', 1, min_val=1, max_val=10)
    
    # Voice Activity Detection
    ENABLE_VAD = ConfigValidator.get_bool('ENABLE_VAD', True)
    VAD_THRESHOLD = ConfigValidator.get_float('VAD_THRESHOLD', 0.005, min_val=0.0, max_val=1.0)
    
    # Display Settings
    SHOW_TIMESTAMPS = ConfigValidator.get_bool('SHOW_TIMESTAMPS', True)
    SHOW_PERFORMANCE_METRICS = ConfigValidator.get_bool('SHOW_PERFORMANCE_METRICS', True)
    MAX_DISPLAY_LINES = ConfigValidator.get_int('MAX_DISPLAY_LINES', 50, min_val=10, max_val=1000)
    
    # Logging Settings
    LOG_LEVEL = ConfigValidator.get_str('LOG_LEVEL', 'INFO', allowed_values=['DEBUG', 'INFO', 'WARNING', 'ERROR', 'CRITICAL'])
    LOG_DIR = ConfigValidator.get_str('LOG_DIR', 'logs')
    ENABLE_FILE_LOGGING = ConfigValidator.get_bool('ENABLE_FILE_LOGGING', True)
    ENABLE_CONSOLE_LOGGING = ConfigValidator.get_bool('ENABLE_CONSOLE_LOGGING', True)
    
    # Error Handling
    MAX_RETRIES = ConfigValidator.get_int('MAX_RETRIES', 3, min_val=1, max_val=10)
    RETRY_DELAY = ConfigValidator.get_int('RETRY_DELAY', 2, min_val=1, max_val=30)
    
    # Monitoring
    ENABLE_METRICS = ConfigValidator.get_bool('ENABLE_METRICS', True)
    METRICS_INTERVAL = ConfigValidator.get_int('METRICS_INTERVAL', 60, min_val=10, max_val=600)
    
    # Audio Device
    AUDIO_DEVICE = os.getenv('AUDIO_DEVICE', None) or None
    
    @classmethod
    def get_device(cls):
        """Get the compute device for Whisper model."""
        import torch
        if cls.USE_GPU and torch.cuda.is_available():
            return "cuda"
        return "cpu"
    
    @classmethod
    def validate(cls):
        """Validate all configuration values."""
        ConfigValidator.validate_all()
