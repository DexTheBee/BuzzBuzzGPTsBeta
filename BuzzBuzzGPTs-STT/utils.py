"""
Utility functions and compatibility patches for the STT application.
"""

import numpy as np
from logger_config import get_logger

logger = get_logger(__name__)


def apply_patches():
    """Apply necessary system-wide patches for compatibility.
    
    This function applies monkey-patches to fix compatibility issues
    with newer versions of dependencies. Currently handles:
    - NumPy 2.0+ compatibility with soundcard library
    """
    
    # Monkey-patch numpy.fromstring for soundcard compatibility with NumPy 2.0+
    # This fixes "The binary mode of fromstring is removed" error in Python 3.13+
    if np.lib.NumpyVersion(np.__version__) >= "2.0.0":
        old_fromstring = np.fromstring
        
        def new_fromstring(string, dtype=float, count=-1, sep="", **kwargs):
            """Compatibility wrapper for np.fromstring."""
            if sep == "":
                # Binary mode - use frombuffer instead
                return np.frombuffer(string, dtype, count, **kwargs)
            # Text mode - use original function
            return old_fromstring(string, dtype, count, sep, **kwargs)
        
        np.fromstring = new_fromstring
        logger.info("Applied NumPy 2.0 binary fromstring compatibility patch")
