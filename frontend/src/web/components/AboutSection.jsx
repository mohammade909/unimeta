import React from "react";
import { Users, Clock, Award } from "lucide-react";
import { motion } from "framer-motion";

export default function About() {
  const featureVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.3,
        duration: 0.6,
        type: "spring",
      },
    }),
  };

  const features = [
    {
      Icon: Users,
      title: "Built for Beginners",
      desc: "No trading knowledge needed — our bots handle everything.",
    },
    {
      Icon: Clock,
      title: "Safe & Transparent System",
      desc: "We work with trusted exchanges and real-time data tracking.",
    },
    {
      Icon: Award,
      title: "Daily Profits, 100% Automated",
      desc: "Our smart bots scan markets 24/7 for the best arbitrage opportunities.",
    },
  ];
  return (
    <section
      id="about"
      className="bg-white text-gray-800 p-4 px-4 sm:px-6 lg:px-8 overflow-hidden"
    >
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-2 items-center">
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="w-full"
        >
          <div
            className="relative overflow-hidden bg-cover bg-center"
            style={{ backgroundImage: "url('/img11.png')" }}
          >
            <img
              src="/img10.png"
              alt="Digital investment platform"
              className="w-full object-cover p-12"
            />
          </div>
        </motion.div>

        {/* Right Content */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="space-y-4"
        >
          <span className="text-sm font-semibold tracking-wider uppercase text-red-600">
            About Us
          </span>

          <h2 className="text-3xl md:text-4xl font-bold leading-tight text-gray-900">
            Who We Are and{" "}
            <span className="text-red-600">What We Do</span>
          </h2>

          <p className="text-gray-600 text-base font-medium leading-relaxed text-justify">
            At UniMeta, we believe everyone should have access to smart, stress-free crypto trading. Our platform uses advanced arbitrage technology to help users earn daily profits automatically — with no trading experience, no complicated tools, and no guesswork.
          </p>

          <div className="space-y-6">
            {features.map(({ Icon, title, desc }, i) => (
              <motion.div
                key={i}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={featureVariants}
                className="flex items-start space-x-4"
              >
                <div className="bg-red-100 p-2 rounded-xl shadow-md">
                  <Icon className="text-red-600 w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-gray-800 font-semibold text-base">
                    {title}
                  </h4>
                  <p className="text-gray-600 text-sm">{desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
