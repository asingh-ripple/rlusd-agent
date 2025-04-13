import React from 'react';
import './DonationConfirmationModal.css';

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  action: string;
  message: string;  
  buttonText: string;
  onClose: () => void;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ isOpen, onClose, title, action, message, buttonText }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="donation-confirmation-modal">
          <h1 className="confirmation-title">{title}</h1>
          
          <p className="confirmation-message">
            <span className="confirmation-heading">{action}</span>
            {message}
          </p>
          
          <button 
            className="confirmation-button"
            onClick={onClose}
          >
            {buttonText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal; 