import React from 'react';
import './DonationConfirmationModal.css';

interface DonationConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DonationConfirmationModal: React.FC<DonationConfirmationModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="donation-confirmation-modal">
          <h1 className="confirmation-title">Thank you!!</h1>
          
          <p className="confirmation-message">
            <span className="confirmation-heading">Donation Confirmed</span>
            — your donation has been received and recorded on the blockchain. We'll email you when your contribution is distributed or when there are important updates on the cause.
          </p>
          
          <button 
            className="feel-good-button"
            onClick={onClose}
          >
            I FEEL GOOD
          </button>
        </div>
      </div>
    </div>
  );
};

export default DonationConfirmationModal; 