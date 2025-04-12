"use client";

import { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  
  const [formStatus, setFormStatus] = useState<null | 'success' | 'error'>(null);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, you would send the form data to your backend
    console.log('Form submitted:', formData);
    
    // Simulate form submission
    setTimeout(() => {
      setFormStatus('success');
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: ''
      });
    }, 1000);
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <div className="bg-slate-800 text-white py-20">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Contact Us</h1>
            <p className="text-xl max-w-3xl mx-auto">
              Have questions about GiveFi? We're here to help you make a difference.
            </p>
          </div>
        </div>
        
        {/* Contact Form & Info */}
        <div className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              {/* Contact Info */}
              <div className="lg:col-span-1">
                <h2 className="text-2xl font-bold mb-6">Get In Touch</h2>
                <p className="mb-8 text-gray-600">
                  We'd love to hear from you. Please reach out with any questions about our platform, partnerships, or how you can get involved.
                </p>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="font-bold mb-1">Email</h3>
                    <p className="text-gray-600">info@givefi.org</p>
                  </div>
                  
                  <div>
                    <h3 className="font-bold mb-1">Phone</h3>
                    <p className="text-gray-600">+1 (555) 123-4567</p>
                  </div>
                  
                  <div>
                    <h3 className="font-bold mb-1">Address</h3>
                    <p className="text-gray-600">
                      123 Blockchain Way<br />
                      Suite 456<br />
                      San Francisco, CA 94105
                    </p>
                  </div>
                  
                  <div className="pt-4">
                    <h3 className="font-bold mb-3">Follow Us</h3>
                    <div className="flex space-x-4">
                      <a href="#" className="text-slate-700 hover:text-green-500">
                        <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
                        </svg>
                      </a>
                      <a href="#" className="text-slate-700 hover:text-green-500">
                        <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                        </svg>
                      </a>
                      <a href="#" className="text-slate-700 hover:text-green-500">
                        <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                        </svg>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Contact Form */}
              <div className="lg:col-span-2">
                <h2 className="text-2xl font-bold mb-6">Send Us a Message</h2>
                
                {formStatus === 'success' && (
                  <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
                    <p>Your message has been sent successfully. We'll be in touch soon!</p>
                  </div>
                )}
                
                {formStatus === 'error' && (
                  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                    <p>There was an error sending your message. Please try again.</p>
                  </div>
                )}
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Your Name</label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        required
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                    <select
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      required
                    >
                      <option value="">Please select a subject</option>
                      <option value="General Question">General Question</option>
                      <option value="Donation Inquiry">Donation Inquiry</option>
                      <option value="Partnership Opportunity">Partnership Opportunity</option>
                      <option value="Technical Support">Technical Support</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">Your Message</label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      rows={6}
                      className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      required
                    ></textarea>
                  </div>
                  
                  <div>
                    <button type="submit" className="bg-green-500 hover:bg-green-600 text-white py-3 px-6 rounded-md font-semibold">
                      Send Message
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
        
        {/* Map or Image */}
        <div className="h-80 bg-gray-200 w-full">
          {/* In a real app, you would embed a map here */}
          <div className="h-full w-full flex items-center justify-center">
            <p className="text-gray-500 text-lg">Map Placeholder</p>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
} 