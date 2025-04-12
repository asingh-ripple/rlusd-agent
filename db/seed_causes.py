#!/usr/bin/env python3
"""
Seed script to populate the causes table with mock data.
"""

import os
import sys
import traceback
from datetime import datetime
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Add the parent directory to the path to import the database module
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from db.database import Base, Cause

# Initialize the database with an SQLite database file
DB_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data", "disaster_monitor.db")
DB_CONNECTION_STRING = f"sqlite:///{DB_PATH}"

# Mock data from CauseDetailPage.tsx and other React components
mock_causes = [
    {
        "id": "customer-1",
        "title": "Hurricane Relief in Florida",
        "description": "Support communities affected by the recent devastating hurricane in Florida.",
        "goal": 500000,
        "imageUrl": "https://images.unsplash.com/photo-1569427575831-317b45c7a130?auto=format&fit=crop&q=80&w=1000",
        "category": "Natural Disasters"
    },
    {
        "id": "customer-2",
        "title": "Flood Recovery in Louisiana",
        "description": "Help families rebuild after the devastating floods in Louisiana.",
        "goal": 350000,
        "imageUrl": "https://images.unsplash.com/photo-1583488630027-58f4c80c74ff?auto=format&fit=crop&q=80&w=1000",
        "category": "Natural Disasters"
    },
    {
        "id": "customer-3",
        "title": "Wildfire Relief in California",
        "description": "Provide support for communities affected by the devastating wildfires in California.",
        "goal": 400000,
        "imageUrl": "https://images.unsplash.com/photo-1602496849540-bf8fa67a6ef2?auto=format&fit=crop&q=80&w=1000",
        "category": "Natural Disasters"
    },
    {
        "id": "customer-4",
        "title": "Emergency Aid for Gaza",
        "description": "Provide critical humanitarian assistance to civilians caught in the conflict in Gaza.",
        "goal": 750000,
        "imageUrl": "https://images.unsplash.com/photo-1628511954475-4fc8b0ed4193?auto=format&fit=crop&q=80&w=1000",
        "category": "Conflict Zone"
    },
    {
        "id": "customer-5",
        "title": "Ukraine Humanitarian Crisis",
        "description": "Support families displaced by the ongoing conflict in Ukraine with essential aid.", 
        "goal": 1000000,
        "imageUrl": "https://images.unsplash.com/photo-1655123613624-56376576e4a5?auto=format&fit=crop&q=80&w=1000",
        "category": "Conflict Zone"
    },
    # Adding causes from CausesPage.tsx
    {
        "id": "customer-6",
        "title": "Global Relief Disaster Response",
        "description": "GRN delivers emergency food, shelter, and water within 24 hours of natural disasters. Your donation helps their rapid-response teams reach areas hit by floods, earthquakes, and hurricanes around the world.",
        "goal": 50000,
        "imageUrl": "/images/disaster-relief.jpg",
        "category": "Natural Disasters"
    },
    {
        "id": "customer-7",
        "title": "Rebuilding After the Storm with ShelterNow",
        "description": "Specializing in post-disaster recovery, ShelterNow helps communities build homes using local labor and sustainable materials. Support long-term recovery after natural catastrophes.",
        "goal": 15000,
        "imageUrl": "/images/shelter-rebuild.jpg",
        "category": "Natural Disasters"
    },
    {
        "id": "customer-8",
        "title": "Mobile Clinics For Crisis Zones With HealthBridge",
        "description": "HealthBridge deploys mobile clinics in underserved areas affected by conflicts and pandemics. Every donation fuels life-saving diagnoses and care in real time.",
        "goal": 200000,
        "imageUrl": "/images/mobile-clinics.jpg",
        "category": "Health Emergencies"
    },
    {
        "id": "customer-9",
        "title": "Emergency Aid in Gaza with Humanity Frontline",
        "description": "Providing food, medical aid, and psychological support for families affected by conflict in Gaza. Your donation goes directly to vetted local workers on the ground.",
        "goal": 60000,
        "imageUrl": "/images/gaza-aid.jpg",
        "category": "Conflict Zone"
    },
    {
        "id": "customer-10",
        "title": "Combating Cholera with CleanMedic Haiti",
        "description": "Fighting the cholera outbreak with emergency IV fluids, antibiotics, and bed treatment. Your contribution supports local nurses and medics on the frontlines.",
        "goal": 220000,
        "imageUrl": "/images/cholera-haiti.jpg",
        "category": "Health Emergencies"
    },
    {
        "id": "customer-11",
        "title": "Feeding Children in Drought with NourishNow",
        "description": "Providing school meals and nutritional support in East Africa where children face severe food insecurity due to drought. $1 can feed a child for a day.",
        "goal": 120000,
        "imageUrl": "/images/drought-children.jpg",
        "category": "Food & Water Crisis"
    }
]

def recreate_tables():
    """Drop and recreate all tables"""
    try:
        print(f"Connecting to database: {DB_CONNECTION_STRING}")
        engine = create_engine(DB_CONNECTION_STRING)
        
        # Drop all tables
        print("Dropping all tables...")
        Base.metadata.drop_all(engine)
        print("Successfully dropped all tables.")
        
        # Create all tables, including the updated Cause model
        print("Creating all tables...")
        Base.metadata.create_all(engine)
        print("Successfully created all tables.")
        
        return engine
    except Exception as e:
        print(f"Error recreating tables: {str(e)}")
        traceback.print_exc()
        return None

def seed_causes():
    """Seed the causes table with mock data"""
    print("Starting database setup...")
    engine = recreate_tables()
    if not engine:
        print("Failed to setup database, aborting.")
        return
    
    # Create a session
    Session = sessionmaker(bind=engine)
    session = Session()
    
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
            )
            
            session.add(cause)
        
        # Commit all changes
        session.commit()
        print("Successfully seeded causes table!")
        
    except Exception as e:
        session.rollback()
        print(f"Error seeding causes table: {str(e)}")
        traceback.print_exc()
    finally:
        session.close()

if __name__ == "__main__":
    seed_causes() 