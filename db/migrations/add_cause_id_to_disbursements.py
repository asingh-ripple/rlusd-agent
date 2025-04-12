"""
Migration script to add cause_id column to disbursements_donations table.
"""

from sqlalchemy import text
from db.database import init_db, get_db
from db.sqlite_config import get_connection_string

def add_cause_id():
    """
    Add cause_id column to disbursements_donations table.
    """
    print("Starting migration to add cause_id column...")
    
    # Initialize database
    init_db(get_connection_string())
    db = get_db()
    session = db.Session()
    
    try:
        # Drop temporary table if it exists from previous failed migration
        session.execute(text("""
            DROP TABLE IF EXISTS disbursements_donations_new;
        """))
        
        # Create temporary table with new structure
        session.execute(text("""
            CREATE TABLE disbursements_donations_new (
                id TEXT PRIMARY KEY,
                donation_id TEXT NOT NULL,
                disbursement_id TEXT NOT NULL,
                cause_id TEXT NOT NULL,
                amount REAL NOT NULL,
                created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
            );
        """))
        
        # Copy data from old table to new table, setting cause_id to 'unknown' for existing records
        session.execute(text("""
            INSERT INTO disbursements_donations_new (id, donation_id, disbursement_id, cause_id, amount, created_at)
            SELECT id, donation_id, disbursement_id, 'unknown', amount, created_at
            FROM disbursements_donations;
        """))
        
        # Drop old table
        session.execute(text("""
            DROP TABLE disbursements_donations;
        """))
        
        # Rename new table to original name
        session.execute(text("""
            ALTER TABLE disbursements_donations_new 
            RENAME TO disbursements_donations;
        """))
        
        session.commit()
        print("Successfully added cause_id column to disbursements_donations table")
        
    except Exception as e:
        session.rollback()
        print(f"Error during migration: {str(e)}")
        raise
    finally:
        session.close()

if __name__ == "__main__":
    add_cause_id() 