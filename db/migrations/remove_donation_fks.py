"""
Migration script to remove foreign key constraints from the donations table.
"""

import os
import sys
from sqlalchemy import text

# Add the project root directory to the Python path
project_root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.append(project_root)

from db.database import get_db, init_db
from config.logger_config import setup_logger
from db.config import SQLITE_URL

logger = setup_logger(__name__)

def remove_foreign_keys():
    """
    Remove foreign key constraints from the donations table.
    """
    session = None
    try:
        # Initialize the database
        init_db(SQLITE_URL)
        db = get_db()
        session = db.Session()
        
        # SQL commands to remove foreign key constraints
        commands = [
            # Drop the existing table
            "DROP TABLE IF EXISTS donations",
            
            # Recreate the table without foreign key constraints
            """
            CREATE TABLE donations (
                donation_id VARCHAR(50) PRIMARY KEY,
                customer_id VARCHAR(50) NOT NULL,
                cause_id VARCHAR(50) NOT NULL,
                amount NUMERIC(20, 6) NOT NULL,
                currency VARCHAR NOT NULL,
                donation_date DATETIME NOT NULL,
                status VARCHAR NOT NULL
            )
            """
        ]
        
        # Execute each command
        for cmd in commands:
            session.execute(text(cmd))
            session.commit()
            
        logger.info("Successfully removed foreign key constraints from donations table")
        
    except Exception as e:
        if session:
            session.rollback()
        logger.error(f"Error removing foreign key constraints: {str(e)}")
        raise
    finally:
        if session:
            session.close()

if __name__ == "__main__":
    remove_foreign_keys() 