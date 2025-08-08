import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaBars, FaTimes } from "react-icons/fa";

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("home");

  const sectionIds = [
    "home",
    "about",
    "process",
    "trading",
    "contact",
  ];

  const scrollToSection = (id) => {
    setActiveSection(id);
    const section = document.getElementById(id);
    if (section) {
      section.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    setIsOpen(false);
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

    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const navLinks = [
    { name: "Home", route: "/" },
    { name: "About", id: "about" },
    { name: "Process", id: "process" },
    { name: "Trading", id: "trading" },
    { name: "Contact", id: "contact" },
  ];

  return (
    <>
      <header className="fixed top-0 left-0 w-full z-50 bg-[#293331] shadow-md">
        <div className="max-w-7xl mx-auto px-4  flex justify-between items-center">
          <Link to="/" className="text-white text-xl font-bold">
            <img src="/logo.png" className="w-20"/>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-white font-medium">
            {navLinks.map((link) =>
              link.route ? (
                <Link
                  key={link.name}
                  to={link.route}
                  onClick={() => setActiveSection("home")}
                  className={`cursor-pointer transition px-2 py-1 rounded ${
                    activeSection === "home"
                      ? "text-[#a5e881] font-semibold"
                      : "hover:text-[#7db65e]"
                  }`}
                >
                  {link.name}
                </Link>
              ) : (
                <Link
                  key={link.id}
                  to="#"
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToSection(link.id);
                  }}
                  className={`cursor-pointer transition px-2 py-1 rounded ${
                    activeSection === link.id
                      ? "text-[#a5e881] font-semibold"
                      : "hover:text-[#7db65e]"
                  }`}
                >
                  {link.name}
                </Link>
              )
            )}

            <Link
              to="/registration"
              className={`bg-[#7db65e] hover:bg-[#6da94c] text-white font-semibold py-2 px-4 rounded ${
                activeSection === "registration" ? "ring-2 ring-white" : ""
              }`}
            >
              Sign Up
            </Link>

            <Link
              to="/login"
              className={`bg-[#7db65e] hover:bg-[#6da94c] text-white font-semibold py-2 px-4 rounded ${
                activeSection === "login" ? "ring-2 ring-white" : ""
              }`}
            >
              Login
            </Link>
          </nav>
          <div className="md:hidden text-white text-2xl">
            <button onClick={() => setIsOpen(true)}>
              <FaBars />
            </button>
          </div>
        </div>
        {isOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-90 z-50">
            <div className="fixed top-0 left-0 w-64 h-full bg-[#1f2524] shadow-lg p-4">
              <button
                className="text-2xl text-[#7db65e] absolute top-2 right-2"
                onClick={() => setIsOpen(false)}
              >
                <FaTimes />
              </button>
              <nav className="mt-12 flex flex-col gap-4 text-white">
                {navLinks.map((link) =>
                  link.route ? (
                    <Link
                      key={link.name}
                      to={link.route}
                      onClick={() => setActiveSection("home")}
                      className={`cursor-pointer transition px-2 py-1 rounded ${
                        activeSection === "home"
                          ? "text-[#a5e881] font-bold"
                          : "hover:text-[#7db65e]"
                      }`}
                    >
                      {link.name}
                    </Link>
                  ) : (
                    <Link
                      key={link.id}
                      to="#"
                      onClick={(e) => {
                        e.preventDefault();
                        scrollToSection(link.id);
                      }}
                      className={`cursor-pointer transition px-2 py-1 rounded ${
                        activeSection === link.id
                          ? "text-[#a5e881] font-semibold"
                          : "hover:text-[#7db65e]"
                      }`}
                    >
                      {link.name}
                    </Link>
                  )
                )}

                <div className="flex gap-3">
                  <Link
                    to="/registration"
                    className={`bg-[#7db65e] w-full text-center hover:bg-[#6da94c] text-white font-semibold py-2 px-4 rounded ${
                      activeSection === "registration"
                        ? "ring-2 ring-white"
                        : ""
                    }`}
                  >
                    Sign Up
                  </Link>

                  <Link
                    to="/login"
                    className={`bg-[#7db65e] w-full text-center hover:bg-[#6da94c] text-white font-semibold py-2 px-4 rounded ${
                      activeSection === "login" ? "ring-2 ring-white" : ""
                    }`}
                  >
                    Login
                  </Link>
                </div>
              </nav>
            </div>
          </div>
        )}
      </header>
      <div className="h-[65px]"></div>
    </>
  );
};

export default Header;
