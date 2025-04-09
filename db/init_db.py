"""
Initialize the SQLite database.
"""

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from config.logger_config import setup_logger
from db.database import CustomerType
from db.config import SQLITE_URL

# Set up logging
logger = setup_logger(__name__)

def init_db(connection_string: str = SQLITE_URL) -> None:
    """
    Initialize the database connection.
    
    Args:
        connection_string: Database connection string
    """
    try:
        # Create engine
        engine = create_engine(connection_string)
        
        # Create session factory
        SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
        
        logger.info(f"Database initialized successfully at {connection_string}")
        return SessionLocal
        
    except Exception as e:
        logger.error(f"Error initializing database: {e}")
        raise

def get_db():
    # This function is not provided in the original file or the new code block
    # It's assumed to exist as it's called in the main function
    pass

def main():
    # Initialize the database
    init_db()
    db = get_db()
    
    # Test adding a customer
    try:
        db.add_customer(
            customer_id="sender-1",
            wallet_seed="sEdTbvYhVumc89LPr6ajiKe13km37h3",
            customer_type=CustomerType.SENDER
        )
        print("Successfully added test sender customer 1")
    except Exception as e:
        print(f"Error adding test sender: {str(e)}")
    
    try:
        db.add_customer(
            customer_id="sender-2",
            wallet_seed="sEdTy9zRMrgjqs7d14944UCdFxXdGix",
            customer_type=CustomerType.SENDER
        )
        print("Successfully added test sender customer 2")
    except Exception as e:
        print(f"Error adding test sender: {str(e)}")
    
    try:
        db.add_customer(
            customer_id="receiver-1",
            wallet_seed="sEd7Sok4VSed8Sw5m2z9LY2YbKLT5PG",
            customer_type=CustomerType.RECEIVER
        )
        print("Successfully added test receiver customer")
    except Exception as e:
        print(f"Error adding test receiver: {str(e)}")

    try:
        db.add_customer(
            customer_id="receiver-2",
            wallet_seed="sEdTeac7Bi6x6t6c3vz74Ux7s4MPcqe",
            customer_type=CustomerType.RECEIVER
        )
        print("Successfully added test receiver customer 2")
    
    except Exception as e:
        print(f"Error adding test receiver: {str(e)}")

    
    # Test adding a relationship
    try:
        db.add_relationship("sender-1", "receiver-1")
        print("Successfully added test relationship 1")
        db.add_relationship("sender-2", "receiver-2")
        print("Successfully added test relationship 2")
    except Exception as e:
        print(f"Error adding test relationship: {str(e)}")


if __name__ == "__main__":
    main() 