import React, { useState, useContext } from 'react'; // Make sure to import useContext
import { AuthContext } from '../../backend/AuthContext';

const ChatButton = () => {
    const { isAuthenticated, userRole } = useContext(AuthContext);
    const [showOptions, setShowOptions] = useState(false);

    const handleClick = () => {
        setShowOptions((prev) => !prev); // Toggle the visibility of options
    };

    const handleTextClick = () => {
        // Determine the URL based on userRole
        const textChatUrl = isAuthenticated && userRole === 'admin' ? 
            'http://127.0.0.1:7000' : // Admin chat URL
            'http://127.0.0.1:5000'; // Regular user chat URL

        // Redirect to the chat text interface
        window.open(textChatUrl, '_blank'); // Open in a new window/tab
    };

    const handleUploadClick = () => {
        // Redirect to the upload interface
        window.open('http://127.0.0.1:8000/', '_blank'); // Open in a new window/tab
    };

    // Determine the button text based on authentication and user role
    const buttonText = isAuthenticated && userRole === 'admin' ? 'Forestia Bot' : 'Chopper Bot';

    return (
        <div>
            <button className="chat-button" onClick={handleClick}>
                <i className="fas fa-comments"></i>
                {buttonText}
            </button>

            {showOptions && (
                <div className="options">
                    <button onClick={handleTextClick} className="option-button">Text</button>
                    <button onClick={handleUploadClick} className="option-button">Upload Image & Video</button>
                </div>
            )}
        </div>
    );
};

export default ChatButton;
