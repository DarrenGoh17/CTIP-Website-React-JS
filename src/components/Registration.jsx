import { useNavigate } from 'react-router-dom';
import conservation from '../assets/conservation included.png';
import background from '../assets/registration bg.webp';

const Registration = () => {
    const navigate = useNavigate();

    const handleRegisterClick = () => {
        navigate('/entry'); // Navigate to register page
    };

    return (
        <div className="registration-container" style={{ position: 'relative', backgroundImage: `url(${background})`, backgroundSize: 'cover', backgroundPosition: 'center', width: '100%', height: '100vh' }}>

            {/* Overlay */}
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                background: 'linear-gradient(to top, rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0))',
                zIndex: 1,
            }}></div>

            <div className="content-wrapper" style={{ position: 'relative', zIndex: 2, textAlign: 'center', color: 'white', padding: '20px' }}>
                <h1 className="registration-title">Join Us Now</h1>
                <img src={conservation} alt="Conservation Included" className="conservation-image" />
                <p>We are excited to invite you to be a part of something special! Get to know our latest news.</p>
                <button className="register-button" onClick={handleRegisterClick}>Register Now</button>
            </div>
        </div>
    );
};

export default Registration;
