import { useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../backend/AuthContext';
import config from '../../backend/config';

import image01 from '../assets/semenggoh cleaning.jpg';
import image02 from '../assets/quiz-event.webp';
import image03 from '../assets/wildlife conservation.webp';
import image04 from '../assets/orangutan-rehabilitation.webp';

const Events = () => {
  const { userId } = useContext(AuthContext); // Get userId from AuthContext

  // Function to update voucher_10 status
  const handleQuizLinkClick = async () => {
    if (!userId) {
      console.warn("User not authenticated. Redirect to login or handle unauthenticated state.");
      return;
    }
    try {
      await axios.post(`${config.API_BASE_URL}/user/${userId}/assign-voucher`, {
        voucherType: '10'
      });
      console.log("Voucher 10 assigned successfully");
    } catch (error) {
      console.error("Failed to assign Voucher 10:", error);
    }
  };

  return (
    <section className="discover-section">
      {/* Existing Discover Section */}
      <div className="things-to-do">
        <div className="header-container">
          <h2>Events</h2>
          <hr />
        </div>
        <div className="subtitle">
          <span>Participate In Adventurous Events</span>
        </div>
        <div className="activities">
          <div className="activity">
            <img className="activity-image" src={image01} alt="Cleaning Volunteering" />
            <h3>Cleaning Volunteering</h3>
            <p>
              Join our cleaning volunteering efforts to help maintain the natural beauty of Semenggoh Wildlife Centre. Make a positive impact by contributing to the cleanliness and sustainability of this important habitat.
            </p>
          </div>

          <div className="activity">
            <img className="activity-image" src={image02} alt="Wildlife Quizziz" />
            <h3>Wildlife Quizziz</h3>
            <p>
              Test your knowledge of wildlife at our fun and interactive quiz event. Learn fascinating facts about animals while competing for exciting prizes.
            </p>
            {/* Call handleQuizLinkClick on click */}
            <a
              href="https://quizizz.com/admin/quiz/66fcaf8476340e5b2df7bdee?modal=contentCreation&type=quiz&source=content-creation-modal"
              className="find-out-more"
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleQuizLinkClick}
            >
              Find Out More &rarr;
            </a>
          </div>

          <div className="activity">
            <img className="activity-image" src={image03} alt="Wildlife Conservation Campaign" />
            <h3>Wildlife Conservation Campaign</h3>
            <p>
              Get involved in our wildlife conservation campaign and help protect endangered species. Participate in workshops and activities that highlight the importance of preserving our natural environment.
            </p>
          </div>

          <div className="activity">
            <img className="activity-image" src={image04} alt="Orangutan Rehabilitation" />
            <h3>Orangutan Rehabilitation</h3>
            <p>
              Learn about the orangutan rehabilitation program and how we help rescued orangutans return to their natural habitat. Discover the challenges these incredible animals face and what you can do to support their journey.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Events;
