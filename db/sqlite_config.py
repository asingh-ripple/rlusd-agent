"""
SQLite database configuration settings.
"""

import os
from pathlib import Path

# Database file path
DB_DIR = Path(__file__).parent.parent / "data"
DB_FILE = "disaster_monitor.db"

# Create data directory if it doesn't exist
DB_DIR.mkdir(exist_ok=True)

def get_connection_string() -> str:
    """
    Get the SQLite database connection string.
    
    Returns:
        str: SQLite connection string
    """
    return f"sqlite:///{DB_DIR / DB_FILE}" 