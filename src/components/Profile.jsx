import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import config from '../../backend/config';
import { AuthContext } from '../../backend/AuthContext';
import monkeyAvatar from '../assets/monkey.webp';
import mosquitoAvatar from '../assets/mosquito.webp';
import birdAvatar from '../assets/bird.webp';
import snakeAvatar from '../assets/snake.webp';
import deerAvatar from '../assets/deer.webp';
import catAvatar from '../assets/cat.webp';

const Profile = () => {
    const { userId } = useContext(AuthContext);
    const [avatar, setAvatar] = useState('monkey');
    const [isEditingAvatar, setIsEditingAvatar] = useState(false);
    const [gender, setGender] = useState('Not specified');
    const [dateOfBirth, setDateOfBirth] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const avatarOptions = [
        { label: 'Monkey', value: 'monkey', src: monkeyAvatar },
        { label: 'Mosquito', value: 'mosquito', src: mosquitoAvatar },
        { label: 'Bird', value: 'bird', src: birdAvatar },
        { label: 'Snake', value: 'snake', src: snakeAvatar },
        { label: 'Deer', value: 'deer', src: deerAvatar },
        { label: 'Cat', value: 'cat', src: catAvatar }
    ];

    useEffect(() => {
        if (userId) {
            fetchUserProfile();
        }
    }, [userId]);

    const fetchUserProfile = async () => {
        try {
            setIsLoading(true);
            const response = await axios.get(`${config.API_BASE_URL}/user-details/${userId}`);
            setAvatar(response.data.avatar || 'monkey');
            setGender(response.data.gender || 'Not specified');
            setDateOfBirth(response.data.date_of_birth ? response.data.date_of_birth.split('T')[0] : 'Not specified');
        } catch (error) {
            console.error('Error fetching user profile:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAvatarChange = async (newAvatar) => {
        try {
            setAvatar(newAvatar);
            setIsEditingAvatar(false);
        } catch (error) {
            console.error('Error updating avatar:', error);
        }
    };

    const handleSaveChanges = async () => {
        try {
            await axios.put(`${config.API_BASE_URL}/user-details/${userId}`, {
                avatar,
                gender,
                dateOfBirth,
            });
            setIsEditing(false);
        } catch (error) {
            console.error('Error updating user profile:', error);
        }
    };

    return (
        <div className="profile-container">
            {isLoading ? (
                <p>Loading...</p>
            ) : (
                <>
                    <div className="avatar-section">
                        <img
                            src={avatarOptions.find(option => option.value === avatar)?.src}
                            alt={avatar}
                            className="avatar-image"
                        />
                        {isEditing && (
                            <button onClick={() => setIsEditingAvatar(true)} className="profile-button edit">
                                Change Avatar
                            </button>
                        )}
                    </div>

                    {isEditingAvatar && (
                        <div className="modal-overlay">
                            <div className="modal-content-avatar">
                                <h3>Select an Avatar</h3>
                                <div className="avatar-options">
                                    {avatarOptions.map(option => (
                                        <div key={option.value} onClick={() => handleAvatarChange(option.value)} className="avatar-option">
                                            <img src={option.src} alt={option.label} className="avatar-image-option" />
                                        </div>
                                    ))}
                                </div>
                                <button onClick={() => setIsEditingAvatar(false)} className="profile-button cancel">
                                    Close
                                </button>
                            </div>
                        </div>
                    )}

                    <h2 className="profile-title">User Profile</h2>

                    <div className="profile-info-container">
                        <span className="profile-label">Gender:</span>
                        {isEditing ? (
                            <select value={gender} onChange={(e) => setGender(e.target.value)} className="profile-input">
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Rather not say">Rather not say</option>
                            </select>
                        ) : (
                            <span className="profile-value">{gender}</span>
                        )}
                    </div>

                    <div className="profile-info-container">
                        <span className="profile-label">Date of Birth:</span>
                        {isEditing ? (
                            <input
                                type="date"
                                value={dateOfBirth}
                                onChange={(e) => setDateOfBirth(e.target.value)}
                                className="profile-input"
                            />
                        ) : (
                            <span className="profile-value">{dateOfBirth}</span>
                        )}
                    </div>

                    <button
                        onClick={() => {
                            if (isEditing) {
                                handleSaveChanges();
                            }
                            setIsEditing(!isEditing);
                        }}
                        className="profile-button edit"
                    >
                        {isEditing ? 'Save' : 'Edit Profile'}
                    </button>
                </>
            )}
        </div>
    );
};

export default Profile;
