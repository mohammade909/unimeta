// controllers/UserController.js
const User = require("../models/User");
const { validationResult } = require("express-validator");
const ROI = require("../service/roi.proccess");
const Database = require("../database");

class UserController {
  constructor() {
    this.roiService = new ROI();
  }
  // Get all users (admin only)
  getAllUsers = async (req, res) => {
    try {
      const {
        page = 1,
        limit = 500,
        search = "",
        status = "",
        role = "",
        sort = "created_at",
        order = "desc",
      } = req.query;

      const filters = {};
      if (status) filters.status = status;
      if (role) filters.role = role;

      const users = await User.findAll({
        page: parseInt(page),
        limit: parseInt(limit),
        search,
        filters,
        sort,
        order,
      });

      res.json({
        success: true,
        data: users,
      });
    } catch (error) {
      console.error("Get all users error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  };

  // Get user by ID
  getUserById = async (req, res) => {
    try {
      const { id } = req.params;

      const user = await User.findById(id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      res.json({
        success: true,
        data: { user },
      });
    } catch (error) {
      console.error("Get user by ID error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  };
  getUserProfile = async (req, res) => {
    try {
      const { id } = req.user;

      const user = await User.findById(id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      res.json({
        success: true,
        user,
      });
    } catch (error) {
      console.error("Get user by ID error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  };
  selfROIProcess = async (req, res) => {
    try {
      const { id } = req.user;
      const connection = await Database.getConnection();
      const roiProcessor = new ROI(connection);
      const roiData = await roiProcessor.processUserROI(id);
      res.json({
        success: true,
        data: roiData,
      });
    } catch (error) {
      console.error("Self ROI process error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  };

  // Update user profile
  updateProfile = async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      const userId = req.params.id || req.user.id;
      const updateData = req.body;
      console.log("Update data:", updateData);

      // Remove sensitive fields that shouldn't be updated via this endpoint
      delete updateData.password;
      delete updateData.password_hash;
      delete updateData.role;
      delete updateData.referrer_id;
      delete updateData.referral_code;

      const updatedUser = await User.update(userId, updateData);

      res.json({
        success: true,
        message: "Profile updated successfully",
        data: { user: updatedUser },
      });
    } catch (error) {
      console.error("Update profile error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  };

  // Admin: Update user status
  updateUserStatus = async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!["active", "inactive", "suspended", "banned"].includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid status value",
        });
      }

      await User.updateStatus(id, status);

      res.json({
        success: true,
        message: "User status updated successfully",
      });
    } catch (error) {
      console.error("Update user status error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  };

  // Admin: Update user role
  updateUserRole = async (req, res) => {
    try {
      const { id } = req.params;
      const { role } = req.body;

      if (!["user", "admin", "manager"].includes(role)) {
        return res.status(400).json({
          success: false,
          message: "Invalid role value",
        });
      }

      await User.updateRole(id, role);

      res.json({
        success: true,
        message: "User role updated successfully",
      });
    } catch (error) {
      console.error("Update user role error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  };

  // Get user's referrals
  getUserReferrals = async (req, res) => {
    try {
      const userId = req.params.id || req.user.id;
      const { page = 1, limit = 10 } = req.query;

      const referrals = await User.getReferrals(userId, {
        page: parseInt(page),
        limit: parseInt(limit),
      });

      res.json({
        success: true,
        data: referrals,
      });
    } catch (error) {
      console.error("Get user referrals error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  };

  // Delete user (soft delete)
  deleteUser = async (req, res) => {
    try {
      const { id } = req.params;

      // Prevent self-deletion
      if (req.user.id == id) {
        return res.status(400).json({
          success: false,
          message: "You cannot delete your own account",
        });
      }

      await User.softDelete(id);

      res.json({
        success: true,
        message: "User deleted successfully",
      });
    } catch (error) {
      console.error("Delete user error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  };

  // Get user statistics (admin only)
  getUserStats = async (req, res) => {
    try {
      const stats = await User.getStats();

      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      console.error("Get user stats error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  };
}

module.exports = new UserController();

// ==================== ROUTES ====================
