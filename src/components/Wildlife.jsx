import { useEffect, useRef } from 'react';
import $ from 'jquery';
import { gsap, Expo, Quint } from 'gsap';

// Import your images
import image1 from '../assets/bearded pig.jpeg';
import image2 from '../assets/orang utan.webp';
import image3 from '../assets/porcupine.webp';
import image4 from '../assets/crocodile.webp';
import image5 from '../assets/great argus pheasant.jpg';
import image6 from '../assets/sambar deer.webp';
import image7 from '../assets/leopard cat.jpeg';
import image8 from '../assets/pigtail macque.jpg';
import image9 from '../assets/sun bear.jpeg';
import image10 from '../assets/marteen.jpeg';
import image11 from '../assets/squirrel.jpeg';

const Wildlife = () => {
  const contentContainerRef = useRef(null);
  const carouselContainerRef = useRef(null);

  const imageDescriptions = [
    "Bearded Pig",
    "Orangutan",
    "Porcupine",
    "Crocodile",
    "Great Argus Pheasant",
    "Sambar Deer",
    "Leopard Cat",
    "Pig-tailed Macaque",
    "Sun Bear",
    "Yellow Throated Marteen",
    "Three-Striped Ground Squirrel"
  ];

  const imageLinks = [
    'https://en.wikipedia.org/wiki/Bornean_bearded_pig#:~:text=The%20Bornean%20bearded%20pig%20(Sus%20barbatus),%20also%20known%20as%20the#:~:text=The%20Bornean%20bearded%20pig%20(Sus%20barbatus),%20also%20known%20as%20the',
    'https://www.bing.com/search?q=orangutan&qs=n&form=QBRE&sp=-1&lq=0&pq=orangut&sc=10-7&sk=&cvid=7C2927BAEE644D2A8FB18D5BC17C6737&ghsh=0&ghacc=0&ghpl=',
    'https://en.wikipedia.org/wiki/Porcupine',
    'https://en.wikipedia.org/wiki/Crocodile#:~:text=The%20Modern%20English%20form%20crocodile%20was%20adapted%20directly%20from',
    'https://www.bing.com/search?q=great-argus-pheasant&cvid=6bdeb056d2e548f5a13bb3be5fab14b1&gs_lcrp=EgZjaHJvbWUyBggAEEUYOTIGCAEQABhAMgYIAhAAGEAyBggDEAAYQDIGCAQQABhAMgYIBRAAGEAyBggGEAAYQDIGCAcQABhA0gEHNjQwajBqOagCBLACAQ&FORM=ANAB01&PC=NMTS',
    'https://en.wikipedia.org/wiki/Sambar_deer#:~:text=The%20sambar%20(Rusa%20unicolor)%20is%20a%20large%20deer%20native%20to#:~:text=The%20sambar%20(Rusa%20unicolor)%20is%20a%20large%20deer%20native%20to',
    'https://en.wikipedia.org/wiki/Leopard_cat',
    'https://en.wikipedia.org/wiki/Southern_pig-tailed_macaque#:~:text=The%20southern%20pig-tailed%20macaque%20(Macaca%20nemestrina),%20also#:~:text=The%20southern%20pig-tailed%20macaque%20(Macaca%20nemestrina),%20also',
    'https://en.wikipedia.org/wiki/Sun_bear',
    'https://en.wikipedia.org/wiki/Yellow-throated_marten#:~:text=The%20yellow-throated%20marten%20(Martes%20flavigula)%20is%20a%20marten',
    'https://en.wikipedia.org/wiki/Three-striped_ground_squirrel'
  ];

  useEffect(() => {
    let container, carousel, item, radius, itemLength, rY, ticker;
    let mouseX = 0;
    let mouseY = 0;
    let mouseZ = 0;
    let addX = 0;
    let isHovered = false;

    const init = () => {
      container = $(contentContainerRef.current);
      carousel = $(carouselContainerRef.current);
      item = $('.carouselItem');
      itemLength = item.length;
      rY = 360 / itemLength;
      radius = Math.round(250 / Math.tan(Math.PI / itemLength));

      gsap.set(container, { perspective: 600 });
      gsap.set(carousel, { z: -radius });

      for (let i = 0; i < itemLength; i++) {
        const $item = item.eq(i);
        const $block = $item.find('.carouselItemInner');

        gsap.set($item, {
          rotationY: rY * i,
          z: radius,
          transformOrigin: `50% 50% ${-radius}px`,
        });

        animateIn($item, $block);
      }

      window.addEventListener('mousemove', onMouseMove, false);
      carousel.on('mouseenter', () => isHovered = true);
      carousel.on('mouseleave', () => isHovered = false);

      ticker = setInterval(looper, 1000 / 60);
    };

    const animateIn = ($item, $block) => {
      const $nrX = 360 * getRandomInt(2);
      const $nrY = 360 * getRandomInt(2);
      const $nx = -2000 + getRandomInt(4000);
      const $ny = -2000 + getRandomInt(4000);
      const $nz = -4000 + getRandomInt(4000);
      const $s = 1.5 + getRandomInt(10) * 0.1;
      const $d = 1 - getRandomInt(8) * 0.1;

      gsap.set($item, { autoAlpha: 1, delay: $d });
      gsap.set($block, {
        z: $nz,
        rotationY: $nrY,
        rotationX: $nrX,
        x: $nx,
        y: $ny,
        autoAlpha: 0,
      });
      gsap.to($block, $s, {
        delay: $d,
        rotationY: 0,
        rotationX: 0,
        z: 0,
        ease: Expo.easeInOut,
      });
      gsap.to($block, $s - 0.5, {
        delay: $d,
        x: 0,
        y: 0,
        autoAlpha: 1,
        ease: Expo.easeInOut,
      });
    };

    const onMouseMove = (event) => {
      mouseX = -(-(window.innerWidth * 0.5) + event.pageX) * 0.0025;
      mouseY = -(-(window.innerHeight * 0.5) + event.pageY) * 0.01;
      mouseZ = -radius - (Math.abs(-(window.innerHeight * 0.5) + event.pageY) - 200);
    };

    const looper = () => {
      if (!isHovered) {
        addX += mouseX * 0.2; // Slow down rotation when not hovering
      } else {
        addX += mouseX; // Normal speed when hovering
      }
      gsap.to(carousel, 0.05, { rotationY: addX, rotationX: mouseY, ease: Quint.easeOut });
      gsap.set(carousel, { z: mouseZ });
    };

    const getRandomInt = (n) => Math.floor(Math.random() * n + 1);

    init();

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      clearInterval(ticker);
    };
  }, []);

  return (
    <div className='animal-container'>
      <div className="header-container">
        <h2>Wildlife</h2>
      </div>
      <div id="contentContainer" ref={contentContainerRef} className="trans3d">
        <section id="carouselContainer" ref={carouselContainerRef} className="trans3d">
          {[
            image1, image2, image3, image4, image5, 
            image6, image7, image8, image9, image10, image11
          ].map((image, index) => (
            <figure key={index + 1} className="carouselItem trans3d">
              <a href={imageLinks[index]} target="_blank" rel="noopener noreferrer">
                <div className="carouselItemInner trans3d">
                  <img src={image} alt={`Carousel Item ${index + 1}`} style={{ width: '100%', height: '100%' }} />
                  <div className="imageDescription">
                    {imageDescriptions[index]}
                  </div>
                </div>
              </a>
              <div className="carouselShadow trans3d"></div>
            </figure>
          ))}
        </section>
      </div>
    </div>
  );
};

export default Wildlife;
