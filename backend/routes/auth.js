import express from "express";
import { authenticateToken } from "../Middlewares/auth.js";
import {
  register,
  login,
  getProfile,
  updateProfile,
} from "../Controllers/authController.js";

const router = express.Router();

// Public routes
router.post("/register", register);
router.post("/login", login);

// Protected routes
router.get("/profile", authenticateToken, getProfile);
router.put("/profile", authenticateToken, updateProfile);

// Token verification endpoint
router.get("/verify", authenticateToken, (req, res) => {
  res.json({
    valid: true,
    user: {
      id: req.user.id,
      email: req.user.email,
      role: req.user.role,
      company: req.user.company_name,
    },
  });
});

export default router;
