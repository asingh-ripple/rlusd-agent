"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Cause } from '../types';

export default function CausesPage() {
  const [causes, setCauses] = useState<Cause[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>('All');

  useEffect(() => {
    const fetchCauses = async () => {
      try {
        const response = await fetch('/api/causes');
        const data = await response.json();
        setCauses(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching causes:', error);
        setLoading(false);
      }
    };

    fetchCauses();
  }, []);

  const categories = [
    'All',
    'Natural Disasters',
    'Conflict Zone',
    'Health Emergencies',
    'Food & Water Crisis'
  ];

  const filteredCauses = activeCategory === 'All' 
    ? causes 
    : causes.filter(cause => cause.category === activeCategory);

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
        
        {/* Page Title */}
        <div className="container mx-auto px-4 mb-8">
          <h1 className="text-3xl font-bold">All Causes</h1>
          <p className="mt-2 text-gray-600">Browse all our active causes and make an impact today.</p>
        </div>
        
        {/* Category Filter */}
        <div className="container mx-auto px-4 mb-8">
          <div className="flex flex-wrap gap-2">
            {categories.map(category => (
              <button
                key={category}
                className={`px-4 py-2 rounded-full text-sm ${
                  activeCategory === category
                    ? 'bg-slate-700 text-white'
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                }`}
                onClick={() => setActiveCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
        
        {/* Causes Grid */}
        <div className="container mx-auto px-4 py-8">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
            </div>
          ) : filteredCauses.length === 0 ? (
            <div className="text-center py-16">
              <h3 className="text-xl font-bold mb-4">No causes found</h3>
              <p className="text-gray-600">There are currently no active causes in this category.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredCauses.map((cause) => (
                <div key={cause.id} className="border rounded-lg overflow-hidden shadow-sm">
                  <div className="relative h-48 bg-gray-200">
                    <Image 
                      src={cause.imageUrl || '/images/causes/placeholder.svg'} 
                      alt={cause.title}
                      fill
                      className="object-cover"
                      onError={(e) => {
                        // @ts-ignore - fallback to placeholder if image fails to load
                        e.target.src = '/images/causes/placeholder.svg';
                      }}
                      unoptimized={cause.imageUrl?.endsWith('.svg')}
                    />
                  </div>
                  
                  <div className="p-6">
                    <div className="mb-3">
                      <span className="inline-block bg-gray-100 rounded-full px-3 py-1 text-xs font-semibold text-gray-700 mr-2">
                        {cause.category}
                      </span>
                    </div>
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
                    
                    <Link href={`/causes/${cause.id}`}>
                      <button className="w-full bg-slate-700 hover:bg-slate-800 text-white py-2 px-4 rounded text-sm">
                        VIEW DETAILS
                      </button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
} 