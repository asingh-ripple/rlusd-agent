"""
Initialize the SQLite database.
"""

from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from config.logger_config import setup_logger
from db.database import Base, CustomerType, TransactionType, TransactionStatus, DonationStatus, DisbursementStatus, get_db, init_db as init_db_module
from db.config import SQLITE_URL

# Set up logging
logger = setup_logger(__name__)

def init_db(connection_string: str = SQLITE_URL) -> sessionmaker:
    """
    Initialize the database connection and create all tables.
    
    Args:
        connection_string: Database connection string
    
    Returns:
        SessionLocal: A SQLAlchemy sessionmaker
    """
    try:
        # Create engine
        engine = create_engine(connection_string)
        
        # Create all tables if they don't exist
        Base.metadata.create_all(bind=engine)
        
        # Create session factory
        SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
        
        # Initialize foreign key support for SQLite
        with engine.connect() as conn:
            conn.execute(text("PRAGMA foreign_keys=ON"))
        
        logger.info(f"Database initialized successfully at {connection_string}")
        return SessionLocal
        
    except Exception as e:
        logger.error(f"Error initializing database: {e}")
        raise

def reset_db(connection_string: str = SQLITE_URL) -> None:
    """
    Reset the database by dropping and recreating all tables.
    
    Args:
        connection_string: Database connection string
    """
    try:
        engine = create_engine(connection_string)
        
        # Drop all tables
        Base.metadata.drop_all(bind=engine)
        logger.info("All tables dropped successfully")
        
        # Recreate all tables
        Base.metadata.create_all(bind=engine)
        logger.info("All tables recreated successfully")
        
        # Initialize foreign key support for SQLite
        with engine.connect() as conn:
            conn.execute(text("PRAGMA foreign_keys=ON"))
        
        logger.info(f"Database reset successfully at {connection_string}")
    except Exception as e:
        logger.error(f"Error resetting database: {e}")
        raise

def main():
    print("Starting database initialization...")
    
    # Reset the database (drops and recreates all tables)
    reset_db()
    
    # Initialize the module-level database instance
    init_db_module(SQLITE_URL)
    
    # Get the module-level database instance
    db = get_db()
    
    print(f"Database initialized and module-level instance created")
    print("Tables created with the following schema:")
    print("- Customers")
    print("- CustomerRelationships")
    print("- Transactions")
    print("- Checks")
    print("- Causes")
    print("- Donations")
    print("- Disbursements")
    print("- Disbursements_Donations")
    
if __name__ == "__main__":
    main()