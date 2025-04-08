import os
import sys
from pathlib import Path

# Add the project root directory to the Python path
project_root = str(Path(__file__).parent.parent.parent)
sys.path.append(project_root)

from sqlalchemy import text, create_engine
from db.database import Base
from db.sqlite_config import get_connection_string

def run_migration():
    """Run the migration to add checks table and insertion_date column."""
    # Get the connection string and create engine
    connection_string = get_connection_string()
    engine = create_engine(connection_string)
    
    # Create a connection
    conn = engine.connect()
    
    try:
        # Start a transaction
        with conn.begin():
            # Add insertion_date to transactions table if it doesn't exist
            conn.execute(text("""
                ALTER TABLE transactions 
                ADD COLUMN insertion_date DATETIME DEFAULT CURRENT_TIMESTAMP;
            """))
            
            # Create the checks table
            conn.execute(text("""
                CREATE TABLE IF NOT EXISTS checks (
                    check_id VARCHAR PRIMARY KEY,
                    sender_id VARCHAR NOT NULL,
                    receiver_id VARCHAR NOT NULL,
                    amount NUMERIC(20, 6) NOT NULL,
                    currency VARCHAR NOT NULL,
                    expiration_date DATETIME NOT NULL,
                    insertion_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (sender_id) REFERENCES customers(customer_id) ON DELETE CASCADE,
                    FOREIGN KEY (receiver_id) REFERENCES customers(customer_id) ON DELETE CASCADE
                );
            """))
            
            print("Migration completed successfully")
            
    except Exception as e:
        print(f"Error during migration: {str(e)}")
        raise
    finally:
        conn.close()

if __name__ == "__main__":
    run_migration() 