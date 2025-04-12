"""
Migration script to update cause_id in disbursements_donations table.
"""

from sqlalchemy import text
from db.database import init_db, get_db
from db.sqlite_config import get_connection_string

def update_cause_id():
    """
    Update cause_id to customer-2 for all records in disbursements_donations table.
    """
    print("Starting update of cause_id values...")
    
    # Initialize database
    init_db(get_connection_string())
    db = get_db()
    session = db.Session()
    
    try:
        # Update all records to set cause_id to customer-2
        session.execute(text("""
            UPDATE disbursements_donations
            SET cause_id = 'customer-2';
        """))
        
        # Get count of updated records
        result = session.execute(text("""
            SELECT COUNT(*) as count
            FROM disbursements_donations;
        """))
        count = result.fetchone()[0]
        
        session.commit()
        print(f"Successfully updated {count} records to set cause_id to customer-2")
        
    except Exception as e:
        session.rollback()
        print(f"Error updating cause_id: {str(e)}")
        raise
    finally:
        session.close()

if __name__ == "__main__":
    update_cause_id() 