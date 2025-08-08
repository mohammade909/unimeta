import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Star, ArrowRight } from "lucide-react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

// Feature Data
const featureData = [
  {
    id: 1,
    title: "Easy to Use",
    description:
      "Our platform is designed to be simple and user-friendly, so anyone can start without any technical knowledge or experience.",
    image: "https://lottie.host/49b7af40-09d3-49d1-99b2-fcbbcd2fc6ab/p66DQgEgOD.lottie",
    badge: "Beginner Friendly",
  },
  {
    id: 2,
    title: "Strong Security",
    description:
      "We use advanced security systems to keep your money and personal data safe — giving you complete peace of mind.",
    image: "https://lottie.host/e8225ead-e82f-466c-bb0f-0809de846f69/jknLqJt2Ao.lottie",
    badge: "Bank Grade",
  },
  {
    id: 3,
    title: "Learn as You Go",
    description:
      "You don't need to be an expert. Finoty helps you understand each step while you invest and grow at your own pace.",
    image: "https://lottie.host/26b0999a-d486-48e8-9031-fffa41fa24ef/MyecT1D1kq.lottie",
    badge: "Educational",
  },
  {
    id: 4,
    title: "Flexible Earnings",
    description:
      "You have full control over how you earn and when you withdraw. Start small, grow steadily, and access your funds anytime.",
    image: "/slide4.jpg",
    badge: "Flexible",
  },
  {
    id: 5,
    title: "Smart Analytics",
    description:
      "Advanced market insights and real-time data help you make informed decisions and maximize your investment potential.",
    image: "/slide5.jpg",
    badge: "AI Powered",
  },
];

// Feature Card
const FeatureCard = ({ feature, isActive }) => {
  const isLottie = feature.image?.endsWith(".lottie");

  return (
    <div
      className={`group relative overflow-hidden rounded-2xl transition-all duration-500 ${
        isActive ? "scale-105 z-10" : "scale-95 opacity-70"
      }`}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-amber-500/20 via-transparent to-orange-600/20 z-10" />
      <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-400 via-yellow-500 to-orange-500 rounded-2xl blur opacity-30 group-hover:opacity-60 transition duration-500" />

      <div className="relative bg-gradient-to-br from-gray-900 via-black to-gray-800 rounded-2xl overflow-hidden border border-amber-500/30 group-hover:border-amber-400/50 transition-all duration-300">
        <div className="relative h-48 overflow-hidden flex items-center justify-center">
          {isLottie ? (
            <DotLottieReact
              src={feature.image}
              loop
              autoplay
              className="w-full h-auto"
            />
          ) : (
            <img
              src={feature.image}
              alt={feature.title}
              className="object-contain h-full"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>

        <div className="p-6 relative z-20">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 bg-gradient-to-r from-amber-400 to-yellow-500 rounded-lg flex items-center justify-center">
              <Star size={16} className="text-black" />
            </div>
            <h3 className="text-xl font-bold text-white group-hover:text-amber-400 transition-colors duration-300">
              {feature.title}
            </h3>
          </div>
          <p className="text-gray-300 text-sm leading-relaxed mb-4 group-hover:text-gray-200 transition-colors duration-300">
            {feature.description}
          </p>
          <button className="w-full py-2 px-4 bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border border-amber-500/40 rounded-lg text-amber-400 text-sm font-medium hover:from-amber-500 hover:to-yellow-500 hover:text-black transition-all duration-300 flex items-center justify-center gap-2">
            Learn More
            <ArrowRight size={14} />
          </button>
        </div>

        <div className="absolute top-2 right-2 w-4 h-4 bg-amber-400/20 rounded-full" />
        <div className="absolute bottom-2 left-2 w-6 h-6 bg-yellow-500/10 rounded-full" />
      </div>
    </div>
  );
};

// Custom Swiper
const CustomSwiper = ({ children, slidesPerView = 1, spaceBetween = 24 }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const maxIndex = Math.max(0, children.length - slidesPerView);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
  };

  return (
    <div className="relative">
      {/* Navigation Buttons */}
      <button
        onClick={prevSlide}
        className="absolute -left-8 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-gradient-to-r from-amber-500 to-yellow-600 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-all z-20"
      >
        <ChevronLeft size={20} className="text-black" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute -right-8 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-gradient-to-r from-amber-500 to-yellow-600 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-all z-20"
      >
        <ChevronRight size={20} className="text-black" />
      </button>

      {/* Slides */}
      <div className="overflow-hidden">
        <div
          className="flex transition-transform duration-500 ease-out"
          style={{
            transform: `translateX(-${currentIndex * (100 / slidesPerView)}%)`,
            gap: `${spaceBetween}px`,
          }}
        >
          {children.map((child, index) => (
            <div
              key={index}
              className="flex-shrink-0"
              style={{
                width: `calc(${100 / slidesPerView}% - ${
                  (spaceBetween * (slidesPerView - 1)) / slidesPerView
                }px)`,
              }}
            >
              {React.cloneElement(child, {
                isActive:
                  index >= currentIndex && index < currentIndex + slidesPerView,
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Dots */}
      <div className="flex justify-center gap-2 mt-8">
        {Array.from({ length: maxIndex + 1 }).map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`transition-all duration-300 ${
              index === currentIndex
                ? "w-8 h-3 bg-gradient-to-r from-amber-500 to-yellow-600 rounded-full"
                : "w-3 h-3 bg-gray-600 hover:bg-gray-500 rounded-full"
            }`}
          />
        ))}
      </div>
    </div>
  );
};

// Main Component
export default function FeatureSlider() {
  const [slidesPerView, setSlidesPerView] = useState(3);

  useEffect(() => {
    const updateSlidesPerView = () => {
      if (window.innerWidth < 640) setSlidesPerView(1);
      else if (window.innerWidth < 1024) setSlidesPerView(2);
      else if (window.innerWidth < 1280) setSlidesPerView(3);
      else setSlidesPerView(4);
    };

    updateSlidesPerView();
    window.addEventListener("resize", updateSlidesPerView);
    return () => window.removeEventListener("resize", updateSlidesPerView);
  }, []);

  return (
    <section className="relative py-10 bg-gradient-to-b from-black via-gray-900 to-black overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-yellow-500/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-radial from-amber-500/5 to-transparent" />
      </div>

      <div className="relative max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-block mb-4">
            <span className="px-4 py-2 bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border border-amber-500/40 rounded-full text-amber-400 text-sm font-medium">
              Premium Features
            </span>
          </div>
          <h2 className="text-4xl font-bold text-white mb-2">
            Everything You Need in{" "}
            <span className="bg-gradient-to-r from-amber-400 via-yellow-500 to-orange-500 bg-clip-text text-transparent">
              One Platform
            </span>
          </h2>
          <p className="text-base text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Finoty brings together powerful tools and a simple experience to
            help you grow in the world of crypto, blockchain, and tokens —
            without confusion or risk.
          </p>
        </div>

        {/* Feature Cards */}
        <CustomSwiper slidesPerView={slidesPerView} spaceBetween={24}>
          {featureData.map((feature) => (
            <FeatureCard key={feature.id} feature={feature} />
          ))}
        </CustomSwiper>
      </div>
    </section>
  );
}
