  const mysql = require("mysql2/promise");
  require("dotenv").config();

  class Database {
    constructor() {
      this.pool = mysql.createPool({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD ,
        database: process.env.DB_NAME ,
        port: parseInt(process.env.DB_PORT),

        // Connection pool settings
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        acquireTimeout: 60000,
        timeout: 60000,

        // MySQL specific settings
        supportBigNumbers: true,
        bigNumberStrings: true,
        dateStrings: false,
        debug: false,
        multipleStatements: false,
        reconnect: true,
        charset: "utf8mb4",
        typeCast: true,

        // Additional recommended settings
        ssl:
          process.env.DB_SSL === "true"
            ? {
                rejectUnauthorized: false,
              }
            : false,
        timezone: "+00:00", // Use UTC

        // Connection idle timeout
        idleTimeout: 300000, // 5 minutes

        // Enable keep alive
        keepAliveInitialDelay: 0,
      });

      // Set up event listeners
      this.setupEventListeners();

      // Test connection
      this.testConnection();
    }

    setupEventListeners() {
      this.pool.on("connection", (connection) => {
        console.log("🔗 New database connection established");
      });

      this.pool.on("error", (err) => {
        console.error("❌ Database pool error:", err);
        if (err.code === "PROTOCOL_CONNECTION_LOST") {
          console.log("🔄 Attempting to reconnect...");
        }
      });

      this.pool.on("release", (connection) => {
        console.log("🔓 Database connection released");
      });
    }

    async testConnection() {
      try {
        const connection = await this.pool.getConnection();
        console.log("✅ Database connected successfully");
        console.log(`📊 Database: ${process.env.DB_NAME || "multilevel"}`);
        console.log(
          `🏠 Host: ${process.env.DB_HOST || "localhost"}:${
            process.env.DB_PORT || 3306
          }`
        );
        connection.release();
      } catch (error) {
        console.error("❌ Database connection failed:", error.message);
        console.error("🔍 Please check your database configuration");
        process.exit(1);
      }
    }

    async query(sql, params = []) {
      let connection;
      try {
        connection = await this.pool.getConnection();
        const [results] = await connection.execute(sql, params);
        return results;
      } catch (error) {
        console.error("❌ Database query error:", {
          message: error.message,
          sql: sql.substring(0, 100) + "...",
          params: params.length > 0 ? params : "none",
        });
        throw error;
      } finally {
        if (connection) connection.release();
      }
    }

    async execute(sql, params = []) {
      // Alias for query method for consistency
      return this.query(sql, params);
    }

    async getConnection() {
      try {
        return await this.pool.getConnection();
      } catch (error) {
        console.error("❌ Failed to get database connection:", error.message);
        throw error;
      }
    }

    async beginTransaction() {
      const connection = await this.getConnection();
      try {
        await connection.beginTransaction();
        return connection;
      } catch (error) {
        connection.release();
        console.error("❌ Failed to begin transaction:", error.message);
        throw error;
      }
    }
    // Add this method to your Database class (in addition to the existing query method)
    async queryWithLimitOffset(sql, params = []) {
      let connection;
      try {
        connection = await this.pool.getConnection();
        // Use connection.query() instead of connection.execute() for LIMIT/OFFSET queries
        const [results] = await connection.query(sql, params);
        return results;
      } catch (error) {
        console.error("❌ Database query error:", {
          message: error.message,
          sql: sql.substring(0, 100) + "...",
          params: params.length > 0 ? params : "none",
        });
        throw error;
      } finally {
        if (connection) connection.release();
      }
    }

    async commitTransaction(connection) {
      try {
        await connection.commit();
        console.log("✅ Transaction committed successfully");
      } catch (error) {
        console.error("❌ Error committing transaction:", error.message);
        throw error;
      } finally {
        if (connection) connection.release();
      }
    }

    async rollbackTransaction(connection) {
      try {
        await connection.rollback();
        console.log("🔄 Transaction rolled back");
      } catch (error) {
        console.error("❌ Error rolling back transaction:", error.message);
        throw error;
      } finally {
        if (connection) connection.release();
      }
    }

    // Execute transaction with automatic rollback on error
    async executeTransaction(callback) {
      const connection = await this.beginTransaction();
      try {
        const result = await callback(connection);
        await this.commitTransaction(connection);
        return result;
      } catch (error) {
        await this.rollbackTransaction(connection);
        throw error;
      }
    }

    // Get pool statistics
    getPoolStats() {
      return {
        totalConnections: this.pool.pool._allConnections.length,
        freeConnections: this.pool.pool._freeConnections.length,
        acquiringConnections: this.pool.pool._acquiringConnections.length,
        connectionLimit: this.pool.pool.config.connectionLimit,
      };
    }

    // Health check method
    async healthCheck() {
      try {
        const result = await this.query("SELECT 1 as health_check");
        return {
          status: "healthy",
          timestamp: new Date().toISOString(),
          poolStats: this.getPoolStats(),
        };
      } catch (error) {
        return {
          status: "unhealthy",
          error: error.message,
          timestamp: new Date().toISOString(),
        };
      }
    }

    async close() {
      try {
        await this.pool.end();
        console.log("🔒 Database connection pool closed");
      } catch (error) {
        console.error("❌ Error closing database pool:", error.message);
        throw error;
      }
    }

    // Graceful shutdown
    async gracefulShutdown() {
      console.log("🛑 Initiating graceful database shutdown...");
      try {
        // Wait for active connections to finish
        await new Promise((resolve) => setTimeout(resolve, 1000));
        await this.close();
        console.log("✅ Database shutdown completed");
      } catch (error) {
        console.error("❌ Error during graceful shutdown:", error.message);
        throw error;
      }
    }
  }

  // Create singleton instance
  const database = new Database();

  // Handle graceful shutdown
  process.on("SIGTERM", async () => {
    console.log("📡 SIGTERM received, shutting down gracefully...");
    await database.gracefulShutdown();
    process.exit(0);
  });

  process.on("SIGINT", async () => {
    console.log("📡 SIGINT received, shutting down gracefully...");
    await database.gracefulShutdown();
    process.exit(0);
  });

  module.exports = database;
