"use client";

import { useState, useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";


interface CardData {
  company: string;
  image: string;
  title: string;
  description: string;
  tags: string[];
  link: string;
}

const cards: CardData[] = [
  {
    company: "Bedquest",
    image: "/crm-sliderImage.jfif",
    title: "We Made A Community Mural With AI",
    description:
      "Using tools like geofencing and keyword retargeting, we target customers based on location and behavior, ensuring every impression counts.",
    tags: ["CEO", "SEO", "Branding"],
    link: "#",
  },
  {
    company: "Apple",
    image: "\crm-siderImage7.png",
    title: "Reimagining Retail Experience",
    description:
      "Apple redefined in-store customer interactions using AR and personalized AI assistants.",
    tags: ["AR", "UX", "Retail"],
    link: "#",
  },
  {
    company: "Google",
    image: "/crm-sliderImage22.webp",
    title: "AI-Powered Workspace Tools",
    description:
      "Google Workspace now leverages AI to automate workflow and increase team productivity.",
    tags: ["AI", "Cloud", "Productivity"],
    link: "#",
  },
];

export default function ImageSlider() {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Initialize AOS once
  useEffect(() => {
    AOS.init({ duration: 800, easing: "ease-out-cubic", once: true });
  }, []);

  // Auto-slide every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % cards.length);
      AOS.refresh(); // re-trigger animation
    }, 3000);
    return () => clearInterval(interval);
  }, []);

 

  const currentCard = cards[currentIndex];

  return (
    <section className="relative  px-0 pt-1 md:px-10   text-white flex flex-col  ">
      <div className="relative flex flex-col items-center justify-center w-full max-w-[1200px] mx-auto">
        {/* Image Card */}
        <div
          key={currentIndex}
          data-aos="fade-down"
          className="relative overflow-hidden rounded-md w-full transition-all duration-700"
        >
         
          <div className=" relative ">
             <img
            src={currentCard.image}
            alt={currentCard.title}
            className="object-cover w-full h-[22vh]  rounded-xs"
          />
          <div className=" absolute top-0 left-0 h-full w-full bg-black/35"></div>
          </div>

          <div
           
            data-aos-delay="150"
            className="absolute bottom-0 left-0 p-6 sm:p-10 md:p-12 space-y-4  rounded-xs w-full"
          >
        

            <h2
              data-aos="fade-right"
              data-aos-delay="300"
              className="text-white text-shadow-black text-shadow-2xl text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold leading-tight"
            >
              {currentCard.title}
            </h2>

           
          </div>
        </div>

       
      </div>
    </section>
  );
}