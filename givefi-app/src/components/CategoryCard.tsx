import React from 'react';
import './CategoryCard.css';

interface CategoryCardProps {
  id: string;
  title: string;
  description: string;
  icon: string;
  onClick: () => void;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ id, title, description, icon, onClick }) => {
  return (
    <div className="category" id={id} onClick={onClick}>
      <div className="category-icon">{icon}</div>
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
};

export default CategoryCard; 