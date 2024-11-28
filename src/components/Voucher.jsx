import { useState, useEffect, useContext } from 'react';
import Swal from 'sweetalert2';
import axios from 'axios';
import { AuthContext } from '../../backend/AuthContext';
import config from '../../backend/config';
import image20 from '../assets/20 percent.png';
import image10 from '../assets/10 percent.png';

const Voucher = () => {
  const [voucher10Available, setVoucher10Available] = useState(false); // Tracks if the 10% voucher is available to redeem
  const [voucher20Available, setVoucher20Available] = useState(false); // Tracks if the 20% voucher is available to redeem
  const [loading, setLoading] = useState(true); // Loading indicator for voucher status
  const { userId } = useContext(AuthContext); 

  useEffect(() => {
    if (userId) {
      fetchVoucherStatus();
    } else {
      console.warn("User ID is not available in AuthContext.");
    }
  }, [userId]);

  // Log changes to voucher10Available
  useEffect(() => {
    console.log("Updated voucher10Available:", voucher10Available);
  }, [voucher10Available]);

  // Log changes to voucher20Available
  useEffect(() => {
    console.log("Updated voucher20Available:", voucher20Available);
  }, [voucher20Available]);

  // Function to check voucher status from the backend
  const fetchVoucherStatus = async () => {
    try {
      setLoading(true); // Start loading state
      const response = await axios.get(`${config.API_BASE_URL}/user/${userId}/voucher-status`);
      console.log("Response data:", response.data);
      const { voucher_10, voucher_10_redeem, voucher_20, voucher_20_redeem } = response.data;
      
      // Set availability of each voucher based on separate conditions
      setVoucher10Available(voucher_10 === 1 && voucher_10_redeem === 0); // Show only if voucher_10 = 1 and not redeemed
      setVoucher20Available(voucher_20 === 1 && voucher_20_redeem === 0); // Show only if voucher_20 = 1 and not redeemed
    } catch (error) {
      console.error('Error fetching voucher status:', error);
      Swal.fire({
        title: 'Error',
        text: 'Failed to fetch voucher status. Please try again later.',
        icon: 'error',
        confirmButtonColor: '#d33'
      });
    } finally {
      setLoading(false); // End loading state
    }
  };

  // Function to handle voucher redemption
  const handleUseVoucher = (voucherType) => {
    const isVoucherAvailable = voucherType === '20' ? voucher20Available : voucher10Available;
    const setVoucherAvailable = voucherType === '20' ? setVoucher20Available : setVoucher10Available;
    const image = voucherType === '20' ? image20 : image10;

    if (isVoucherAvailable) {
      Swal.fire({
        title: `Redeem ${voucherType}% Voucher`,
        text: `Would you like to redeem the ${voucherType}% voucher?`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#7B9645',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes',
        cancelButtonText: 'No'
      }).then(async (result) => {
        if (result.isConfirmed) {
          try {
            const response = await axios.post(`${config.API_BASE_URL}/user/${userId}/redeem-voucher`, { voucherType });
            if (response.status === 200) {
              setVoucherAvailable(false); // Mark the voucher as redeemed in the state
              Swal.fire({
                title: `${voucherType}% Voucher Redeemed!`,
                text: 'You have successfully redeemed the voucher.',
                icon: 'success',
                confirmButtonColor: '#7B9645'
              });
            } else {
              throw new Error("Unexpected response status");
            }
          } catch (error) {
            console.error(`Error redeeming ${voucherType}% voucher:`, error);
            Swal.fire({
              title: 'Error',
              text: 'Failed to redeem voucher. Please try again later.',
              icon: 'error',
              confirmButtonColor: '#d33'
            });
          }
        }
      });
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <p>Loading voucher status...Please refresh</p>
      </div>
    );
  }

  // Check if all vouchers are redeemed
  const allVouchersRedeemed = !voucher10Available && !voucher20Available;

  return (
    <section className="discover-section">
      <div className="things-to-do">
        <div className="header-container">
          <h2>Vouchers</h2>
          <hr />
        </div>
        <div className="voucher-container">
          
          {/* Display individual vouchers if any are available */}
          {!allVouchersRedeemed ? (
            <>
              {/* Voucher 10% */}
              {voucher10Available && (
                <div className="image-container" onClick={() => handleUseVoucher('10')}>
                  <img src={image10} alt="10% Voucher" className="voucher-image" />
                  <button className="hover-button">Redeem 10% Voucher</button>
                </div>
              )}

              {/* Voucher 20% */}
              {voucher20Available && (
                <div className="image-container" onClick={() => handleUseVoucher('20')}>
                  <img src={image20} alt="20% Voucher" className="voucher-image" />
                  <button className="hover-button">Redeem 20% Voucher</button>
                </div>
              )}
            </>
          ) : (
            // Show this message only if all vouchers are redeemed
            <div className="no-voucher-left">
              <p>No voucher to redeem left.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Voucher;
