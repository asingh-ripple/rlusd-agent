import logging
import sys
from typing import Optional

def setup_logger(name: Optional[str] = None, level: int = logging.INFO) -> logging.Logger:
    """
    Set up a logger with consistent configuration.
    
    Args:
        name (Optional[str]): The name of the logger. If None, returns the root logger.
        level (int): The logging level. Defaults to logging.INFO.
        
    Returns:
        logging.Logger: The configured logger instance.
    """
    # Create or get the logger
    logger = logging.getLogger(name)
    
    # Only configure if the logger has no handlers
    if not logger.handlers:
        # Set the logging level
        logger.setLevel(level)
        
        # Create a formatter
        formatter = logging.Formatter(
            '%(asctime)s - %(name)s - %(levelname)s - %(message)s',
            datefmt='%Y-%m-%d %H:%M:%S'
        )
        
        # Create a console handler
        console_handler = logging.StreamHandler(sys.stdout)
        console_handler.setFormatter(formatter)
        
        # Add the handler to the logger
        logger.addHandler(console_handler)
        
        # Suppress httpx logs by default
        logging.getLogger("httpx").setLevel(logging.WARNING)
    
    return logger 