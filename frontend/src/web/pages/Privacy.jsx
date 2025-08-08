import React from 'react';
import { Shield, Lock, Eye, UserCheck, Database, AlertCircle, Home } from 'lucide-react';
import { Link } from "react-router-dom";
const pages = [{ name: "Privacy", href: "/privacy", current: false }];
import Header from '../layout/Header';
import Footer from '../layout/Footer';

const Privacy = () => {
  const privacyFeatures = [
    {
      icon: <Shield className="w-8 h-8 text-blue-600" />,
      title: "Data Protection",
      description: "Your personal information is encrypted and stored securely using industry-standard protocols."
    },
    {
      icon: <Lock className="w-8 h-8 text-green-600" />,
      title: "Secure Transmission",
      description: "All data transfers are protected with SSL encryption and secure communication channels."
    },
    {
      icon: <Eye className="w-8 h-8 text-purple-600" />,
      title: "Transparency",
      description: "We maintain complete transparency about what data we collect and how it's used."
    },
    {
      icon: <UserCheck className="w-8 h-8 text-orange-600" />,
      title: "User Control",
      description: "You have full control over your data with options to modify, export, or delete at any time."
    },
    {
      icon: <Database className="w-8 h-8 text-indigo-600" />,
      title: "Minimal Collection",
      description: "We only collect data that's absolutely necessary for providing our services."
    },
    {
      icon: <AlertCircle className="w-8 h-8 text-red-600" />,
      title: "Incident Response",
      description: "Immediate notification and response protocols in case of any security incidents."
    }
  ];

  return (
    <>
    <Header/>
        <div className="relative px-6 bg-black isolate  lg:px-8">
        <div className="max-w-2xl py-5 mx-auto sm:py-20 ">
          <div className="text-center">
            <h2 className="text-4xl font-semibold tracking-tight text-[#7db65e]  text-balance sm:text-4xl">
            Privacy <span className="text-red-400">Policy</span>
            </h2>
            <p className="mt-4 text-base font-medium text-gray-400 text-pretty ">
              
              At Unimeta, we value your privacy and are committed to protecting your personal data. 
              This Privacy Policy explains how we collect, use, and safeguard your information.
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
    <section className="py-12 bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-7xl mx-auto ">
        <div className="bg-white rounded-md   border border-gray-100 mb-4">
          <h3 className="text-3xl font-bold p-6 bg-gradient-to-br from-[#f1ffea] to-[#f7f7f7] border-b border-gray-200 text-gray-900 ">How We Protect <span className="text-red-500"> Your Privacy </span></h3>
          <div className="sm:space-y-6">
            {privacyFeatures.map((feature, index) => (
              <div key={index} className="sm:flex items-center  p-4 sm:p-6  hover:bg-red-50 transition-colors duration-200">
                <div className="flex-shrink-0 mr-4 mb-4 sm:mb-0">
                  {feature.icon}
                </div>
                <div>
                  <h4 className="text-lg text-justify font-semibold text-gray-900">
                    {feature.title}
                  </h4>
                  <p className="text-gray-600 text-justify font-medium leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-md sm:p-8 p-4  border border-gray-100">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-3xl font-bold text-gray-900 mb-6">
                Our Privacy Commitment
              </h3>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-red-600 rounded-full mt-3 mr-4 flex-shrink-0"></div>
                  <p className="text-gray-700 ">
                    <span className="text-gray-900  font-semibold">No selling of personal data:</span> We never sell your personal information to third parties.
                  </p>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-red-600 rounded-full mt-3 mr-4 flex-shrink-0"></div>
                  <p className="text-gray-700">
                     <span className="text-gray-900  font-semibold">GDPR & CCPA compliant:</span> We follow international privacy standards and regulations.
                  </p>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-red-600 rounded-full mt-3 mr-4 flex-shrink-0"></div>
                  <p className="text-gray-700">
                   <span className="text-gray-900  font-semibold">Regular security audits:</span> Our systems undergo regular third-party security assessments.
                  </p>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-red-600 rounded-full mt-3 mr-4 flex-shrink-0"></div>
                  <p className="text-gray-700">
                     <span className="text-gray-900  font-semibold">Data portability:</span> Export your data anytime in standard formats.
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-[#f1ffea] to-[#f7f7f7] rounded-xl p-4 sm:p-8">
              <h4 className="text-2xl font-semibold text-gray-900 mb-4">
                Questions About Privacy?
              </h4>
              <p className="text-gray-600 mb-6">
                Our privacy team is here to help. Get in touch if you have any questions about how we handle your data.
              </p>
              <div className="space-y-3">
                <button className="w-full bg-[#7db65e] hover:bg-[#6da94c] text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200">
                  Read Full Privacy Policy
                </button>
                <button className="w-full bg-white hover:bg-red-50 text-red-600 font-semibold py-3 px-6 rounded-lg border-2 border-red-600 transition-colors duration-200">
                  Contact Privacy Team
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
    <Footer/>
    </>
  );
};

export default Privacy;