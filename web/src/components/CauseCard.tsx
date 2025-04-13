import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { formatCurrency, calculatePercentage } from '../utils/helpers';
import './CauseCard.css';

// Import the Cause interface
interface Cause {
  cause_id: string;
  name: string;
  description: string;
  goal: number;
  raised: number;
  donations: number;
  imageUrl: string;
  category: string;
}

interface CauseCardProps {
  cause: Cause;
  expanded?: boolean;
}

const CauseCard: React.FC<CauseCardProps> = ({ cause, expanded = false }) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(expanded);
  const [imageError, setImageError] = useState<boolean>(false);
  
  const progressPercentage = calculatePercentage(cause.raised, cause.goal);
  
  const toggleExpand = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };
  
  return (
    <div className="max-w-md mx-auto">
      <div className={`bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${isExpanded ? 'z-10 relative' : ''}`}>
        {/* Image section */}
        <div className="h-44 relative overflow-hidden">
          <img 
            src={cause.imageUrl} 
            alt={cause.name}
            className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
          />
          <div className="absolute top-3 left-3 z-10">
            <span className="bg-indigo-600 bg-opacity-90 text-white text-xs font-semibold px-3 py-1 rounded-full backdrop-blur">
              {cause.category}
            </span>
          </div>
        </div>
        
        {/* Content section */}
        <div className="p-5 flex flex-col gap-3">
          {/* Title with proper overflow handling */}
          <h3 className={`text-lg font-bold text-gray-900 leading-tight ${!isExpanded ? 'line-clamp-2' : ''}`}>
            {cause.name}
          </h3>
          
          {/* Description with expand/collapse functionality */}
          <div className="flex flex-col gap-1">
            <p className={`text-sm text-gray-600 leading-relaxed ${!isExpanded ? 'line-clamp-3' : ''}`}>
              {cause.description}
            </p>
            
            {cause.description.length > 120 && (
              <button 
                className="text-xs font-semibold text-indigo-600 uppercase tracking-wide text-left"
                onClick={toggleExpand}
                aria-label={isExpanded ? "Show less" : "Show more"}
              >
                {isExpanded ? "Show less" : "Show more"}
              </button>
            )}
          </div>
          
          {/* Progress bar */}
          <div className="mt-1">
            <div className="flex justify-between mb-1 text-xs">
              <span className="font-semibold text-indigo-600">{Math.round(progressPercentage)}% funded</span>
              <span className="text-gray-500">{formatCurrency(cause.raised)} of {formatCurrency(cause.goal)}</span>
            </div>
            <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-indigo-600 rounded-full"
                style={{ width: `${progressPercentage}%` }}
                role="progressbar"
                aria-valuenow={progressPercentage}
                aria-valuemin={0}
                aria-valuemax={100}
              ></div>
            </div>
          </div>
          
          {/* Stats and CTA */}
          <div className="flex justify-between items-center pt-3 border-t border-gray-200 mt-2">
            <div className="flex flex-col">
              <span className="text-base font-bold text-gray-900">{cause.donations}</span>
              <span className="text-xs text-gray-500">Donations</span>
            </div>
            <a href={`/causes/${cause.cause_id}`} className="bg-indigo-600 text-white text-xs font-semibold py-2 px-3 rounded uppercase tracking-wide hover:bg-indigo-700 transition-colors">
              View Details
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CauseCard;