// src/components/HeroSlider.jsx
import { useState, useEffect, useRef } from "react";

const slides = [
  {
    title: "Fresh Fruits &\nOrganic Food",
    desc: "The best organic products online, freshly delivered to your door daily.",
    img: "assets/fruits.png",
    alt: "Fresh fruits pile",
  },
  {
    title: "Fresh Vegetables &\nOrganic Greens",
    desc: "Crisp, nutrient-rich vegetables delivered fresh from local organic farms.",
    img: "assets/fresh&clean.png",
    alt: "Organic vegetables arrangement",
  },
  {
    title: "Exotic Tropical\nFruits",
    desc: "Vibrant, juicy tropical fruits sourced sustainably and delivered daily.",
    img: "assets/tropical-fruits.png",
    alt: "Tropical fruits pile",
  },
  {
    title: "Fresh Dairy &\nOrganic Eggs",
    desc: "Farm-fresh milk, cheese, yogurt and eggs — pure, natural and nutritious every day.",
    img: "assets/dairy-needs.png",
    alt: "Eggs",
  },
];

export default function HeroSlider() {
  const [current, setCurrent] = useState(0);
  const autoSlideRef = useRef(null);

  const startAutoSlide = () => {
    autoSlideRef.current = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 5000);
  };

  const stopAutoSlide = () => clearInterval(autoSlideRef.current);

  useEffect(() => {
    startAutoSlide();
    return () => stopAutoSlide();
  }, []);

  const goToSlide = (index) => {
    stopAutoSlide();
    setCurrent(index);
    startAutoSlide();
  };

  return (
    <div
      className="slider"
      onMouseEnter={stopAutoSlide}
      onMouseLeave={startAutoSlide}
    >
      {slides.map((slide, i) => (
        <div key={i} className={`slide${i === current ? " active" : ""}`}>
          <div className="content">
            <h1>
              {slide.title.split("\n").map((line, j) => (
                <span key={j}>{line}{j === 0 && <br />}</span>
              ))}
            </h1>
            <p>{slide.desc}</p>
            <form className="subscribe" onSubmit={(e) => e.preventDefault()}>
              <input type="email" placeholder="Your email address" required />
              <button type="submit">Subscribe</button>
            </form>
          </div>
          <div className="image-container">
            <img src={slide.img} alt={slide.alt} />
          </div>
        </div>
      ))}

      <div className="dots">
        {slides.map((_, i) => (
          <div
            key={i}
            className={`dot${i === current ? " active" : ""}`}
            onClick={() => goToSlide(i)}
          ></div>
        ))}
      </div>
    </div>
  );
}
