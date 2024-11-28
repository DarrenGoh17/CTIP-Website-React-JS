import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import config from '../../backend/config';
import backgroundImage from '../assets/donation bg.png';

const Donation = () => {
    const [totalDonation, setTotalDonation] = useState(0);
    const donationGoal = 5000; // Set the donation goal

    // Fetch total donations when the component mounts
    useEffect(() => {
        const fetchTotalDonation = async () => {
            try {
                const response = await axios.get(`${config.API_BASE_URL}/donations/total`);
                setTotalDonation(response.data.totalDonation);
            } catch (error) {
                console.error('Error fetching donation total:', error);
            }
        };
        fetchTotalDonation();
    }, []);

    // Calculate the progress percentage
    const progressPercentage = Math.min((totalDonation / donationGoal) * 100, 100); // Cap at 100%

    return (
        <div 
            style={{ 
                backgroundImage: `url(${backgroundImage})`, 
                padding: '50px', 
                color: '#000', 
                backgroundSize: 'cover',
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                justifyContent: 'center', 
                minHeight: '80vh' 
            }}
        >
            <h1 className='h1-header'>We Need You!</h1>
            <p>Help us reach <strong>RM 5,000</strong> for Orangutan rescue efforts</p>
            
            {/* Progress Bar */}
            <div className="progress-bar-container" style={{ width: '60%', height: '50px', position: 'relative', marginTop: '20px' }}>
                <div className="total-goal-bar" style={{ backgroundColor: '#e0e0e0', height: '100%', borderRadius: '10px' }}></div>
                <div className="progress-bar" style={{ 
                    backgroundColor: '#FFD700', 
                    height: '100%', 
                    width: `${progressPercentage}%`, 
                    borderRadius: '10px', 
                    transition: 'width 0.5s ease',
                    position: 'absolute', 
                    top: '0', 
                    left: '0' 
                }}></div>
                
                {/* Donation Amount Indicator */}
                <div style={{
                    position: 'absolute',
                    top: '0',
                    left: `${progressPercentage}%`,
                    transform: 'translateX(-50%)',
                    padding: '5px',
                    backgroundColor: '#FFF',
                    border: '1px solid #FFD700',
                    borderRadius: '5px',
                    whiteSpace: 'nowrap',
                    fontWeight: 'bold',
                    color: '#000',
                    marginTop: '-30px'
                }}>
                    RM {totalDonation}
                </div>
            </div>

            <Link to="/donationPage">
                <button 
                    className="donate-button"
                    style={{ 
                        fontWeight: 'bold',
                        marginTop: '20px', 
                        padding: '20px 30px', 
                        borderRadius: '50px', 
                        backgroundColor: '#7B9645', 
                        color: 'white', 
                        border: 'none', 
                        cursor: 'pointer',
                        fontSize: '1rem',
                        transition: 'background-color 0.3s'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#45a049'} // Change color on hover
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#7B9645'} // Revert color
                >
                    Donate Now
                </button>
            </Link>
        </div>
    );
};

export default Donation;
