// controllers/TransactionController.js
const Transaction = require("../models/Transaction");

class TransactionController {
  // Get all transactions (Admin only)
  static async getAllTransactions(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        user_id,
        transaction_type,
        status,
        source_type,
        date_from,
        date_to,
        search,
      } = req.query;

      const filters = {};
      if (user_id) filters.user_id = user_id;
      if (transaction_type) filters.transaction_type = transaction_type;
      if (status) filters.status = status;
      if (source_type) filters.source_type = source_type;
      if (date_from) filters.date_from = date_from;
      if (date_to) filters.date_to = date_to;
      if (search) filters.search = search;

      const result = await Transaction.getAll(
        parseInt(page),
        parseInt(limit),
        filters
      );

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error("Get all transactions error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to get transactions",
        error: error.message,
      });
    }
  }

  // Get transaction by ID
  static async getTransactionById(req, res) {
    try {
      const { id } = req.params;

      const transaction = await Transaction.findById(id);

      if (!transaction) {
        return res.status(404).json({
          success: false,
          message: "Transaction not found",
        });
      }

      res.json({
        success: true,
        data: transaction.toJSON(),
      });
    } catch (error) {
      console.error("Get transaction by ID error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to get transaction",
        error: error.message,
      });
    }
  }

  // Get transaction by hash
  static async getTransactionByHash(req, res) {
    try {
      const { hash } = req.params;

      const transaction = await Transaction.findByHash(hash);

      if (!transaction) {
        return res.status(404).json({
          success: false,
          message: "Transaction not found",
        });
      }

      res.json({
        success: true,
        data: transaction.toJSON(),
      });
    } catch (error) {
      console.error("Get transaction by hash error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to get transaction",
        error: error.message,
      });
    }
  }

  // Get transaction by reference ID
  static async getTransactionByReference(req, res) {
    try {
      const { reference } = req.params;

      const transaction = await Transaction.findByReferenceId(reference);

      if (!transaction) {
        return res.status(404).json({
          success: false,
          message: "Transaction not found",
        });
      }

      res.json({
        success: true,
        data: transaction.toJSON(),
      });
    } catch (error) {
      console.error("Get transaction by reference error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to get transaction",
        error: error.message,
      });
    }
  }

  // Get user transactions
  static async getUserTransactions(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        userId,
        transaction_type,
        status,
        currency,
        source_type,
        related_user_id,
        related_investment_id,
        date_from,
        date_to,
        min_amount,
        max_amount,
        reference_id,
        transaction_hash,
        order_by = "created_at",
        order_direction = "DESC",
      } = req.query;

      // Validate required userId parameter
      if (!userId) {
        return res.status(400).json({
          success: false,
          message: "userId is required",
        });
      }

      // Build options object for the enhanced getByUserId method
      const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        order_by,
        order_direction,
        transaction_type,
      };

      // Add optional filters only if they exist
      // if (transaction_type) options.transaction_type = transaction_type;
      if (status) options.status = status;
      if (currency) options.currency = currency;
      if (source_type) options.source_type = source_type;
      if (related_user_id) options.related_user_id = related_user_id;
      if (related_investment_id)
        options.related_investment_id = related_investment_id;
      if (date_from) options.date_from = date_from;
      if (date_to) options.date_to = date_to;
      if (min_amount) options.min_amount = min_amount;
      if (max_amount) options.max_amount = max_amount;
      if (reference_id) options.reference_id = reference_id;
      if (transaction_hash) options.transaction_hash = transaction_hash;
      const result = await Transaction.getByUserId(userId, options);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error("Get user transactions error:", error);

      // Handle specific validation errors
      if (
        error.message.includes("Invalid userId") ||
        error.message.includes("Invalid limit") ||
        error.message.includes("Invalid offset") ||
        error.message.includes("Invalid order_by")
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid request parameters",
          error: error.message,
        });
      }

      res.status(500).json({
        success: false,
        message: "Failed to get user transactions",
        error: error.message,
      });
    }
  }
  static async getUserDailyLimit(req, res) {
    try {
      const data = await Transaction.validateDailyEarningsLimit(req.user.id);
      res.json({
        success: true,
        data,
      });
    } catch (error) {
      console.error("Get user daily limit error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to get user daily limit",
        error: error.message,
      });
    }
  }

  // Create transaction manually (Admin only)
  static async createTransaction(req, res) {
    try {
      const {
        user_id,
        transaction_type,
        amount,
        fee_amount = 0,
        currency = "USD",
        status = "completed",
        related_user_id,
        related_investment_id,
        source_type,
        source_details,
        admin_notes,
      } = req.body;

      // Validate required fields
      if (!user_id || !transaction_type || !amount || !source_type) {
        return res.status(400).json({
          success: false,
          message: "Missing required fields",
        });
      }

      // Validate amount
      if (parseFloat(amount) <= 0) {
        return res.status(400).json({
          success: false,
          message: "Invalid amount",
        });
      }

      const net_amount = parseFloat(amount) - parseFloat(fee_amount);

      const transaction = new Transaction({
        user_id,
        transaction_type,
        amount: parseFloat(amount),
        fee_amount: parseFloat(fee_amount),
        net_amount,
        currency,
        status,
        related_user_id,
        related_investment_id,
        source_type,
        source_details,
        processed_by: req.user ? req.user.id : null,
        processed_at: status === "completed" ? new Date() : null,
        admin_notes,
      });

      await transaction.create();

      res.json({
        success: true,
        message: "Transaction created successfully",
        data: transaction.toJSON(),
      });
    } catch (error) {
      console.error("Create transaction error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to create transaction",
        error: error.message,
      });
    }
  }

  // Update transaction (Admin only)
  static async updateTransaction(req, res) {
    try {
      const { id } = req.params;
      const {
        transaction_type,
        amount,
        fee_amount,
        currency,
        status,
        related_user_id,
        related_investment_id,
        source_type,
        source_details,
        admin_notes,
      } = req.body;

      const transaction = await Transaction.findById(id);

      if (!transaction) {
        return res.status(404).json({
          success: false,
          message: "Transaction not found",
        });
      }

      // Update fields
      if (transaction_type !== undefined)
        transaction.transaction_type = transaction_type;
      if (amount !== undefined) {
        transaction.amount = parseFloat(amount);
        transaction.net_amount =
          parseFloat(amount) - parseFloat(transaction.fee_amount);
      }
      if (fee_amount !== undefined) {
        transaction.fee_amount = parseFloat(fee_amount);
        transaction.net_amount =
          parseFloat(transaction.amount) - parseFloat(fee_amount);
      }
      if (currency !== undefined) transaction.currency = currency;
      if (status !== undefined) {
        transaction.status = status;
        if (status === "completed" && !transaction.processed_at) {
          transaction.processed_at = new Date();
          transaction.processed_by = req.user ? req.user.id : null;
        }
      }
      if (related_user_id !== undefined)
        transaction.related_user_id = related_user_id;
      if (related_investment_id !== undefined)
        transaction.related_investment_id = related_investment_id;
      if (source_type !== undefined) transaction.source_type = source_type;
      if (source_details !== undefined)
        transaction.source_details = source_details;
      if (admin_notes !== undefined) transaction.admin_notes = admin_notes;

      await transaction.update();

      res.json({
        success: true,
        message: "Transaction updated successfully",
        data: transaction.toJSON(),
      });
    } catch (error) {
      console.error("Update transaction error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update transaction",
        error: error.message,
      });
    }
  }

  // Update transaction status (Admin only)
  static async updateTransactionStatus(req, res) {
    try {
      const { id } = req.params;
      const { status, admin_notes } = req.body;

      if (!status) {
        return res.status(400).json({
          success: false,
          message: "Status is required",
        });
      }

      const validStatuses = ["pending", "completed", "failed", "cancelled"];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid status",
        });
      }

      const transaction = await Transaction.findById(id);

      if (!transaction) {
        return res.status(404).json({
          success: false,
          message: "Transaction not found",
        });
      }

      await transaction.updateStatus(
        status,
        req.user ? req.user.id : null,
        admin_notes
      );

      res.json({
        success: true,
        message: "Transaction status updated successfully",
        data: transaction.toJSON(),
      });
    } catch (error) {
      console.error("Update transaction status error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update transaction status",
        error: error.message,
      });
    }
  }

  // Get transaction statistics
  static async getTransactionStats(req, res) {
    try {
      const { user_id, date_from, date_to } = req.query;

      const stats = await Transaction.getStatistics(
        user_id,
        date_from,
        date_to
      );

      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      console.error("Get transaction stats error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to get transaction statistics",
        error: error.message,
      });
    }
  }

  // Delete transaction (Admin only)
  static async deleteTransaction(req, res) {
    try {
      const { id } = req.params;

      const transaction = await Transaction.findById(id);

      if (!transaction) {
        return res.status(404).json({
          success: false,
          message: "Transaction not found",
        });
      }

      await transaction.delete();

      res.json({
        success: true,
        message: "Transaction deleted successfully",
      });
    } catch (error) {
      console.error("Delete transaction error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to delete transaction",
        error: error.message,
      });
    }
  }

  // Export transactions (Admin only)
  static async exportTransactions(req, res) {
    try {
      const {
        user_id,
        transaction_type,
        status,
        source_type,
        date_from,
        date_to,
        format = "json",
      } = req.query;

      const filters = {};
      if (user_id) filters.user_id = user_id;
      if (transaction_type) filters.transaction_type = transaction_type;
      if (status) filters.status = status;
      if (source_type) filters.source_type = source_type;
      if (date_from) filters.date_from = date_from;
      if (date_to) filters.date_to = date_to;

      // Get all transactions without pagination for export
      const result = await Transaction.getAll(1, 10000, filters);

      if (format === "csv") {
        // Convert to CSV format
        const csvHeaders = [
          "ID",
          "User ID",
          "Transaction Hash",
          "Reference ID",
          "Type",
          "Amount",
          "Fee Amount",
          "Net Amount",
          "Currency",
          "Status",
          "Source Type",
          "Source Details",
          "Created At",
        ];

        const csvRows = result.transactions.map((t) => [
          t.id,
          t.user_id,
          t.transaction_hash,
          t.reference_id,
          t.transaction_type,
          t.amount,
          t.fee_amount,
          t.net_amount,
          t.currency,
          t.status,
          t.source_type,
          t.source_details,
          t.created_at,
        ]);

        const csvContent = [csvHeaders, ...csvRows]
          .map((row) => row.map((field) => `"${field}"`).join(","))
          .join("\n");

        res.setHeader("Content-Type", "text/csv");
        res.setHeader(
          "Content-Disposition",
          "attachment; filename=transactions.csv"
        );
        res.send(csvContent);
      } else {
        res.json({
          success: true,
          data: result,
        });
      }
    } catch (error) {
      console.error("Export transactions error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to export transactions",
        error: error.message,
      });
    }
  }
}

module.exports = TransactionController;
