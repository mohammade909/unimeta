import React, { useState } from "react";
import { ChevronDown, ChevronUp, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const faqData = [
  {
    id: 1,
    question: "What is arbitrage trading?",
    answer:
      "Arbitrage trading is buying crypto from one exchange at a lower price and selling it on another at a higher price — UniMeta automates this for you to earn profits daily.",
  },
  {
    id: 2,
    question: "Do I need trading experience to use UniMeta?",
    answer:
      "Not at all. UniMeta is fully automated, so anyone can start earning without any trading knowledge.",
  },
  {
    id: 3,
    question: "How much can I earn daily?",
    answer:
      "Earnings depend on your selected package and market opportunities. Our system aims to deliver stable, low-risk daily returns.",
  },
  {
    id: 4,
    question: "Is my money safe with UniMeta?",
    answer:
      "Yes. We use secure technology and only work with trusted exchanges.",
  },
  {
    id: 5,
    question: "How do I get started?",
    answer:
      "Just sign up, choose a package, deposit funds, and activate your bot. That’s it — the system takes care of everything else.",
  },
  {
    id: 6,
    question: "Can I withdraw my profits anytime?",
    answer:
      "Yes, you can withdraw your available profits at any time. UniMeta gives you full control over your funds with no lock-in period.",
  },
  {
    id: 7,
    question: "Is there any referral program?",
    answer:
      "Yes, UniMeta offers a referral program where you can earn extra income by inviting others to join the platform.",
  },
];

const FAQSection = () => {
  const [visibleFaq, setVisibleFaq] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const toggleFaq = (id) => {
    setVisibleFaq((prev) => (prev === id ? null : id));
  };

  const filteredFaqs = faqData.filter(
    (faq) =>
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="inline-flex items-center space-x-2 mb-2">
          <img src="/img8.svg" className="w-8" alt="icon" />
          <span className="text-[#7db65e] font-semibold text-sm tracking-wider uppercase">
            Faq Section
          </span>
          <img src="/img9.svg" className="w-8" alt="icon" />
        </div>

        <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-800 mb-2">
          Frequently Asked{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-br from-red-400 to-red-500">
            Questions
          </span>
        </h2>

        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-10">
          <p className="text-gray-600 font-medium max-w-xl text-center sm:text-left">
            Got questions about UniMeta? We’ve answered the most common ones to help you get started with confidence.
          </p>

          <div className="relative w-full sm:w-80">
            <input
              type="text"
              placeholder="Search questions..."
              className="w-full bg-white text-gray-800 border border-gray-300 rounded-md pl-10 pr-4 py-2 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#7db65e] transition"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left Side Image */}
          <div className="lg:col-span-5">
            <img
              src="/faq.jpg"
              alt="FAQ Illustration"
              className="w-full object-cover"
            />
          </div>

          {/* FAQ List */}
          <div className="lg:col-span-7 space-y-4">
            {filteredFaqs.length > 0 ? (
              filteredFaqs.map((faq, index) => (
                <motion.div
                  key={faq.id}
                  className="bg-white rounded-md border shadow-sm border-gray-200 hover:border-[#7db65e] transition-all"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <div
                    onClick={() => toggleFaq(faq.id)}
                    className="flex justify-between items-center p-4 cursor-pointer"
                  >
                    <h3 className="font-semibold text-sm sm:text-base text-gray-800">
                      {faq.question}
                    </h3>
                    {visibleFaq === faq.id ? (
                      <ChevronUp className="w-5 h-5 text-[#7db65e]" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-500" />
                    )}
                  </div>
                  <AnimatePresence>
                    {visibleFaq === faq.id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.25 }}
                        className="px-4 pb-4 text-sm text-gray-600 overflow-hidden"
                      >
                        {faq.answer}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))
            ) : (
              <p className="text-gray-500 mt-4">No matching FAQ found.</p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
