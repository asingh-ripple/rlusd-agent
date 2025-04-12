#!/usr/bin/env python3
"""
Script to run all seeding operations.
"""

import os
import sys

# Add the parent directory to the path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from db.seed_causes import seed_causes

def run_all_seeds():
    """Run all seed operations"""
    print("Starting database seeding process...")
    
    # Seed the causes table
    seed_causes()
    
    # Add additional seed functions here as needed
    
    print("Database seeding completed successfully!")

if __name__ == "__main__":
    run_all_seeds() 