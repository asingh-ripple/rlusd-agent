import React, { useState } from 'react';
import { formatCurrency } from '../utils/helpers';
import './DonationForm.css';

interface DonationFormProps {
  causeTitle: string;
  onSubmit?: (amount: number, paymentMethod: string, formData: any) => void;
}

const DonationForm: React.FC<DonationFormProps> = ({ causeTitle, onSubmit }) => {
  const [donationAmount, setDonationAmount] = useState<string>('25');
  const [paymentMethod, setPaymentMethod] = useState<string>('creditCard');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    displayName: true,
    creditCardNumber: '',
  });

  const predefinedAmounts = [10, 25, 50];

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
      onSubmit(parseFloat(donationAmount), paymentMethod, formData);
    } else {
      alert(`Thank you for your donation of ${formatCurrency(parseFloat(donationAmount))}!`);
    }
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
          <h3>Payment Method</h3>
          <div className="payment-methods">
            <label className="payment-method">
              <input
                type="radio"
                name="paymentMethod"
                value="creditCard"
                checked={paymentMethod === 'creditCard'}
                onChange={() => setPaymentMethod('creditCard')}
              />
              <span className="payment-label">Credit Card</span>
            </label>
            <label className="payment-method">
              <input
                type="radio"
                name="paymentMethod"
                value="paypal"
                checked={paymentMethod === 'paypal'}
                onChange={() => setPaymentMethod('paypal')}
              />
              <span className="payment-label">PayPal</span>
            </label>
          </div>

          {paymentMethod === 'creditCard' && (
            <div className="credit-card-input">
              <label>
                Credit Card Number
                <input
                  type="text"
                  name="creditCardNumber"
                  value={formData.creditCardNumber}
                  onChange={handleInputChange}
                  placeholder="**** **** **** ****"
                  className="form-input"
                />
              </label>
            </div>
          )}
        </div>

        <div className="form-section">
          <h3>Personal Information</h3>
          <div className="form-fields">
            <div className="form-row">
              <label>
                First Name
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                />
              </label>
            </div>
            <div className="form-row">
              <label>
                Last Name
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                />
              </label>
            </div>
            <div className="form-row">
              <label>
                Email Address
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                />
              </label>
            </div>
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
        </div>

        <div className="donation-summary">
          <div className="donation-total">
            <span>Donation Total:</span>
            <span className="donation-amount">
              {formatCurrency(parseFloat(donationAmount) || 0)}
            </span>
          </div>
        </div>

        <button type="submit" className="donate-button">
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