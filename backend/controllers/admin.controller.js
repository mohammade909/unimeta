const AdminStatsService = require("../service/admin.dashboard");

class AdminController {
  constructor() {
    this.statsService = new AdminStatsService();
    this.getDashboardStats = this.getDashboardStats.bind(this);
  }
  async getDashboardStats(req, res) {
    try {
      const stats = await this.statsService.getDashboardStats();

      return res.status(200).json({
        success: true,
        message: "Dashboard statistics retrieved successfully",
        data: stats.data,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error in getDashboardStats:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to retrieve dashboard statistics",
        error: error.message,
      });
    }
  }
}
module.exports = AdminController;
