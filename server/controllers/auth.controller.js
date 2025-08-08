const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("../models/User");
const { validationResult } = require("express-validator");
const RewardAssignmentService = require("../service/reward.assignment.service");
const UserWalletAddress = require("../models/UserWallets");
class AuthController {
  constructor() {
    this.rewardService = new RewardAssignmentService();
  }
  // Generate JWT token
  generateToken(user) {
    return jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "24h" }
    );
  }

  // Generate referral code
  generateUsername() {
    return crypto.randomBytes(6).toString("hex").toUpperCase();
  }
  generateReferralCode() {
    const randomNumber = Math.floor(Math.random() * 999999) + 1; // Generate a random number between 1 and 999999
    const formattedNumber = randomNumber.toString().padStart(6, "0"); // Format number to 6 digits with leading zeros if necessary
    return `GYG${formattedNumber}`;
  }

  // User registration
  register = async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      const { email, password, full_name, phone, country_code, referrer_code } =
        req.body;

      const username = this.generateUsername();
      const existingUser = await User.findByEmailOrUsername(email, username);
      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: "User with this email or username already exists",
        });
      }

      // Find referrer if referral code provided
      let referrer = null;
      if (referrer_code) {
        referrer = await User.findByReferralCode(referrer_code);
        if (!referrer) {
          return res.status(400).json({
            success: false,
            message: "Invalid referral code",
          });
        }
      }

      // Hash password
      const salt = await bcrypt.genSalt(12);
      const password_hash = await bcrypt.hash(password, salt);

      // Create user
      const userData = {
        username,
        email,
        password_hash,
        full_name,
        phone,
        country_code,
        referrer_id: referrer?.id || null,
        referral_code: this.generateReferralCode(),
        status: "inactive",
      };

      const user = await User.create(userData);

      // Generate token
      const token = this.generateToken(user);

      await this.rewardService.assignRewardsToUser(user.id);
 
      res.status(201).json({
        success: true,
        message: "User registered successfully. Please verify your email.",
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          full_name: user.full_name,
          role: user.role,
          status: user.status,
          referral_code: user.referral_code,
        },
        token,
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error during registration",
      });
    }
  };

  // User login
  login = async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      const { email, password } = req.body;

      // Find user by email
      const user = await User.findByEmail(email);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Invalid credentials",
        });
      }

      // Check account status
      const restrictedStatuses = ["banned", "suspended"];
      if (restrictedStatuses.includes(user.status)) {
        return res.status(403).json({
          success: false,
          message: `Account is ${user.status}. Please contact support.`,
        });
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(
        password,
        user.password_hash
      );
      if (!isValidPassword) {
        return res.status(401).json({
          success: false,
          message: "Invalid credentials",
        });
      }

      // Update last login timestamp
      await User.updateLastLogin(user.id);

      // Generate token and build response data
      const token = this.generateToken(user);
      const userPayload = {
        id: user.id,
        username: user.username,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        status: user.status,
        email_verified_at: user.email_verified_at,
      };

      return res.json({
        success: true,
        message: "Login successful",
        [user.role === "admin" ? "admin" : "user"]: userPayload,
        token,
      });
    } catch (error) {
      console.error("Login error:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error during login",
      });
    }
  };

  adminLogin = async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      const { email } = req.body;

      // Find user by email
      const user = await User.findByEmail(email);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      // Check if user is admin

      // Check account status
      const restrictedStatuses = ["banned", "suspended"];
      if (restrictedStatuses.includes(user.status)) {
        return res.status(403).json({
          success: false,
          message: `Account is ${user.status}. Please contact support.`,
        });
      }

      // Update last login timestamp
      await User.updateLastLogin(user.id);

      // Generate token and build response data
      const token = this.generateToken(user);
      const payload = {
        id: user.id,
        username: user.username,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        status: user.status,
        email_verified_at: user.email_verified_at,
      };

      return res.json({
        success: true,
        message: "Admin login successful",
        user: payload,
        token,
      });
    } catch (error) {
      console.error("Admin login error:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error during admin login",
      });
    }
  };
  // Change password
  changePassword = async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      const { current_password, new_password } = req.body;
      const userId = req.user.id;

      // Get user with password
      const user = await User.findById(userId);

      // Verify current password
      const isValidPassword = await bcrypt.compare(
        current_password,
        user.password_hash
      );
      if (!isValidPassword) {
        return res.status(400).json({
          success: false,
          message: "Current password is incorrect",
        });
      }

      // Hash new password
      const salt = await bcrypt.genSalt(12);
      const new_password_hash = await bcrypt.hash(new_password, salt);

      // Update password
      await User.updatePassword(userId, new_password_hash);

      res.json({
        success: true,
        message: "Password changed successfully",
      });
    } catch (error) {
      console.error("Change password error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  };

  // Verify email
  verifyEmail = async (req, res) => {
    try {
      const { token } = req.params;

      // In a real implementation, you'd verify the email verification token
      // For now, we'll just activate the account
      const decoded = jwt.verify(token, process.env.EMAIL_VERIFICATION_SECRET);

      await User.verifyEmail(decoded.userId);

      res.json({
        success: true,
        message: "Email verified successfully",
      });
    } catch (error) {
      console.error("Email verification error:", error);
      res.status(400).json({
        success: false,
        message: "Invalid or expired verification token",
      });
    }
  };

  // Get current user profile
  getProfile = async (req, res) => {
    try {
      const user = await User.findById(req.user.id);

      res.json({
        success: true,
        data: {
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            full_name: user.full_name,
            phone: user.phone,
            profile_image: user.profile_image,
            date_of_birth: user.date_of_birth,
            country_code: user.country_code,
            role: user.role,
            status: user.status,
            referral_code: user.referral_code,
            email_verified_at: user.email_verified_at,
            phone_verified_at: user.phone_verified_at,
            last_login_at: user.last_login_at,
            created_at: user.created_at,
          },
        },
      });
    } catch (error) {
      console.error("Get profile error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  };

  // Logout (in a real app, you might want to blacklist the token)
  logout = async (req, res) => {
    res.json({
      success: true,
      message: "Logged out successfully",
    });
  };
}

module.exports = new AuthController();
