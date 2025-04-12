import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import Footer from './components/Footer';
import './App.css';
import CausesPage from './pages/CausesPage';
import CauseDetailPage from './pages/CauseDetailPage';
import AdminPage from './pages/AdminPage';
const App: React.FC = () => {
  return (
    <Router>
      <div className="app">
        <Navbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/causes" element={<CausesPage />} />
          <Route path="/causes/:id" element={<CauseDetailPage />} />
          <Route path="/admin" element={<AdminPage />} />
          {/* Add other routes as needed */}
          {/* <Route path="*" element={<HomePage />} /> */}
        </Routes>
        <Footer />
      </div>
    </Router>
  );
};

export default App;
