const mysql = require("mysql2/promise");
  require("dotenv").config();
// Create connection pool for better performance and connection management
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: parseInt(process.env.DB_PORT) || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  connectTimeout: 10000,
  queueLimit: 0,
  acquireTimeout: 60000,
  timeout: 60000,
  reconnect: true
});

// Test the connection
(async () => {
  try {
    const connection = await pool.getConnection();
    console.log("Connected to database successfully");
    connection.release();
  } catch (err) {
    console.error("Error connecting to database:", err);
  }
})();

// Export the pool with a query method that the User model expects
module.exports = {
  query: async (sql, params = []) => {
    try {
      const [results] = await pool.execute(sql, params);
      return results;
    } catch (error) {
      console.error("Database query error:", error);
      throw error;
    }
  },
  pool: pool
};