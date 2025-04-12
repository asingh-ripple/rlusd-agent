#!/usr/bin/env python3
"""
Script to run all seeding operations.
"""

import os
import sys

# Add the parent directory to the path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from db.seed_causes import seed_causes, DB_CONNECTION_STRING
from db.database import init_db, get_db, Base
from sqlalchemy import create_engine, text

def reset_database():
    """Reset the database by dropping and recreating all tables"""
    print("Resetting database...")
    
    try:
        # Create engine
        engine = create_engine(DB_CONNECTION_STRING)
        
        # Drop all tables
        Base.metadata.drop_all(bind=engine)
        print("All tables dropped successfully")
        
        # Create all tables
        Base.metadata.create_all(bind=engine)
        
        # Enable foreign key support for SQLite
        with engine.connect() as conn:
            conn.execute(text("PRAGMA foreign_keys=ON"))
        
        print("All tables recreated successfully")
        return True
    
    except Exception as e:
        print(f"Error resetting database: {str(e)}")
        traceback.print_exc()
        return False

def run_all_seeds():
    """Run all seed operations"""
    print("Starting database seeding process...")
    
    # Seed the causes table
    seed_causes()
    
    # Add additional seed functions here as needed
    
    print("Database seeding completed successfully!")

if __name__ == "__main__":
    run_all_seeds() 