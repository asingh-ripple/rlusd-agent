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
    """Run the migration to drop the ledger_index column."""
    # Get the connection string and create engine
    connection_string = get_connection_string()
    engine = create_engine(connection_string)
    
    # Create a connection
    conn = engine.connect()
    
    try:
        # Start a transaction
        with conn.begin():
            # Drop the ledger_index column
            conn.execute(text("""
                ALTER TABLE transactions 
                DROP COLUMN ledger_index;
            """))
            
            print("Migration completed successfully")
            
    except Exception as e:
        print(f"Error during migration: {str(e)}")
        raise
    finally:
        conn.close()

if __name__ == "__main__":
    run_migration() 