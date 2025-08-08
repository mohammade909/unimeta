const db = require("../database");
const RewardAssignmentService = require("../service/reward.assignment.service");
class User {
  constructor(userData = {}) {
    this.id = userData.id;
    this.username = userData.username;
    this.email = userData.email;
    this.password_hash = userData.password_hash;
    this.phone = userData.phone;
    this.full_name = userData.full_name;
    this.profile_image = userData.profile_image;
    this.date_of_birth = userData.date_of_birth;
    this.country_code = userData.country_code;
    this.role = userData.role || "user";
    this.status = userData.status || "inactive";
    this.email_verified_at = userData.email_verified_at;
    this.phone_verified_at = userData.phone_verified_at;
    this.referrer_id = userData.referrer_id;
    this.referral_code = userData.referral_code;
    this.last_login_at = userData.last_login_at;
    this.created_at = userData.created_at;
    this.updated_at = userData.updated_at;
  }

  // Create a new user
  static async create(userData) {
    const sql = `
            INSERT INTO users (
                username, email, password_hash, phone, full_name,
                profile_image, date_of_birth, country_code, role, status,
                referrer_id, referral_code
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

    const params = [
      userData.username,
      userData.email,
      userData.password_hash,
      userData.phone || null,
      userData.full_name,
      userData.profile_image || null,
      userData.date_of_birth || null,
      userData.country_code || null,
      userData.role || "user",
      userData.status || "inactive",
      userData.referrer_id || null,
      userData.referral_code,
    ];

    try {
      const result = await db.query(sql, params);
      const newUser = await this.findById(result.insertId);
      await this.autoAssignRewards(newUser.id);
      return new User(newUser);
    } catch (error) {
      if (error.code === "ER_DUP_ENTRY") {
        if (error.message.includes("username")) {
          throw new Error("Username already exists");
        } else if (error.message.includes("email")) {
          throw new Error("Email already exists");
        } else if (error.message.includes("referral_code")) {
          throw new Error("Referral code already exists");
        }
      }
      throw error;
    }
  }

  static async autoAssignRewards(userId) {
    try {
      const rewardService = new RewardAssignmentService();

      // Small delay to ensure user is fully created
      setTimeout(async () => {
        try {
          const result = await rewardService.assignRewardsToUser(userId);
          if (result.success) {
            console.log(
              `Rewards auto-assigned to user ${userId}:`,
              result.assigned_rewards
            );
          } else {
            console.log(
              `Failed to auto-assign rewards to user ${userId}:`,
              result.message
            );
          }
        } catch (error) {
          console.error(
            `Error auto-assigning rewards to user ${userId}:`,
            error
          );
        }
      }, 1000);
    } catch (error) {
      console.error(`Error in autoAssignRewards for user ${userId}:`, error);
    }
  }

  // Find user by ID
  static async findById(id) {
    const sql = "SELECT * FROM users WHERE id = ?";
    const results = await db.query(sql, [id]);
    return results.length > 0 ? results[0] : null;
  }

  // Find user by email
  static async findByEmail(email) {
    const sql = "SELECT * FROM users WHERE email = ?";
    const results = await db.query(sql, [email]);
    return results.length > 0 ? results[0] : null;
  }

  // Find user by username
  static async findByUsername(username) {
    const sql = "SELECT * FROM users WHERE username = ?";
    const results = await db.query(sql, [username]);
    return results.length > 0 ? results[0] : null;
  }

  // Find user by email or username
  static async findByEmailOrUsername(email, username) {
    const sql = "SELECT * FROM users WHERE email = ? OR username = ?";
    const results = await db.query(sql, [email, username]);
    return results.length > 0 ? results[0] : null;
  }

  // Find user by referral code
  static async findByReferralCode(referralCode) {
    const sql = "SELECT * FROM users WHERE referral_code = ?";
    const results = await db.query(sql, [referralCode]);
    return results.length > 0 ? results[0] : null;
  }

  // Update user
  static async update(id, updateData) {
    const allowedFields = [
      "username",
      "email",
      "phone",
      "full_name",
      "profile_image",
      "date_of_birth",
      "country_code",
    ];

    const updateFields = [];
    const updateValues = [];

    for (const [key, value] of Object.entries(updateData)) {
      if (allowedFields.includes(key)) {
        updateFields.push(`${key} = ?`);
        updateValues.push(value);
      }
    }

    if (updateFields.length === 0) {
      throw new Error("No valid fields to update");
    }

    updateValues.push(id);
    const sql = `UPDATE users SET ${updateFields.join(
      ", "
    )}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;

    try {
      await db.query(sql, updateValues);
      return await this.findById(id);
    } catch (error) {
      if (error.code === "ER_DUP_ENTRY") {
        if (error.message.includes("username")) {
          throw new Error("Username already exists");
        } else if (error.message.includes("email")) {
          throw new Error("Email already exists");
        }
      }
      throw error;
    }
  }

  // Update password
  static async updatePassword(id, passwordHash) {
    const sql =
      "UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?";
    await db.query(sql, [passwordHash, id]);
  }

  // Update last login
  static async updateLastLogin(id) {
    const sql =
      "UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE id = ?";
    await db.query(sql, [id]);
  }

  // Verify email
  static async verifyEmail(id) {
    const sql =
      'UPDATE users SET email_verified_at = CURRENT_TIMESTAMP, status = "active", updated_at = CURRENT_TIMESTAMP WHERE id = ?';
    await db.query(sql, [id]);
  }

  // Verify phone
  static async verifyPhone(id) {
    const sql =
      "UPDATE users SET phone_verified_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = ?";
    await db.query(sql, [id]);
  }

  // Update user status (admin only)
  static async updateStatus(id, status) {
    const sql =
      "UPDATE users SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?";
    await db.query(sql, [status, id]);
  }

  // Update user role (admin only)
  static async updateRole(id, role) {
    const sql =
      "UPDATE users SET role = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?";
    await db.query(sql, [role, id]);
  }

  // Alternative approach - User.findAll method
  static async findAll(options = {}) {
    const {
      page = 1,
      limit = 1000,
      search = "",
      filters = {},
      sort = "created_at",
      order = "desc",
    } = options;

    // Ensure page and limit are integers
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10;
    const offset = (pageNum - 1) * limitNum;

    const whereConditions = [];
    const queryParams = [];

    // Add search condition
    if (search && search.trim()) {
      whereConditions.push(
        "(u.username LIKE ? OR u.email LIKE ? OR u.full_name LIKE ?)"
      );
      const searchTerm = `%${search.trim()}%`;
      queryParams.push(searchTerm, searchTerm, searchTerm);
    }

    // Add filters
    if (filters.status) {
      whereConditions.push("u.status = ?");
      queryParams.push(filters.status);
    }

    if (filters.role) {
      whereConditions.push("u.role = ?");
      queryParams.push(filters.role);
    }

    if (filters.email_verified) {
      if (filters.email_verified === "true") {
        whereConditions.push("u.email_verified_at IS NOT NULL");
      } else {
        whereConditions.push("u.email_verified_at IS NULL");
      }
    }

    const whereClause =
      whereConditions.length > 0
        ? `WHERE ${whereConditions.join(" AND ")}`
        : "";

    // Validate sort column (update with table alias)
    const allowedSortColumns = [
      "created_at",
      "updated_at",
      "username",
      "email",
      "full_name",
    ];
    const sortColumn = allowedSortColumns.includes(sort)
      ? `u.${sort}`
      : "u.created_at";
    const orderDirection = order.toLowerCase() === "asc" ? "ASC" : "DESC";

    try {
      // Get total count first
      const countSql = `SELECT COUNT(*) as total FROM users u ${whereClause}`;
      const countResult = await db.query(countSql, queryParams);
      const total = countResult[0].total;

      // Build main query with wallet information and referral count
      const sql = `
      SELECT 
        u.id, u.username, u.email, u.phone, u.full_name, u.profile_image,
        u.date_of_birth, u.country_code, u.role, u.status,
        u.email_verified_at, u.phone_verified_at, u.referrer_id,
        u.referral_code, u.last_login_at, u.created_at, u.updated_at,
        
        -- Wallet information
        w.id as wallet_id,
        w.main_balance,
        w.roi_balance,
        w.commission_balance,
        w.bonus_balance,
        w.locked_amount,
        w.withdrawal_limit,
        w.total_earned,
        w.total_withdrawn,
        w.total_invested,
        w.last_updated as wallet_last_updated,
        w.created_at as wallet_created_at,
        
        -- Referral count
        COALESCE(r.total_referrals, 0) as total_referrals
      FROM users u
      LEFT JOIN user_wallets w ON u.id = w.user_id
      LEFT JOIN (
        SELECT referrer_id, COUNT(*) as total_referrals
        FROM users
        WHERE referrer_id IS NOT NULL
        GROUP BY referrer_id
      ) r ON u.id = r.referrer_id
      ${whereClause}
      ORDER BY ${sortColumn} ${orderDirection}
      LIMIT ${limitNum} OFFSET ${offset}
    `;

      // Execute main query
      const users = await db.query(sql, queryParams);

      return {
        users,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum),
        },
      };
    } catch (error) {
      console.error("Database error in User.findAll:", error);
      throw error;
    }
  }

  static async getAllUsers() {
    try {
      const sql = `
        SELECT id, username, email, full_name, status, created_at
        FROM users 
        WHERE status = 'active'
        ORDER BY created_at DESC
      `;

      const users = await db.query(sql);
      return users;
    } catch (error) {
      console.error("Database error in User.getAllUsers:", error);
      throw error;
    }
  }
  // Get user referrals with wallet information
  static async getReferrals(userId, options = {}) {
    const { page = 1, limit = 10 } = options;
    const offset = (page - 1) * limit;

    try {
      // Get total count
      const countSql =
        "SELECT COUNT(*) as total FROM users WHERE referrer_id = ?";
      const countResult = await db.query(countSql, [userId]);
      const total = countResult[0].total;

      // Get referrals with wallet information
      const sql = `
      SELECT 
        u.id, u.username, u.email, u.full_name, u.status, u.role,
        u.email_verified_at, u.created_at,
        
        -- Wallet information
        w.id as wallet_id,
        w.main_balance,
        w.roi_balance,
        w.commission_balance,
        w.bonus_balance,
        w.locked_amount,
        w.withdrawal_limit,
        w.total_earned,
        w.total_withdrawn,
        w.total_invested,
        w.last_updated as wallet_last_updated,
        w.created_at as wallet_created_at
      FROM users u
      LEFT JOIN user_wallets w ON u.id = w.user_id
      WHERE u.referrer_id = ?
      ORDER BY u.created_at DESC
      LIMIT ? OFFSET ?
    `;

      const referrals = await db.query(sql, [userId, limit, offset]);

      // Calculate total earned across all referrals
      const totalEarnedSql = `
      SELECT SUM(w.total_earned) as total_referrals_earned
      FROM users u
      LEFT JOIN user_wallets w ON u.id = w.user_id
      WHERE u.referrer_id = ?
    `;

      const totalEarnedResult = await db.query(totalEarnedSql, [userId]);
      const totalReferralsEarned =
        totalEarnedResult[0].total_referrals_earned || 0;

      return {
        referrals,
        totalReferralsEarned,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      console.error("Database error in User.getReferrals:", error);
      throw error;
    }
  }

  // Get user statistics
  static async getStats() {
    const queries = [
      "SELECT COUNT(*) as total FROM users",
      'SELECT COUNT(*) as active FROM users WHERE status = "active"',
      'SELECT COUNT(*) as inactive FROM users WHERE status = "inactive"',
      'SELECT COUNT(*) as suspended FROM users WHERE status = "suspended"',
      'SELECT COUNT(*) as banned FROM users WHERE status = "banned"',
      "SELECT COUNT(*) as email_verified FROM users WHERE email_verified_at IS NOT NULL",
      "SELECT COUNT(*) as phone_verified FROM users WHERE phone_verified_at IS NOT NULL",
      'SELECT COUNT(*) as admins FROM users WHERE role = "admin"',
      'SELECT COUNT(*) as managers FROM users WHERE role = "manager"',
      'SELECT COUNT(*) as users FROM users WHERE role = "user"',
      "SELECT COUNT(*) as today_registrations FROM users WHERE DATE(created_at) = CURDATE()",
      "SELECT COUNT(*) as this_week FROM users WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)",
      "SELECT COUNT(*) as this_month FROM users WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)",
    ];

    const results = await Promise.all(queries.map((query) => db.query(query)));

    return {
      total: results[0][0].total,
      status: {
        active: results[1][0].active,
        inactive: results[2][0].inactive,
        suspended: results[3][0].suspended,
        banned: results[4][0].banned,
      },
      verification: {
        email_verified: results[5][0].email_verified,
        phone_verified: results[6][0].phone_verified,
      },
      roles: {
        admins: results[7][0].admins,
        managers: results[8][0].managers,
        users: results[9][0].users,
      },
      registrations: {
        today: results[10][0].today_registrations,
        this_week: results[11][0].this_week,
        this_month: results[12][0].this_month,
      },
    };
  }

  // Get referral tree (for MLM structure)
  static async getReferralTree(userId, depth = 3) {
    const getReferralsRecursive = async (parentId, currentDepth) => {
      if (currentDepth > depth) return [];

      const sql = `
                SELECT 
                    id, username, email, full_name, status, role,
                    email_verified_at, created_at
                FROM users 
                WHERE referrer_id = ? 
                ORDER BY created_at DESC
            `;

      const directReferrals = await db.query(sql, [parentId]);

      const referralsWithChildren = await Promise.all(
        directReferrals.map(async (referral) => ({
          ...referral,
          children: await getReferralsRecursive(referral.id, currentDepth + 1),
          level: currentDepth,
        }))
      );

      return referralsWithChildren;
    };

    return await getReferralsRecursive(userId, 1);
  }

  // Soft delete user
  static async softDelete(id) {
    const sql =
      'UPDATE users SET status = "banned", updated_at = CURRENT_TIMESTAMP WHERE id = ?';
    await db.query(sql, [id]);
  }

  // Hard delete user (use with caution)
  static async hardDelete(id) {
    const sql = "DELETE FROM users WHERE id = ?";
    await db.query(sql, [id]);
  }

  // Check if referral code exists
  static async isReferralCodeExists(referralCode) {
    const sql = "SELECT COUNT(*) as count FROM users WHERE referral_code = ?";
    const result = await db.query(sql, [referralCode]);
    return result[0].count > 0;
  }

  // Get user with referrer info
  static async findByIdWithReferrer(id) {
    const sql = `
            SELECT 
                u.*,
                r.username as referrer_username,
                r.full_name as referrer_full_name,
                r.email as referrer_email
            FROM users u
            LEFT JOIN users r ON u.referrer_id = r.id
            WHERE u.id = ?
        `;
    const results = await db.query(sql, [id]);
    return results.length > 0 ? results[0] : null;
  }

  // Get recent user activities (last logins)
  static async getRecentActivities(limit = 10) {
    const sql = `
            SELECT 
                id, username, email, full_name, last_login_at
            FROM users 
            WHERE last_login_at IS NOT NULL 
            ORDER BY last_login_at DESC 
            LIMIT ?
        `;
    return await db.query(sql, [limit]);
  }

  // Search users by various criteria
  static async search(query, limit = 10) {
    const sql = `
            SELECT 
                id, username, email, full_name, role, status,
                profile_image, created_at
            FROM users 
            WHERE 
                username LIKE ? OR 
                email LIKE ? OR 
                full_name LIKE ? OR
                referral_code LIKE ?
            ORDER BY 
                CASE 
                    WHEN username = ? THEN 1
                    WHEN email = ? THEN 2
                    WHEN username LIKE ? THEN 3
                    WHEN email LIKE ? THEN 4
                    ELSE 5
                END,
                created_at DESC
            LIMIT ?
        `;

    const searchTerm = `%${query}%`;
    const exactMatch = query;
    const startsWith = `${query}%`;

    const params = [
      searchTerm,
      searchTerm,
      searchTerm,
      searchTerm,
      exactMatch,
      exactMatch,
      startsWith,
      startsWith,
      limit,
    ];

    return await db.query(sql, params);
  }

  // Get user instance methods
  async save() {
    if (this.id) {
      return await User.update(this.id, this);
    } else {
      const created = await User.create(this);
      Object.assign(this, created);
      return this;
    }
  }

  async delete() {
    if (this.id) {
      await User.softDelete(this.id);
    }
  }

  // Convert to JSON (remove sensitive data)
  toJSON() {
    const { password_hash, ...userWithoutPassword } = this;
    return userWithoutPassword;
  }
}

module.exports = User;
