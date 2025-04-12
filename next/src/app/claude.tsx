// app/page.tsx
"use client";

import { useState, useEffect } from 'react';

// Mock data for the API
const mockCauses = [
  {
    id: 1,
    title: "Global Relief Disaster Response",
    description: "GRN delivers emergency food, shelter, and water within 24 hours of natural disasters. Your donation helps their rapid-response teams reach areas hit by floods, earthquakes, and hurricanes around the world.",
    goal: 50000,
    raised: 27400,
    donations: 14,
    imageUrl: "/api/placeholder/400/240", // Placeholder image
    category: "Natural Disasters",
    // Additional details for the cause page
    fundAllocation: [
      { category: "Emergency Shelter", allocation: "25-30%" },
      { category: "Clean Water & Sanitation", allocation: "20-25%" },
      { category: "Food & Nutrition", allocation: "15-20%" },
      { category: "Medical Aid", allocation: "15-20%" },
      { category: "Local Logistics", allocation: "10-15%" },
      { category: "Operational Support", allocation: "5-10%" }
    ],
    overview: "When disaster strikes, every second counts.\n\nGlobal Relief Network (GRN) is one of the world's fastest-acting humanitarian organizations, specializing in rapid emergency response. From floods in South Asia to earthquakes in South America, GRN mobilizes supplies and local teams within 24 hours — bringing hope and critical resources to families in crisis.\n\nYour donation helps us act immediately to save lives and stabilize communities in the hardest-hit regions.\n\nWith GiveFi, your contribution goes further — and faster — through blockchain-backed, transparent delivery.",
    impactFlow: [
      { from: "Global Charity", to: "Global Relief Disaster Response" },
      { from: "Global Relief Disaster Response", to: "Relief Riders Kenya" },
      { from: "Global Relief Disaster Response", to: "CleanWater Uganda" },
      { from: "Global Relief Disaster Response", to: "ShelterNow Nairobi" },
      { from: "Global Relief Disaster Response", to: "Mobile Medics Africa" },
      { from: "Global Relief Disaster Response", to: "Unknown Address" }
    ],
    testimonials: [
      {
        quote: "When the cyclone hit, we lost everything. GRN brought tarps, clean water, and food to our village before anyone else arrived.",
        author: "Amina, GRN aid recipient in coastal Mozambique"
      },
      {
        quote: "In the chaos after the earthquake, GRN was the first group we saw. They gave us hope.",
        author: "Luis, father of three, Peru"
      }
    ],
    aboutOrg: {
      name: "Global Charity",
      differentiators: [
        "Response within 24 hours of verified disasters",
        "Aid distributed through local NGOs and partners already embedded in the region",
        "GiveFi's blockchain-backed donations enable faster fund transfers and complete transparency",
        "Real-time updates so you can see your impact as it happens"
      ],
      description: "When every minute counts, Global Relief Network (GRN) is there. Each year, millions of people are displaced by natural disasters — floods, earthquakes, hurricanes, and wildfires. Many are left without shelter, food, or clean water within hours of the crisis.\n\nGRN specializes in rapid-response deployments that bring essential aid to vulnerable communities in the critical first 72 hours — often the difference between survival and tragedy.\n\nThrough local partnerships and field-trained teams, GRN ensures that relief is not only fast, but culturally appropriate, needs-driven, and grounded in local knowledge."
    }
  },
  {
    id: 2,
    title: "Rebuilding After the Storm with ShelterNow",
    description: "Specializing in post-disaster recovery, ShelterNow helps communities build homes using local labor and sustainable materials. Support long-term recovery after natural catastrophes.",
    goal: 15000,
    raised: 12200,
    donations: 25,
    imageUrl: "/api/placeholder/400/240", // Placeholder image
    category: "Natural Disasters",
    // Additional details for the cause page
    fundAllocation: [
      { category: "Sustainable Building Materials", allocation: "40-45%" },
      { category: "Local Labor Wages", allocation: "25-30%" },
      { category: "Water & Sanitation Systems", allocation: "15-20%" },
      { category: "Project Management", allocation: "5-10%" },
      { category: "Community Training", allocation: "5-10%" }
    ],
    overview: "Ut et sem tempor eu amet nunc. Vestibulum lectus cras sed odio. A dolor vitae efficacis pulvinar rhoncus vitae. Congue phasellus diam phasellus risus ullamcorper enim. Etiam suspendisse praesent eu nisl quisque. Porttitor orci id id nunc eu eget eu. Proin sed feugiat a enim quis.\n\nWhen disasters strike, immediate aid is crucial, but the work of rebuilding communities for the long term is just as essential. ShelterNow focuses on this critical second phase of disaster response, working with affected communities to rebuild permanent, disaster-resistant homes using sustainable materials and local labor.\n\nThis approach not only provides safe housing but also stimulates local economies and teaches resilient building techniques that communities can use for generations to come.",
    impactFlow: [
      { from: "Global Charity", to: "ShelterNow" },
      { from: "ShelterNow", to: "Local Builder Collectives" },
      { from: "ShelterNow", to: "Material Supply Chains" },
      { from: "ShelterNow", to: "Community Training Programs" }
    ],
    testimonials: [
      {
        quote: "After losing our home in the typhoon, we didn't know where to turn. ShelterNow not only helped us rebuild, but taught us how to build stronger for the next storm.",
        author: "Maria, homeowner in the Philippines"
      },
      {
        quote: "I worked as a carpenter on ShelterNow projects after Hurricane Eta. The money I earned helped my whole family recover, and now I have new skills to support us.",
        author: "Carlos, construction worker in Honduras"
      }
    ],
    aboutOrg: {
      name: "ShelterNow",
      differentiators: [
        "Permanent, disaster-resistant housing solutions",
        "Use of sustainable, locally-sourced materials",
        "Employment and training for local workers",
        "Community-centered design approach"
      ],
      description: "ShelterNow was founded in 2010 after the Haiti earthquake by a team of architects and disaster relief specialists who saw the need for better long-term housing solutions following natural disasters.\n\nToday, we operate in over 20 countries, with a focus on regions prone to recurring natural disasters. Our approach combines traditional wisdom with modern engineering to create homes that can withstand future disasters while respecting local architectural traditions and environmental considerations.\n\nEvery dollar donated to ShelterNow helps families rebuild not just homes, but livelihoods and community resilience."
    }
  },
  {
    id: 3,
    title: "Mobile Clinics For Crisis Zones With HealthBridge",
    description: "HealthBridge deploys mobile clinics in underserved areas affected by conflicts and pandemics. Every donation fuels life-saving diagnoses and care in real time.",
    goal: 200000,
    raised: 87000,
    donations: 6,
    imageUrl: "/api/placeholder/400/240", // Placeholder image
    category: "Health Emergencies",
    // Additional details for the cause page
    fundAllocation: [
      { category: "Medical Supplies", allocation: "35-40%" },
      { category: "Medical Staff", allocation: "25-30%" },
      { category: "Transport & Logistics", allocation: "15-20%" },
      { category: "Local Training", allocation: "10-15%" },
      { category: "Administration", allocation: "5-10%" }
    ],
    overview: "Specializing in crisis zone healthcare, HealthBridge helps communities navigate public health emergencies and conflict situations through mobile clinics that can reach the most vulnerable populations.\n\nHealthBridge's rapid response teams include doctors, nurses, and community health workers who can set up functioning clinics within hours in almost any environment. These clinics provide emergency care, disease prevention, maternal health services, and ongoing treatment for chronic conditions.\n\nWith your support, HealthBridge can continue to bring life-saving medical care to places where healthcare systems have collapsed or never existed at all.",
    impactFlow: [
      { from: "Global Charity", to: "HealthBridge" },
      { from: "HealthBridge", to: "Mobile Clinic Teams" },
      { from: "HealthBridge", to: "Medical Supply Partners" },
      { from: "HealthBridge", to: "Local Health Workers" },
      { from: "HealthBridge", to: "Telemedicine Services" }
    ],
    testimonials: [
      {
        quote: "When the conflict reached our village, we had to flee with nothing. My son became very ill during our journey. The HealthBridge clinic saved his life when no one else could help us.",
        author: "Fatima, mother of three, Syria"
      },
      {
        quote: "I've worked with many international medical organizations, but HealthBridge's ability to establish effective care in the most difficult environments is unmatched.",
        author: "Dr. Kiran, emergency physician and volunteer"
      }
    ],
    aboutOrg: {
      name: "HealthBridge",
      differentiators: [
        "Deployment of mobile clinics within 48 hours of crisis",
        "Integration with local health workers and traditional healers",
        "Telemedicine capabilities even in low-connectivity areas",
        "Focus on training local providers for sustainable healthcare"
      ],
      description: "HealthBridge was founded in 2005 by a group of emergency physicians and humanitarian workers who saw firsthand how healthcare systems collapse during conflicts and natural disasters.\n\nOur mission is to bridge the gap between emergency medical response and long-term healthcare solutions in crisis-affected communities worldwide. We believe that everyone deserves access to quality healthcare, regardless of where they live or what challenges they face.\n\nHealthBridge operates in some of the world's most challenging environments, from conflict zones to refugee camps to remote communities devastated by natural disasters."
    }
  }
];

const GiveFiDemo = () => {
  // State would normally be populated from API but using mock data for demo
  const [causes, setCauses] = useState(mockCauses);
  const [activePage, setActivePage] = useState('home');
  const [selectedCause, setSelectedCause] = useState(null);
  const [donationAmount, setDonationAmount] = useState(600);
  const [paymentMethod, setPaymentMethod] = useState('creditCard');
  
  // Parsing function for CSV data (not used in demo but would be needed in real app)
  const parseCSV = (csvText) => {
    // Basic CSV parsing logic would go here
    return [];
  };
  
  useEffect(() => {
    // In a real app, we would fetch data here
    // For demo purposes, we're using the mock data directly
  }, []);

  const viewCauseDetails = (id) => {
    const cause = causes.find(cause => cause.id === id);
    if (cause) {
      setSelectedCause(cause);
      setActivePage('causeDetail');
    }
  };

  const goToHome = () => {
    setActivePage('home');
    setSelectedCause(null);
  };
  
  // Components for different pages
  const HomePage = () => (
    <>
      {/* Hero Section */}
      <section className="py-12 bg-white text-center">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Give Instantly. Help Globally.</h1>
          <p className="text-lg mb-6">Disasters don't wait — and now, your donations don't have to either.</p>
          <p className="max-w-2xl mx-auto">
            Powered by Ripple and blockchain tech, GiveFi gets your funds to the people who need them — fast, transparent, direct.
          </p>
        </div>
      </section>

      {/* Categories */}
      <section className="py-10 bg-gray-100">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: "Natural Disasters",
                icon: "🏠",
                description: "Send emergency relief instantly to local responders"
              },
              {
                title: "Conflict Zone",
                icon: "🕊️",
                description: "Crypto-powered donations reach borderless aid networks"
              },
              {
                title: "Health Emergencies",
                icon: "🏥",
                description: "Fund life-saving supplies with full transparency"
              },
              {
                title: "Food & Water Crisis",
                icon: "🍲",
                description: "Help fund direct access to basic human needs"
              }
            ].map((category, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-sm text-center flex flex-col items-center">
                <div className="mb-4 text-3xl">{category.icon}</div>
                <h3 className="text-lg font-bold mb-2">{category.title}</h3>
                <p className="text-sm text-gray-600">{category.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Latest Causes */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8">Latest Causes</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {causes.map((cause) => (
              <div key={cause.id} className="border rounded-lg overflow-hidden shadow-sm">
                <div className="h-48 bg-gray-200">
                  <img 
                    src={cause.imageUrl}
                    alt={cause.title}
                    className="object-cover w-full h-full"
                  />
                </div>
                
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2">{cause.title}</h3>
                  <p className="text-gray-600 mb-4 text-sm h-24 overflow-hidden">{cause.description}</p>
                  
                  <div className="mb-4">
                    <div className="h-2 w-full bg-gray-200 rounded-full">
                      <div 
                        className="h-2 bg-green-500 rounded-full" 
                        style={{ width: `${Math.min(100, (cause.raised / cause.goal) * 100)}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between text-sm mb-4">
                    <div>
                      <p className="font-bold">Goal: ${cause.goal.toLocaleString()}</p>
                      <p className="text-gray-500">Raised: ${cause.raised.toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{cause.donations}</p>
                      <p className="text-gray-500">donations</p>
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => viewCauseDetails(cause.id)}
                    className="w-full bg-slate-700 hover:bg-slate-800 text-white py-2 px-4 rounded text-sm"
                  >
                    VIEW DETAILS
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );

  const CauseDetailPage = () => {
    if (!selectedCause) return null;
    
    return (
      <div className="pt-4">
        {/* Breadcrumb */}
        <div className="container mx-auto px-4 mb-6">
          <div className="flex items-center text-sm">
            <button onClick={goToHome} className="text-slate-600 hover:text-slate-800">Home</button>
            <span className="mx-2">{'>'}</span>
            <span className="text-slate-800">Causes</span>
          </div>
        </div>
        
        {/* Cause Title */}
        <div className="container mx-auto px-4 mb-8">
          <h1 className="text-3xl font-bold">{selectedCause.title}</h1>
        </div>
        
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Image, Goal, Donation Form */}
            <div className="lg:col-span-2">
              {/* Hero Image */}
              <div className="h-80 bg-gray-200 rounded mb-6">
                <img 
                  src={selectedCause.imageUrl}
                  alt={selectedCause.title}
                  className="w-full h-full object-cover rounded"
                />
              </div>
              
              {/* Progress Bar */}
              <div className="h-4 w-full bg-gray-200 rounded-full mb-4">
                <div 
                  className="h-4 bg-green-500 rounded-full" 
                  style={{ width: `${Math.min(100, (selectedCause.raised / selectedCause.goal) * 100)}%` }}
                ></div>
              </div>
              
              {/* Donation Stats */}
              <div className="flex justify-between mb-8">
                <div>
                  <h3 className="font-bold text-xl">Goal: ${selectedCause.goal.toLocaleString()}</h3>
                  <p>Raised: $ {selectedCause.raised.toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <h3 className="font-bold text-xl">{selectedCause.donations}</h3>
                  <p>donations</p>
                </div>
              </div>
              
              {/* Overview */}
              <div className="mb-10">
                <h2 className="text-2xl font-bold mb-4">Overview</h2>
                <div className="whitespace-pre-line">
                  {selectedCause.overview.split('\n').map((paragraph, i) => (
                    <p key={i} className="mb-4">{paragraph}</p>
                  ))}
                </div>
              </div>
              
              {/* Money Flow Visualization */}
              <div className="mb-10">
                <h2 className="text-2xl font-bold mb-6">Where will my money go?</h2>
                <p className="mb-4">Thanks to blockchain technology, every fund transfer is traceable. Here's a real-time snapshot of where donations are going — which partners are receiving them, what they're being used for, and how your impact is unfolding.</p>
                
                {/* Flow Diagram - Simple version */}
                <div className="flex flex-col items-center">
                  <div className="relative flex flex-col items-center">
                    {selectedCause.impactFlow.map((flow, index) => {
                      if (index === 0) {
                        return (
                          <div key={index} className="flex items-center mb-4">
                            <div className="bg-slate-700 text-white px-4 py-2 rounded text-sm">{flow.from}</div>
                            <div className="w-8 h-1 bg-slate-400 mx-2"></div>
                            <div className="bg-slate-700 text-white px-4 py-2 rounded text-sm">{flow.to}</div>
                          </div>
                        );
                      }
                      return (
                        <div key={index} className="flex items-center mb-2 mt-2">
                          <div className="w-4 h-1 bg-slate-400 mx-1"></div>
                          <div className="bg-white border border-slate-300 px-4 py-2 rounded text-sm">{flow.to}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
              
              {/* Testimonials */}
              <div className="mb-10">
                <h2 className="text-2xl font-bold mb-6">Real Stories from the Field</h2>
                
                {selectedCause.testimonials.map((testimonial, index) => (
                  <div key={index} className="mb-6">
                    <blockquote className="italic mb-2">"{testimonial.quote}"</blockquote>
                    <p className="text-sm text-slate-600">— {testimonial.author}</p>
                  </div>
                ))}
              </div>
              
              {/* About Organization */}
              <div className="mb-10">
                <h2 className="text-2xl font-bold mb-4">About {selectedCause.aboutOrg.name}</h2>
                
                <div className="mb-6">
                  <h3 className="font-bold mb-2">What Makes This Different</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    {selectedCause.aboutOrg.differentiators.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>
                
                <div className="whitespace-pre-line">
                  {selectedCause.aboutOrg.description.split('\n').map((paragraph, i) => (
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
                  
                  {selectedCause.fundAllocation.map((item, index) => (
                    <div key={index} className="flex justify-between py-2 border-b border-gray-100 text-sm">
                      <span>
                        {item.category === "Emergency Shelter" && "🏠 "}
                        {item.category === "Clean Water & Sanitation" && "💧 "}
                        {item.category === "Food & Nutrition" && "🍲 "}
                        {item.category === "Medical Aid" && "🩺 "}
                        {item.category === "Local Logistics" && "🚚 "}
                        {item.category === "Operational Support" && "⚙️ "}
                        {item.category === "Medical Supplies" && "💊 "}
                        {item.category === "Medical Staff" && "👨‍⚕️ "}
                        {item.category === "Transport & Logistics" && "🚚 "}
                        {item.category === "Local Training" && "👨‍🏫 "}
                        {item.category === "Administration" && "📊 "}
                        {item.category === "Sustainable Building Materials" && "🧱 "}
                        {item.category === "Local Labor Wages" && "👷 "}
                        {item.category === "Water & Sanitation Systems" && "🚿 "}
                        {item.category === "Project Management" && "📋 "}
                        {item.category === "Community Training" && "👨‍🏫 "}
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
                
                {causes.filter(cause => cause.id !== selectedCause.id).map((cause) => (
                  <div key={cause.id} className="mb-6 border-b pb-4">
                    <div className="flex mb-2">
                      <div className="w-24 h-16 bg-gray-200 rounded">
                        <img 
                          src={cause.imageUrl}
                          alt={cause.title}
                          className="w-full h-full object-cover rounded"
                        />
                      </div>
                      <div className="ml-3">
                        <h4 className="font-bold text-sm">{cause.title}</h4>
                        <p className="text-xs text-gray-600 line-clamp-2">{cause.description.substring(0, 80)}...</p>
                        <button 
                          onClick={() => viewCauseDetails(cause.id)}
                          className="text-xs text-green-500 font-bold mt-1"
                        >
                          VIEW DETAILS
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Navbar */}
      <nav className="bg-slate-800 text-white py-4">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center">
            <button onClick={goToHome} className="flex items-center">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mr-2">
                <svg className="w-5