import React, { useState, useEffect } from 'react';
import './CharityDistributionInput.css';

interface CharityDistributionInputProps {
  name: string;
  maxAmount: number;
  receiver_id: string;
  onChange?: (name: string, receiver_id: string, amount: number, percentage: number) => void;
}

const CharityDistributionInput: React.FC<CharityDistributionInputProps> = ({ 
  name, 
  maxAmount, 
  receiver_id,
  onChange 
}) => {
  const [amount, setAmount] = useState<string>('');
  const [percentage, setPercentage] = useState<string>('');
  const [activeField, setActiveField] = useState<'amount' | 'percentage' | null>(null);

  // Handle amount change
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    // Only allow numbers and a decimal point
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setAmount(value);
      setActiveField('amount');
      
      // Clear percentage when amount is being entered
      setPercentage('');
      
      // Calculate and notify parent
      const amountValue = value === '' ? 0 : parseFloat(value);
      const percentValue = maxAmount > 0 ? (amountValue / maxAmount) * 100 : 0;
      
      if (onChange) {
        onChange(name, receiver_id, amountValue, percentValue);
      }
    }
  };

  // Handle percentage change
  const handlePercentageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    // Only allow numbers and a decimal point up to 100
    if (value === '' || (/^\d*\.?\d*$/.test(value) && parseFloat(value) <= 100)) {
      setPercentage(value);
      setActiveField('percentage');
      
      // Clear amount when percentage is being entered
      setAmount('');
      
      // Calculate equivalent amount and notify parent
      const percentValue = value === '' ? 0 : parseFloat(value);
      const amountValue = (percentValue / 100) * maxAmount;
      
      if (onChange) {
        onChange(name, receiver_id, amountValue, percentValue);
      }
    }
  };

  // Focus handling
  const handleFocus = (field: 'amount' | 'percentage') => {
    setActiveField(field);
  };

  return (
    <div className="charity-distribution-input">
      <h3 className="charity-name">{name}</h3>
      <div className="input-fields">
        <div className="amount-field">
          <label className="input-label">Amount</label>
          <div className="input-wrapper">
            <span className="currency-symbol">$</span>
            <input
              type="text"
              value={amount}
              onChange={handleAmountChange}
              onFocus={() => handleFocus('amount')}
              className={`amount-input ${activeField === 'amount' ? 'active' : ''}`}
              placeholder="0.00"
            />
          </div>
        </div>
        
        <div className="percentage-field">
          <label className="input-label">%</label>
          <div className="input-wrapper">
            <input
              type="text"
              value={percentage}
              onChange={handlePercentageChange}
              onFocus={() => handleFocus('percentage')}
              className={`percentage-input ${activeField === 'percentage' ? 'active' : ''}`}
              placeholder="0"
            />
            <span className="percentage-symbol">%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CharityDistributionInput; 