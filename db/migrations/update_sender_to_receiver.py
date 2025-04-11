#!/usr/bin/env python3
"""
Migration to update sender-2 to receiver-3.
"""

from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from config.logger_config import setup_logger
from db.config import SQLITE_URL
from db.database import Customer, CustomerType

# Set up logging
logger = setup_logger(__name__)

def update_customer_type(session):
    """Update sender-2 to receiver-3."""
    try:
        # First, check if sender-2 exists
        sender = session.query(Customer).filter_by(customer_id="sender-2").first()
        if not sender:
            logger.error("sender-2 not found in database")
            return False

        # Update the customer type
        sender.customer_type = CustomerType.RECEIVER
        sender.customer_id = "receiver-3"
        
        # Commit the changes
        session.commit()
        logger.info("Successfully updated sender-2 to receiver-3")
        return True
    except Exception as e:
        session.rollback()
        logger.error(f"Error updating customer: {e}")
        return False

def main():
    """Run the migration."""
    try:
        engine = create_engine(SQLITE_URL)
        Session = sessionmaker(bind=engine)
        session = Session()
        
        if update_customer_type(session):
            logger.info("Migration completed successfully")
        else:
            logger.error("Migration failed")
    except Exception as e:
        logger.error(f"Migration failed: {e}")
        raise
    finally:
        if 'session' in locals():
            session.close()

if __name__ == "__main__":
    main() 