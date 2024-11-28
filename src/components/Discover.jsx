import React, { useContext, useState } from 'react';
import { AuthContext } from '../../backend/AuthContext';
import config from '../../backend/config';
import axios from 'axios';
import image01 from '../assets/feeding-session.webp';
import image02 from '../assets/nature walk.webp';
import image03 from '../assets/photography.webp';
import image04 from '../assets/souvenir shop.webp';

const Discover = () => {
  const { userId } = useContext(AuthContext);
  const [showContent, setShowContent] = useState([false, false, false, false]);

  const toggleContent = (index, type) => {
    updateUserPreference(type); // Call function when toggling content
    setShowContent((prev) => {
      const newShowContent = [...prev];
      newShowContent[index] = !newShowContent[index];
      return newShowContent;
    });
  };

  const updateUserPreference = async (type) => {
    try {
      const response = await axios.post(`${config.API_BASE_URL}/user-preference/${userId}`, { type });
      if (response.status === 200) {
        console.log('Preference updated successfully');
      }
    } catch (error) {
      console.error('Error updating user preference:', error);
    }
  };

  return (
    <section className="discover-section">
      <div className="things-to-do">
        <div className="header-container">
          <h2>Discover</h2>
          <hr />
        </div>
        <div className="subtitle">
          <span>Things to do at Semenggoh Wildlife Centre</span>
        </div>
        <div className="activities">
          <div className="activity">
            <img className="activity-image" src={image01} alt="Orangutan Feeding Sessions" />
            <h3>Orangutan Feeding Sessions</h3>
            {showContent[0] && (
              <p>Witness the amazing orangutans up close as they come out for their feeding sessions. Learn about their behavior and conservation efforts.</p>
            )}
            <a
              href="#toggle-content"
              className="find-out-more"
              onClick={(e) => {
                e.preventDefault();
                toggleContent(0, 'feeding');
              }}
            >
              {showContent[0] ? 'Hide' : 'Read More'}
            </a>
          </div>

          <div className="activity">
            <img className="activity-image" src={image02} alt="Nature Walk" />
            <h3>Nature Walk</h3>
            {showContent[1] && (
              <p>Take a guided nature walk through the beautiful trails of Semenggoh Wildlife Centre and discover the diverse flora and fauna of the rainforest.</p>
            )}
            <a
              href="#toggle-content"
              className="find-out-more"
              onClick={(e) => {
                e.preventDefault();
                toggleContent(1, 'nature_walk');
              }}
            >
              {showContent[1] ? 'Hide' : 'Read More'}
            </a>
          </div>

          <div className="activity">
            <img className="activity-image" src={image03} alt="Photography Session" />
            <h3>Photography Session</h3>
            {showContent[2] && (
              <p>Capture stunning shots of the orangutans and the surrounding nature. Our photography sessions offer great opportunities for wildlife photography enthusiasts.</p>
            )}
            <a
              href="#toggle-content"
              className="find-out-more"
              onClick={(e) => {
                e.preventDefault();
                toggleContent(2, 'photography');
              }}
            >
              {showContent[2] ? 'Hide' : 'Read More'}
            </a>
          </div>

          <div className="activity">
            <img className="activity-image" src={image04} alt="Souvenir Shop" />
            <h3>Souvenir Shop</h3>
            {showContent[3] && (
              <p>Visit our souvenir shop and take home unique memorabilia that supports the conservation work at Semenggoh Wildlife Centre.</p>
            )}
            <a
              href="#toggle-content"
              className="find-out-more"
              onClick={(e) => {
                e.preventDefault();
                toggleContent(3, '');
              }}
            >
              {showContent[3] ? 'Hide' : 'Read More'}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Discover;
