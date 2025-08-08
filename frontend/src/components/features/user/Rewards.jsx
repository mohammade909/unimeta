import React from "react";
import { Trophy, Target, Clock, Gift, TrendingUp, Star, Loader2, Users } from "lucide-react";
import { useUserRewards } from "../../../hooks/useUserReward";

const RewardList = () => {
  const { rewards, bussiness, dashboard, stats, loading, error } = useUserRewards();
  
  console.log("Rewards Data:", bussiness);
  const getRewardTitle = (programId) => {
    const titles = {
      1: "First Milestone",
      2: "Ultimate Challenge"
    };
    return titles[programId] || `Reward Program ${programId}`;
  };

  const getRewardDescription = (programId) => {
    const descriptions = {
      1: "Complete your first 1,000 points to unlock exclusive rewards",
      2: "Master level achievement - reach 5,000 points for premium benefits"
    };
    return descriptions[programId] || "Complete this challenge to earn rewards";
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getDaysUntilExpiry = (expiryDate) => {
    const now = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'in_progress':
        return 'bg-blue-500';
      case 'completed':
        return 'bg-green-500';
      case 'expired':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getProgressBarColor = (percentage) => {
    if (percentage >= 80) return 'bg-green-400';
    if (percentage >= 50) return 'bg-yellow-400';
    return 'bg-blue-400';
  };

  // Get leg business data for progress calculation
  const getLegBusinessProgress = (reward) => {
    if (!bussiness?.legBusiness?.legs) {
      return {
        totalLegBusiness: 0,
        legs: [],
        percentage: 0,
        displayValue: 0
      };
    }

    const target = parseFloat(reward.required_target || 0);
    const totalLegBusiness = bussiness.legBusiness.totalLegBusiness || 0;
    
    // Calculate ratio-based target for each leg
    const legs = Object.entries(bussiness.legBusiness.legs).map(([legKey, legData]) => {
      const ratio = legData.ratio || 0;
      const legTarget = (ratio / 100) * target; // Calculate target based on ratio
      const actualBusiness = legData.business || 0;
      const cappedBusiness = Math.min(actualBusiness, legTarget); // Cap at leg target
      
      return {
        name: legKey.replace('_', ' ').toUpperCase(),
        business: actualBusiness,
        cappedBusiness: cappedBusiness,
        legTarget: legTarget,
        ratio: ratio,
        members: legData.members?.length || 0,
        weightedBusiness: legData.weightedBusiness || 0
      };
    });

    const percentage = target > 0 ? (totalLegBusiness / target) * 100 : 0;
    
    // Cap the display value at the target if completed
    const displayValue = Math.min(totalLegBusiness, target);

    return {
      totalLegBusiness,
      legs,
      percentage: Math.min(percentage, 100),
      displayValue
    };
  };

  // Loading Component
  const LoadingCard = () => (
    <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 shadow-2xl">
      <div className="animate-pulse">
        <div className="flex items-center mb-6">
          <div className="w-12 h-12 bg-white/20 rounded-full mr-4"></div>
          <div>
            <div className="h-5 bg-white/20 rounded w-32 mb-2"></div>
            <div className="h-3 bg-white/20 rounded w-48"></div>
          </div>
        </div>
        <div className="mb-6">
          <div className="h-3 bg-white/20 rounded w-full mb-2"></div>
          <div className="h-2 bg-white/20 rounded w-3/4"></div>
        </div>
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <div className="h-4 bg-white/20 rounded w-16 mb-2"></div>
            <div className="h-3 bg-white/20 rounded w-12"></div>
          </div>
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <div className="h-4 bg-white/20 rounded w-16 mb-2"></div>
            <div className="h-3 bg-white/20 rounded w-12"></div>
          </div>
        </div>
        <div className="h-8 bg-white/20 rounded-full w-32 ml-auto"></div>
      </div>
    </div>
  );

  // Error Component
  const ErrorComponent = () => (
    <div className="text-center py-12">
      <div className="inline-flex items-center justify-center w-16 h-16 bg-red-500/20 rounded-full mb-6">
        <Trophy className="w-8 h-8 text-red-400" />
      </div>
      <h2 className="text-2xl font-bold text-white mb-4">Something went wrong</h2>
      <p className="text-gray-300 mb-6">We couldn't load your rewards. Please try again later.</p>
      <button 
        onClick={() => window.location.reload()} 
        className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white px-6 py-3 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
      >
        Try Again
      </button>
    </div>
  );

  // Empty State Component
  const EmptyState = () => (
    <div className="text-center py-12">
      <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-500/20 rounded-full mb-6">
        <Gift className="w-8 h-8 text-gray-400" />
      </div>
      <h2 className="text-2xl font-bold text-white mb-4">No rewards yet</h2>
      <p className="text-gray-300 mb-6">Start earning points to unlock amazing rewards!</p>
      <button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-3 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg">
        Get Started
      </button>
    </div>
  );

  return (
    <div className="min-h-screen ">
      <div className="max-w-7xl mx-auto bg-[#1a1a1a]">
        {/* Header */}
        <div className="flex justify-start  items-center gap-4 border-b border-white/20 p-4">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full shadow-lg">
            <Trophy className="w-8 h-8 text-white" />
          </div>
          <div>
          <h1 className="text-3xl font-semibold   bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
            Rewards Dashboard
          </h1>
          <p className="text-base text-gray-300">Track your progress and claim amazing rewards</p>
        </div>
        </div>

        {/* Loading State */}
        {loading?.useUserRewards && (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 rounded-full mb-6">
              <Loader2 className="w-8 h-8 text-white animate-spin" />
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">Loading your rewards...</h2>
            <p className="text-gray-300">Please wait while we fetch your latest progress</p>
            
            {/* Loading Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
              <LoadingCard />
              <LoadingCard />
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !loading?.useUserRewards && <ErrorComponent />}

        {/* Empty State */}
        {!loading.useUserRewards && !error && (!rewards || rewards.length === 0) && <EmptyState />}

        {/* Rewards Grid */}
        {!loading?.useUserRewards && !error && rewards && rewards.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 p-4">
            {rewards.map((reward) => {
              const target = parseFloat(reward.required_target || 0);
              const daysLeft = getDaysUntilExpiry(reward.expires_at);
              const legProgress = getLegBusinessProgress(reward);
              
              return (
                <div
                  key={reward.id}
                  className="relative bg-white/10 backdrop-blur-lg rounded-md p-4 border border-white/20 hover:bg-white/15 shadow-2xl"
                >
                  {/* Status Badge */}
                  <div className="absolute top-4 right-4">
                    <div className={`px-3 py-1 rounded-full text-xs font-semibold text-white ${getStatusColor(reward.status)}`}>
                      {reward.status.replace('_', ' ').toUpperCase()}
                    </div>
                  </div>

                  {/* Reward Icon */}
                  <div className="flex items-center mb-6">
                    <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center mr-4">
                      <Gift className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">{getRewardTitle(reward.reward_program_id)}</h3>
                      <p className="text-gray-300 text-sm">{getRewardDescription(reward.reward_program_id)}</p>
                    </div>
                  </div>

                  {/* Leg Business Progress Section */}
                  <div className="mb-6">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-300 text-sm flex items-center">
                        <Target className="w-4 h-4 mr-1" />
                        Leg Business Progress
                      </span>
                      <span className="text-white font-semibold">{legProgress.displayValue.toFixed(0)} / {target.toFixed(0)}</span>
                    </div>
                    
                    {/* Main Progress Bar */}
                    {/* <div className="w-full bg-gray-700 rounded-full h-3 mb-3 overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-500 ${getProgressBarColor(legProgress.percentage)} rounded-full relative`}
                        style={{ width: `${legProgress.percentage}%` }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/20"></div>
                      </div>
                    </div>
                     */}
                    {/* Individual Leg Progress Bars */}
                    {legProgress.legs.length > 0 && (
                      <div className="space-y-2 mb-3">
                        {legProgress.legs.map((leg, index) => {
                          const legPercentage = leg.legTarget > 0 ? (leg.cappedBusiness / leg.legTarget) * 100 : 0;
                          return (
                            <div key={index} className="flex items-center space-x-3">
                              <span className="text-xs text-gray-400 w-12">{leg.name}</span>
                              <div className="flex-1 bg-gray-700 rounded-full h-2 overflow-hidden">
                                <div 
                                  className={`h-full transition-all duration-500 ${index === 0 ? 'bg-blue-400' : index === 1 ? 'bg-purple-400' : 'bg-green-400'} rounded-full`}
                                  style={{ width: `${Math.min(legPercentage, 100)}%` }}
                                ></div>
                              </div>
                              <span className="text-xs text-white w-20 text-right">
                                {leg.cappedBusiness.toFixed(0)} / {leg.legTarget.toFixed(0)}
                              </span>
                              <span className="text-xs text-yellow-400 w-8 text-right">
                                {leg.ratio}%
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                    
                    <div className="flex justify-between text-xs text-gray-400">
                      <span>{legProgress.percentage.toFixed(1)}% Complete</span>
                      <span>{Math.max(0, target - legProgress.displayValue).toFixed(0)} remaining</span>
                    </div>
                  </div>

                  {/* Stats Row */}
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-gray-400 text-xs">Salary</p>
                          <p className="text-white font-bold text-sm">${parseFloat(reward.reward_amount || 0).toFixed(2)}</p>
                        </div>
                        <Star className="w-4 h-4 text-yellow-400" />
                      </div>
                    </div>
                    
                    {/* <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-gray-400 text-xs">Days Left</p>
                          <p className={`font-bold text-sm ${daysLeft <= 7 ? 'text-red-400' : 'text-white'}`}>
                            {daysLeft > 0 ? daysLeft : 'Expired'}
                          </p>
                        </div>
                        <Clock className="w-4 h-4 text-blue-400" />
                      </div>
                    </div> */}

                    <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-gray-400 text-xs">Total Legs</p>
                          <p className="text-white font-bold text-sm">{legProgress.legs.length}</p>
                        </div>
                        <Users className="w-4 h-4 text-green-400" />
                      </div>
                    </div>
                  </div>

                  {/* Action Button */}
                  {/* <div className="flex justify-between items-center">
                    <div className="text-xs text-gray-400">
                      Expires: {formatDate(reward.expires_at)}
                    </div>
                  </div> */}

                  {/* Decorative Elements */}
                  <div className="absolute top-0 left-0 w-full h-full rounded-md bg-gradient-to-br from-purple-500/10 to-pink-500/10 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                </div>
              );
            })}
          </div>
        )}

        {/* Summary Stats */}
        {!loading && !error && rewards && rewards.length > 0 && bussiness?.legBusiness && (
          <div className="mt-12 bg-white/5 backdrop-blur-lg rounded-3xl p-8 border border-white/10">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
              <TrendingUp className="w-6 h-6 mr-3 text-green-400" />
              Your Business Summary
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-2">{rewards.length}</div>
                <div className="text-gray-400">Active Rewards</div>
              </div>
              
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-400 mb-2">
                  ${rewards.reduce((sum, reward) => sum + parseFloat(reward.reward_amount || 0), 0).toFixed(2)}
                </div>
                <div className="text-gray-400">Total Potential</div>
              </div>
              
              <div className="text-center">
                <div className="text-3xl font-bold text-green-400 mb-2">
                  {bussiness.legBusiness.totalLegBusiness}
                </div>
                <div className="text-gray-400">Total Leg Business</div>
              </div>

              <div className="text-center">
                <div className="text-3xl font-bold text-blue-400 mb-2">
                  {Object.keys(bussiness.legBusiness.legs).length}
                </div>
                <div className="text-gray-400">Active Legs</div>
              </div>
            </div>

            {/* Leg Details */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.entries(bussiness.legBusiness.legs).map(([legKey, legData]) => (
                <div key={legKey} className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-lg font-semibold text-white">{legKey.replace('_', ' ').toUpperCase()}</h3>
                    <span className="text-sm text-gray-400">{legData.ratio}% ratio</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-400">Business</p>
                      <p className="text-white font-semibold">{legData.business}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Members</p>
                      <p className="text-white font-semibold">{legData.members?.length || 0}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RewardList;