import Link from 'next/link';

const Footer = () => {
  return (
    <footer className="bg-slate-800 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center mb-4">
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="16" cy="16" r="14" fill="#4CAF50" />
                <path d="M16 8C12.13 8 9 11.13 9 15C9 20.25 16 26 16 26C16 26 23 20.25 23 15C23 11.13 19.87 8 16 8ZM16 17.5C14.62 17.5 13.5 16.38 13.5 15C13.5 13.62 14.62 12.5 16 12.5C17.38 12.5 18.5 13.62 18.5 15C18.5 16.38 17.38 17.5 16 17.5Z" fill="white" />
              </svg>
              <span className="ml-2 text-xl font-bold">GiveFi</span>
            </div>
            <p className="text-sm text-gray-300 mb-4">
              Empowering global generosity through instant, trusted donations — no borders, no delays.
            </p>
            <div className="flex space-x-4">
              <Link href="#" className="text-white hover:text-green-300">
                <span className="sr-only">Facebook</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
                </svg>
              </Link>
              <Link href="#" className="text-white hover:text-green-300">
                <span className="sr-only">Twitter</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </Link>
              <Link href="#" className="text-white hover:text-green-300">
                <span className="sr-only">LinkedIn</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
              </Link>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-bold mb-4">About Us</h3>
            <ul className="space-y-2">
              <li><Link href="/about" className="text-gray-300 hover:text-green-300">About Us</Link></li>
              <li><Link href="/causes" className="text-gray-300 hover:text-green-300">Causes</Link></li>
              <li><Link href="/volunteers" className="text-gray-300 hover:text-green-300">Volunteers</Link></li>
              <li><Link href="/partners" className="text-gray-300 hover:text-green-300">Partners</Link></li>
              <li><Link href="/contact" className="text-gray-300 hover:text-green-300">Contact Us</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-bold mb-4">Useful Links</h3>
            <ul className="space-y-2">
              <li><Link href="/faq" className="text-gray-300 hover:text-green-300">F.A.Q</Link></li>
              <li><Link href="/news" className="text-gray-300 hover:text-green-300">News</Link></li>
              <li><Link href="/reports" className="text-gray-300 hover:text-green-300">Reports</Link></li>
              <li><Link href="/terms" className="text-gray-300 hover:text-green-300">Terms of Use</Link></li>
              <li><Link href="/privacy" className="text-gray-300 hover:text-green-300">Privacy Policy</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-bold mb-4">Subscribe</h3>
            <p className="text-sm text-gray-300 mb-4">Stay updated with our latest causes and impact stories.</p>
            <form className="flex flex-col space-y-2">
              <input
                type="email"
                placeholder="Your email"
                className="px-4 py-2 rounded bg-slate-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <button
                type="submit"
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-slate-700 text-center text-sm text-gray-400">
          <p>© Copyright Charity 2024. Design by Fightagni.com</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 