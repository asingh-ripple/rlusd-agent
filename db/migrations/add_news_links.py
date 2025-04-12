from sqlalchemy import text
from ..database import get_db
from ..sqlite_config import get_connection_string
from ..database import init_db

init_db(get_connection_string())

def migrate():
    """Add news_links column to disaster_responses table."""
    db = get_db()
    session = db.Session()
    
    try:
        # Add news_links column
        session.execute(text("""
            ALTER TABLE disaster_responses
            ADD COLUMN news_link VARCHAR(2000)
        """))
        
        session.commit()
        print("Successfully added news_link column to disaster_responses table")
        
    except Exception as e:
        session.rollback()
        print(f"Error adding news_link column: {str(e)}")
        raise
        
    finally:
        session.close()

if __name__ == "__main__":
    migrate() 