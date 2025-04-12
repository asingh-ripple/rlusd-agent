import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Image from 'next/image';

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <div className="bg-slate-800 text-white py-20">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">About GiveFi</h1>
            <p className="text-xl max-w-3xl mx-auto">
              Empowering global generosity through blockchain technology for faster, more transparent donations
            </p>
          </div>
        </div>
        
        {/* Our Mission */}
        <div className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold mb-6 text-center">Our Mission</h2>
              <p className="text-lg mb-4">
                At GiveFi, we believe that when disaster strikes, every second counts. Our mission is to use the power of blockchain technology to get funds to the people who need them most—fast, transparently, and directly.
              </p>
              <p className="text-lg mb-4">
                Traditional donation systems can be slow, with funds taking days or even weeks to reach affected areas. Meanwhile, administrative costs can reduce the impact of each dollar given. We're changing that through our innovative platform that leverages Ripple and other blockchain technologies.
              </p>
              <p className="text-lg">
                By removing intermediaries and creating a transparent chain of custody for every donation, we ensure that your generosity has maximum impact in the shortest possible time.
              </p>
            </div>
          </div>
        </div>
        
        {/* Our Impact */}
        <div className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-12 text-center">Our Impact</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div className="bg-white p-8 rounded-lg shadow-sm">
                <div className="text-4xl font-bold text-green-500 mb-2">$2.4M+</div>
                <p className="text-xl">Donations Delivered</p>
              </div>
              
              <div className="bg-white p-8 rounded-lg shadow-sm">
                <div className="text-4xl font-bold text-green-500 mb-2">24 Hours</div>
                <p className="text-xl">Average Delivery Time</p>
              </div>
              
              <div className="bg-white p-8 rounded-lg shadow-sm">
                <div className="text-4xl font-bold text-green-500 mb-2">42</div>
                <p className="text-xl">Countries Reached</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* How It Works */}
        <div className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-12 text-center">How It Works</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="bg-gray-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                  <span className="text-2xl font-bold">1</span>
                </div>
                <h3 className="text-xl font-bold mb-4">Choose a Cause</h3>
                <p className="text-gray-600">
                  Browse our verified causes and select one that resonates with you, whether it's disaster relief, healthcare, or humanitarian aid.
                </p>
              </div>
              
              <div className="text-center">
                <div className="bg-gray-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                  <span className="text-2xl font-bold">2</span>
                </div>
                <h3 className="text-xl font-bold mb-4">Make a Donation</h3>
                <p className="text-gray-600">
                  Donate using your credit card or cryptocurrency. Every transaction is secure and verified on the blockchain.
                </p>
              </div>
              
              <div className="text-center">
                <div className="bg-gray-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                  <span className="text-2xl font-bold">3</span>
                </div>
                <h3 className="text-xl font-bold mb-4">Track Your Impact</h3>
                <p className="text-gray-600">
                  Follow your donation's journey in real-time, from the moment you give to its final destination in the hands of those who need it.
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Our Team */}
        <div className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-12 text-center">Our Team</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {/* Team member cards would go here */}
              {[
                { name: "Sarah Kim", title: "Founder & CEO", img: "/images/placeholder.svg" },
                { name: "David Mwangi", title: "Chief Technology Officer", img: "/images/placeholder.svg" },
                { name: "Aisha Patel", title: "Partnerships Director", img: "/images/placeholder.svg" },
                { name: "Miguel Fernandez", title: "Head of Operations", img: "/images/placeholder.svg" }
              ].map((member, index) => (
                <div key={index} className="bg-white p-6 rounded-lg shadow-sm text-center">
                  <div className="relative w-32 h-32 mx-auto mb-4 rounded-full overflow-hidden">
                    <div className="bg-gray-200 w-full h-full"></div>
                  </div>
                  <h3 className="text-xl font-bold">{member.name}</h3>
                  <p className="text-gray-600">{member.title}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Join Us CTA */}
        <div className="py-20 bg-slate-800 text-white text-center">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-6">Join Our Mission</h2>
            <p className="text-xl max-w-2xl mx-auto mb-8">
              Together, we can transform how the world responds to crises. Be part of the solution.
            </p>
            <button className="bg-green-500 hover:bg-green-600 text-white py-3 px-8 rounded-md text-lg font-semibold">
              Donate Now
            </button>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
} 