import pkg from "pg";
import dotenv from "dotenv";
const { Pool } = pkg;

// Configure dotenv
dotenv.config();

const pool = new Pool({
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || "peoplepulse_ai",
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});
// console.log("POOL:", pool);

// Test database connection
pool.on("connect", () => {
  console.log("📊 Connected to PostgreSQL database");
});

pool.on("error", (err) => {
  console.error("🔥 Database connection error:", err);
  process.exit(-1);
});

// Helper function to execute queries
export const query = async (text, params) => {
  const start = Date.now();
  try {
    // console.log("🗄️  Executing query:", text, params);

    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    // console.log("🗄️  Executed query", { text, duration, rows: res.rowCount });
    return res;
  } catch (error) {
    console.error("🔥 Database query error:", error);
    throw error;
  }
};

// Helper function to get client for transactions
export const getClient = async () => {
  const client = await pool.connect();
  return client;
};

// Helper function for transactions
export const transaction = async (callback) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const result = await callback(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

export { pool };

export default {
  pool,
  query,
  getClient,
  transaction,
};
