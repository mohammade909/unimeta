import { Bell, User, LogOut, ChevronDownIcon } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { Link, useLocation } from "react-router-dom";
import {
  selectAdmin,
  selectUser,
  resetUserAuth,
  resetAdminAuth,
} from "../../store/slices/authSlice";
import { useWallet } from "../../hooks/useWallet";
import { useEffect, useState, useRef } from "react";
import WalletCard from "../common/WalletCard";
import NotificationBell from "../features/shared/NotificationBell";
import Breadcrumb from "../common/Breadcrumb";
// import CountdownButton from "../common/CountdownButton";
import { useProfile } from "../../hooks/useUserApi";

// import CountdownTimer from "../common/CountdownButton";
const Header = ({ isSidebarOpen, onToggleMobileMenu, isMobileMenuOpen }) => {
  const dispatch = useDispatch();
   const { profile, fetchProfile, updateProfileData, loading } = useProfile();
  const admin = useSelector(selectAdmin);
  const location = useLocation();
  const { userWallet, getUserWallet } = useWallet();

  const isAdminPath = location.pathname.includes("/admin");
  const currentUser = isAdminPath ? admin : profile;
  const showWalletCards = !isAdminPath;
  const [isOpen, setIsOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (!isAdminPath) {
      getUserWallet();
    }
  }, [isAdminPath, getUserWallet]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    if (isAdminPath) {
      dispatch(resetAdminAuth());
    } else {
      dispatch(resetUserAuth());
    }
  };

  const walletInfo = [
    {
      title: "Active Wallet",
      amount: userWallet?.main_balance ?? 0,
      gradient: "from-green-400 to-blue-500",
    },
    {
      title: "ROI Wallet",
      amount: userWallet?.roi_balance ?? 0,
      gradient: "from-purple-500 to-pink-500",
    },
    {
      title: "Total Earned",
      amount: userWallet?.total_earned ?? 0,
      gradient: "from-yellow-400 to-orange-500",
    },
  ];

  return (
    <header className="shadow-sm bg-[#1E2328] border-b border-gray-700 h-16 flex items-center justify-between px-4 lg:px-6 text-white">
      <Breadcrumb user={profile} />
      {/* <CountdownTimer/> */}
      <div className="flex items-center md:hidden">
        <button
          onClick={onToggleMobileMenu}
          className="text-[#4abd0b] hover:text-white p-2"
          aria-label="Toggle mobile menu"
        >
          {isMobileMenuOpen ? (
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          ) : (
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          )}
        </button>
      </div>
      <div className="flex items-center space-x-4 ml-auto relative">
        {showWalletCards && (
          <>
            {/* Desktop View: Grid */}
            <div className="hidden lg:block">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {walletInfo.map((item, index) => (
                  <WalletCard key={index} {...item} />
                ))}
              </div>
            </div>

            {/* Mobile View: Dropdown */}
            <div className="block relative lg:hidden px-2">
              <button
                className="flex items-center gap-2 pl-4 pr-2 py-2 rounded-md font-semibold text-white backdrop-blur-md border border-white/20 bg-gradient-to-br from-yellow-400/60 to-yellow-500/80 shadow-lg hover:shadow-xl transition-all duration-300"
                onClick={() => setIsOpen(!isOpen)}
              >
                Wallet
                <ChevronDownIcon
                  className={`h-5 w-5 transform transition-transform duration-300 ${
                    isOpen ? "rotate-180" : "rotate-0"
                  }`}
                />
              </button>

              {isOpen && (
                <div className="mt-2 absolute min-w-44 overflow-y-auto bg-black/70 backdrop-blur-md border border-white/10 rounded-md p-2 space-y-3 shadow-xl z-50">
                  {walletInfo.map((item, index) => (
                    <div
                      key={index}
                      className="transition-all duration-300 hover:scale-[1.02] hover:shadow-md rounded-lg"
                    >
                      <WalletCard {...item} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {isAdminPath && (
          <div className="hidden sm:block">
            <div className="px-3 py-1 bg-[#4abd0b]/10 text-[#4abd0b] rounded-full text-sm font-semibold">
              Admin Panel
            </div>
          </div>
        )}
        <button className="relative p-2 text-[#4abd0b] hover:text-white transition">
          <NotificationBell />
        </button>
        <div className="relative" ref={dropdownRef}>
          <div
            className="flex items-center space-x-3 cursor-pointer"
            onClick={() => setShowDropdown((prev) => !prev)}
          >
            <div className="hidden sm:block text-right">
              <p className="text-sm font-semibold text-white">
                {currentUser?.full_name || currentUser?.name}
              </p>
              <p className="text-xs text-[#4abd0b]">
                {isAdminPath ? "Administrator" : currentUser?.role}
              </p>
            </div>
            <div className="w-8 h-8 bg-[#4abd0b]/20 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
          </div>

          {showDropdown && (
            <div className="absolute right-0 mt-2 w-40 bg-[#2B2F36] border border-[#4abd0b]/30 rounded-md shadow-lg z-50">
              <Link
                to="/user/profile"
                className="flex items-center w-full px-4 py-2 text-sm text-white hover:bg-[#4abd0b]/10"
              >
                <span className="w-4 h-4 mr-2 text-[#4abd0b]">👤</span>
                Profile
              </Link>

              <button
                onClick={handleLogout}
                className="flex items-center w-full px-4 py-2 text-sm text-white hover:bg-[#4abd0b]/10"
              >
                <LogOut className="w-4 h-4 mr-2 text-[#4abd0b]" />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
