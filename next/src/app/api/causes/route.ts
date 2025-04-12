import { NextResponse } from 'next/server';

export interface Cause {
  id: number;
  title: string;
  description: string;
  goal: number;
  raised: number;
  donations: number;
  imageUrl: string;
  category: string;
}

// Mock data for the API
const causes: Cause[] = [
  {
    id: 1,
    title: "Global Relief Disaster Response",
    description: "GRN delivers emergency food, shelter, and water within 24 hours of natural disasters. Your donation helps their rapid-response teams reach areas hit by floods, earthquakes, and hurricanes around the world.",
    goal: 50000,
    raised: 27400,
    donations: 14,
    imageUrl: "/images/causes/disaster-relief.jpg",
    category: "Natural Disasters"
  },
  {
    id: 2,
    title: "Rebuilding After the Storm with ShelterNow",
    description: "Specializing in post-disaster recovery, ShelterNow helps communities build homes using local labor and sustainable materials. Support long-term recovery after natural catastrophes.",
    goal: 15000,
    raised: 12200,
    donations: 25,
    imageUrl: "/images/causes/shelter-rebuild.jpg",
    category: "Natural Disasters"
  },
  {
    id: 3,
    title: "Mobile Clinics For Crisis Zones With HealthBridge",
    description: "HealthBridge deploys mobile clinics in underserved areas affected by conflicts and pandemics. Every donation fuels life-saving diagnoses and care in real time.",
    goal: 200000,
    raised: 87000,
    donations: 6,
    imageUrl: "/images/causes/mobile-clinics.jpg",
    category: "Health Emergencies"
  },
  {
    id: 4,
    title: "Emergency Aid in Gaza with Humanity Frontline",
    description: "Providing food, medical aid, and psychological support for families affected by conflict in Gaza. Your donation goes directly to vetted local workers on the ground.",
    goal: 60000,
    raised: 32500,
    donations: 12,
    imageUrl: "/images/causes/gaza-aid.jpg",
    category: "Conflict Zone"
  },
  {
    id: 5,
    title: "Combating Cholera with CleanMedic Haiti",
    description: "Fighting the cholera outbreak with emergency IV fluids, antibiotics, and bed treatment. Your contribution supports local nurses and medics on the frontlines.",
    goal: 220000,
    raised: 80000,
    donations: 24,
    imageUrl: "/images/causes/cholera-haiti.jpg",
    category: "Health Emergencies"
  },
  {
    id: 6,
    title: "Feeding Children in Drought with NourishNow",
    description: "Providing school meals and nutritional support in East Africa where children face severe food insecurity due to drought. $1 can feed a child for a day.",
    goal: 120000,
    raised: 35000,
    donations: 8,
    imageUrl: "/images/causes/drought-children.jpg",
    category: "Food & Water Crisis"
  }
];

export async function GET() {
  return NextResponse.json(causes);
} 