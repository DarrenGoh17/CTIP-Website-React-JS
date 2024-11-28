import React, { useState, useContext, useEffect } from 'react';
import image01 from '../assets/orang utan bg dekstop.webp';
import image02 from '../assets/slider 2.png';
import image03 from '../assets/slider 3.png';
import image04 from '../assets/nature walk popup.webp';
import image05 from '../assets/photography popup.jpg';
import video01 from '../assets/feeding.mp4';
import { AuthContext } from '../../backend/AuthContext';
import axios from 'axios';
import { Modal, Button, Image } from 'react-bootstrap';
import config from '../../backend/config';

const images = [
  image01,
  image02,
  image03,
];

const popups = [
  {
    type: 'feeding',
    title: 'Orangutan Feeding Session',
    video: video01,
    content: '9:00 AM , 3:00 PM',
  },
  {
    type: 'nature_walk',
    title: 'Nature Walk',
    image: image04,
    content: 'Explore the wild nature in Semenggoh Wildlife Centre',
  },
  {
    type: 'photography',
    title: 'Wildlife Photography Tips',
    image: image05,
    content: 'Capturing a moment in the wild is like freezing a heartbeat of nature.',
  },
];

const captions = [
  { title: "Orangutan Sanctuary", description: "Welcome to the Semenggoh Wildlife Reserve, a serene refuge nestled deep within the lush tropical rainforest." },
  { title: "", description: "" },
  { title: "", description: "" },
];

const MainSlider = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const { isAuthenticated, userId } = useContext(AuthContext);
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const [popupContent, setPopupContent] = useState(null);

  useEffect(() => {
    if (isAuthenticated) {
      fetchPreference();
    }
  }, [isAuthenticated]);
  
  const fetchPreference = async () => {
    try {
      const response = await axios.get(`${config.API_BASE_URL}/user-preference/${userId}`);
      const highestCountType = getHighestCountType(response.data);
      setPopupContent(getPopupContentByType(highestCountType));
      setIsPopupVisible(true);
    } catch (error) {
      console.error('Error fetching user preference:', error);
    }
  };
  
  const getHighestCountType = (preferences) => {
    const counts = {
      feeding: preferences.feeding_count,
      nature_walk: preferences.nature_walk_count,
      photography: preferences.photography_count,
    };
    return Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b);
  };
  
  const getPopupContentByType = (type) => {
    return popups.find((popup) => popup.type === type);
  };
  
  const handleClosePopup = () => {
    setIsPopupVisible(false);
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
  };

  return (
    <div className="main-slider">
      {/* Popup Modal */}
      <Modal show={isPopupVisible} onHide={handleClosePopup}>
        <Modal.Header closeButton>
          <Modal.Title>You might be interested in</Modal.Title>
        </Modal.Header>
        <Modal.Body>
        {popupContent && (
          <>
            {popupContent.video ? (
              <video style={{ width: '100%', height: '400px' }} controls autoPlay muted>
              <source src={popupContent.video} type="video/mp4" />
              Your browser does not support the video tag.
              </video>
            ) : (
              <Image src={popupContent.image} fluid />
            )}
            <h4>{popupContent.title}</h4>
            <p>{popupContent.content}</p>
          </>
        )}
        {!popupContent && <p>No relevant content available</p>}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClosePopup}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
      <div className="slider-container" style={{ transform: `translateX(-${currentIndex * 100}%)` }}>
        {images.map((image, index) => (
          <div className={`slider-image ${index === currentIndex ? 'active' : ''} ${(index === 1 || index === 2)? 'no-overlay' : ''}`} key={index}>
            <img src={image} alt={`Slide ${index + 1}`} />
            {index === currentIndex && (
              <div className="caption">
                <h2>{captions[index].title}</h2>
                <p>{captions[index].description}</p>
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="controls">
        <button className="control prev" onClick={handlePrev}>
          <i className="fa fa-chevron-left" aria-hidden="true"></i> {/* Left arrow icon */}
        </button>
        <button className="control next" onClick={handleNext}>
          <i className="fa fa-chevron-right" aria-hidden="true"></i> {/* Right arrow icon */}
        </button>
      </div>
    </div>
    
  );
};

export default MainSlider;
