// components/CategoryCard.tsx
import React from 'react';
import { CategoryInfo } from '../app/types';

interface CategoryCardProps {
  category: CategoryInfo;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ category }) => {
  // Icons mapping based on category
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'disaster-icon':
        return (
          <svg className="w-12 h-12 text-orange-500" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 3L1 9l11 6 11-6-11-6zm0 12.5L4 13 1 14.5l11 6 11-6-3-1.5-8 4.5z" />
          </svg>
        );
      case 'conflict-icon':
        return (
          <svg className="w-12 h-12 text-orange-500" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zM9 12c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm6 0c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z" />
            <path d="M12 14c-2.33 0-4.32 1.45-5.12 3.5h1.67c.69-1.19 1.97-2 3.45-2s2.75.81 3.45 2h1.67c-.8-2.05-2.79-3.5-5.12-3.5z" />
          </svg>
        );
      case 'health-icon':
        return (
          <svg className="w-12 h-12 text-orange-500" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 10h-4v4h-2v-4H7v-2h4V7h2v4h4v2z" />
          </svg>
        );
      case 'food-water-icon':
        return (
          <svg className="w-12 h-12 text-orange-500" viewBox="0 0 24 24" fill="currentColor">
            <path d="M11 9H9V2H7v7H5V2H3v7c0 2.12 1.66 3.84 3.75 3.97V22h2.5v-9.03C11.34 12.84 13 11.12 13 9V2h-2v7zm5-3v8h2.5v8H21V2c-2.76 0-5 2.24-5 4z" />
          </svg>
        );
      default:
        return (
          <svg className="w-12 h-12 text-orange-500" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
          </svg>
        );
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md flex flex-col items-center text-center">
      {getIcon(category.icon)}
      <h3 className="text-lg font-bold mt-4 mb-2">{category.title}</h3>
      <p className="text-sm text-gray-600">{category.description}</p>
    </div>
  );
};

export default CategoryCard;