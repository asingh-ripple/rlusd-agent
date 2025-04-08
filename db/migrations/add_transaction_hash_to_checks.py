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
    """Run the migration to add transaction_hash column to checks table."""
    # Get the connection string and create engine
    connection_string = get_connection_string()
    engine = create_engine(connection_string)
    
    # Create a connection
    conn = engine.connect()
    
    try:
        # Start a transaction
        with conn.begin():
            # SQLite doesn't support adding NOT NULL columns directly
            # So we need to:
            # 1. Create a new table with the new column
            # 2. Copy data from old table
            # 3. Drop old table
            # 4. Rename new table to old name
            
            # Create new table with transaction_hash
            conn.execute(text("""
                CREATE TABLE checks_new (
                    check_id VARCHAR PRIMARY KEY,
                    transaction_hash VARCHAR NOT NULL,
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
            
            # Copy data from old table to new table
            conn.execute(text("""
                INSERT INTO checks_new (
                    check_id, sender_id, receiver_id, amount, 
                    currency, expiration_date, insertion_date
                )
                SELECT 
                    check_id, sender_id, receiver_id, amount, 
                    currency, expiration_date, insertion_date
                FROM checks;
            """))
            
            # Drop old table
            conn.execute(text("DROP TABLE checks;"))
            
            # Rename new table to old name
            conn.execute(text("ALTER TABLE checks_new RENAME TO checks;"))
            
            print("Migration completed successfully")
            
    except Exception as e:
        print(f"Error during migration: {str(e)}")
        raise
    finally:
        conn.close()

if __name__ == "__main__":
    run_migration() 