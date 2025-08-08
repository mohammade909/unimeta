import React, { useState, useEffect } from "react";
import { TrendingUp, Shield, BarChart3 } from "lucide-react";
import { motion } from "framer-motion";

const Broker = () => {
  const [userCount, setUserCount] = useState(5000000);
  const [productCount, setProductCount] = useState(1000);

  useEffect(() => {
    const interval = setInterval(() => {
      setUserCount((prev) => prev + Math.floor(Math.random() * 5) + 1);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const features = [
    {
      icon: <Shield className="w-12 h-12 text-blue-500" />,
      title: "AI-Powered Trading Bots",
      description:
        "Our advanced bots automatically scan multiple crypto exchanges, spot price differences, and execute trades in real-time for maximum returns.",
    },
    {
      icon: <BarChart3 className="w-12 h-12 text-green-500" />,
      title: "24/7 Automated Trading",
      description:
        "No need to sit in front of charts. UniMeta works round-the-clock — even while you sleep — making sure you never miss a profit opportunity.",
    },
    {
      icon: <TrendingUp className="w-12 h-12 text-orange-500" />,
      title: "User-Friendly Dashboard",
      description:
        "Track your earnings, monitor trades, and manage your account with ease using our simple and intuitive dashboard — built for everyone.",
    },
  ];

  const wordAnimation = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const containerAnimation = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const stats = [
    {
      value: userCount.toLocaleString() + "+",
      label: "Registered Users",
      color: "purple",
      leftimg: "/img4.svg",
      rightimg: "/img4.svg",
    },
    {
      value: productCount + "+",
      label: "Products",
      color: "orange",
      leftimg: "/img5.svg",
      rightimg: "/img5.svg",
    },
    {
      value: "From 0.0 pips",
      label: "Spreads",
      color: "green",
      leftimg: "/img6.svg",
      rightimg: "/img6.svg",
    },
    {
      value: "$0",
      label: "Deposit Fees*",
      color: "blue",
      leftimg: "/img7.svg",
      rightimg: "/img7.svg",
    },
  ];

  const borderColorClasses = {
    purple: "border-purple-500",
    orange: "border-orange-500",
    green: "border-green-500",
    blue: "border-blue-500",
  };

  return (
    <div className="relative  min-h-screen overflow-hidden">
      {/* Background Image */}

      {/* Left & Right Gradient Overlays */}
      <div
        className="absolute top-0 bottom-0 left-0 w-[46px] z-10 pointer-events-none"
        style={{
          background:
            "linear-gradient(90deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0) 100%)",
        }}
      />
      <div
        className="absolute top-0 bottom-0 right-0 w-[46px] z-10 pointer-events-none"
        style={{
          background:
            "linear-gradient(270deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0) 100%)",
        }}
      />

      {/* Main Content */}
      <div className="relative z-20 container mx-auto px-6 py-16">
        {/* Header */}
        <div className="text-center mb-10 space-y-2">
          <div className="inline-flex items-center space-x-2">
            <img src="/img8.svg" className="w-8"/>
            <span className="text-[#a5e881] font-semibold text-sm tracking-wider uppercase">
              Features
            </span>
             <img src="/img9.svg" className="w-8"/>
          </div>

          <motion.h2
            className="text-4xl  font-bold text-white leading-tight flex-wrap justify-center gap-2"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, amount: 0.5 }}
            variants={containerAnimation}
          >
           <div className="flex justify-center flex-wrap">
  <motion.span variants={wordAnimation}>Powerful </motion.span>
  <motion.span variants={wordAnimation}>&nbsp;</motion.span>
  <motion.span variants={wordAnimation}>Features </motion.span>
  <motion.span variants={wordAnimation}>&nbsp;</motion.span>
  <motion.span variants={wordAnimation}>That </motion.span>
  <motion.span variants={wordAnimation}>&nbsp;</motion.span>
  <motion.span variants={wordAnimation}>Drive</motion.span>
</div>
{" "}
            <motion.span
              className="text-red-500 block"
              variants={wordAnimation}
            >
                Your Profits
            </motion.span>
          </motion.h2>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-4 mb-4">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className="bg-white/5 backdrop-blur-md p-6 rounded-md border border-white/10 shadow-md space-y-4 transition hover:scale-[1.02]"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
            >
              <div className="w-14 h-14 flex items-center justify-center rounded-xl bg-[#394947] border border-white/20 shadow-sm p-2">
                {feature.icon}
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white mb-1">
                  {feature.title}
                </h3>
                <p className="text-basse text-white/80 text-justify leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => {
            const border = borderColorClasses[stat.color];
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false, amount: 0.3 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className={`relative rounded-md p-8 bg-white/5 backdrop-blur-md text-white border ${border} overflow-hidden shadow-md hover:shadow-xl transition-all`}
              >
                {/* Left Gradient */}
                <div
                  className="absolute top-0 bottom-0 left-0 w-[46px] pointer-events-none z-0"
                  style={{
                    background:
                      "linear-gradient(90deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0) 100%)",
                  }}
                />

                {/* Right Gradient */}
                <div
                  className="absolute top-0 bottom-0 right-0 w-[46px] pointer-events-none z-0"
                  style={{
                    background:
                      "linear-gradient(270deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0) 100%)",
                  }}
                />

                {/* Top Left Icon */}
                <div className="absolute top-4 left-4 z-10">
                  <img src={stat.leftimg} alt="left" className="w-8 h-8" />
                </div>

                {/* Top Right Icon */}
                <div className="absolute top-4 right-4 z-10">
                  <img src={stat.rightimg} alt="right" className="w-8 h-8" />
                </div>

                {/* Stat Content */}
                <div className="text-center flex flex-col justify-center h-full relative z-10">
                  <div className="text-3xl font-bold leading-[100%] mt-4 mb-2">
                    {stat.value}
                  </div>
                  <div className="text-white/70 text-base">{stat.label}</div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Broker;
