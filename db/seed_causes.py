#!/usr/bin/env python3
"""
Seed script to populate the database with mock data.
"""

import os
import sys
import traceback
from datetime import datetime
from sqlalchemy import create_engine, MetaData, text
from sqlalchemy.orm import sessionmaker

# Add the parent directory to the path to import the database module
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from db.database import Base, Cause, Customer, CustomerType

# Initialize the database with an SQLite database file
DB_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data", "disaster_monitor.db")
DB_CONNECTION_STRING = f"sqlite:///{DB_PATH}"

# {
#         "customer_id": "benefactor-4",
#         "customer_name": "Flood Recovery in Louisiana",
#         "email_address": "sender2@example.com",
#         "wallet_address": "rMQhytkyM4dwSJkmoAY3qxThRX2M2Py8wc",
#         "wallet_seed": "sEd56SLmRgdRENTjdEwU3AJezmGSD9",
#         "customer_type": CustomerType.SENDER
#     },
#     {
#         "customer_id": "benefactor-5",
#         "customer_name": "Global Relief Fund",
#         "email_address": "sender1@example.com",
#         "wallet_address": "rQBsLAh7nQLdRJTJnCapCsbng5Eu8oTUHW",
#         "wallet_seed": "sEdSCgE57Qvs6NHJDc6aRkXPz5A1AE",
#         "customer_type": CustomerType.SENDER
#     },
#     {
#         "customer_id": "benefactor-6",
#         "customer_name": "Flood Recovery in Louisiana",
#         "email_address": "sender2@example.com",
#         "wallet_address": "rMQhytkyM4dwSJkmoAY3qxThRX2M2Py8wc",
#         "wallet_seed": "sEd56SLmRgdRENTjdEwU3AJezmGSD9",
#         "customer_type": CustomerType.SENDER
#     },

# Mock customers data
mock_customers = [
    {
        "customer_id": "benefactor-1",
        "customer_name": "Global Relief Fund",
        "email_address": "sender1@example.com",
        "wallet_address": "rQBsLAh7nQLdRJTJnCapCsbng5Eu8oTUHW",
        "wallet_seed": "sEdTbvYhVumc89LPr6ajiKe13km37h3",
        "customer_type": CustomerType.SENDER
    },
    {
        "customer_id": "benefactor-2",
        "customer_name": "Flood Recovery in Louisiana",
        "email_address": "sender2@example.com",
        "wallet_address": "rMQhytkyM4dwSJkmoAY3qxThRX2M2Py8wc",
        "wallet_seed": "sEd7Sok4VSed8Sw5m2z9LY2YbKLT5PG",
        "customer_type": CustomerType.SENDER
    },
    {
        "customer_id": "benefactor-3",
        "customer_name": "Global Relief Fund",
        "email_address": "sender1@example.com",
        "wallet_address": "rEK9ZdnAxMX3eqvF8HKJdBhftcepK3by55",
        "wallet_seed": "sEdTy9zRMrgjqs7d14944UCdFxXdGix",
        "customer_type": CustomerType.SENDER
    },
    {
        "customer_id": "charity-1",
        "customer_name": "Relief Riders Kenya",
        "email_address": "receiver1@example.com",
        "wallet_address": "rJcYDNsHc5zAEbnPMj4y27GdbL6k2XvtuX",
        "wallet_seed": "sEdTeac7Bi6x6t6c3vz74Ux7s4MPcqe",
        "customer_type": CustomerType.RECEIVER
    },
    {
        "customer_id": "charity-2",
        "customer_name": "Clean Water for Nigeria",
        "email_address": "receiver2@example.com",
        "wallet_address": "rU1639GkScbLsUGbPDu7D1YHdMmM8E8NfL",
        "wallet_seed": "sEd7QHq54A53HVB286ApCjh9EeakzbH",
        "customer_type": CustomerType.RECEIVER
    },
    {
        "customer_id": "charity-3",
        "customer_name": "Hurrican in the Philippines Relief Team",
        "email_address": "receiver1@example.com",
        "wallet_address": "rp7mh1AJKDfJxJMx7DL3urTuW9bjRTE5Cm",
        "wallet_seed": "sEdScpmaSs5zM3YWjKTHPdsBTY6ZK3L",
        "customer_type": CustomerType.RECEIVER
    },
    {
        "customer_id": "charity-4",
        "customer_name": "Mobile Clinics For Crisis Zones With HealthBridge",
        "email_address": "receiver2@example.com",
        "wallet_address": "rPbnbLavLZLhXZhgoqVFCkTuG3YFcGS3Jh",
        "wallet_seed": "sEdVJRosHqNbeGm7UDKH8zCiQ8fZ2so",
        "customer_type": CustomerType.RECEIVER
    }
]
# Mock data from CauseDetailPage.tsx and other React components
mock_causes = [
    {
        "id": "2",
        "title": "Flood Recovery in Louisiana",
        "description": "Help families rebuild after the devastating floods in Louisiana.",
        "goal": 50000,
        "imageUrl": "images/flood-recovery.jpg",
        "category": "Natural Disasters",
        "customer_id": "customer-1"
    },
    {
        "id": "7",
        "title": "Rebuilding After the Storm with ShelterNow",
        "description": "Specializing in post-disaster recovery, ShelterNow helps communities build homes using local labor and sustainable materials. Support long-term recovery after natural catastrophes.",
        "goal": 15000,
        "imageUrl": "images/rebuild-after.jpg",
        "category": "Natural Disasters",
        "customer_id": "customer-2"
    },
    {
        "id": "8",
        "title": "Mobile Clinics For Crisis Zones With HealthBridge",
        "description": "HealthBridge deploys mobile clinics in underserved areas affected by conflicts and pandemics. Every donation fuels life-saving diagnoses and care in real time.",
        "goal": 20000,
        "imageUrl": "images/mobile-clinics.jpg",
        "category": "Health Emergencies",
        "customer_id": "customer-2"
    },
    {
        "id": "9",
        "title": "Emergency Aid in Gaza with Humanity Frontline",
        "description": "Providing food, medical aid, and psychological support for families affected by conflict in Gaza. Your donation goes directly to vetted local workers on the ground.",
        "goal": 6000,
        "imageUrl": "images/emergency-aid.jpg",
        "category": "Conflict Zone",
        "customer_id": "customer-2"
    },
    {
        "id": "10",
        "title": "Combating Cholera with CleanMedic Haiti",
        "description": "Fighting the cholera outbreak with emergency IV fluids, antibiotics, and bed treatment. Your contribution supports local nurses and medics on the frontlines.",
        "goal": 1000,
        "imageUrl": "images/combating.jpg",
        "category": "Health Emergencies",
        "customer_id": "customer-2"
    }
]

def recreate_tables():
    """Drop and recreate only the customers and causes tables"""
    try:
        print(f"Connecting to database: {DB_CONNECTION_STRING}")
        engine = create_engine(DB_CONNECTION_STRING)
        
        # Create a direct connection to execute raw SQL
        connection = engine.connect()
        
        # Drop only the causes and customers tables in the correct order (causes depends on customers)
        print("Dropping specific tables...")
        try:
            connection.execute(text("DROP TABLE IF EXISTS causes"))
            print("Dropped causes table.")
            connection.execute(text("DROP TABLE IF EXISTS customers"))
            print("Dropped customers table.")
            connection.commit()
        except Exception as e:
            print(f"Error dropping tables: {str(e)}")
        
        # Create only the customers and causes tables
        print("Creating customers and causes tables...")
        # Create a metadata object just for these two tables
        metadata = MetaData()
        Customer.__table__.to_metadata(metadata)
        Cause.__table__.to_metadata(metadata)
        metadata.create_all(engine)
        print("Successfully created customers and causes tables.")
        
        return engine
    except Exception as e:
        print(f"Error recreating tables: {str(e)}")
        traceback.print_exc()
        return None

def seed_customers(session):
    """Seed customers table with mock data."""
    print("Seeding customers table...")
    try:
        # Check if customers already exist
        existing_customers = session.query(Customer).all()
        if existing_customers:
            print(f"Found {len(existing_customers)} existing customers - skipping customer seeding")
            return True
            
        # If no customers exist, add them
        for customer_data in mock_customers:
            customer = Customer(**customer_data)
            print(f"Adding customer: {customer.customer_id}")
            session.add(customer)
        session.commit()
        print("Successfully seeded customers table.")
        return True
    except Exception as e:
        print(f"Error seeding customers table: {e}")
        session.rollback()
        return False

def seed_causes(session):
    """Seed the causes table with mock data"""
    try:
        print("Seeding causes table...")
        for cause_data in mock_causes:
            print(f"Adding cause: {cause_data['title']} (ID: {cause_data['id']}) with goal: {cause_data['goal']}")
            
            # Create a new cause with the mock data
            cause = Cause(
                cause_id=cause_data["id"],
                name=cause_data["title"],
                description=cause_data["description"],
                imageUrl=cause_data["imageUrl"],
                category=cause_data["category"],
                goal=cause_data["goal"],
                customer_id=cause_data["customer_id"]
            )
            
            session.add(cause)
        
        # Commit all changes
        session.commit()
        print("Successfully seeded causes table!")
        return True
        
    except Exception as e:
        session.rollback()
        print(f"Error seeding causes table: {str(e)}")
        traceback.print_exc()
        return False

def seed_database():
    """Main function to seed the database"""
    print("Starting database setup...")
    engine = recreate_tables()
    if not engine:
        print("Failed to setup database, aborting.")
        return
    
    # Create a session
    Session = sessionmaker(bind=engine)
    session = Session()
    
    try:
        # First seed customers
        if not seed_customers(session):
            print("Failed to seed customers, aborting.")
            return
        
        # Then seed causes
        if not seed_causes(session):
            print("Failed to seed causes.")
            return
        
        print("Database seeding completed successfully!")
        
    finally:
        session.close()

if __name__ == "__main__":
    seed_database() 