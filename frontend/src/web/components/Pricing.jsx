import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";
import {
  Check,
  Star,
  Crown,
  Zap,
  Sparkles,
  TrendingUp,
} from "lucide-react";

const pricingPlans = [
  {
    name: "Starter Plan",
    price: "$50",
   "Daily-Capping": "2x",
   Roi: "2x",
    popular: false,
    icon: Zap,
    // features: [
    //   "Basic Tools",
    //   "Email Support",
    //   "Community Access",
    //   "5 Projects",
    //   "10GB Storage",
    // ],
    description: "Entry-level access to automated trading. Ideal for beginners.",
  },
  {
    name: "Pro",
    price: "$100",
   "Daily-Capping": "2x",
   Roi: "2x",
    popular: true,
    icon: Star,
    // features: [
    //   "Advanced Analytics",
    //   "Priority Email Support",
    //   "Private Group",
    //   "Unlimited Projects",
    //   "100GB Storage",
    // ],
    description: "Enhanced bot performance and daily profit tracking.",
  },
  {
    name: "Team",
      price: "$250",
   "Daily-Capping": "2x",
   Roi: "2x",
    popular: false,
    icon: TrendingUp,
    // features: [
    //   "Team Management",
    //   "Shared Dashboards",
    //   "All Pro Features",
    //   "Team Collaboration",
    //   "500GB Storage",
    // ],
    description: "Faster trade execution and higher return potential."
  },
  {
    name: "Business",
    price: "$500",
   "Daily-Capping": "2x",
   Roi: "2x",
    popular: false,
    icon: Crown,
    // features: [
    //   "Custom Integrations",
    //   "Dedicated Manager",
    //   "Team Training",
    //   "Advanced Security",
    //   "1TB Storage",
    // ],
    description: "Priority trading slots, faster withdrawals, and support."
  },
  {
    name: "Enterprise",
   price: "$1000",
   "Daily-Capping": "2x",
   Roi: "2x",
    popular: false,
    icon: Sparkles,
    // features: [
    //   "Unlimited Access",
    //   "24/7 Support",
    //   "Custom Solutions",
    //   "White Labeling",
    //   "Unlimited Storage",
    // ],
    description: "Full access to all features, maximum earning potential."
  },
];

export default function Pricing() {
  return (
    <section className="bg-white py-20 px-4 sm:px-8 lg:px-12">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-red-50 text-red-600 px-6 py-2 rounded-full text-sm font-medium mb-3 shadow">
            <Star className="w-4 h-4" />
            Choose Your Perfect Plan
          </div>
          <h2 className="text-4xl font-bold text-gray-900">Pricing Plans</h2>
          <p className="text-gray-700 font-medium text-lg max-w-3xl mx-auto">
            Choose a plan that fits your budget. All packages include full access to our automated arbitrage system with daily profit potential.
          </p>
        </div>

        {/* Swiper */}
        <Swiper
  modules={[Autoplay]}
  autoplay={{
    delay: 3000,
    disableOnInteraction: false,
  }}
  slidesPerView="auto"
  spaceBetween={20}
  className="pricing-swiper pb-16"
>
  {pricingPlans.map((plan, idx) => {
    const Icon = plan.icon;
    return (
      <SwiperSlide
        key={idx}
        className="!w-[280px] sm:!w-[300px] md:!w-[320px] lg:!w-[340px] xl:!w-[360px]"
      >
        <div className="group h-full">
          <div className="relative rounded-xl shadow-md border border-gray-200 p-6 bg-white text-gray-800 h-full">
            {/* Icon */}
            <div
              className={`w-16 h-16 rounded-2xl mb-6 flex items-center justify-center ${
                plan.popular
                  ? "bg-red-600 text-white"
                  : "bg-red-100 text-red-500"
              }`}
            >
              <Icon className="w-8 h-8" />
            </div>

            {/* Title */}
            <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>

            {/* Description */}
            <p className="text-sm text-gray-500 mb-6">
              {plan.description}
            </p>

            {/* Price */}
            <div className="mb-6">
              <span className="text-4xl font-extrabold">
                {plan.price}
              </span>
              <span className="text-base text-gray-400">
                /{plan.period}
              </span>
            </div>

            {/* Features */}
            {/* <ul className="space-y-4 mb-6">
              {plan.features.map((feature, i) => (
                <li key={i} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-red-100 text-red-500 flex items-center justify-center">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-sm text-gray-700">{feature}</span>
                </li>
              ))}
            </ul> */}

            {/* CTA Button */}
            <button
              className={`w-full py-3 rounded-xl font-semibold transition-all ${
                plan.popular
                  ? "bg-red-600 text-white hover:bg-red-700"
                  : "bg-red-100 text-red-600 hover:bg-red-200"
              }`}
            >
              {plan.popular ? "Get Started Now" : "Choose Plan"}
            </button>
          </div>
        </div>
      </SwiperSlide>
    );
  })}
</Swiper>

      </div>

      {/* Optional Custom Styling */}
      <style jsx>{`
        .pricing-swiper {
          position: relative;
        }

        .pricing-swiper .swiper-pagination {
          display: none;
        }
      `}</style>
    </section>
  );
}
