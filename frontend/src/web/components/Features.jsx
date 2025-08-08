import { TrendingUp, Building2, DollarSign, Shield, BarChart3, Coins, } from "lucide-react";
import { Link } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";

const featureData = [
  {
    id: 1,
    title: "Smart Investment",
    description:
      "AI-powered algorithms analyze market trends across crypto, forex, and real estate to maximize your investment potential.",
    icon: TrendingUp,
  },
  {
    id: 2,
    title: "Real Estate Portfolio",
    description:
      "Access premium real estate opportunities worldwide. Diversify your portfolio with tangible assets.",
    icon: Building2,
  },
  {
    id: 3,
    title: "Multi-Currency Trading",
    description:
      "Trade major forex pairs and cryptocurrencies all from one unified platform with institutional-grade execution.",
    icon: DollarSign,
  },
  {
    id: 4,
    title: "Bank-Level Security",
    description:
      "Your investments are protected by military-grade encryption and comprehensive insurance coverage.",
    icon: Shield,
  },
  {
    id: 5,
    title: "Advanced Analytics",
    description:
      "Real-time market analysis and portfolio optimization tools to make informed investment decisions.",
    icon: BarChart3,
  },
  {
    id: 6,
    title: "Digital Assets",
    description:
      "Trade Bitcoin, Ethereum, and emerging altcoins alongside traditional forex pairs and real estate tokens.",
    icon: Coins,
  },
];

const FeatureCard = ({ feature }) => {
  const Icon = feature.icon;
  return (
    <div className="group relative h-full">
      <div className="h-full bg-gradient-to-br from-gray-900 to-black rounded-xl border border-amber-400/30 p-6 hover:border-amber-400/60 hover:shadow-lg hover:shadow-amber-500/20 transition-all duration-300">
        <div className="w-14 h-14 bg-gradient-to-br from-amber-400 to-yellow-600 rounded-lg flex items-center justify-center mb-5 group-hover:scale-105 transition-transform duration-300">
          <Icon size={24} className="text-black" />
        </div>
        <h3 className="text-lg font-semibold text-white mb-3 group-hover:text-amber-400 transition-colors duration-300">
          {feature.title}
        </h3>
        <p className="text-gray-300 text-base text-justify leading-relaxed">
          {feature.description}
        </p>
        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-amber-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </div>
    </div>
  );
};

export default function Features() {
  return (
    <div className="py-16 bg-gradient-to-b from-black to-gray-900 relative">
      {/* Background Blur Circles */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-32 left-20 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-32 right-20 w-80 h-80 bg-yellow-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-6 z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="inline-block px-4 py-2 bg-amber-500/20 border border-amber-500/40 rounded-full text-amber-400 text-sm font-medium mb-4">
            Investment Platform
          </span>
          <h2 className="text-4xl  font-bold text-white mb-2">
            Everything You Need to{" "}
            <span className="bg-gradient-to-r from-amber-400 to-yellow-500 bg-clip-text text-transparent">
              Grow Your Wealth
            </span>
          </h2>
          <p className="text-base text-gray-300 max-w-2xl mx-auto">
            Professional tools for real estate, cryptocurrency, and forex
            trading. Start your investment journey with confidence.
          </p>
        </div>

        {/* Swiper Slider (Autoplay Only) */}
        <Swiper
          modules={[Autoplay]}
          autoplay={{ delay: 5000, disableOnInteraction: false }}
          spaceBetween={25}
          breakpoints={{
            320: { slidesPerView: 1 },
            768: { slidesPerView: 2 },
            1024: { slidesPerView: 4 },
          }}
          className="pb-12"
        >
          {featureData.map((feature) => (
            <SwiperSlide key={feature.id}>
              <FeatureCard feature={feature} />
            </SwiperSlide>
          ))}
        </Swiper>

        {/* CTA Section */}
        <div className="text-center mt-8">
          <div className="inline-flex flex-col md:flex-row items-center gap-4 bg-gradient-to-r from-amber-500/10 to-yellow-500/10 border border-amber-500/30 rounded-xl px-6 py-4">
            <div className="w-10 h-10 bg-gradient-to-r from-amber-400 to-yellow-500 rounded-full flex items-center justify-center">
              <TrendingUp size={20} className="text-black" />
            </div>
            <div>
              <h3 className="text-white font-semibold">Ready to Start Investing?</h3>
              <p className="text-gray-400 text-sm">Join thousands of successful investors</p>
            </div>
            <Link to="user/login" className="px-6 py-2 bg-gradient-to-r from-amber-500 to-yellow-600 text-black font-semibold rounded-lg hover:from-amber-400 hover:to-yellow-500 transition-all duration-200">
              Get Started
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
