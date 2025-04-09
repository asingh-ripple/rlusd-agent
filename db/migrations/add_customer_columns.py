"""
Migration to add public_key and email_address columns to the customer table.
"""

from sqlalchemy import Column, String, text, inspect
from sqlalchemy.orm import sessionmaker
from config.logger_config import setup_logger
from db.config import SQLITE_URL
from db.database import Base, Customer

# Set up logging
logger = setup_logger(__name__)

def check_columns_exist(engine):
    """Check if the columns already exist in the table."""
    inspector = inspect(engine)
    columns = inspector.get_columns('customers')
    column_names = [col['name'] for col in columns]
    return 'public_key' in column_names, 'email_address' in column_names

def add_customer_columns():
    """
    Add public_key and email_address columns to the customer table.
    """
    session = None
    try:
        # Create engine
        from sqlalchemy import create_engine
        engine = create_engine(SQLITE_URL)
        
        # Check if columns already exist
        public_key_exists, email_exists = check_columns_exist(engine)
        
        if public_key_exists and email_exists:
            logger.info("Columns already exist in the table")
            return
            
        # Create session
        Session = sessionmaker(bind=engine)
        session = Session()
        
        # Add new columns
        logger.info("Adding public_key and email_address columns to customer table")
        
        # Execute ALTER TABLE statements
        if not public_key_exists:
            session.execute(text("ALTER TABLE customers ADD COLUMN public_key VARCHAR(128)"))
            logger.info("Added public_key column")
            
        if not email_exists:
            session.execute(text("ALTER TABLE customers ADD COLUMN email_address VARCHAR(255)"))
            logger.info("Added email_address column")
        
        # Commit changes
        session.commit()
        logger.info("Successfully added new columns to customer table")
        
        # Verify columns were added
        public_key_exists, email_exists = check_columns_exist(engine)
        if public_key_exists and email_exists:
            logger.info("Verification successful: both columns exist")
        else:
            logger.error("Verification failed: columns were not added")
            
    except Exception as e:
        logger.error(f"Error adding columns to customer table: {e}")
        if session:
            session.rollback()
        raise
    finally:
        if session:
            session.close()

if __name__ == "__main__":
    add_customer_columns() 