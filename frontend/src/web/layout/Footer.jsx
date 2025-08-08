import { Facebook, Twitter, Linkedin } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

const socialLinks = [
  { icon: <Facebook size={16} />, id: "https://facebook.com" },
  { icon: <Twitter size={16} />, id: "https://twitter.com" },
  { icon: <Linkedin size={16} />, id: "https://linkedin.com" },
  {
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        viewBox="0 0 24 24"
      >
        <path d="M12 2C6.5 2 2 6.5 2 12c0 4.2 2.6 7.9 6.4 9.4-.1-.8-.2-2 0-2.9.2-.8 1.3-5 1.3-5s-.3-.6-.3-1.6c0-1.5.9-2.6 2-2.6.9 0 1.4.7 1.4 1.5 0 .9-.6 2.3-.9 3.5-.3 1.1.5 1.9 1.6 1.9 1.9 0 3.2-2.4 3.2-5.3 0-2.2-1.5-3.8-4.2-3.8-3 0-4.8 2.3-4.8 4.8 0 .9.3 1.5.7 2 .1.1.1.2.1.3-.1.3-.2 1-.2 1.1-.1.2-.2.3-.4.2-1.4-.6-2-2.2-2-4 0-2.9 2.4-6.4 7.3-6.4 3.9 0 6.4 2.8 6.4 5.8 0 4-2.2 6.9-5.5 6.9-1.1 0-2.1-.6-2.5-1.3 0 0-.6 2.2-.7 2.6-.2.8-.7 1.8-1.1 2.4.9.3 1.9.4 2.9.4 5.5 0 10-4.5 10-10S17.5 2 12 2z" />
      </svg>
    ),
    id: "https://github.com",
  },
];

const importantLinks = [
  { label: "Home", id: "home" },
  { label: "About us", id: "about" },
  { label: "Contact", id: "contact" },
];

export default function Footer() {
  const [activeSection, setActiveSection] = useState("home");

  const scrollToSection = (id) => {
    const section = document.getElementById(id);
    if (section) {
      section.scrollIntoView({ behavior: "smooth", block: "start" });
      setActiveSection(id);
    }
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute("id");
            setActiveSection(id);
          }
        });
      },
      { threshold: 0.6 }
    );

    importantLinks.forEach((link) => {
      const el = document.getElementById(link.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <footer className="bg-[#192623] text-white w-full">
      <div className="container mx-auto px-4 pt-14">
        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-4">
          {/* About Us */}
          <div>
            <h3 className="text-lg font-semibold mb-4 relative">
              ABOUT US
              <span className="absolute bottom-[-8px] left-0 w-16 h-1 bg-gradient-to-r from-[#6da94c] to-green-700"></span>
            </h3>
            <p className="text-gray-200 mt-6 text-sm leading-relaxed">
              UniMeta is a smart trading platform that helps you earn daily
              profits through automated crypto arbitrage — no experience needed.
            </p>
            <div className="flex mt-6 space-x-3">
              {socialLinks.map((item, index) => (
                <a
                  key={index}
                  href={item.id}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 border border-gray-700 flex items-center justify-center rounded-full hover:bg-gradient-to-br from-[#6da94c] to-green-700 hover:text-black transition duration-300"
                >
                  {item.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Important Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4 relative">
              IMPORTANT LINKS
              <span className="absolute bottom-[-8px] left-0 w-16 h-1 bg-gradient-to-r from-[#6da94c] to-green-700"></span>
            </h3>
            <ul className="space-y-3 mt-6">
              {importantLinks.map((link, index) => (
                <li
                  key={index}
                  className="flex items-center group cursor-pointer"
                >
                  <span className="text-[#6da94c] mr-2">—</span>
                  <Link
                    to="#"
                    onClick={(e) => {
                      e.preventDefault();
                      scrollToSection(link.id);
                    }}
                    className={`text-gray-200 group-hover:text-white text-sm transition duration-300 group-hover:translate-x-1 ${
                      activeSection === link.id
                        ? "text-[#a5e881] font-semibold"
                        : ""
                    }`}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Address */}
          <div>
            <h3 className="text-lg font-semibold mb-4 relative">
              ADDRESS LOCATION
              <span className="absolute bottom-[-8px] left-0 w-16 h-1 bg-gradient-to-r from-[#6da94c] to-green-700"></span>
            </h3>
            <div className="space-y-2 mt-6 text-sm text-gray-200">
              <p>
                One Canada Square, Canary Wharf, London, E14 5AB, United Kingdom
              </p>
              <p>
                Email:{" "}
                <a
                  href="mailto:info@flexogain.com"
                  className="hover:text-white"
                >
                  info@unimeta.biz
                </a>
              </p>
            </div>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-lg font-semibold mb-4 relative">
              NEWSLETTER
              <span className="absolute bottom-[-8px] left-0 w-16 h-1 bg-gradient-to-r from-[#6da94c] to-green-700"></span>
            </h3>
            <p className="text-gray-200 mt-6 text-sm">
              You will be notified when something new appears.
            </p>
            <form className="mt-4 flex flex-col sm:flex-row gap-2">
              <input
                type="email"
                required
                placeholder="Email Address *"
                className="bg-[#1c1c1c] text-white p-2 flex-grow outline-none text-sm rounded-md border border-gray-400 placeholder-gray-300"
              />
              <button
                type="submit"
                className="bg-gradient-to-br from-[#4c832e] to-[#56a52c] p-2 rounded-md hover:opacity-90 transition"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="text-red-100"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M22 2L11 13"></path>
                  <path d="M22 2L15 22L11 13L2 9L22 2Z"></path>
                </svg>
              </button>
            </form>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="mt-12 py-4 border-t border-gray-300 flex flex-col md:flex-row justify-between items-center text-gray-200 text-sm gap-2">
          <div>Unimeta © 2025. All rights reserved.</div>
          <div className="flex gap-2">
            <Link to="/privacy" className="hover:text-[#6da94c] transition">
              Privacy
            </Link>
            <span className="mx-1">•</span>
            <Link to="/terms" className="hover:text-[#6da94c] transition">
              Terms of Use
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
