"""
Database configuration settings.
"""

import os
from typing import Optional

# Database connection settings
DB_HOST: str = os.getenv("DB_HOST", "localhost")
DB_PORT: str = os.getenv("DB_PORT", "5432")
DB_NAME: str = os.getenv("DB_NAME", "disaster_monitor")
DB_USER: str = os.getenv("DB_USER", "postgres")
DB_PASSWORD: str = os.getenv("DB_PASSWORD", "postgres")

def get_connection_string() -> str:
    """
    Get the database connection string.
    
    Returns:
        str: PostgreSQL connection string
    """
    return f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}" 