// components/Header.tsx
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

const Header: React.FC = () => {
  return (
    <header className="bg-slate-800 text-white py-4">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <div className="flex items-center">
          <Link href="/" className="flex items-center">
            <div className="mr-2">
              <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
              </svg>
            </div>
            <span className="text-xl font-bold">GiveFi</span>
          </Link>
        </div>
        
        <nav className="hidden md:flex items-center space-x-6">
          <Link href="/" className="hover:text-green-400 transition">Home</Link>
          <Link href="/about" className="hover:text-green-400 transition">About Us</Link>
          <Link href="/contact" className="hover:text-green-400 transition">Contact Us</Link>
        </nav>
        
        <div>
          <button className="bg-green-500 hover:bg-green-600 text-white py-2 px-6 rounded transition">
            LOG IN
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;