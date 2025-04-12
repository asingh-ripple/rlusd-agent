"""
Migration script to add donor_id column to disbursements_donations table.
"""

from sqlalchemy import text
from db.database import init_db, get_db
from db.sqlite_config import get_connection_string

def add_donor_id():
    """
    Add donor_id column to disbursements_donations table and populate with donor-1.
    """
    print("Starting migration to add donor_id column...")
    
    # Initialize database
    init_db(get_connection_string())
    db = get_db()
    session = db.Session()
    
    try:
        # Add donor_id column
        session.execute(text("""
            ALTER TABLE disbursements_donations 
            ADD COLUMN donor_id TEXT NOT NULL DEFAULT 'donor-1';
        """))
        
        # Get count of updated records
        result = session.execute(text("""
            SELECT COUNT(*) as count
            FROM disbursements_donations;
        """))
        count = result.fetchone()[0]
        
        session.commit()
        print(f"Successfully added donor_id column and updated {count} records to set donor_id to donor-1")
        
    except Exception as e:
        session.rollback()
        print(f"Error during migration: {str(e)}")
        raise
    finally:
        session.close()

if __name__ == "__main__":
    add_donor_id() 