// components/ProgressBar.tsx
import React from 'react';

interface ProgressBarProps {
  percentage: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ percentage }) => {
  // Ensure percentage is between 0 and 100
  const clampedPercentage = Math.min(Math.max(percentage, 0), 100);
  
  // Determine color based on progress
  let barColor = 'bg-green-500';
  if (clampedPercentage < 25) {
    barColor = 'bg-red-500';
  } else if (clampedPercentage < 50) {
    barColor = 'bg-yellow-500';
  } else if (clampedPercentage < 75) {
    barColor = 'bg-blue-500';
  }

  return (
    <div className="w-full bg-gray-200 rounded-full h-2.5">
      <div 
        className={`${barColor} h-2.5 rounded-full`} 
        style={{ width: `${clampedPercentage}%` }}
      ></div>
    </div>
  );
};

export default ProgressBar;