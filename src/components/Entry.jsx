import React, { useState, useContext } from 'react';
import { Button } from 'primereact/button';
import { Password } from 'primereact/password';
import { InputText } from 'primereact/inputtext';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { AuthContext } from '../../backend/AuthContext';
import axios from 'axios';
import config from '../../backend/config';

import orangutanbg1 from '../assets/orang utan bg 1.webp';

const Entry = () => {
    const { login } = useContext(AuthContext);
    const [isSignup, setIsSignup] = useState(false);
    const [formData, setFormData] = useState({
        signupUsername: '',
        signupEmail: '',
        signupPhoneNumber: '',
        signupPassword: '',
        confirmPassword: '',
        loginUsernameOrEmail: '',
        loginPassword: '',
        otp: '',
    });
    const [isOtpSent, setIsOtpSent] = useState(false); // Track OTP status
    const [errors, setErrors] = useState({});
    const navigate = useNavigate();

    // Toggle between Signup and Login forms
    const toggleForm = () => {
        setIsSignup(!isSignup);
        setFormData({
            signupUsername: '',
            signupEmail: '',
            signupPhoneNumber: '',
            signupPassword: '',
            confirmPassword: '',
            loginUsernameOrEmail: '',
            loginPassword: '',
            otp: '',
        });
        setErrors({});
    };

    // Validate Signup form data
    const validateSignup = () => {
        let errors = {};
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const phoneRegex = /^\d{10,15}$/;
        const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

        if (!formData.signupUsername) {
            errors.signupUsername = '*Required field';
        } else if (formData.signupUsername.length < 3) {
            errors.signupUsername = '*Username must be at least 3 characters long';
        }

        if (!formData.signupEmail) {
            errors.signupEmail = '*Required field';
        } else if (!emailRegex.test(formData.signupEmail)) {
            errors.signupEmail = '*Please enter a valid email';
        }

        if (!formData.signupPhoneNumber) {
            errors.signupPhoneNumber = '*Required field';
        } else if (!phoneRegex.test(formData.signupPhoneNumber)) {
            errors.signupPhoneNumber = '*Phone number must be 10-15 digits long';
        }

        if (!formData.signupPassword) {
            errors.signupPassword = '*Required field';
        } else if (!passwordRegex.test(formData.signupPassword)) {
            errors.signupPassword = '*Password must be at least 8 characters, contain letters, numbers, and special characters (@$!%*?&)';
        }

        if (!formData.confirmPassword) {
            errors.confirmPassword = '*Required field';
        } else if (formData.signupPassword !== formData.confirmPassword) {
            errors.confirmPassword = '*Passwords do not match';
        }

        return errors;
    };

    // Request OTP
    const handleRequestOtp = async () => {
        if (!formData.signupEmail) {
            return;
        }
        try {
            await axios.post(`${config.API_BASE_URL}/request-otp`, { email: formData.signupEmail });
            setIsOtpSent(true);
            Swal.fire('OTP Sent', 'Check your email for the OTP', 'success');
        } catch (error) {
            Swal.fire('Error', error.response?.data?.error || 'Failed to send OTP', 'error');
        }
    };

    //verify OTP
    const handleVerifyOtp = async (email, otpCode) => {
        try {
            const response = await axios.post(`${config.API_BASE_URL}/verify-otp`, { email, otpCode });
            Swal.fire({
                title: 'OTP Verified!',
                text: response.data.message,
                icon: 'success',
                confirmButtonText: 'OK',
            }).then(() => {
                // Set OTP as verified and proceed to submit user data
                submitUserData(); // Call a separate function to handle user data submission
            });
        } catch (error) {
            // If OTP is incorrect, resend a new OTP and ask the user to enter it again
            Swal.fire({
                title: 'Invalid OTP',
                text: 'The OTP you entered is incorrect. A new OTP has been sent to your email.',
                icon: 'error',
                confirmButtonText: 'Retry',
            });
    
            // Resend OTP
            try {
                await axios.post(`${config.API_BASE_URL}/request-otp`, { email });
                setIsOtpSent(true);
                Swal.fire('New OTP Sent', 'Check your email for the new OTP', 'info');
            } catch (error) {
                Swal.fire('Error', 'Failed to send new OTP. Please try again later.', 'error');
            }
        }
    };

    // Validate Login form data
    const validateLogin = () => {
        let errors = {};
        if (!formData.loginUsernameOrEmail) {
            errors.loginUsernameOrEmail = '*Required field';
        }
        if (!formData.loginPassword) {
            errors.loginPassword = '*Required field';
        }
        return errors;
    };

    // Handle input change for all form fields
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSignup = async (e) => {
        e.preventDefault();
        const validationErrors = validateSignup();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }
    
        try {
            // Request OTP after validation
            Swal.fire({
                title: 'Requesting OTP...',
                text: 'Please wait while we send you the OTP.',
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                },
            });

            // Request OTP after validation
            await axios.post(`${config.API_BASE_URL}/request-otp`, { email: formData.signupEmail });
            setIsOtpSent(true);
    
            // Prompt user to enter OTP
            let otpVerified = false;
    
            while (!otpVerified) {
                const { isConfirmed, value: otpCode } = await Swal.fire({
                    title: 'Enter OTP',
                    input: 'text',
                    inputLabel: 'Enter the OTP sent to your email',
                    inputPlaceholder: 'OTP',
                    showCancelButton: true,
                    confirmButtonText: 'Verify',
                    preConfirm: (otpCode) => {
                        if (!otpCode) {
                            Swal.showValidationMessage('Please enter the OTP');
                        }
                        return otpCode;
                    },
                });
    
                // If user confirmed with an OTP
                if (isConfirmed && otpCode) {
                    try {
                        // Verify OTP
                        await axios.post(`${config.API_BASE_URL}/verify-otp`, {
                            email: formData.signupEmail,
                            otpCode,
                        });
    
                        // OTP verified, proceed with registration
                        await axios.post(`${config.API_BASE_URL}/signup`, {
                            username: formData.signupUsername,
                            email: formData.signupEmail,
                            phoneNumber: formData.signupPhoneNumber,
                            password: formData.signupPassword,
                        });
    
                        Swal.fire({
                            title: 'Registration Successful',
                            text: 'Your account has been created.',
                            icon: 'success',
                            confirmButtonText: 'OK',
                        }).then(() => toggleForm()); // Switch to login form
    
                        otpVerified = true; // Mark OTP as verified to exit the loop
                    } catch (error) {
                        // If OTP verification fails, resend a new OTP and prompt for entry again
                        Swal.fire({
                            title: 'Invalid OTP',
                            text: 'The OTP you entered is incorrect. A new OTP has been sent to your email.',
                            icon: 'error',
                            confirmButtonText: 'Retry',
                        });
    
                        // Resend OTP
                        await axios.post(`${config.API_BASE_URL}/request-otp`, { email: formData.signupEmail });
                        Swal.fire('New OTP Sent', 'Check your email for the new OTP', 'info');
                    }
                } else {
                    // User canceled, exit loop without completing registration
                    break;
                }
            }
        } catch (error) {
            Swal.fire('Error', error.response?.data?.error || 'Failed to send OTP', 'error');
        }
    };
    
    // Handle login
    const handleLogin = async (e) => {
        e.preventDefault();
    
        const validationErrors = validateLogin();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }
    
        try {

            // Request OTP after validation
            Swal.fire({
                title: 'Requesting OTP...',
                text: 'Please wait while we send you the OTP.',
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                },
            });
            
            // Send login request directly with usernameOrEmail and password
            const loginResponse = await axios.post(`${config.API_BASE_URL}/login`, {
                usernameOrEmail: formData.loginUsernameOrEmail,
                password: formData.loginPassword,
            });
    
            // Extract the email from the response, regardless of username or email input
            const { email, username, role, id, token } = loginResponse.data;
            localStorage.setItem('token', token);
    
            // Request OTP with the email provided in the login response
            await axios.post(`${config.API_BASE_URL}/request-otp`, { email });
            setIsOtpSent(true);
    
            let otpVerified = false;
    
            while (!otpVerified) {
                const { isConfirmed, value: otpCode } = await Swal.fire({
                    title: 'Enter OTP',
                    input: 'text',
                    inputLabel: 'Enter the OTP sent to your email',
                    inputPlaceholder: 'OTP',
                    showCancelButton: true,
                    confirmButtonText: 'Verify',
                    preConfirm: (otpCode) => {
                        if (!otpCode) {
                            Swal.showValidationMessage('Please enter the OTP');
                        }
                        return otpCode;
                    },
                });
    
                if (isConfirmed && otpCode) {
                    try {
                        // Verify OTP
                        await axios.post(`${config.API_BASE_URL}/verify-otp`, {
                            email, // Use the email from the login response
                            otpCode,
                        });
    
                        // OTP verified, proceed with login
                        login(username, role, id);
    
                        Swal.fire({
                            title: 'Login Successful!',
                            text: `Welcome, ${username}`,
                            icon: 'success',
                            confirmButtonText: 'OK',
                        }).then(() => {
                            navigate('/');
                        });
    
                        otpVerified = true;
                    } catch (error) {
                        Swal.fire({
                            title: 'Invalid OTP',
                            text: 'The OTP you entered is incorrect. A new OTP has been sent to your email.',
                            icon: 'error',
                            confirmButtonText: 'Retry',
                        });
    
                        // Resend OTP
                        await axios.post(`${config.API_BASE_URL}/request-otp`, { email });
                        Swal.fire('New OTP Sent', 'Check your email for the new OTP', 'info');
                    }
                } else {
                    break;
                }
            }
        } catch (error) {
            Swal.fire({
                title: 'Login Failed',
                text: error.response?.data?.error || 'Invalid credentials or error occurred. Please try again.',
                icon: 'error',
                confirmButtonText: 'OK',
            });
        }
    };
              

    return (
        <div className="entry-container">
            <div className="entry d-flex">
                <div className="entry-form">
                    <h2>{isSignup ? 'Registration' : 'Login'}</h2>
                    <form onSubmit={isSignup ? handleSignup : handleLogin}>
                        {isSignup ? (
                            <>
                                {/* Signup Form Fields */}
                                <div className={`input-field ${errors.signupUsername ? 'has-error' : ''}`}>
                                    <InputText
                                        id="signupUsername"
                                        name="signupUsername"
                                        value={formData.signupUsername}
                                        onChange={handleInputChange}
                                        placeholder="Username"
                                    />
                                    {errors.signupUsername && (
                                        <small className="error-text">{errors.signupUsername}</small>
                                    )}
                                </div>

                                <div className={`input-field ${errors.signupEmail ? 'has-error' : ''}`}>
                                    <InputText
                                        id="signupEmail"
                                        name="signupEmail"
                                        value={formData.signupEmail}
                                        onChange={handleInputChange}
                                        placeholder="Email"
                                    />
                                    {errors.signupEmail && (
                                        <small className="error-text">{errors.signupEmail}</small>
                                    )}
                                </div>

                                <div className={`input-field ${errors.signupPhoneNumber ? 'has-error' : ''}`}>
                                    <InputText
                                        id="signupPhoneNumber"
                                        name="signupPhoneNumber"
                                        value={formData.signupPhoneNumber}
                                        onChange={handleInputChange}
                                        placeholder="Phone Number"
                                    />
                                    {errors.signupPhoneNumber && (
                                        <small className="error-text">{errors.signupPhoneNumber}</small>
                                    )}
                                </div>

                                <div className={`input-field ${errors.signupPassword ? 'has-error' : ''}`}>
                                    <Password
                                        id="signupPassword"
                                        name="signupPassword"
                                        value={formData.signupPassword}
                                        onChange={handleInputChange}
                                        placeholder="Password"
                                        feedback={false}
                                    />
                                    {errors.signupPassword && (
                                        <small className="error-text">{errors.signupPassword}</small>
                                    )}
                                </div>

                                <div className={`input-field ${errors.confirmPassword ? 'has-error' : ''}`}>
                                    <Password
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        value={formData.confirmPassword}
                                        onChange={handleInputChange}
                                        placeholder="Confirm Password"
                                        feedback={false}
                                    />
                                    {errors.confirmPassword && (
                                        <small className="error-text">{errors.confirmPassword}</small>
                                    )}
                                </div>

                                <Button label="Sign Up" className="p-button-primary" type="submit" />

                                <p className="toggle-link">
                                    Already have an account?{' '}
                                    <a href="#" onClick={toggleForm}>
                                        Login
                                    </a>
                                </p>
                            </>
                        ) : (
                            <>
                                {/* Login Form Fields */}
                                <div className={`input-field ${errors.loginUsernameOrEmail ? 'has-error' : ''}`}>
                                    <InputText
                                        id="loginUsernameOrEmail"
                                        name="loginUsernameOrEmail"
                                        value={formData.loginUsernameOrEmail}
                                        onChange={handleInputChange}
                                        placeholder="Username/Email"
                                    />
                                    {errors.loginUsernameOrEmail && (
                                        <small className="error-text">{errors.loginUsernameOrEmail}</small>
                                    )}
                                </div>

                                <div className={`input-field ${errors.loginPassword ? 'has-error' : ''}`}>
                                    <Password
                                        id="loginPassword"
                                        name="loginPassword"
                                        value={formData.loginPassword}
                                        onChange={handleInputChange}
                                        placeholder="Password"
                                        feedback={false}
                                    />
                                    {errors.loginPassword && (
                                        <small className="error-text">{errors.loginPassword}</small>
                                    )}
                                </div>

                                <Button label="Login" className="p-button-primary" type="submit" />
                                <p className="toggle-link">
                                    Not registered?{' '}
                                    <a href="#" onClick={toggleForm}>
                                        Sign up now
                                    </a>
                                </p>
                            </>
                        )}
                    </form>
                </div>
                <div className="entrybg">
                    <img src={orangutanbg1} alt="Entry Background" className="entry-bg" />
                </div>
            </div>
        </div>
    );
};

export default Entry;
