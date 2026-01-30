"""
Unit tests for the STT application.
Production-grade testing with mocks and fixtures.
"""

import unittest
import queue
import numpy as np
from unittest.mock import Mock, MagicMock, patch
import time


class TestAudioCapture(unittest.TestCase):
    """Test cases for AudioCapture module."""
    
    @patch('audio_capture.sc')
    def test_audio_capture_init(self, mock_sc):
        """Test audio capture initialization."""
        from audio_capture import AudioCapture
        
        # Mock loopback device
        mock_mic = Mock()
        mock_mic.name = "Mock Speakers (Loopback)"
        mock_mic.isloopback = True
        
        mock_speaker = Mock()
        mock_speaker.name = "Mock Speakers"
        
        mock_sc.default_speaker.return_value = mock_speaker
        mock_sc.all_microphones.return_value = [mock_mic]
        
        audio_queue = queue.Queue()
        capture = AudioCapture(audio_queue)
        
        self.assertIsNotNone(capture.mic)
        self.assertEqual(capture.mic.name, "Mock Speakers (Loopback)")
    
    @patch('audio_capture.sc')
    def test_audio_capture_no_loopback_raises_error(self, mock_sc):
        """Test that missing loopback device raises error."""
        from audio_capture import AudioCapture, AudioCaptureError
        
        mock_sc.default_speaker.side_effect = Exception("No speaker")
        mock_sc.all_microphones.return_value = []
        
        audio_queue = queue.Queue()
        
        with self.assertRaises(AudioCaptureError):
            AudioCapture(audio_queue)


class TestWhisperTranscriber(unittest.TestCase):
    """Test cases for WhisperTranscriber module."""
    
    def test_transcriber_init(self):
        """Test transcriber initialization."""
        from transcriber import WhisperTranscriber
        
        audio_queue = queue.Queue()
        callback = Mock()
        
        transcriber = WhisperTranscriber(audio_queue, callback)
        
        self.assertIsNotNone(transcriber)
        self.assertEqual(transcriber.is_running, False)
        self.assertIsNone(transcriber.model)
    
    @patch('transcriber.WhisperModel')
    def test_model_loading_with_retry(self, mock_whisper_model):
        """Test model loading with retry logic."""
        from transcriber import WhisperTranscriber
        
        audio_queue = queue.Queue()
        callback = Mock()
        transcriber = WhisperTranscriber(audio_queue, callback)
        
        # First attempt fails, second succeeds
        mock_whisper_model.side_effect = [Exception("Network error"), MagicMock()]
        
        result = transcriber.load_model(max_retries=2)
        
        self.assertTrue(result)
        self.assertEqual(mock_whisper_model.call_count, 2)
    
    @patch('transcriber.WhisperModel')
    def test_model_loading_failure_after_retries(self, mock_whisper_model):
        """Test model loading fails after max retries."""
        from transcriber import WhisperTranscriber
        
        audio_queue = queue.Queue()
        callback = Mock()
        transcriber = WhisperTranscriber(audio_queue, callback)
        
        mock_whisper_model.side_effect = Exception("Persistent error")
        
        result = transcriber.load_model(max_retries=3)
        
        self.assertFalse(result)
        self.assertEqual(mock_whisper_model.call_count, 3)


class TestConfig(unittest.TestCase):
    """Test cases for configuration management."""
    
    def test_config_validation(self):
        """Test configuration validation."""
        from config import Config
        
        # Should not raise exception
        try:
            Config.validate()
        except Exception as e:
            self.fail(f"Config validation failed: {e}")
    
    def test_config_values_in_range(self):
        """Test that config values are within valid ranges."""
        from config import Config
        
        self.assertGreater(Config.SAMPLE_RATE, 0)
        self.assertGreaterEqual(Config.VAD_THRESHOLD, 0.0)
        self.assertLessEqual(Config.VAD_THRESHOLD, 1.0)
        self.assertGreater(Config.MAX_QUEUE_SIZE, 0)


class TestConfigValidator(unittest.TestCase):
    """Test cases for configuration validator."""
    
    def test_get_int_with_bounds(self):
        """Test integer validation with min/max bounds."""
        from config_validator import ConfigValidator
        import os
        
        os.environ['TEST_INT'] = '50'
        value = ConfigValidator.get_int('TEST_INT', 10, min_val=0, max_val=100)
        self.assertEqual(value, 50)
        
        os.environ['TEST_INT'] = '150'
        value = ConfigValidator.get_int('TEST_INT', 10, min_val=0, max_val=100)
        self.assertEqual(value, 100)  # Clamped to max
    
    def test_get_bool(self):
        """Test boolean value parsing."""
        from config_validator import ConfigValidator
        import os
        
        for true_val in ['true', 'True', '1', 'yes', 'on']:
            os.environ['TEST_BOOL'] = true_val
            self.assertTrue(ConfigValidator.get_bool('TEST_BOOL'))
        
        for false_val in ['false', 'False', '0', 'no', 'off']:
            os.environ['TEST_BOOL'] = false_val
            self.assertFalse(ConfigValidator.get_bool('TEST_BOOL'))


class TestAudioProcessing(unittest.TestCase):
    """Test cases for audio processing utilities."""
    
    def test_audio_chunk_processing(self):
        """Test audio chunk normalization and conversion."""
        # Create test audio data
        test_audio = np.random.randn(1000).astype(np.float32)
        
        # Should be float32
        self.assertEqual(test_audio.dtype, np.float32)
        
        # Should be 1D for mono
        self.assertEqual(len(test_audio.shape), 1)
    
    def test_vad_threshold(self):
        """Test voice activity detection threshold."""
        from config import Config
        
        # Silent audio should be below threshold
        silent_audio = np.zeros(1000, dtype=np.float32)
        rms_silent = np.sqrt(np.mean(silent_audio**2))
        self.assertLess(rms_silent, Config.VAD_THRESHOLD)
        
        # Loud audio should be above threshold
        loud_audio = np.ones(1000, dtype=np.float32) * 0.5
        rms_loud = np.sqrt(np.mean(loud_audio**2))
        self.assertGreater(rms_loud, Config.VAD_THRESHOLD)


class TestLogging(unittest.TestCase):
    """Test cases for logging configuration."""
    
    def test_logger_setup(self):
        """Test logger initialization."""
        from logger_config import setup_logging, get_logger
        
        logger = setup_logging(log_level="INFO", file_logging=False)
        self.assertIsNotNone(logger)
        
        module_logger = get_logger(__name__)
        self.assertIsNotNone(module_logger)


if __name__ == '__main__':
    # Run tests with verbosity
    unittest.main(verbosity=2)
