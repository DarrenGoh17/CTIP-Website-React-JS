import React, { useState, useEffect } from 'react';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { useNavigate, useLocation } from 'react-router-dom';
import Swal from 'sweetalert2';
import axios from 'axios';
import config from '../../backend/config';

const OTPVerification = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { email } = location.state || {};  // Retrieve the user's email

    const [otp, setOtp] = useState(''); // OTP entered by the user
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [timer, setTimer] = useState(300); // 5 minutes in seconds

    // Send OTP when the component mounts
    useEffect(() => {
        const sendOtp = async () => {
            try {
                await axios.post(`${config.API_BASE_URL}/send-otp`, { email });
                Swal.fire({
                    title: 'OTP Sent',
                    text: 'An OTP has been sent to your email. Please verify to continue.',
                    icon: 'info',
                    confirmButtonText: 'OK',
                });
            } catch (error) {
                console.error("Error sending OTP:", error);
                setError('Failed to send OTP. Please try again.');
            }
        };
        sendOtp();
    }, [email]);

    // Handle OTP input change
    const handleOtpChange = (e) => {
        setOtp(e.target.value);
        if (error) setError('');
    };

    // Handle OTP submission and compare with server-stored OTP
    const handleOtpSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const response = await axios.post(`${config.API_BASE_URL}/verify-otp`, {
                email,
                otp,
            });

            if (response.data.success) {
                Swal.fire({
                    title: 'Login Successful!',
                    text: 'OTP verified successfully.',
                    icon: 'success',
                    confirmButtonText: 'OK',
                }).then(() => navigate('/')); // Redirect to home on successful verification
            } else {
                setError('Invalid OTP. Please try again.');
            }
        } catch (error) {
            console.error("Error in OTP verification:", error);
            setError('Invalid or expired OTP.');
            Swal.fire({
                title: 'OTP Verification Failed',
                text: 'Invalid OTP entered. Please check and try again.',
                icon: 'error',
                confirmButtonText: 'OK',
            });
        } finally {
            setIsLoading(false);
        }
    };

    // Countdown Timer Effect
    useEffect(() => {
        if (timer > 0) {
            const interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
            return () => clearInterval(interval);
        } else {
            Swal.fire({
                title: 'OTP Expired',
                text: 'Your OTP has expired. Please request a new one.',
                icon: 'warning',
                confirmButtonText: 'OK',
            }).then(() => navigate('/entry')); // Redirect to login page
        }
    }, [timer, navigate]);

    return (
        <div style={styles.otpContainer}>
            <div style={styles.otpFormCard}>
                <h2 style={styles.heading}>OTP Verification</h2>
                <form onSubmit={handleOtpSubmit}>
                    <div style={{ ...styles.inputField, ...(error ? styles.hasError : {}) }}>
                        <label htmlFor="otp" style={styles.label}>Enter OTP</label>
                        <InputText
                            id="otp"
                            name="otp"
                            value={otp}
                            onChange={handleOtpChange}
                            placeholder="6-digit OTP"
                            maxLength="6"
                            required
                            style={styles.input}
                        />
                        {error && <small style={styles.errorText}>{error}</small>}
                    </div>
                    <div style={styles.otpTimer}>
                        Time remaining: {Math.floor(timer / 60)}:{('0' + (timer % 60)).slice(-2)}
                    </div>
                    <Button
                        label={isLoading ? 'Verifying...' : 'Verify OTP'}
                        className="p-button-primary"
                        type="submit"
                        disabled={isLoading}
                        style={{ marginTop: '1em' }}
                    />
                    <Button
                        label="Cancel"
                        className="p-button-secondary"
                        onClick={() => navigate('/entry')}
                        type="button"
                        style={{ marginTop: '1em', marginLeft: '0.5em' }}
                    />
                </form>
            </div>
        </div>
    );
};

export default OTPVerification;

// Inline styles (same as previous example)
const styles = {
    otpContainer: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#f5f5f5',
    },
    otpFormCard: {
        backgroundColor: '#fff',
        padding: '2em',
        borderRadius: '8px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        width: '350px',
        textAlign: 'center',
    },
    heading: {
        marginBottom: '1.5em',
        color: '#333',
    },
    inputField: {
        marginBottom: '1em',
    },
    label: {
        display: 'block',
        marginBottom: '0.5em',
        color: '#555',
    },
    input: {
        width: '100%',
        padding: '0.5em',
        borderRadius: '4px',
        borderColor: '#ccc',
    },
    hasError: {
        borderColor: 'red',
    },
    errorText: {
        color: 'red',
        fontSize: '0.8em',
        marginTop: '0.3em',
    },
    otpTimer: {
        textAlign: 'center',
        marginBottom: '1em',
        color: '#555',
    },
};
