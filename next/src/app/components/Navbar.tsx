import Link from 'next/link';

const Navbar = () => {
  return (
    <nav className="bg-slate-800 text-white py-4">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <Link href="/" className="flex items-center">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-2">
            <circle cx="16" cy="16" r="14" fill="#4CAF50" />
            <path d="M16 8C12.13 8 9 11.13 9 15C9 20.25 16 26 16 26C16 26 23 20.25 23 15C23 11.13 19.87 8 16 8ZM16 17.5C14.62 17.5 13.5 16.38 13.5 15C13.5 13.62 14.62 12.5 16 12.5C17.38 12.5 18.5 13.62 18.5 15C18.5 16.38 17.38 17.5 16 17.5Z" fill="white" />
          </svg>
          <span className="ml-2 text-xl font-bold">GiveFi</span>
        </Link>
        
        <div className="hidden md:flex space-x-6">
          <Link href="/" className="hover:text-green-300">Home</Link>
          <Link href="/causes" className="hover:text-green-300">Causes</Link>
          <Link href="/about" className="hover:text-green-300">About Us</Link>
          <Link href="/contact" className="hover:text-green-300">Contact Us</Link>
        </div>
        
        <button className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded">
          LOG IN
        </button>
      </div>
    </nav>
  );
};

export default Navbar; 