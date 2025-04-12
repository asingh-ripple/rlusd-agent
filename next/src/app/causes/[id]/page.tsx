"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { Cause } from '../../types';

// Mock data for fund allocation
const fundAllocation = [
  { category: "Emergency Shelter", allocation: "25-30%" },
  { category: "Clean Water & Sanitation", allocation: "20-25%" },
  { category: "Food & Nutrition", allocation: "15-20%" },
  { category: "Medical Aid", allocation: "15-20%" },
  { category: "Local Logistics", allocation: "10-15%" },
  { category: "Operational Support", allocation: "5-10%" }
];

// Mock data for impact flow
const impactFlow = [
  { from: "Global Charity", to: "Global Relief Disaster Response" },
  { from: "Global Relief Disaster Response", to: "Relief Riders Kenya" },
  { from: "Global Relief Disaster Response", to: "CleanWater Uganda" },
  { from: "Global Relief Disaster Response", to: "ShelterNow Nairobi" },
  { from: "Global Relief Disaster Response", to: "Mobile Medics Africa" },
  { from: "Global Relief Disaster Response", to: "Unknown Address" }
];

// Mock data for testimonials
const testimonials = [
  {
    quote: "When the cyclone hit, we lost everything. GRN brought tarps, clean water, and food to our village before anyone else arrived.",
    author: "Amina, GRN aid recipient in coastal Mozambique"
  },
  {
    quote: "In the chaos after the earthquake, GRN was the first group we saw. They gave us hope.",
    author: "Luis, father of three, Peru"
  }
];

// Mock data for organization info
const aboutOrg = {
  name: "Global Charity",
  differentiators: [
    "Response within 24 hours of verified disasters",
    "Aid distributed through local NGOs and partners already embedded in the region",
    "GiveFi's blockchain-backed donations enable faster fund transfers and complete transparency",
    "Real-time updates so you can see your impact as it happens"
  ],
  description: "When every second matters, Global Relief Network (GRN) is there. Each year, millions of people are displaced by natural disasters — floods, earthquakes, hurricanes, and wildfires. Many are left without shelter, food, or clean water within hours of the crisis.\n\nGRN specializes in rapid-response deployments that bring essential aid to vulnerable communities in the critical first 72 hours — often the difference between survival and tragedy.\n\nThrough local partnerships and field-trained teams, GRN ensures that relief is not only fast, but culturally appropriate, needs-driven, and grounded in local knowledge."
};

export default function CausePage({ params }: { params: { id: string } }) {
  const [cause, setCause] = useState<Cause | null>(null);
  const [loading, setLoading] = useState(true);
  const [donationAmount, setDonationAmount] = useState(600);
  const [paymentMethod, setPaymentMethod] = useState('creditCard');
  const [relatedCauses, setRelatedCauses] = useState<Cause[]>([]);

  useEffect(() => {
    const fetchCause = async () => {
      try {
        const response = await fetch('/api/causes');
        const allCauses = await response.json();
        const currentCause = allCauses.find((c: Cause) => c.id === parseInt(params.id));
        
        if (currentCause) {
          setCause(currentCause);
          setRelatedCauses(allCauses.filter((c: Cause) => c.id !== parseInt(params.id)).slice(0, 3));
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching cause:', error);
        setLoading(false);
      }
    };

    fetchCause();
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!cause) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Cause not found</h1>
            <Link href="/" className="text-blue-500 hover:underline">Return to home</Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const overview = "When disaster strikes, every second counts.\n\nGlobal Relief Network (GRN) is one of the world's fastest-acting humanitarian organizations, specializing in rapid emergency response. From floods in South Asia to earthquakes in South America, GRN mobilizes supplies and local teams within 24 hours — bringing hope and critical resources to families in crisis.\n\nYour donation helps us act immediately to save lives and stabilize communities in the hardest-hit regions.\n\nWith GiveFi, your contribution goes further — and faster — through blockchain-backed, transparent delivery.";

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow">
        {/* Breadcrumb */}
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center text-sm">
            <Link href="/" className="text-slate-600 hover:text-slate-800">Home</Link>
            <span className="mx-2">{">"}</span>
            <span className="text-slate-800">Causes</span>
          </div>
        </div>
        
        {/* Cause Title */}
        <div className="container mx-auto px-4 mb-6">
          <h1 className="text-3xl font-bold">{cause.title}</h1>
        </div>
        
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column */}
            <div className="lg:col-span-2">
              {/* Hero Image */}
              <div className="h-80 bg-gray-200 rounded mb-6 relative overflow-hidden">
                <Image 
                  src={cause.imageUrl || '/images/causes/placeholder.svg'} 
                  alt={cause.title}
                  fill
                  className="object-cover"
                  onError={(e) => {
                    // @ts-ignore - fallback to placeholder if image fails to load
                    e.target.src = '/images/causes/placeholder.svg';
                  }}
                />
              </div>
              
              {/* Progress Bar */}
              <div className="h-4 w-full bg-gray-200 rounded-full mb-4">
                <div 
                  className="h-4 bg-green-500 rounded-full" 
                  style={{ width: `${Math.min(100, (cause.raised / cause.goal) * 100)}%` }}
                ></div>
              </div>
              
              {/* Donation Stats */}
              <div className="flex justify-between mb-8">
                <div>
                  <h3 className="font-bold text-xl">Goal: ${cause.goal.toLocaleString()}</h3>
                  <p>Raised: $ {cause.raised.toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <h3 className="font-bold text-xl">{cause.donations}</h3>
                  <p>donations</p>
                </div>
              </div>
              
              {/* Overview */}
              <div className="mb-10">
                <h2 className="text-2xl font-bold mb-4">Overview</h2>
                <div className="whitespace-pre-line">
                  {overview.split('\n').map((paragraph, i) => (
                    <p key={i} className="mb-4">{paragraph}</p>
                  ))}
                </div>
              </div>
              
              {/* Money Flow Visualization */}
              <div className="mb-10">
                <h2 className="text-2xl font-bold mb-6">Where will my money go?</h2>
                <p className="mb-4">Thanks to blockchain technology, every fund transfer is traceable. Here's a real-time snapshot of where donations are going — which partners are receiving them, what they're being used for, and how your impact is unfolding.</p>
                
                {/* Flow Diagram */}
                <div className="flex justify-center my-8">
                  <div className="max-w-2xl w-full">
                    <div className="flex justify-center mb-6">
                      <div className="bg-slate-700 text-white px-4 py-2 rounded text-sm w-40 text-center">
                        Global Charity
                      </div>
                    </div>
                    
                    <div className="flex justify-center relative mb-6">
                      <div className="absolute top-0 left-1/2 h-8 w-0.5 bg-slate-400"></div>
                      <div className="bg-slate-700 text-white px-4 py-2 rounded text-sm w-56 text-center mt-8">
                        Global Relief Disaster Response
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-8 relative">
                      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 h-8 w-0.5 bg-slate-400"></div>
                      <div className="absolute top-0 left-1/6 sm:left-1/4 h-8 w-0.5 bg-slate-400"></div>
                      <div className="absolute top-0 left-1/2 h-8 w-0.5 bg-slate-400"></div>
                      <div className="absolute top-0 right-1/6 sm:right-1/4 h-8 w-0.5 bg-slate-400"></div>
                      
                      <div className="border border-slate-300 px-2 py-1 rounded text-sm text-center">
                        Relief Riders Kenya
                      </div>
                      <div className="border border-slate-300 px-2 py-1 rounded text-sm text-center">
                        CleanWater Uganda
                      </div>
                      <div className="border border-slate-300 px-2 py-1 rounded text-sm text-center">
                        ShelterNow Nairobi
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 mx-auto max-w-lg">
                      <div className="border border-slate-300 px-2 py-1 rounded text-sm text-center">
                        Mobile Medics Africa
                      </div>
                      <div className="border border-slate-300 px-2 py-1 rounded text-sm text-center">
                        Unknown Address
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Testimonials */}
              <div className="mb-10">
                <h2 className="text-2xl font-bold mb-6">Real Stories from the Field</h2>
                
                {testimonials.map((testimonial, index) => (
                  <div key={index} className="mb-6">
                    <blockquote className="italic mb-2">"{testimonial.quote}"</blockquote>
                    <p className="text-sm text-slate-600">— {testimonial.author}</p>
                  </div>
                ))}
              </div>
              
              {/* About Organization */}
              <div className="mb-10">
                <h2 className="text-2xl font-bold mb-4">About {aboutOrg.name}</h2>
                
                <div className="mb-6">
                  <h3 className="font-bold mb-2">What Makes This Different</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    {aboutOrg.differentiators.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>
                
                <div className="whitespace-pre-line">
                  {aboutOrg.description.split('\n').map((paragraph, i) => (
                    <p key={i} className="mb-4">{paragraph}</p>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Right Column - Donation Form */}
            <div className="lg:col-span-1">
              <div className="bg-white p-6 border rounded-lg shadow-sm sticky top-4">
                <h2 className="text-xl font-bold mb-6">Estimated Use of Funds</h2>
                
                <div className="mb-6">
                  <div className="mb-2 flex justify-between text-sm font-bold">
                    <span>Category</span>
                    <span>Approx. Allocation</span>
                  </div>
                  
                  {fundAllocation.map((item, index) => (
                    <div key={index} className="flex justify-between py-2 border-b border-gray-100 text-sm">
                      <span>
                        {item.category === "Emergency Shelter" && "🏠 "}
                        {item.category === "Clean Water & Sanitation" && "💧 "}
                        {item.category === "Food & Nutrition" && "🍲 "}
                        {item.category === "Medical Aid" && "🩺 "}
                        {item.category === "Local Logistics" && "🚚 "}
                        {item.category === "Operational Support" && "⚙️ "}
                        {item.category}
                      </span>
                      <span>{item.allocation}</span>
                    </div>
                  ))}
                </div>
                
                {/* Donation Form */}
                <div>
                  <h3 className="font-bold mb-4">Donation Amount</h3>
                  
                  <div className="flex space-x-2 mb-4">
                    <button 
                      className={`flex-1 py-2 px-4 rounded ${donationAmount === 10 ? 'bg-slate-700 text-white' : 'bg-white border border-slate-300'}`}
                      onClick={() => setDonationAmount(10)}
                    >
                      $10
                    </button>
                    <button 
                      className={`flex-1 py-2 px-4 rounded ${donationAmount === 25 ? 'bg-slate-700 text-white' : 'bg-white border border-slate-300'}`}
                      onClick={() => setDonationAmount(25)}
                    >
                      $25
                    </button>
                    <button 
                      className={`flex-1 py-2 px-4 rounded ${donationAmount === 50 ? 'bg-slate-700 text-white' : 'bg-white border border-slate-300'}`}
                      onClick={() => setDonationAmount(50)}
                    >
                      $50
                    </button>
                  </div>
                  
                  <div className="mb-6">
                    <div className="flex items-center">
                      <span className="text-lg mr-2">$</span>
                      <input 
                        type="text" 
                        className="w-full p-2 border rounded bg-gray-50" 
                        value={donationAmount} 
                        onChange={(e) => {
                          const value = parseInt(e.target.value);
                          if (!isNaN(value)) setDonationAmount(value);
                        }}
                      />
                    </div>
                  </div>
                  
                  <h3 className="font-bold mb-4">Select Payment Method</h3>
                  
                  <div className="flex space-x-4 mb-6">
                    <label className="flex items-center">
                      <input 
                        type="radio" 
                        checked={paymentMethod === 'creditCard'} 
                        onChange={() => setPaymentMethod('creditCard')}
                        className="mr-2"
                      />
                      Credit Card
                    </label>
                    
                    <label className="flex items-center">
                      <input 
                        type="radio" 
                        checked={paymentMethod === 'paypal'} 
                        onChange={() => setPaymentMethod('paypal')}
                        className="mr-2"
                      />
                      Pay Pal
                    </label>
                  </div>
                  
                  {paymentMethod === 'creditCard' && (
                    <div className="mb-6">
                      <label className="block text-sm mb-2">Credit Card Number</label>
                      <input type="text" className="w-full p-2 border rounded bg-gray-50" placeholder="**** **** **** ****" />
                    </div>
                  )}
                  
                  <h3 className="font-bold mb-4">Personal Information</h3>
                  
                  <div className="space-y-4 mb-6">
                    <div>
                      <label className="block text-sm mb-1">First Name</label>
                      <input type="text" className="w-full p-2 border rounded bg-gray-50" />
                    </div>
                    
                    <div>
                      <label className="block text-sm mb-1">Last Name</label>
                      <input type="text" className="w-full p-2 border rounded bg-gray-50" />
                    </div>
                    
                    <div className="flex items-center">
                      <input type="checkbox" id="displayName" className="mr-2" />
                      <label htmlFor="displayName" className="text-sm">Don't display my name with this donation</label>
                    </div>
                    
                    <div>
                      <label className="block text-sm mb-1">Email Address</label>
                      <input type="email" className="w-full p-2 border rounded bg-gray-50" />
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <div className="flex justify-between items-center">
                      <span className="font-bold">Donation Total:</span>
                      <span className="text-xl text-green-500 font-bold">${donationAmount}</span>
                    </div>
                  </div>
                  
                  <button className="w-full bg-green-500 hover:bg-green-600 text-white py-3 px-4 rounded font-bold">
                    DONATE NOW
                  </button>
                </div>
              </div>
              
              {/* Related Causes */}
              <div className="mt-8">
                <h3 className="font-bold text-xl mb-4">Urgent Causes</h3>
                
                {relatedCauses.map((relatedCause) => (
                  <div key={relatedCause.id} className="mb-6 border-b pb-4">
                    <div className="flex mb-2">
                      <div className="w-24 h-16 bg-gray-200 rounded relative overflow-hidden">
                        <Image 
                          src={relatedCause.imageUrl || '/images/causes/placeholder.svg'} 
                          alt={relatedCause.title}
                          fill
                          className="object-cover"
                          onError={(e) => {
                            // @ts-ignore
                            e.target.src = '/images/causes/placeholder.svg';
                          }}
                        />
                      </div>
                      <div className="ml-3">
                        <h4 className="font-bold text-sm">{relatedCause.title}</h4>
                        <p className="text-xs text-gray-600 line-clamp-2">{relatedCause.description.substring(0, 80)}...</p>
                        <Link href={`/causes/${relatedCause.id}`} className="text-xs text-green-500 font-bold mt-1 inline-block">
                          VIEW DETAILS
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
} 