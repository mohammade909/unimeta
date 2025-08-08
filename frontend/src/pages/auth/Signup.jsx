import React, { useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import { selectIsAuthenticated } from "../../store/slices/authSlice";
import SignupForm from "../../components/features/auth/SignupForm";
import Header from "../../web/layout/Header";
import Footer from "../../web/layout/Footer";
import { useState } from "react";

const Signup = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthenticated = useSelector(selectIsAuthenticated);

  // Get referral code from URL parameters
  const searchParams = new URLSearchParams(location.search);
  const referralCode = searchParams.get("ref") || searchParams.get("referral");
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640); // Tailwind's 'sm' is 640px
    };

    handleResize(); // Set on mount
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);
  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Handle successful signup
  const handleSignupSuccess = (userData) => {
    navigate(`/${userData.user?.role}/dashboard`);
    // Show success message and redirect after a brief delay
    // setTimeout(() => {
    //   if (userData.user?.status === 'inactive') {
    //     // If user needs email verification
    //     navigate('/verify-email', {
    //       state: {
    //         email: userData.user.email,
    //         message: 'Please check your email to verify your account.'
    //       }
    //     });
    //   } else {
    //     // Direct login success
    //     navigate(`${userData?.role}/dashboard`);
    //   }
    // }, 1500);
  };
    const backgroundImage = "/hero.jpg";

  return (
    <>
    <Header/>
       <div
      className="relative flex items-center justify-end text-white sm:p-8 py-8 px-4 bg-center bg-cover bg-black"
      style={{ backgroundImage: isMobile ? 'none' : `url(${backgroundImage})` }}
    >
        <div className="absolute inset-0 bg-black opacity-10" />
        <div className="max-w-lg w-full  sm:mx-0 relative   sm:px-4 ">
          <div className=" items-center">
            {/* Left Side - Content */}
            {/* <div className="lg:block hidden lg:pr-8">
              <div className="max-w-md mx-auto lg:max-w-none">
                <h1 className="text-4xl lg:text-5xl font-bold text-yellow-100 mb-6">
                  Join thousands building their future
                </h1>

                <p className="text-lg text-gray-300 mb-8">
                  Create your account today and start your journey with our
                  platform. Get access to exclusive features and join a thriving
                  community.
                </p>

                <div className="space-y-4 mb-8">
                  {[
                    "Free account setup",
                    "Access to premium features",
                    "24/7 customer support",
                    "Referral rewards program",
                  ].map((feature, i) => (
                    <div key={i} className="flex items-center space-x-3">
                      <div className="w-6 h-6 bg-yellow-200/20 rounded-full flex items-center justify-center">
                        <svg
                          className="w-3 h-3 text-yellow-400"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      <span className="text-yellow-200">{feature}</span>
                    </div>
                  ))}
                </div>

                {referralCode && (
                  <div className="bg-yellow-800/20 border border-yellow-600 rounded-lg p-4 mb-6">
                    <div className="flex items-center space-x-2">
                      <svg
                        className="w-5 h-5 text-yellow-400"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="text-green-300 font-medium">
                        You've been referred!
                      </span>
                    </div>
                    <p className="text-yellow-200 text-sm mt-1">
                      Complete your registration to unlock special referral
                      bonuses.
                    </p>
                  </div>
                )}

                <div className="bg-gray-900 rounded-lg p-6 border-l-4 border-yellow-500">
                  <blockquote className="text-gray-300 italic mb-3">
                    "This platform completely transformed how I manage my
                    workflow. The design is clean and the tools are powerful."
                  </blockquote>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-yellow-600/30 rounded-full flex items-center justify-center">
                      <span className="text-green-300 font-semibold text-sm">
                        JD
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-yellow-100">John Doe</p>
                      <p className="text-sm text-yellow-400">Product Manager</p>
                    </div>
                  </div>
                </div>
              </div>
            </div> */}

            <div className="">
              <div className="  bg-[#00390f00] backdrop-blur-md  border border-white/20 shadow-xl rounded-2xl ">
                <SignupForm
                  onSuccess={handleSignupSuccess}
                  initialReferralCode={referralCode}
                />
              </div>
            </div>
          </div>
        </div>
    </div>
    <Footer/>
    </>
  );
};

export default Signup;
