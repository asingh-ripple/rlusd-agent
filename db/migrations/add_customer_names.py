"""
Migration script to add customer_name column and seed customer names.
"""

import os
import sys
from sqlalchemy import text, inspect

# Add the project root directory to the Python path
project_root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.append(project_root)

from db.database import get_db, init_db
from config.logger_config import setup_logger
from db.config import SQLITE_URL

logger = setup_logger(__name__)

# Customer names mapping
# CUSTOMER_NAMES = {
#     "customer-1": "Global Relief Fund",
#     "customer-2": "Flood Recovery in Louisiana",
#     "customer-3": "Hurricane Harvey Relief",
#     "customer-4": None,
#     "customer-5": "Earthquake Relief in Turkey",
#     "customer-6": "Hurricane Maria Relief",
#     "customer-7": "Combating Cholera with CleanMedic Haiti"
# }

def add_customer_names():
    """
    Add customer_name column and seed customer names.
    """
    session = None
    try:
        # Initialize the database
        init_db(SQLITE_URL)
        db = get_db()
        session = db.Session()
        
        # Check if customer_name column exists
        inspector = inspect(db.engine)
        columns = [col['name'] for col in inspector.get_columns('customers')]
        
        if 'customer_name' not in columns:
            # Add the customer_name column if it doesn't exist
            session.execute(text("""
                ALTER TABLE customers 
                ADD COLUMN customer_name VARCHAR(255)
            """))
            session.commit()
            logger.info("Added customer_name column")
        else:
            logger.info("customer_name column already exists")
        
        # Update customer names
        # for customer_id, name in CUSTOMER_NAMES.items():
        #     session.execute(
        #         text("UPDATE customers SET customer_name = :name WHERE customer_id = :customer_id"),
        #         {"name": name, "customer_id": customer_id}
        #     )
        #     logger.info(f"Updated name for customer {customer_id} to {name}")
            
        # session.commit()
        # logger.info("Successfully seeded customer names")
        
    except Exception as e:
        if session:
            session.rollback()
        logger.error(f"Error adding customer names: {str(e)}")
        raise
    finally:
        if session:
            session.close()

if __name__ == "__main__":
    add_customer_names() 