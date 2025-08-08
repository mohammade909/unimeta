const express = require("express");
const router = express.Router();
const UserDashboard = require("../service/user.dashboard"); // Adjust path as needed
const AuthMiddleware = require('../middlewares/auth');
const dashboard = new UserDashboard();

router.use(AuthMiddleware.authenticate)
// Middleware for error handling
const handleErrors = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Route: Get complete user dashboard
router.get(
  "/dashboard/",
  handleErrors(async (req, res) => {
    const  userId  = req.user.id;
    const date = req.query.date || null;

    const result = await dashboard.getUserDashboardStats(Number(userId), date);

    if (result.success) {
      res.json({
        success: true,
        data: result.data,
        message: "Dashboard data retrieved successfully",
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Failed to retrieve dashboard data",
        error: result.error,
      });
    }
  })
);

// Route: Get basic user information
router.get(
  "/user/:userId/basic",
  handleErrors(async (req, res) => {
    const { userId } = req;

    const userInfo = await dashboard.getUserBasicInfo(userId);

    if (userInfo) {
      res.json({
        success: true,
        data: userInfo,
        message: "User information retrieved successfully",
      });
    } else {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
  })
);

// Route: Get daily statistics
router.get(
  "/user/:userId/daily-stats",
  handleErrors(async (req, res) => {
    const { userId } = req;
    const date = req.query.date || new Date().toISOString().split("T")[0];

    const dailyStats = await dashboard.getDailyStats(userId, date);

    res.json({
      success: true,
      data: dailyStats,
      message: "Daily statistics retrieved successfully",
    });
  })
);

// Route: Get investment statistics
router.get(
  "/user/:userId/investment-stats",
  handleErrors(async (req, res) => {
    const { userId } = req;

    const investmentStats = await dashboard.getInvestmentStats(userId);

    res.json({
      success: true,
      data: investmentStats,
      message: "Investment statistics retrieved successfully",
    });
  })
);

// Route: Get team statistics
router.get(
  "/user/:userId/team-stats",
  handleErrors(async (req, res) => {
    const { userId } = req;

    const teamStats = await dashboard.getTeamStats(userId);

    res.json({
      success: true,
      data: teamStats,
      message: "Team statistics retrieved successfully",
    });
  })
);

// Route: Get recent transactions
router.get(
  "/user/:userId/transactions",
  handleErrors(async (req, res) => {
    const { userId } = req;
    const limit = parseInt(req.query.limit) || 10;

    if (limit > 100) {
      return res.status(400).json({
        success: false,
        message: "Limit cannot exceed 100",
      });
    }

    const transactions = await dashboard.getRecentTransactions(userId, limit);

    res.json({
      success: true,
      data: transactions,
      message: "Recent transactions retrieved successfully",
    });
  })
);

// Route: Get reward progress
router.get(
  "/user/:userId/rewards",
  handleErrors(async (req, res) => {
    const { userId } = req;

    const rewards = await dashboard.getRewardProgress(userId);

    res.json({
      success: true,
      data: rewards,
      message: "Reward progress retrieved successfully",
    });
  })
);

// Route: Get monthly statistics
router.get(
  "/user/:userId/monthly-stats",
  handleErrors(async (req, res) => {
    const { userId } = req;
    const date = req.query.date || new Date().toISOString().split("T")[0];

    const monthlyStats = await dashboard.getMonthlyStats(userId, date);

    res.json({
      success: true,
      data: monthlyStats,
      message: "Monthly statistics retrieved successfully",
    });
  })
);

// Route: Get multi-user dashboard (for admin/batch operations)
router.post(
  "/dashboard/multi-user",
  handleErrors(async (req, res) => {
    const { userIds, date } = req.body;

    if (!Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "User IDs array is required",
      });
    }

    if (userIds.length > 50) {
      return res.status(400).json({
        success: false,
        message: "Cannot process more than 50 users at once",
      });
    }

    // Validate all user IDs are numbers
    const validUserIds = userIds
      .filter((id) => !isNaN(id))
      .map((id) => parseInt(id));
    if (validUserIds.length !== userIds.length) {
      return res.status(400).json({
        success: false,
        message: "All user IDs must be valid numbers",
      });
    }

    const results = await dashboard.getMultiUserDashboard(validUserIds, date);

    res.json({
      success: true,
      data: results,
      message: "Multi-user dashboard data retrieved successfully",
    });
  })
);

// Route: Get system-wide statistics (admin only)
router.get(
  "/system/stats",
  handleErrors(async (req, res) => {
    // Add admin role check here
    // if (req.user.role !== 'admin') {
    //     return res.status(403).json({
    //         success: false,
    //         message: 'Admin access required'
    //     });
    // }

    const date = req.query.date || null;
    const systemStats = await dashboard.getSystemStats(date);

    res.json({
      success: true,
      data: systemStats,
      message: "System statistics retrieved successfully",
    });
  })
);

// Route: Get user dashboard summary (lightweight version)
router.get(
  "/user/:userId/summary",
  handleErrors(async (req, res) => {
    const { userId } = req;

    const [userInfo, dailyStats, investmentStats] = await Promise.all([
      dashboard.getUserBasicInfo(userId),
      dashboard.getDailyStats(userId),
      dashboard.getInvestmentStats(userId),
    ]);

    const summary = {
      user: {
        id: userInfo?.id,
        username: userInfo?.username,
        full_name: userInfo?.full_name,
        status: userInfo?.status,
        total_balance: userInfo?.total_balance || 0,
      },
      today: {
        total_earned: dailyStats?.total_earned || 0,
        roi_earned: dailyStats?.roi_earned || 0,
        commission_earned: dailyStats?.commission_earned || 0,
      },
      investments: {
        total_investments: investmentStats?.total_investments || 0,
        active_investments: investmentStats?.active_investments || 0,
        total_invested: investmentStats?.total_invested || 0,
        total_roi_earned: investmentStats?.total_roi_earned || 0,
      },
    };

    res.json({
      success: true,
      data: summary,
      message: "User summary retrieved successfully",
    });
  })
);

// Route: Get user earnings breakdown
router.get(
  "/user/:userId/earnings",
  handleErrors(async (req, res) => {
    const { userId } = req;
    const days = parseInt(req.query.days) || 30;

    if (days > 365) {
      return res.status(400).json({
        success: false,
        message: "Days cannot exceed 365",
      });
    }

    // This would require a new method in UserDashboard class
    // For now, we'll use existing methods to provide earnings data
    const [dailyStats, monthlyStats, investmentStats] = await Promise.all([
      dashboard.getDailyStats(userId),
      dashboard.getMonthlyStats(userId),
      dashboard.getInvestmentStats(userId),
    ]);

    const earnings = {
      daily: {
        roi: dailyStats?.roi_earned || 0,
        commission: dailyStats?.commission_earned || 0,
        bonus: dailyStats?.bonus_earned || 0,
        total: dailyStats?.total_earned || 0,
      },
      monthly: {
        roi: monthlyStats?.monthly_roi || 0,
        commission: monthlyStats?.monthly_commission || 0,
        bonus: monthlyStats?.monthly_bonus || 0,
        total:
          (monthlyStats?.monthly_roi || 0) +
          (monthlyStats?.monthly_commission || 0) +
          (monthlyStats?.monthly_bonus || 0),
      },
      investment: {
        total_roi_earned: investmentStats?.total_roi_earned || 0,
        active_investment_amount:
          investmentStats?.active_investment_amount || 0,
      },
    };

    res.json({
      success: true,
      data: earnings,
      message: "Earnings breakdown retrieved successfully",
    });
  })
);

// Graceful shutdown
process.on("SIGTERM", async () => {
  console.log("Shutting down dashboard service...");
  await dashboard.close();
  process.exit(0);
});

process.on("SIGINT", async () => {
  console.log("Shutting down dashboard service...");
  await dashboard.close();
  process.exit(0);
});

module.exports = router;
