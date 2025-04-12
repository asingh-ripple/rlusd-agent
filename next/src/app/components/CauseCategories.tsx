import Image from 'next/image';

interface Category {
  title: string;
  icon: string;
  description: string;
}

const CauseCategories = () => {
  const categories: Category[] = [
    {
      title: "Natural Disasters",
      icon: "/images/icons/natural-disasters.svg",
      description: "Send emergency relief instantly to local responders"
    },
    {
      title: "Conflict Zone",
      icon: "/images/icons/conflict-zone.svg",
      description: "Crypto-powered donations reach borderless aid networks"
    },
    {
      title: "Health Emergencies",
      icon: "/images/icons/health.svg",
      description: "Fund life-saving supplies with full transparency"
    },
    {
      title: "Food & Water Crisis",
      icon: "/images/icons/food-water.svg",
      description: "Help fund direct access to basic human needs"
    }
  ];

  return (
    <section className="py-12 bg-gray-100">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category, index) => (
            <div key={index} className="bg-white p-6 rounded-lg shadow-sm text-center flex flex-col items-center">
              <div className="mb-4 relative w-12 h-12">
                <svg className="w-12 h-12 text-amber-500" viewBox="0 0 48 48" fill="currentColor">
                  {/* Fallback icon */}
                  <path d="M24 4C12.96 4 4 12.96 4 24C4 35.04 12.96 44 24 44C35.04 44 44 35.04 44 24C44 12.96 35.04 4 24 4ZM24 8C26.08 8 27.84 8.8 29.12 10.08C30.4 11.36 31.2 13.12 31.2 15.2C31.2 17.28 30.4 19.04 29.12 20.32C27.84 21.6 26.08 22.4 24 22.4C21.92 22.4 20.16 21.6 18.88 20.32C17.6 19.04 16.8 17.28 16.8 15.2C16.8 13.12 17.6 11.36 18.88 10.08C20.16 8.8 21.92 8 24 8ZM24 40C19.04 40 14.64 37.52 12 33.76C12.08 28.88 21.92 26.24 24 26.24C26.08 26.24 35.92 28.88 36 33.76C33.36 37.52 28.96 40 24 40Z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold mb-2">{category.title}</h3>
              <p className="text-sm text-gray-600">{category.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CauseCategories; 