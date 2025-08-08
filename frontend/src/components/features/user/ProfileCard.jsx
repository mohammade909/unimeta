import React, { useState } from 'react';
import { Copy, Share2, Check, User, Gift, Star, Trophy } from 'lucide-react';
import { useSelector } from 'react-redux';

const ProfileCard = () => {
  const [copied, setCopied] = useState(false);
  const [showShareOptions, setShowShareOptions] = useState(false);
   
  // Sample user data - replace with actual user data
  const userData = {
    name: "Alex Johnson",
    email: "alex.johnson@email.com",
    phone: "+1 (555) 123-4567",
    memberSince: "January 2024",
    referralCode: "ALEX2024REF",
    totalReferrals: 12,
    rewardsEarned: 250,
    level: "Gold Member"
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(userData.referralCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  const shareMessage = `🎉 Join me on this amazing platform! Use my referral code: ${userData.referralCode} and get exclusive benefits! 🚀`;

  const handleWhatsAppShare = () => {
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareMessage)}`;
    window.open(whatsappUrl, '_blank');
    setShowShareOptions(false);
  };

  const handleInstagramShare = () => {
    // Instagram doesn't support direct text sharing via URL, so we'll copy to clipboard
    navigator.clipboard.writeText(shareMessage);
    alert('Message copied to clipboard! You can paste it in Instagram.');
    setShowShareOptions(false);
  };

  return (
    <div className="max-w-md mx-auto bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 p-1 rounded-2xl shadow-2xl">
      <div className="bg-white rounded-xl p-6 space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800">{userData.name}</h2>
          <div className="flex items-center justify-center space-x-2 mt-2">
            <Trophy className="w-4 h-4 text-yellow-500" />
            <span className="text-sm font-medium text-gray-600">{userData.level}</span>
          </div>
        </div>

        {/* User Info */}
        <div className="space-y-3">
          <div className="flex items-center space-x-3">
            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
            <span className="text-gray-600 text-sm">{userData.email}</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
            <span className="text-gray-600 text-sm">{userData.phone}</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            <span className="text-gray-600 text-sm">Member since {userData.memberSince}</span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gradient-to-r from-purple-100 to-pink-100 p-3 rounded-lg text-center">
            <div className="text-2xl font-bold text-purple-600">{userData.totalReferrals}</div>
            <div className="text-xs text-gray-600">Total Referrals</div>
          </div>
          <div className="bg-gradient-to-r from-pink-100 to-red-100 p-3 rounded-lg text-center">
            <div className="text-2xl font-bold text-pink-600">{userData.rewardsEarned}</div>
            <div className="text-xs text-gray-600">Rewards Earned</div>
          </div>
        </div>

        {/* Referral Code Section */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-xl">
          <div className="flex items-center space-x-2 mb-3">
            <Gift className="w-5 h-5 text-purple-500" />
            <span className="font-semibold text-gray-800">Your Referral Code</span>
          </div>
          
          <div className="flex items-center space-x-2 mb-4">
            <div className="flex-1 bg-white p-3 rounded-lg border-2 border-dashed border-purple-300">
              <span className="font-mono text-lg font-bold text-purple-600 tracking-wider">
                {userData.referralCode}
              </span>
            </div>
            <button
              onClick={handleCopyCode}
              className="bg-purple-500 hover:bg-purple-600 text-white p-3 rounded-lg transition-colors duration-200"
            >
              {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
            </button>
          </div>

          {copied && (
            <div className="text-green-600 text-sm text-center mb-3">
              ✓ Referral code copied to clipboard!
            </div>
          )}

          {/* Share Button */}
          <div className="relative">
            <button
              onClick={() => setShowShareOptions(!showShareOptions)}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white py-3 px-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center space-x-2"
            >
              <Share2 className="w-5 h-5" />
              <span>Share Referral Code</span>
            </button>

            {/* Share Options */}
            {showShareOptions && (
              <div className="absolute top-full mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                <button
                  onClick={handleWhatsAppShare}
                  className="w-full p-3 text-left hover:bg-gray-50 flex items-center space-x-3 border-b border-gray-100"
                >
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">W</span>
                  </div>
                  <span className="text-gray-700">Share on WhatsApp</span>
                </button>
                <button
                  onClick={handleInstagramShare}
                  className="w-full p-3 text-left hover:bg-gray-50 flex items-center space-x-3"
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">I</span>
                  </div>
                  <span className="text-gray-700">Share on Instagram</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Close share options when clicking outside */}
        {showShareOptions && (
          <div 
            className="fixed inset-0 z-0" 
            onClick={() => setShowShareOptions(false)}
          ></div>
        )}
      </div>
    </div>
  );
};

export default ProfileCard;