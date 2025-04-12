"""
Migration script to remove foreign key constraints from disbursements_donations table.
"""

from sqlalchemy import text
from ..database import init_db, get_db
from ..sqlite_config import get_connection_string

def remove_foreign_keys():
    """
    Remove foreign key constraints from disbursements_donations table.
    """
    print("Starting migration to remove foreign key constraints...")
    
    # Initialize database
    init_db(get_connection_string())
    db = get_db()
    session = db.Session()
    
    try:
        # Drop existing table
        session.execute(text("""
            DROP TABLE IF EXISTS disbursements_donations;
        """))
        
        # Recreate table without foreign key constraints
        session.execute(text("""
            CREATE TABLE disbursements_donations (
                id TEXT PRIMARY KEY,
                donation_id TEXT NOT NULL,
                disbursement_id TEXT NOT NULL,
                amount REAL NOT NULL,
                created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
            );
        """))
        
        session.commit()
        print("Successfully removed foreign key constraints from disbursements_donations table")
        
    except Exception as e:
        session.rollback()
        print(f"Error during migration: {str(e)}")
        raise
    finally:
        session.close()

if __name__ == "__main__":
    remove_foreign_keys() 