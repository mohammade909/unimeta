// controllers/userInvestmentController.js
const UserInvestment = require("../models/UserInvestment");

class UserInvestmentController {
  // Create new investment using the investMoney method
  async createInvestment(req, res) {
    try {
      const user_id = req.user?.id; // Get user ID from authenticated user
      const {
        plan_id,
        invested_amount,
        start_date,
        currency = "USD",
        fee_amount = 0,
        source_details,
        admin_notes, // Add this to destructuring since it's used below
      } = req.body;

      // Validate required fields
      if (!user_id || !plan_id || !invested_amount) {
        return res.status(400).json({
          success: false,
          message: "Required fields: plan_id, invested_amount",
        });
      }

      // Validate investment amount
      if (invested_amount <= 0) {
        return res.status(400).json({
          success: false,
          message: "Investment amount must be greater than 0",
        });
      }

      // Parse start_date or use current date
      const parsedStartDate = start_date ? new Date(start_date) : new Date();

      if (isNaN(parsedStartDate)) {
        return res.status(400).json({
          success: false,
          message: "Invalid start_date format",
        });
      }

    

      // Calculate end_date (6 months later - you can modify this based on plan duration)
      const parsedEndDate = new Date(parsedStartDate);
      parsedEndDate.setMonth(parsedEndDate.getMonth() + 6);

      const investmentData = {
        user_id,
        plan_id,
        invested_amount: parseFloat(invested_amount),
        current_value: parseFloat(invested_amount),
        total_earned: 0,
        start_date: parsedStartDate.toISOString().slice(0, 10), // 'YYYY-MM-DD'
        end_date: parsedEndDate.toISOString().slice(0, 10),
        status: "active",
      };

      const transactionData = {
        currency: currency || "USD",
        fee_amount: parseFloat(fee_amount) || 0,
        source_type: "internal",
        source_details: source_details ? JSON.stringify(source_details) : null,
        processed_by: req.user?.id || null,
        processed_at: new Date(),
        admin_notes: admin_notes || null, // Fix: properly handle admin_notes
        status: "completed",
      };

      // Create investment and transaction
      const result = await UserInvestment.investMoney(
        investmentData,
        transactionData
      );

      res.status(201).json({
        success: true,
        message: "Investment created successfully",
        data: {
          investment: result.investment.toJSON(),
          investment_id: result.investment_id,
          transaction_id: result.transaction_id,
        },
      });
    } catch (error) {
      console.error("Error creating investment:", error);
      res.status(500).json({
        success: false,
        message: "Failed to create investment",
        error: error.message,
      });
    }
  }

  // Add additional money to existing investment
  async addAdditionalInvestment(req, res) {
    try {
      const { id } = req.params;
      const {
        amount,
        currency = "USD",
        fee_amount = 0,
        admin_notes,
        source_details,
      } = req.body;

      // Validate required fields
      if (!amount || amount <= 0) {
        return res.status(400).json({
          success: false,
          message: "Amount must be greater than 0",
        });
      }

      // Find the investment
      const investment = await UserInvestment.findById(id);
      if (!investment) {
        return res.status(404).json({
          success: false,
          message: "Investment not found",
        });
      }

      // Check if user owns this investment (if not admin)
      if (req.user?.id !== investment.user_id && req.user?.role !== "admin") {
        return res.status(403).json({
          success: false,
          message: "Unauthorized to modify this investment",
        });
      }

      // Check if investment is active
      if (investment.status !== "active") {
        return res.status(400).json({
          success: false,
          message: "Cannot add money to inactive investment",
        });
      }

      // Prepare transaction data
      const transactionData = {
        currency,
        fee_amount: parseFloat(fee_amount) || 0,
        source_type: "internal",
        source_details: source_details || {
          description: "Additional investment",
          method: "platform",
        },
        processed_by: req.user?.id || null,
        processed_at: new Date(),
        admin_notes: admin_notes || null,
        status: "completed",
      };

      // Add additional investment
      const result = await investment.investAdditionalMoney(
        id,
        parseFloat(amount),
        transactionData
      );

      res.json({
        success: true,
        message: "Additional investment added successfully",
        data: {
          investment: result.investment.toJSON(),
          transaction_id: result.transaction_id,
        },
      });
    } catch (error) {
      console.error("Error adding additional investment:", error);
      res.status(500).json({
        success: false,
        message: "Failed to add additional investment",
        error: error.message,
      });
    }
  }

  // Get all investments with filters
  async getAllInvestments(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        user_id,
        plan_id,
        status,
        search,
        start_date,
        end_date,
      } = req.query;

      const filters = {};
      if (user_id) filters.user_id = user_id;
      if (plan_id) filters.plan_id = plan_id;
      if (status) filters.status = status;
      if (search) filters.search = search;
      if (start_date && end_date) {
        filters.start_date = start_date;
        filters.end_date = end_date;
      }

      const result = await UserInvestment.getAll(
        parseInt(page),
        parseInt(limit),
        filters
      );

      res.json({
        success: true,
        data: {
          investments: result.investments.map((inv) => inv.toJSON()),
          pagination: {
            total: result.total,
            page: result.page,
            limit: result.limit,
            totalPages: result.totalPages,
          },
        },
      });
    } catch (error) {
      console.error("Error fetching investments:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch investments",
        error: error.message,
      });
    }
  }

  // Get investment by ID
  async getInvestmentById(req, res) {
    try {
      const { id } = req.params;

      const investment = await UserInvestment.findById(id);

      if (!investment) {
        return res.status(404).json({
          success: false,
          message: "Investment not found",
        });
      }

      // Check if user can view this investment (if not admin)
      if (req.user?.id !== investment.user_id && req.user?.role !== "admin") {
        return res.status(403).json({
          success: false,
          message: "Unauthorized to view this investment",
        });
      }

      res.json({
        success: true,
        data: investment.toJSON(),
      });
    } catch (error) {
      console.error("Error fetching investment:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch investment",
        error: error.message,
      });
    }
  }

  // Get investments by user ID (Admin only)
  async getInvestmentsByUserId(req, res) {
    try {
      const { userId } = req.params;
      const { status } = req.query;

      // Check if user is admin
      if (req.user?.role !== "admin") {
        return res.status(403).json({
          success: false,
          message: "Admin access required",
        });
      }

      const investments = await UserInvestment.findByUserId(userId, status);
      const summary = await UserInvestment.getUserSummary(userId);

      res.json({
        success: true,
        data: {
          investments: investments.map((inv) => inv.toJSON()),
          summary,
        },
      });
    } catch (error) {
      console.error("Error fetching user investments:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch user investments",
        error: error.message,
      });
    }
  }

  // Get current user's investments
  async getUserInvestments(req, res) {
    try {
      const userId = req.user.id;
      const { status } = req.query;
      const investments = await UserInvestment.findByUserId(userId, status);
      const summary = await UserInvestment.getUserSummary(userId);

      res.json({
        success: true,
        data: {
          investments,
          summary,
        },
      });
    } catch (error) {
      console.error("Error fetching user investments:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch user investments",
        error: error.message,
      });
    }
  }

  // Update investment (Admin only)
  async updateInvestment(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      // Check if user is admin
      if (req.user?.role !== "admin") {
        return res.status(403).json({
          success: false,
          message: "Admin access required",
        });
      }

      const investment = await UserInvestment.findById(id);
      if (!investment) {
        return res.status(404).json({
          success: false,
          message: "Investment not found",
        });
      }

      // Update investment properties
      Object.keys(updateData).forEach((key) => {
        if (
          investment.hasOwnProperty(key) &&
          key !== "id" &&
          key !== "created_at"
        ) {
          investment[key] = updateData[key];
        }
      });

      await investment.update();

      res.json({
        success: true,
        message: "Investment updated successfully",
        data: investment.toJSON(),
      });
    } catch (error) {
      console.error("Error updating investment:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update investment",
        error: error.message,
      });
    }
  }

  // Update ROI for investment (Admin only)
  async updateROI(req, res) {
    try {
      const { id } = req.params;
      const {
        roi_amount,
        new_current_value,
        admin_notes,
        currency = "USD",
      } = req.body;

      // Check if user is admin
      if (req.user?.role !== "admin") {
        return res.status(403).json({
          success: false,
          message: "Admin access required",
        });
      }

      if (!roi_amount || !new_current_value) {
        return res.status(400).json({
          success: false,
          message: "ROI amount and new current value are required",
        });
      }

      if (roi_amount <= 0 || new_current_value <= 0) {
        return res.status(400).json({
          success: false,
          message: "ROI amount and current value must be greater than 0",
        });
      }

      const investment = await UserInvestment.findById(id);
      if (!investment) {
        return res.status(404).json({
          success: false,
          message: "Investment not found",
        });
      }

      if (investment.status !== "active") {
        return res.status(400).json({
          success: false,
          message: "Cannot update ROI for inactive investment",
        });
      }

      const result = await investment.updateROI(
        parseFloat(roi_amount),
        parseFloat(new_current_value),
        {
          admin_notes,
          currency,
          processed_by: req.user?.id || null,
        }
      );

      res.json({
        success: true,
        message: "ROI updated successfully",
        data: {
          investment: result.investment.toJSON(),
          transaction_id: result.transaction_id,
        },
      });
    } catch (error) {
      console.error("Error updating ROI:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update ROI",
        error: error.message,
      });
    }
  }

  // Update investment status (Admin only)
  async updateStatus(req, res) {
    try {
      const { id } = req.params;
      const { status, admin_notes } = req.body;

      // Check if user is admin
      if (req.user?.role !== "admin") {
        return res.status(403).json({
          success: false,
          message: "Admin access required",
        });
      }

      if (!status) {
        return res.status(400).json({
          success: false,
          message: "Status is required",
        });
      }

      const investment = await UserInvestment.findById(id);
      if (!investment) {
        return res.status(404).json({
          success: false,
          message: "Investment not found",
        });
      }

      await investment.updateStatus(status, admin_notes);

      res.json({
        success: true,
        message: "Investment status updated successfully",
        data: investment.toJSON(),
      });
    } catch (error) {
      console.error("Error updating status:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update investment status",
        error: error.message,
      });
    }
  }

  // Delete investment (Admin only)
  async deleteInvestment(req, res) {
    try {
      const { id } = req.params;

      // Check if user is admin
      if (req.user?.role !== "admin") {
        return res.status(403).json({
          success: false,
          message: "Admin access required",
        });
      }

      const investment = await UserInvestment.findById(id);
      if (!investment) {
        return res.status(404).json({
          success: false,
          message: "Investment not found",
        });
      }

      await investment.delete();

      res.json({
        success: true,
        message: "Investment deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting investment:", error);
      res.status(500).json({
        success: false,
        message: "Failed to delete investment",
        error: error.message,
      });
    }
  }

  // Get investment statistics
  async getInvestmentStats(req, res) {
    try {
      const { user_id, plan_id } = req.query;

      // If not admin, only allow user to see their own stats
      if (req.user?.role !== "admin" && user_id && user_id != req.user?.id) {
        return res.status(403).json({
          success: false,
          message: "Unauthorized to view other user's statistics",
        });
      }

      const filters = {};
      if (user_id) filters.user_id = user_id;
      if (plan_id) filters.plan_id = plan_id;

      const stats = await UserInvestment.getStats(filters);

      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      console.error("Error fetching investment stats:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch investment statistics",
        error: error.message,
      });
    }
  }

  // Get investments due for ROI (Admin only)
  async getDueForROI(req, res) {
    try {
      const { date } = req.query;

      // Check if user is admin
      if (req.user?.role !== "admin") {
        return res.status(403).json({
          success: false,
          message: "Admin access required",
        });
      }

      const investments = await UserInvestment.getDueForROI(date);

      res.json({
        success: true,
        data: {
          investments: investments.map((inv) => inv.toJSON()),
          count: investments.length,
        },
      });
    } catch (error) {
      console.error("Error fetching ROI due investments:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch ROI due investments",
        error: error.message,
      });
    }
  }

  // Get user's investment summary
  async getUserInvestmentSummary(req, res) {
    try {
      const userId = req.user.id;

      const summary = await UserInvestment.getUserSummary(userId);

      res.json({
        success: true,
        data: summary,
      });
    } catch (error) {
      console.error("Error fetching investment summary:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch investment summary",
        error: error.message,
      });
    }
  }

  // Batch process ROI for multiple investments (Admin only)
  async batchProcessROI(req, res) {
    try {
      const { investments } = req.body; // Array of {investment_id, roi_amount, new_current_value}

      // Check if user is admin
      if (req.user?.role !== "admin") {
        return res.status(403).json({
          success: false,
          message: "Admin access required",
        });
      }

      if (!Array.isArray(investments) || investments.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Investments array is required",
        });
      }

      const results = [];
      const errors = [];

      for (const investmentData of investments) {
        try {
          const { investment_id, roi_amount, new_current_value } =
            investmentData;

          const investment = await UserInvestment.findById(investment_id);
          if (!investment) {
            errors.push({
              investment_id,
              error: "Investment not found",
            });
            continue;
          }

          if (investment.status !== "active") {
            errors.push({
              investment_id,
              error: "Investment is not active",
            });
            continue;
          }

          const result = await investment.updateROI(
            parseFloat(roi_amount),
            parseFloat(new_current_value),
            {
              admin_notes: "Batch ROI processing",
              processed_by: req.user?.id || null,
            }
          );

          results.push({
            investment_id,
            transaction_id: result.transaction_id,
            success: true,
          });
        } catch (error) {
          errors.push({
            investment_id: investmentData.investment_id,
            error: error.message,
          });
        }
      }

      res.json({
        success: true,
        message: "Batch ROI processing completed",
        data: {
          processed: results.length,
          errors: errors.length,
          results,
          errors,
        },
      });
    } catch (error) {
      console.error("Error in batch ROI processing:", error);
      res.status(500).json({
        success: false,
        message: "Failed to process batch ROI",
        error: error.message,
      });
    }
  }
}

module.exports = new UserInvestmentController();
