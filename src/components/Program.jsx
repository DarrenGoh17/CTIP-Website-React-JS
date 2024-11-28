import image01 from '../assets/quiz-event.webp'; // Quiz Event Image
import image02 from '../assets/orangutan-rehabilitation.webp'; // Orangutan Rehabilitation Image
import image03 from '../assets/wildlife conservation.webp'; // Wildlife Conservation Image

const program = [
    { src: image01, time: 'Wildlife Quizizz' },
    { src: image02, time: 'Orangutan Rehabilitation Program' },
    { src: image03, time: 'Wildlife Conservation Workshop' },
];

const WildlifePrograms = () => {
    return (
        <div className="container">
            <h1 className='h1-header'>Enjoy a day of fun events with wild adventures</h1>
            <div className="card-container">
                {program.map((item, index) => (
                    <div className="card" key={index}>
                        <img src={item.src} alt={item.time} />
                        <h2>{item.time}</h2>
                        <p>Join us for an exciting session about {item.time.toLowerCase()}!</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default WildlifePrograms;
