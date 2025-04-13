import React, { useState, useRef, useEffect } from 'react';
import { formatCurrency } from '../utils/helpers';
import './DonationForm.css';

interface DonationFormProps {
  causeTitle: string;
  cause_id: string;
  customer_id: string;
  onSubmit?: (amount: number, cause_id: string, customer_id: string) => void; 
}

const DonationForm: React.FC<DonationFormProps> = ({ causeTitle, cause_id, customer_id, onSubmit }) => {
  const [donationAmount, setDonationAmount] = useState<string>('25');
  const [paymentMethod, setPaymentMethod] = useState<string>('creditCard');
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    displayName: true,
    creditCardNumber: '',
  });

  const predefinedAmounts = [10, 25, 50];

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  const handleDonationInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow numbers and a single decimal point
    const value = e.target.value;
    if (/^\d*\.?\d*$/.test(value)) {
      setDonationAmount(value);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!donationAmount || parseFloat(donationAmount) <= 0) {
      alert('Please enter a valid donation amount');
      return;
    }

    if (onSubmit) {
      onSubmit(parseFloat(donationAmount), cause_id, customer_id);
    } else {
      alert(`Thank you for your donation of ${formatCurrency(parseFloat(donationAmount))}!`);
    }
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  return (
    <div className="donation-form-container">
      <h2>Donate to {causeTitle}</h2>
      <form className="donation-form" onSubmit={handleSubmit}>
        <div className="form-section">
          <h3>Donation Amount</h3>
          <div className="amount-buttons">
            {predefinedAmounts.map((amount) => (
              <button
                key={amount}
                type="button"
                className={`amount-button ${parseInt(donationAmount) === amount ? 'active' : ''}`}
                onClick={() => setDonationAmount(amount.toString())}
              >
                ${amount}
              </button>
            ))}
          </div>

          <div className="custom-amount">
            <div className="input-group">
              <span className="currency-symbol">$</span>
              <input
                type="text"
                value={donationAmount}
                onChange={handleDonationInput}
                placeholder="Enter amount"
                className="donation-input"
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>Select Payment Method</h3>
          <div className="payment-dropdown" ref={dropdownRef}>
            <div 
              className="payment-dropdown-header" 
              onClick={toggleDropdown}
            >
              <div className="payment-dropdown-selected">
                <img src="/images/icons/visa.png" alt="Visa" className="payment-card-icon" />
                <span>•••• •••• •••• 4272</span>
              </div>
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="24" 
                height="24" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
                className={`dropdown-arrow ${isDropdownOpen ? 'open' : ''}`}
              >
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </div>
            
            {isDropdownOpen && (
              <div className="payment-dropdown-menu">
                <div 
                  className="payment-dropdown-item active"
                  onClick={() => {
                    setPaymentMethod('creditCard');
                    setIsDropdownOpen(false);
                  }}
                >
                  <img src="/images/icons/visa.png" alt="Visa" className="payment-card-icon" />
                  <span>•••• •••• •••• 4272</span>
                </div>
                {/* Additional cards could be added here */}
              </div>
            )}
          </div>
        </div>

        <div className="form-section">
            <div className="form-row checkbox-row">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="displayName"
                  checked={formData.displayName}
                  onChange={handleInputChange}
                />
                <span>Display my name with this donation</span>
              </label>
            </div>
          </div>

        <div className="donation-summary">
          <div className="donation-total">
            <span>Donation Total:</span>
            <span className="donation-amount">
              ${donationAmount}
            </span>
          </div>
        </div>

        <button type="submit" className="donate-button" onClick={handleSubmit}>
          Donate Now
        </button>
      </form>
      
      <div className="donation-secure-note">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
        </svg>
        <span>Secure donation</span>
      </div>
    </div>
  );
};

export default DonationForm; 