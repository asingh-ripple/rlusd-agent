"""
Migration to add created_at and updated_at columns to the customers table.
"""

from sqlalchemy import text
from sqlalchemy.orm import sessionmaker
from config.logger_config import setup_logger
from db.config import SQLITE_URL

# Set up logging
logger = setup_logger(__name__)

def add_timestamp_columns():
    """
    Add created_at and updated_at columns to the customers table.
    """
    session = None
    try:
        # Create engine
        from sqlalchemy import create_engine
        engine = create_engine(SQLITE_URL)
        
        # Create session
        Session = sessionmaker(bind=engine)
        session = Session()
        
        # Add timestamp columns
        logger.info("Adding timestamp columns to customers table")
        
        # Add created_at column without default
        session.execute(text("""
            ALTER TABLE customers 
            ADD COLUMN created_at TIMESTAMP
        """))
        
        # Add updated_at column without default
        session.execute(text("""
            ALTER TABLE customers 
            ADD COLUMN updated_at TIMESTAMP
        """))
        
        # Update existing rows with current timestamp
        session.execute(text("""
            UPDATE customers 
            SET created_at = CURRENT_TIMESTAMP,
                updated_at = CURRENT_TIMESTAMP
        """))
        
        # Commit changes
        session.commit()
        logger.info("Successfully added timestamp columns to customers table")
        
    except Exception as e:
        logger.error(f"Error adding timestamp columns: {e}")
        if session:
            session.rollback()
        raise
    finally:
        if session:
            session.close()

if __name__ == "__main__":
    add_timestamp_columns() 