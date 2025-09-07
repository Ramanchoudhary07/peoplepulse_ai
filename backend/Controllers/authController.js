import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { query, transaction } from "../config/database.js";

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};

// Register new company and admin user
export const register = async (req, res) => {
  try {
    const {
      companyName,
      subdomain,
      email,
      password,
      firstName,
      lastName,
      phone,
      address,
    } = req.body;

    // Validation
    if (
      !companyName ||
      !subdomain ||
      !email ||
      !password ||
      !firstName ||
      !lastName
    ) {
      return res.status(400).json({
        error: "Missing required fields",
        required: [
          "companyName",
          "subdomain",
          "email",
          "password",
          "firstName",
          "lastName",
        ],
      });
    }

    // Check if subdomain already exists
    const existingCompany = await query(
      "SELECT id FROM companies WHERE subdomain = $1",
      [subdomain.toLowerCase()]
    );

    if (existingCompany.rows.length > 0) {
      return res.status(400).json({ error: "Subdomain already taken" });
    }

    // Check if email already exists
    const existingUser = await query("SELECT id FROM users WHERE email = $1", [
      email.toLowerCase(),
    ]);

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: "Email already registered" });
    }

    // Hash password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create company and admin user in transaction
    const result = await transaction(async (client) => {
      // Create company
      const companyResult = await client.query(
        `INSERT INTO companies (name, subdomain, email, phone, address) 
        VALUES ($1, $2, $3, $4, $5) 
        RETURNING id, name, subdomain`,
        [
          companyName,
          subdomain.toLowerCase(),
          email.toLowerCase(),
          phone,
          address,
        ]
      );

      const company = companyResult.rows[0];

      // Create admin user
      const userResult = await client.query(
        `INSERT INTO users (company_id, email, password_hash, first_name, last_name, role, hire_date) 
        VALUES ($1, $2, $3, $4, $5, $6, CURRENT_DATE) 
        RETURNING id, email, first_name, last_name, role`,
        [
          company.id,
          email.toLowerCase(),
          passwordHash,
          firstName,
          lastName,
          "admin",
        ]
      );

      const user = userResult.rows[0];

      return { company, user };
    });

    // Generate token
    const token = generateToken(result.user.id);

    res.status(201).json({
      message: "Company registered successfully",
      token,
      user: {
        id: result.user.id,
        email: result.user.email,
        firstName: result.user.first_name,
        lastName: result.user.last_name,
        role: result.user.role,
        company: {
          id: result.company.id,
          name: result.company.name,
          subdomain: result.company.subdomain,
        },
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "Registration failed" });
  }
};

// Login user
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: "Email and password are required",
      });
    }

    // Get user with company details
    const result = await query(
      `SELECT u.*, c.name as company_name, c.subdomain, c.is_active as company_active
             FROM users u
             JOIN companies c ON u.company_id = c.id
             WHERE u.email = $1 AND u.is_active = true`,
      [email.toLowerCase()]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const user = result.rows[0];

    // Check if company is active
    if (!user.company_active) {
      return res.status(401).json({ error: "Company account is inactive" });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);

    if (!isValidPassword) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Generate token
    const token = generateToken(user.id);

    // Remove sensitive data
    const { password_hash, company_active, ...safeUser } = user;

    res.json({
      message: "Login successful",
      token,
      user: {
        id: safeUser.id,
        email: safeUser.email,
        firstName: safeUser.first_name,
        lastName: safeUser.last_name,
        role: safeUser.role,
        department: safeUser.department,
        position: safeUser.position,
        company: {
          id: safeUser.company_id,
          name: safeUser.company_name,
          subdomain: safeUser.subdomain,
        },
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Login failed" });
  }
};

// Get current user profile
export const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await query(
      `SELECT u.id, u.email, u.first_name, u.last_name, u.role, 
                    u.department, u.position, u.hire_date, u.created_at,
                    c.name as company_name, c.subdomain
             FROM users u
             JOIN companies c ON u.company_id = c.id
             WHERE u.id = $1`,
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const user = result.rows[0];

    res.json({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
        department: user.department,
        position: user.position,
        hireDate: user.hire_date,
        createdAt: user.created_at,
        company: {
          name: user.company_name,
          subdomain: user.subdomain,
        },
      },
    });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({ error: "Failed to get user profile" });
  }
};

// Update user profile
export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { firstName, lastName, department, position } = req.body;

    const result = await query(
      `UPDATE users 
             SET first_name = $1, last_name = $2, department = $3, position = $4, updated_at = CURRENT_TIMESTAMP
             WHERE id = $5
             RETURNING id, first_name, last_name, department, position`,
      [firstName, lastName, department, position, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      message: "Profile updated successfully",
      user: result.rows[0],
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ error: "Failed to update profile" });
  }
};

export default {
  register,
  login,
  getProfile,
  updateProfile,
};
