"""
Health monitoring and metrics collection for production deployment.
"""

import time
import threading
from typing import Dict, Any, Optional
from logger_config import get_logger
from config import Config

logger = get_logger(__name__)


class HealthMonitor:
    """Monitors application health and collects metrics."""
    
    def __init__(self):
        self.start_time = time.time()
        self.metrics = {
            "total_chunks_processed": 0,
            "total_errors": 0,
            "total_transcriptions": 0,
            "average_latency": 0.0,
            "uptime_seconds": 0
        }
        self._lock = threading.Lock()
        self._monitor_thread: Optional[threading.Thread] = None
        self._is_monitoring = False
        
        self.audio_capture = None
        self.transcriber = None
    
    def set_components(self, audio_capture, transcriber):
        """Set components to monitor."""
        self.audio_capture = audio_capture
        self.transcriber = transcriber
    
    def start_monitoring(self):
        """Start background monitoring thread."""
        if self._is_monitoring:
            return
            
        self._is_monitoring = True
        self._monitor_thread = threading.Thread(target=self._monitor_loop, daemon=True)
        self._monitor_thread.start()
        logger.info("Health monitoring started")
    
    def stop_monitoring(self):
        """Stop monitoring thread."""
        self._is_monitoring = False
        if self._monitor_thread:
            self._monitor_thread.join(timeout=2.0)
        logger.info("Health monitoring stopped")
    
    def _monitor_loop(self):
        """Background loop to collect metrics."""
        while self._is_monitoring:
            try:
                self.update_metrics()
                time.sleep(Config.METRICS_INTERVAL)
            except Exception as e:
                logger.error(f"Error in monitoring loop: {e}")
    
    def update_metrics(self):
        """Update metrics from components."""
        with self._lock:
            self.metrics["uptime_seconds"] = int(time.time() - self.start_time)
            
            # Collect from audio capture
            if self.audio_capture:
                audio_health = self.audio_capture.get_health_status()
                self.metrics["audio_errors"] = audio_health.get("error_count", 0)
                self.metrics["audio_queue_size"] = audio_health.get("queue_size", 0)
            
            # Collect from transcriber
            if self.transcriber:
                self.metrics["transcriber_errors"] = self.transcriber.error_count
    
    def get_health_status(self) -> Dict[str, Any]:
        """Get current health status.
        
        Returns:
            Dictionary with health metrics and status
        """
        with self._lock:
            self.update_metrics()
            
            is_healthy = (
                self.metrics.get("audio_errors", 0) < 100 and
                self.metrics.get("transcriber_errors", 0) < 100
            )
            
            return {
                "status": "healthy" if is_healthy else "degraded",
                "timestamp": time.time(),
                "metrics": self.metrics.copy()
            }
    
    def log_metrics(self):
        """Log current metrics."""
        status = self.get_health_status()
        logger.info(f"Health Status: {status['status']}")
        logger.info(f"Metrics: {status['metrics']}")
    
    def increment_transcriptions(self):
        """Increment transcription counter."""
        with self._lock:
            self.metrics["total_transcriptions"] += 1
    
    def update_latency(self, latency: float):
        """Update average latency metric."""
        with self._lock:
            count = self.metrics["total_chunks_processed"]
            current_avg = self.metrics["average_latency"]
            self.metrics["total_chunks_processed"] = count + 1
            self.metrics["average_latency"] = (current_avg * count + latency) / (count + 1)
