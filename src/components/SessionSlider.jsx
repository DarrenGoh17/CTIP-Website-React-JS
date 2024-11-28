import { useState } from 'react';
import image01 from '../assets/feeding-session.webp';
import image02 from '../assets/nature walk.webp';
import image03 from '../assets/photography.webp';
import image04 from '../assets/souvenir shop.webp';

const SessionSlider = () => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isTransitioning, setIsTransitioning] = useState(false);

    const sessions = [
        { src: image01, time: 'Feeding Session: 9:00am, 3:00pm' },
        { src: image02, time: 'Nature Walk: 8:00am - 4:00pm' },
        { src: image03, time: '11:00am, 5:00pm' },
        { src: image04, time: '12:00pm, 6:00pm' },
    ];

    const handleNextSlide = () => {
        setIsTransitioning(true);
        setTimeout(() => {
            setCurrentIndex((prevIndex) => (prevIndex + 1) % 2);
            setIsTransitioning(false);
        }, 300); // Match this to your CSS transition duration
    };

    const handlePrevSlide = () => {
        setIsTransitioning(true);
        setTimeout(() => {
            setCurrentIndex((prevIndex) => (prevIndex - 1 + 2) % 2);
            setIsTransitioning(false);
        }, 300); // Match this to your CSS transition duration
    };

    return (
        <>
            <h1 className='h1-header'>Tourist Activities</h1>
            <div className="session-slider-container">
                <div className="session-controls">
                    <button className="control prev" onClick={handlePrevSlide}>
                        <i className="fa fa-chevron-left" aria-hidden="true"></i> {/* Left arrow icon */}
                    </button>
                    <button className="control next" onClick={handleNextSlide}>
                        <i className="fa fa-chevron-right" aria-hidden="true"></i> {/* Right arrow icon */}
                    </button>
                </div>

                <div className="hidden-images hidden-image-left">
                    {currentIndex === 0 && (
                        <img 
                            src={sessions[2].src} 
                            alt="Hidden Session 3" 
                            className={`hidden-image right-hidden ${isTransitioning ? 'fade-out' : 'fade-in'}`} 
                        />
                    )}
                    {currentIndex === 1 && (
                        <img 
                            src={sessions[0].src} 
                            alt="Hidden Session 1" 
                            className={`hidden-image right-hidden ${isTransitioning ? 'fade-out' : 'fade-in'}`} 
                        />
                    )}
                </div>

                <div className="session-slides">
                    <div className={`session-slide ${isTransitioning ? 'fade-out' : 'fade-in'}`}>
                        <img 
                            src={sessions[currentIndex * 2].src} 
                            alt={`Session ${currentIndex * 2 + 1}`} 
                            className="session-image" 
                        />
                        <div className="session-time-label">{sessions[currentIndex * 2].time}</div>
                    </div>

                    <div className={`session-slide ${isTransitioning ? 'fade-out' : 'fade-in'}`}>
                        {currentIndex * 2 + 1 < sessions.length && (
                            <img 
                                src={sessions[currentIndex * 2 + 1].src} 
                                alt={`Session ${currentIndex * 2 + 2}`} 
                                className="session-image" 
                            />
                        )}
                        {currentIndex * 2 + 1 < sessions.length && (
                            <div className="session-time-label">{sessions[currentIndex * 2 + 1].time}</div>
                        )}
                    </div>
                </div>

                <div className="hidden-images hidden-image-right">
                    {currentIndex === 0 && (
                        <img 
                            src={sessions[3].src} 
                            alt="Hidden Session 4" 
                            className={`hidden-image right-hidden ${isTransitioning ? 'fade-out' : 'fade-in'}`} 
                        />
                    )}
                    {currentIndex === 1 && (
                        <img 
                            src={sessions[1].src} 
                            alt="Hidden Session 2" 
                            className={`hidden-image right-hidden ${isTransitioning ? 'fade-out' : 'fade-in'}`} 
                        />
                    )}
                </div>
            </div>
        </>
    );
};

export default SessionSlider;
