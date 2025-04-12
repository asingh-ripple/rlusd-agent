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
    print("Starting database initialization...")
    # Initialize the database
    init_db()
    db = get_db()
    print(f"Database instance created: {db}")

    
if __name__ == "__main__":
    main() 