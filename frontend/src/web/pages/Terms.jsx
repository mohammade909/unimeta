import { useState } from "react";
import Header from "../layout/Header";
import Footer from "../layout/Footer";
import {
  ChevronDown,
  FileText,
  BookOpen,
  ShieldCheck,
  Briefcase,
  Scale,
  Clock,
  AlertCircle,
  Home
} from "lucide-react";
import { Link } from "react-router-dom";
const pages = [{ name: "Terms & Conditions", href: "/terms", current: false }];
const Terms = () => {
  const [activeSection, setActiveSection] = useState("introduction");
  const [openAccordion, setOpenAccordion] = useState("");

  const toggleAccordion = (id) => {
    setOpenAccordion(openAccordion === id ? "" : id);
  };

  const sections = [
    {
      id: "introduction",
      title: "Introduction",
      icon: <BookOpen className="w-5 h-5" />,
      content:
        "These terms govern your use of the Finoty platform and its services. By accessing or using our site, you agree to follow these terms.",
    },
    {
      id: "userAgreement",
      title: "User Agreement",
      icon: <FileText className="w-5 h-5" />,
      content:
        "When you register or use Finoty, you enter into a legal agreement with us. You must be at least 18 years old and agree to use the platform lawfully.",
    },
    {
      id: "userResponsibilities",
      title: "User Responsibilities",
      icon: <ShieldCheck className="w-5 h-5" />,
      content:
        "You’re responsible for keeping your account secure and providing accurate information. Any misuse, fraud, or illegal activity may lead to account suspension.",
    },
    {
      id: "intellectualProperty",
      title: "Intellectual Property",
      icon: <Briefcase className="w-5 h-5" />,
      content:
        "All content, branding, and features on Finoty belong to us and are protected by law. You may not copy, share, or modify any materials without permission.",
    },
    {
      id: "disputeResolution",
      title: "Dispute Resolution",
      icon: <Scale className="w-5 h-5" />,
      content:
        "If any issue arises, we aim to resolve it fairly through communication or legal mediation. All disputes will be handled under applicable local laws.",
    },
    {
      id: "termination",
      title: "Termination",
      icon: <Clock className="w-5 h-5" />,
      content:
        "We may suspend or terminate your account if you violate our terms or misuse the platform. You can also choose to close your account at any time.",
    },
  ];

  const faqs = [
    {
      id: 1,
      question: "What is Finoty?",
      answer:
        "Finoty is a digital platform that helps people explore and earn through crypto, blockchain, and tokens — all in a simple and secure way.",
    },
    {
      id: 2,
      question: "Do I need any experience to use Finoty?",
      answer:
        "No, you don’t! Finoty is beginner-friendly and made for anyone who wants to start their journey in digital assets.",
    },
    {
      id: 3,
      question: "Is my money safe on Finoty?",
      answer:
        "Yes. We use advanced security systems to protect your funds and personal data at all times.",
    },
    {
      id: 4,
      question: "How do I start earning?",
      answer:
        "Just sign up, choose how you want to invest, and let your digital assets grow. We’ll guide you through every step.",
    },
    {
      id: 5,
      question: "Can I withdraw my earnings anytime?",
      answer:
        "Yes, you can withdraw your funds whenever you want. You stay in full control of your money.",
    },
  ];

  return (
    <>
      <Header />
       <div className="relative px-6 bg-black isolate  lg:px-8">
        <div className="max-w-2xl py-5 mx-auto sm:py-20 ">
          <div className="text-center">
            <h2 className="text-4xl font-semibold tracking-tight text-[#7db65e]  text-balance sm:text-4xl">
            Terms & <span className="text-red-400">Conditions</span>
            </h2>
            <p className="mt-4 text-base font-medium text-gray-300 text-pretty ">
              
              At Unimeta, we value your  Terms & Conditions and are committed to protecting your personal data. 
              This  Terms & Conditions explains how we collect, use, and safeguard your information.
            </p>
            <nav aria-label="Breadcrumb" className="flex justify-center mt-6">
              <ol
                role="list"
                className="flex space-x-4 rounded-md bg-gray-900 border border-white/20 px-6 shadow"
              >
                <li className="flex">
                  <div className="flex items-center">
                    <Link to="/" className="text-gray-200 hover:text-gray-300">
                      <Home
                        className="size-5 shrink-0"
                      />
                      <span className="sr-only">Home</span>
                    </Link>
                  </div>
                </li>
                {pages.map((page) => (
                  <li key={page.name} className="flex justify-center">
                    <div className="flex items-center justify-center">
                      <svg
                        fill="currentColor"
                        viewBox="0 0 24 44"
                        preserveAspectRatio="none"
                        aria-hidden="true"
                        className="h-full w-6 shrink-0 text-white/20"
                      >
                        <path d="M.293 0l22 22-22 22h1.414l22-22-22-22H.293z" />
                      </svg>
                      <Link
                        to={page.href}
                        aria-current={page.current ? "page" : undefined}
                        className="ml-4 text-sm font-medium text-gray-200 hover:text-gray-300"
                      >
                        {page.name}
                      </Link>
                    </div>
                  </li>
                ))}
              </ol>
            </nav>
          </div>
        </div>
      </div>
      <div className="min-h-screen bg-white text-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-12 flex flex-col lg:flex-row gap-6">
          {/* Sidebar */}
          <aside className="lg:w-1/4 w-full">
            <div className="sticky top-8 bg-gray-50 rounded-lg p-4 border border-gray-200 ">
              <h2 className="text-lg font-semibold mb-4 text-red-600">Contents</h2>
              <ul className="space-y-2">
                {sections.map((section) => (
                  <li key={section.id}>
                    <button
                      onClick={() => setActiveSection(section.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-all ${
                        activeSection === section.id
                          ? "bg-red-100 text-red-700 font-semibold"
                          : "hover:bg-gray-100 text-gray-600"
                      }`}
                    >
                      {section.icon}
                      <span>{section.title}</span>
                    </button>
                  </li>
                ))}
              </ul>

              <div className="mt-8 p-4 bg-red-50 rounded-lg border-l-4 border-red-500">
                <div className="flex items-center gap-2 text-red-600 mb-2">
                  <AlertCircle className="w-5 h-5" />
                  <h3 className="font-medium text-sm">Important Notice</h3>
                </div>
                <p className="text-xs text-gray-600">
                  These terms were last updated on May 1, 2025. Please review them regularly.
                </p>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="lg:w-3/4 w-full space-y-6">
            <div className="bg-gray-50 rounded-lg  p-6 border border-gray-200">
              {sections.map((section) => (
                <div
                  key={section.id}
                  className={`transition-opacity duration-300 ${
                    activeSection === section.id ? "block" : "hidden"
                  }`}
                >
                  <div className="flex items-center gap-3 mb-6 pb-4 border-b border-red-400">
                    <div className="p-2 bg-red-500 text-white rounded-md">{section.icon}</div>
                    <h2 className="text-xl font-bold text-red-600">{section.title}</h2>
                  </div>

                  <div className="text-sm space-y-6 text-gray-700">
                    <p>{section.content}</p>

                    <h3 className="font-semibold text-red-600">Key Information</h3>
                    <p>
                      By using our services, you acknowledge that you have read and agree to these terms.
                    </p>

                    {/* Points box */}
                    <div className="bg-white border border-red-300 rounded-xl p-6 shadow-sm">
                      <h4 className="font-semibold text-gray-800 mb-3">Important Highlights:</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                        <div className="bg-red-50 border border-red-200 p-3 rounded-md">
                          ✅ You must be 18+ or have parental consent
                        </div>
                        <div className="bg-red-50 border border-red-200 p-3 rounded-md">
                          🔐 You are responsible for your account security
                        </div>
                        <div className="bg-red-50 border border-red-200 p-3 rounded-md">
                          ❌ Unauthorized IP use is prohibited
                        </div>
                        <div className="bg-red-50 border border-red-200 p-3 rounded-md">
                          🔄 We may modify terms with notice
                        </div>
                      </div>
                    </div>

                    <h3 className="font-semibold text-red-600">Legal Framework</h3>
                    <p>
                      These Terms represent the full agreement. If any clause is invalid, the rest still applies.
                    </p>

                    <div className="pt-6 flex justify-between items-center border-t border-red-200">
                      <p className="text-xs text-gray-500">Effective Date: May 1, 2025</p>
                      <div className="flex gap-4">
                        <button className="text-red-600 hover:underline text-sm">Print Terms</button>
                        <button className="text-red-600 hover:underline text-sm">Download PDF</button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* FAQ Section */}
            <div className="bg-gray-50 rounded-lg  p-6  border border-gray-200">
              <h2 className="text-xl font-bold text-red-600 mb-6">Frequently Asked Questions</h2>
              <div className="space-y-4">
                {faqs.map((faq) => (
                  <div key={faq.id} className="rounded-lg border border-gray-200 shadow-sm">
                    <button
                      onClick={() => toggleAccordion(faq.id)}
                      className="w-full flex justify-between items-center p-4 bg-white text-left hover:bg-red-50 transition-colors rounded-t-lg"
                    >
                      <span className="text-sm font-medium text-gray-800">{faq.question}</span>
                      <ChevronDown
                        className={`w-5 h-5 text-red-500 transition-transform ${
                          openAccordion === faq.id ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                    {openAccordion === faq.id && (
                      <div className="p-4 text-sm text-gray-700 border-t border-gray-200">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </main>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Terms;
