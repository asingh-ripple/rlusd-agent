// components/CauseCard.tsx
import React from 'react';
import Image from 'next/image';
import { Cause } from '../app/types';
import ProgressBar from '../components/ProgressBar';

interface CauseCardProps {
  cause: Cause;
}

const CauseCard: React.FC<CauseCardProps> = ({ cause }) => {
  // Calculate progress percentage
  const progressPercentage = Math.round((cause.raised / cause.goal) * 100);
  
  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD',
      maximumFractionDigits: 0 
    }).format(amount);
  };

  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-md flex flex-col h-full">
      <div className="relative h-48 w-full">
        <Image
          src={cause.image}
          alt={cause.title}
          fill
          className="object-cover"
        />
      </div>
      
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="text-xl font-bold mb-2">{cause.title}</h3>
        <p className="text-gray-600 text-sm mb-4 flex-grow">{cause.description}</p>
        
        <ProgressBar percentage={progressPercentage} />
        
        <div className="flex justify-between items-center mt-4">
          <div>
            <p className="font-bold">Goal: {formatCurrency(cause.goal)}</p>
            <p className="text-sm text-gray-500">Raised: {formatCurrency(cause.raised)}</p>
          </div>
          <div className="text-right">
            <p className="font-bold">{cause.donations}</p>
            <p className="text-sm text-gray-500">donations</p>
          </div>
        </div>
        
        <button className="mt-4 bg-blue-900 text-white py-2 px-4 rounded w-full hover:bg-blue-800 transition">
          VIEW DETAILS
        </button>
      </div>
    </div>
  );
};

export default CauseCard;