import jwt from "jsonwebtoken";
import { query } from "../config/database.js";

// Middleware to verify JWT token
export const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: "Access token required" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user details from database
    const userResult = await query(
      `SELECT u.*, c.name as company_name, c.subdomain 
             FROM users u 
             JOIN companies c ON u.company_id = c.id 
             WHERE u.id = $1 AND u.is_active = true AND c.is_active = true`,
      [decoded.userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: "Invalid token - user not found" });
    }

    req.user = userResult.rows[0];
    next();
  } catch (error) {
    console.error("JWT verification error:", error);
    return res.status(403).json({ error: "Invalid or expired token" });
  }
};

// Middleware to check user roles
export const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const userRole = req.user.role;
    if (!roles.includes(userRole)) {
      return res.status(403).json({
        error: "Insufficient permissions",
        required: roles,
        current: userRole,
      });
    }

    next();
  };
};

// Middleware to check if user is admin or HR
export const requireHROrAdmin = requireRole(["admin", "hr"]);

// Middleware to check if user is admin
export const requireAdmin = requireRole(["admin"]);

// Middleware to check if user is manager or above
export const requireManager = requireRole(["manager"]);
