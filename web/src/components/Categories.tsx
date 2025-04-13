import React from 'react';
import CategoryCard from './CategoryCard';
import './Categories.css';

interface CategoriesProps {
  onCategorySelect: (categoryId: string) => void;
}

const Categories: React.FC<CategoriesProps> = ({ onCategorySelect }) => {
  const categories = [
    {
      id: 'natural-disasters',
      title: 'Natural Disasters',
      description: 'Send emergency relief instantly to local responders',
      icon: '📖'
    },
    {
      id: 'conflict-zone',
      title: 'Conflict Zone',
      description: 'Crypto-powered donations reach borderless aid networks',
      icon: '🚰'
    },
    {
      id: 'health-emergencies',
      title: 'Health Emergencies',
      description: 'Fund life-saving supplies with full transparency',
      icon: '🧑‍⚕️'
    },
    {
      id: 'food-water',
      title: 'Food & Water Crisis',
      description: 'Help fund direct access to basic human needs',
      icon: '❤️'
    }
  ];

  return (
    <section className="categories">
      {categories.map(category => (
        <CategoryCard
          key={category.id}
          id={category.id}
          title={category.title}
          description={category.description}
          icon={category.icon}
          onClick={() => onCategorySelect(category.id)}
        />
      ))}
    </section>
  );
};

export default Categories; 