"""
Database configuration settings.
"""

import os
from pathlib import Path

# Database settings
DB_NAME = "disaster_monitor.db"
DB_DIR = Path("data")
DB_PATH = DB_DIR / DB_NAME

# Create data directory if it doesn't exist
DB_DIR.mkdir(exist_ok=True)

# SQLite connection string
SQLITE_URL = f"sqlite:///{DB_PATH}" 