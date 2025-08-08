const WithdrawalRequest = require("../models/WithdrawalRequest");
const Wallet = require("../models/Wallet");
class WithdrawalController {
  // User creates withdrawal request
  async createWithdrawal(req, res) {
    try {
      const {
        requested_amount,
        withdrawal_method,
        withdrawalType,
        withdrawal_details,
      } = req.body;
      const user_id = req.user.id;

      console.log(req.body);
      const wallet = await Wallet.findByUserId(user_id);
      // Validate required fields
      if (!requested_amount || !withdrawal_method) {
        return res.status(400).json({
          success: false,
          message: "Required fields: requested_amount and withdrawal_method",
        });
      }

      // Validate amount
      if (requested_amount <= 0) {
        return res.status(400).json({
          success: false,
          message: "Amount must be greater than 0",
        });
      }

      const balance =
        withdrawalType === "ROI" ? wallet.roi_balance : wallet.total_earned;
      if (requested_amount <= 0 || requested_amount > balance) {
        return res.status(400).json({
          success: false,
          message: "Insufficient amount",
        });
      }

      // Calculate fee (example: 2% fee, minimum $1)
      const fee_percentage = 0.02;
      const min_fee = 1.0;
      const calculated_fee = requested_amount * fee_percentage;
      const fee_amount = Math.max(calculated_fee, min_fee);
      const net_amount = requested_amount - fee_amount;

      // Validate withdrawal method specific requirements
      if (withdrawal_method === "bank") {
        return res.status(400).json({
          success: false,
          message: "Bank account details required for bank withdrawal",
        });
      }

      // TODO: Check if user has sufficient balance
      // const userBalance = await getUserBalance(user_id);
      // if (userBalance < requested_amount) {
      //   return res.status(400).json({ success: false, message: 'Insufficient balance' });
      // }

      const withdrawal = await WithdrawalRequest.create({
        user_id,
        requested_amount,
        fee_amount,
        net_amount,
        withdrawal_method,
        withdrawalType,
        withdrawal_details
      });

      res.status(201).json({
        success: true,
        message: "Withdrawal request created successfully",
        data: withdrawal,
      });
    } catch (error) {
      console.error("Error creating withdrawal:", error);
      res.status(500).json({
        success: false,
        message: "Error creating withdrawal request",
        error: error.message,
      });
    }
  }

  // User gets their withdrawal requests
  async getUserWithdrawals(req, res) {
    try {
      const user_id = req.user.id;
      const { page = 1, limit = 10, status } = req.query;

      const result = await WithdrawalRequest.findByUserId(user_id, {
        page: parseInt(page),
        limit: parseInt(limit),
        status,
      });

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error("Error getting user withdrawals:", error);
      res.status(500).json({
        success: false,
        message: "Error fetching withdrawals",
        error: error.message,
      });
    }
  }

  // Admin gets all withdrawal requests
  async getAllWithdrawals(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        status,
        user_id,
        withdrawalType,
      } = req.query;
      const result = await WithdrawalRequest.findAll({
        page: parseInt(page),
        limit: parseInt(limit),
        status,
        user_id,
        withdrawalType,
      });

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error("Error getting all withdrawals:", error);
      res.status(500).json({
        success: false,
        message: "Error fetching withdrawals",
        error: error.message,
      });
    }
  }

  // Admin updates withdrawal request
  async updateWithdrawal(req, res) {
    try {
      const { id } = req.params;
      const { status, rejection_reason, admin_notes, transaction_hash } =
        req.body;
      const admin_id = req.user.id;

      // Validate status
      const validStatuses = [
        "pending",
        "approved",
        "processing",
        "completed",
        "rejected",
      ];
      if (status && !validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid status",
        });
      }

      // Check if withdrawal exists
      const withdrawal = await WithdrawalRequest.findById(id);
      if (!withdrawal) {
        return res.status(404).json({
          success: false,
          message: "Withdrawal request not found",
        });
      }

      // Prepare update data
      const updateData = {};

      if (status) {
        updateData.status = status;
        updateData.processed_by = admin_id;
        updateData.processed_at = new Date();
      }

      if (rejection_reason) {
        updateData.rejection_reason = rejection_reason;
      }

      if (admin_notes) {
        updateData.admin_notes = admin_notes;
      }

      if (transaction_hash) {
        updateData.transaction_hash = transaction_hash;
      }

      const updatedWithdrawal = await WithdrawalRequest.update(id, updateData);

      res.json({
        success: true,
        message: "Withdrawal request updated successfully",
        data: updatedWithdrawal,
      });
    } catch (error) {
      console.error("Error updating withdrawal:", error);
      res.status(500).json({
        success: false,
        message: "Error updating withdrawal request",
        error: error.message,
      });
    }
  }

  // Get withdrawal statistics
  async getStats(req, res) {
    try {
      const { user_id, date_from, date_to } = req.query;

      const stats = await WithdrawalRequest.getStats({
        user_id,
        date_from,
        date_to,
      });

      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      console.error("Error getting withdrawal stats:", error);
      res.status(500).json({
        success: false,
        message: "Error fetching withdrawal statistics",
        error: error.message,
      });
    }
  }

  // Get single withdrawal details
  async getWithdrawal(req, res) {
    try {
      const { id } = req.params;
      const withdrawal = await WithdrawalRequest.findById(id);

      if (!withdrawal) {
        return res.status(404).json({
          success: false,
          message: "Withdrawal request not found",
        });
      }

      // Check if user can access this withdrawal
      if (req.user.role !== "admin" && withdrawal.user_id !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: "Access denied",
        });
      }

      res.json({
        success: true,
        data: withdrawal,
      });
    } catch (error) {
      console.error("Error getting withdrawal:", error);
      res.status(500).json({
        success: false,
        message: "Error fetching withdrawal",
        error: error.message,
      });
    }
  }
}

module.exports = new WithdrawalController();
