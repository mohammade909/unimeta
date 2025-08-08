import { useState, useEffect, useCallback, useMemo } from "react";
import { apiClient, userApiClient } from "../services/api/client";

const useApi = (endpoint, options = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Choose the appropriate API client
  const client = options.useUserClient ? userApiClient : apiClient;

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await client.get(endpoint, {
        params: options.params,
        ...options.requestConfig,
      });

      // Fixed: Set the entire response data, not response.data.data
      setData(response.data.data);
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || err.message || "An error occurred";
      setError(errorMessage);
      console.error(`API Error (${endpoint}):`, err);
    } finally {
      setLoading(false);
    }
  }, [endpoint, client, options.params, options.requestConfig]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
};

// Main dashboard hook
export const useDashboardData = () => {
  return useApi("/summary/dashboard", { useUserClient: true });
};

// Optimized hook with computed values
export const useOptimizedDashboard = () => {
  const { data, loading, error, refetch } = useDashboardData();

  const computedValues = useMemo(() => {
    // Early return if data is not yet loaded or required properties don't exist
    if (
      !data?.userInfo ||
      !data?.investmentStats ||
      !data?.recentTransactions ||
      !data?.rewardProgress
    ) {
      return null;
    }

    const totalBalance = parseFloat(data.userInfo.total_balance || "0");
    const availableBalance =
      parseFloat(data.userInfo.main_balance || "0") +
      parseFloat(data.userInfo.roi_balance || "0") +
      parseFloat(data.userInfo.commission_balance || "0");

    const investmentROI =
      data.investmentStats.total_invested !== "0"
        ? (parseFloat(data.investmentStats.total_roi_earned || "0") /
          parseFloat(data.investmentStats.total_invested || "1")) *
        100
        : 0;

    const recentEarnings = data.recentTransactions
      .filter((t) =>
        ["roi_earning", "level_commission", "direct_bonus"].includes(
          t.transaction_type
        )
      )
      .reduce((sum, t) => sum + parseFloat(t.net_amount || "0"), 0);

    const avgRewardProgress =
      data.rewardProgress.length > 0
        ? data.rewardProgress.reduce(
          (sum, r) => sum + parseFloat(r.achievement_percentage || "0"),
          0
        ) / data.rewardProgress.length
        : 0;

    const isActive = data.userInfo.status === "active";
    const daysSinceJoined = Math.floor(
      (new Date().getTime() - new Date(data.userInfo.created_at).getTime()) /
      (1000 * 60 * 60 * 24)
    );

    const balanceBreakdown = {
      main: parseFloat(data.userInfo.main_balance || "0"),
      roi: parseFloat(data.userInfo.roi_balance || "0"),
      commission: parseFloat(data.userInfo.commission_balance || "0"),
      bonus: parseFloat(data.userInfo.bonus_balance || "0"),
      total: totalBalance,
    };

    const investmentSummary = {
      totalInvested: parseFloat(data.investmentStats.total_invested || "0"),
      totalEarned: parseFloat(data.investmentStats.total_roi_earned || "0"),
      activeAmount: parseFloat(
        data.investmentStats.active_investment_amount || "0"
      ),
      averageDaysRemaining: parseFloat(
        data.investmentStats.avg_days_remaining || "0"
      ),
      roiPercentage: investmentROI,
      totalInvestments: parseInt(data.investmentStats.total_investments || "0"),
      activeInvestments: parseInt(
        data.investmentStats.active_investments || "0"
      ),
      completedInvestments: parseInt(
        data.investmentStats.completed_investments || "0"
      ),
      investmentBreakdown: data.investmentStats.investment_breakdown || [],
    };

    const transactionSummary = {
      totalEarned: parseFloat(data.userInfo.total_earned || "0"),
      totalWithdrawn: parseFloat(data.userInfo.total_withdrawn || "0"),
      recentEarnings,
      withdrawalTransactions: data.recentTransactions.filter(
        (t) => t.transaction_type === "withdrawal"
      ),
      earningTransactions: data.recentTransactions.filter((t) =>
        ["roi_earning", "level_commission", "direct_bonus"].includes(
          t.transaction_type
        )
      ),
      investmentTransactions: data.recentTransactions.filter(
        (t) => t.transaction_type === "invest"
      ),
    };

    // Team statistics
    const teamSummary = {
      directReferrals: data.teamStats?.direct_referrals || 0,
      totalTeamSize: data.teamStats?.total_team_size || 0,
      activeTeamSize: data.teamStats?.active_team_size || 0,
      teamBusiness: parseFloat(data.teamStats?.team_business || "0"),
      levelBreakdown: data.teamStats?.level_breakdown || [],
      topPerformers: data.teamStats?.top_performers || [],
    };

    // Daily statistics
    const dailyStats = {
      roiEarned: parseFloat(data.dailyStats?.roi_earned || "0"),
      commissionEarned: parseFloat(data.dailyStats?.commission_earned || "0"),
      bonusEarned: parseFloat(data.dailyStats?.bonus_earned || "0"),
      totalEarned: parseFloat(data.dailyStats?.total_earned || "0"),
      newReferrals: parseInt(data.dailyStats?.new_referrals || "0"),
      teamBusiness: parseFloat(data.dailyStats?.team_business || "0"),
      withdrawalsAmount: parseFloat(data.dailyStats?.withdrawals_amount || "0"),
      depositsAmount: parseFloat(data.dailyStats?.deposits_amount || "0"),
    };

    // Monthly statistics
    const monthlyStats = {
      monthlyROI: parseFloat(data.monthlyStats?.monthly_roi || "0"),
      monthlyCommission: parseFloat(
        data.monthlyStats?.monthly_commission || "0"
      ),
      monthlyBonus: parseFloat(data.monthlyStats?.monthly_bonus || "0"),
      rewardBonus: parseFloat(data.monthlyStats?.reward_bonus || "0"),
      monthlyDeposits: parseFloat(data.monthlyStats?.monthly_deposits || "0"),
      salary: parseFloat(data.monthlyStats?.salary || "0"),
      monthlyWithdrawals: parseFloat(
        data.monthlyStats?.monthly_withdrawals || "0"
      ),
      monthlyInvestments: parseInt(
        data.monthlyStats?.monthly_investments || "0"
      ),
    };
    const stats = {
      totalROI: parseFloat(data.stats?.total_roi || "0"),
      totalCommission: parseFloat(data.stats?.total_commission || "0"),
      rewardBonus: parseFloat(data.stats?.total_reward || "0"),
      salary: parseFloat(data.stats?.total_salary || "0"),
      totalDeposits: parseFloat(data.stats?.total_deposite || "0"),
      totalWithdrawals: parseFloat(data.stats?.total_withdrawals || "0"),
      totalInvestments: parseInt(data.stats?.total_investments || "0"),
      totalDirect: parseFloat(data.stats?.total_direct || "0"),
      totalUpline: parseFloat(data.stats?.total_upline || "0"),
    };


    // Reward progress with better structure
    const rewardProgress = data.rewardProgress.map((reward) => ({
      ...reward,
      currentProgress: parseFloat(reward.current_progress || "0"),
      requiredTarget: parseFloat(reward.required_target || "0"),
      achievementPercentage: parseFloat(reward.achievement_percentage || "0"),
      rewardAmount: parseFloat(reward.reward_amount || "0"),
      earnedReward: parseFloat(reward.earned_reward || "0"),
    }));

    return {
      // Basic computed values
      totalBalance,
      availableBalance,
      investmentROI,
      recentEarnings,
      avgRewardProgress,
      isActive,
      daysSinceJoined,

      // Detailed breakdowns
      balanceBreakdown,
      investmentSummary,
      transactionSummary,
      teamSummary,
      dailyStats,
      monthlyStats,
      stats,
      rewardProgress,

      // User info
      userInfo: data.userInfo,

      // Last updated
      lastUpdated: data.lastUpdated,
    };
  }, [data]);

  return {
    data,
    loading,
    error,
    refetch,
    computed: computedValues,
  };
};
