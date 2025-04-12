#!/usr/bin/env python3
"""
Script to run all seeding operations.
"""

import os
import sys
import argparse
import traceback

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

def run_all_seeds(reset: bool = False):
    """Run all seed operations
    
    Args:
        reset: If True, drop and recreate all tables before seeding
    """
    print("Starting database seeding process...")
    
    if reset:
        reset_database()
    
    # Seed the causes table
    seed_causes()
    
    # Add additional seed functions here as needed
    
    print("Database seeding completed successfully!")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Run database seeding operations')
    parser.add_argument('--reset', action='store_true', help='Reset database before seeding')
    args = parser.parse_args()
    
    run_all_seeds(reset=args.reset) 