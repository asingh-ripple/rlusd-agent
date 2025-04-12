import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface Cause {
  id: number;
  title: string;
  description: string;
  goal: number;
  raised: number;
  donations: number;
  imageUrl: string;
  category: string;
}

const LatestCauses = () => {
  const [causes, setCauses] = useState<Cause[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchCauses = async () => {
      try {
        const response = await fetch('/api/causes');
        const data = await response.json();
        setCauses(data.slice(0, 3)); // Only show the first 3 causes
        setLoading(false);
      } catch (error) {
        console.error('Error fetching causes:', error);
        setLoading(false);
      }
    };

    fetchCauses();
  }, []);

  if (loading) {
    return (
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8">Latest Causes</h2>
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold">Latest Causes</h2>
          <Link href="/causes" className="text-green-500 hover:text-green-600 font-semibold">
            View All Causes →
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {causes.map((cause) => (
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
                <p className="text-gray-600 mb-4 text-sm">{cause.description.substring(0, 120)}...</p>
                
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
      </div>
    </section>
  );
};

export default LatestCauses; 