import { useState, useContext } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import Swal from 'sweetalert2';
import axios from 'axios';
import { AuthContext } from '../../backend/AuthContext';
import config from '../../backend/config';

import SPAY5 from '../assets/SPAY5.png';
import SPAY10 from '../assets/SPAY10.png';
import SPAY20 from '../assets/SPAY20.png';
import SPAY30 from '../assets/SPAY30.png';
import SPAY50 from '../assets/SPAY50.png';
import SPAY100 from '../assets/SPAY100.png';
import SPAYCustom from '../assets/SPAY-Custom.png';
import DuitNow from '../assets/DuitNow.jpg';

const qrImages = [
  { method: 'SPAY GLOBAL', amount: 5, src: SPAY5 },
  { method: 'SPAY GLOBAL', amount: 10, src: SPAY10 },
  { method: 'SPAY GLOBAL', amount: 20, src: SPAY20 },
  { method: 'SPAY GLOBAL', amount: 30, src: SPAY30 },
  { method: 'SPAY GLOBAL', amount: 50, src: SPAY50 },
  { method: 'SPAY GLOBAL', amount: 100, src: SPAY100 },
  { method: 'SPAY GLOBAL', amount: 'custom', src: SPAYCustom },
  { method: 'DuitNow', amount: 5, src: DuitNow },
  { method: 'DuitNow', amount: 10, src: DuitNow },
  { method: 'DuitNow', amount: 20, src: DuitNow },
  { method: 'DuitNow', amount: 30, src: DuitNow },
  { method: 'DuitNow', amount: 50, src: DuitNow },
  { method: 'DuitNow', amount: 100, src: DuitNow },
  { method: 'DuitNow', amount: 'custom', src: DuitNow },
];

const DonationPage = () => {
  const { userId } = useContext(AuthContext);
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [selectedAmount, setSelectedAmount] = useState(null);
  const [customAmount, setCustomAmount] = useState('');
  const [showQrModal, setShowQrModal] = useState(false);
  const [showCustomInput, setShowCustomInput] = useState(false);

  const handleAmountClick = (amount) => {
    if (amount === 'custom') {
      setShowCustomInput(true);
      setSelectedAmount(null);
    } else {
      setShowCustomInput(false);
      setSelectedAmount(amount);
      setShowQrModal(true);
    }
  };

  const handleCustomAmountSubmit = () => {
    const amount = parseFloat(customAmount);
    if (isNaN(amount) || amount <= 0) {
      Swal.fire({
        title: 'Invalid Amount',
        text: 'Please enter a valid custom amount.',
        icon: 'warning',
        confirmButtonText: 'OK',
      });
    } else {
      setSelectedAmount('custom');
      setShowQrModal(true);
    }
  };

  const getQrImage = () => {
    return qrImages.find((img) => img.method === selectedMethod && img.amount === selectedAmount)?.src;
  };

  const handleDonationSuccess = async () => {
    const donationAmount = selectedAmount === 'custom' ? customAmount : selectedAmount;
    if (!userId) {
      Swal.fire({
        title: 'User not logged in',
        text: 'Please log in to donate.',
        icon: 'error',
      });
      return;
    }
    try {
      await axios.post(`${config.API_BASE_URL}/user/${userId}/donate`, { donationAmount });
      Swal.fire({
        title: 'Donation Successful!',
        text: `You have donated RM ${donationAmount}.`,
        icon: 'success',
        confirmButtonText: 'OK',
      }).then(() => {
        window.location.href = `/?donatedAmount=${donationAmount}`;
      });
    } catch (error) {
      console.error('Error submitting donation:', error);
      Swal.fire({
        title: 'Donation Failed',
        text: 'An error occurred while processing your donation.',
        icon: 'error',
        confirmButtonText: 'OK',
      });
    }
    setShowQrModal(false);
    setCustomAmount('');
  };

  return (
    <div className="donation-container">
      <div className="header-container">
        <h2>Donation</h2>
        <hr />
      </div>

      <h4 className="payment-align">Payment Method</h4>
      <div className="text-center button-payment">
        <Button
          className={`method-button ${selectedMethod === 'SPAY GLOBAL' ? 'btn-active' : ''}`}
          onClick={() => setSelectedMethod('SPAY GLOBAL')}
        >
          SPAY GLOBAL
        </Button>
        <Button
          className={`method-button ${selectedMethod === 'DuitNow' ? 'btn-active' : ''}`}
          onClick={() => setSelectedMethod('DuitNow')}
        >
          DuitNow
        </Button>
      </div>

      <h4 className="payment-align">Amount</h4>
      <div className="d-flex flex-wrap justify-content-center mb-4">
        <div className="amount-button-row">
          {[5, 10, 20].map((amount) => (
            <Button
              key={amount}
              className={`amount-button m-2 ${selectedAmount === amount ? 'btn-active' : ''}`}
              onClick={() => handleAmountClick(amount)}
            >
              RM {amount}.00
            </Button>
          ))}
        </div>

        <div className="amount-button-row">
          {[30, 50, 100].map((amount) => (
            <Button
              key={amount}
              className={`amount-button m-2 ${selectedAmount === amount ? 'btn-active' : ''}`}
              onClick={() => handleAmountClick(amount)}
            >
              RM {amount}.00
            </Button>
          ))}
        </div>

        <div className="w-100 text-center">
          <Button
            className={`amount-button m-2 ${selectedAmount === 'custom' ? 'btn-active' : ''}`}
            onClick={() => handleAmountClick('custom')}
          >
            Custom Amount
          </Button>
        </div>
      </div>

      {showCustomInput && (
        <div className="text-center mb-4">
          <Form.Control
            type="number"
            placeholder="Enter custom amount"
            value={customAmount}
            onChange={(e) => setCustomAmount(e.target.value)}
            style={{ width: '200px', margin: '0 auto' }}
          />
          <Button
            className="mt-2"
            onClick={handleCustomAmountSubmit}
            style={{ margin: '10px auto', borderRadius: '30px', fontSize: '18px', width: '200px', height: '65px' }}
          >
            Confirm
          </Button>
        </div>
      )}

      <Modal
        show={showQrModal}
        onHide={() => setShowQrModal(false)}
        backdrop="static"
        keyboard={false}
      >
        <Modal.Header closeButton>
          <Modal.Title>Scan QR Code to Donate</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center">
          <p>Please scan the QR code below using your {selectedMethod} app to complete the payment.</p>
          {getQrImage() && (
            <img
              src={getQrImage()}
              alt="QR Code"
              style={{ width: '100%', maxWidth: '300px', height: 'auto' }}
              className="img-fluid mb-3"
            />
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="danger" onClick={() => setShowQrModal(false)}>
            Cancel
          </Button>
          <Button
            variant="success"
            onClick={handleDonationSuccess}
          >
            Done
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default DonationPage;
