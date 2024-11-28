import { useState, useEffect } from 'react';
import image01 from '../assets/animal-bg.png';
import image02 from '../assets/orang utan.webp';
import image03 from '../assets/crocodile.webp';
import image04 from '../assets/porcupine.webp';
import image05 from '../assets/bearded pig.jpeg';

const AnimalSlider = () => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [fadeClass, setFadeClass] = useState('fade-in');

    const sessions = [
        { src: image02, time: 'Orangutan' },
        { src: image03, time: 'Crocodile' },
        { src: image04, time: 'Porcupine' },
        { src: image05, time: 'Bearded Pig' },
    ];

    const totalSessions = sessions.length;

    useEffect(() => {
        console.log(`Current index changed to: ${currentIndex}`);
    }, [currentIndex]);

    const nextSlide = () => {
        setFadeClass('fade-out');
        setTimeout(() => {
            setCurrentIndex((prevIndex) => (prevIndex + 1) % totalSessions);
            setFadeClass('fade-in');
        }, 300); // Duration of fade-out animation
    };

    const prevSlide = () => {
        setFadeClass('fade-out');
        setTimeout(() => {
            setCurrentIndex((prevIndex) => (prevIndex - 1 + totalSessions) % totalSessions);
            setFadeClass('fade-in');
        }, 300); // Duration of fade-out animation
    };

    return (
        <>
            <h1 className='h1-header'>Wildlife Animals</h1>
            <div className="session-slider-container" style={{ backgroundImage: `url(${image01})`, backgroundSize: 'cover', backgroundPosition: 'center', width: '100%', height: 'auto' }}>
                <div className="animal-controls">
                    <button className="control prev" onClick={prevSlide}>
                        <i className="fa fa-chevron-left" aria-hidden="true"></i> {/* Left arrow icon */}
                    </button>
                    <button className="control next" onClick={nextSlide}>
                        <i className="fa fa-chevron-right" aria-hidden="true"></i> {/* Right arrow icon */}
                    </button>
                </div>

                <div className="hidden-images hidden-animal-left">
                    <img 
                        src={sessions[(currentIndex + totalSessions - 1) % totalSessions].src} 
                        alt={`Hidden Session ${currentIndex}`} 
                        className="hidden-animal-image" 
                    />
                </div>

                <div className={`session-slides ${fadeClass}`}>
                    <div className="session-slide slider-image">
                        <img 
                            src={sessions[currentIndex].src} 
                            alt={`Session ${currentIndex + 1}`} 
                            className="session-animal-image" 
                        />
                        <div className="session-animal-label">{sessions[currentIndex].time}</div>
                    </div>
                </div>

                <div className="hidden-animal-images hidden-animal-right">
                    <img 
                        src={sessions[(currentIndex + 1) % totalSessions].src} 
                        alt={`Hidden Session ${currentIndex + 2}`} 
                        className="hidden-animal-image" 
                    />
                </div>
            </div>
        </>
    );
};

export default AnimalSlider;
