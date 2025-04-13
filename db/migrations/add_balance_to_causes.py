#!/usr/bin/env python3
"""
Migration script to add balance column to cause table.
"""

import os
import sys
from pathlib import Path

# Add the project root directory to the Python path
project_root = str(Path(__file__).parent.parent.parent)
sys.path.append(project_root)

from sqlalchemy import text, create_engine
from db.sqlite_config import get_connection_string
from config.logger_config import setup_logger

logger = setup_logger(__name__)

def run_migration():
    """Run the migration to add balance column to cause table."""
    # Get the connection string and create engine
    connection_string = get_connection_string()
    engine = create_engine(connection_string)
    
    # Create a connection
    conn = engine.connect()
    
    try:
        # Start a transaction
        with conn.begin():
            # Add balance column to cause table if it doesn't exist
            conn.execute(text("""
                ALTER TABLE causes 
                ADD COLUMN balance FLOAT DEFAULT 0.0;
            """))
            
            logger.info("Successfully added balance column to causes table")
            
    except Exception as e:
        logger.error(f"Error during migration: {str(e)}")
        raise
    finally:
        conn.close()

if __name__ == "__main__":
    run_migration() 