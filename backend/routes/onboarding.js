import express from "express";
import { authenticateToken, requireHROrAdmin } from "../Middlewares/auth.js";
import { tenantIsolation } from "../Middlewares/tenant.js";

const router = express.Router();

// Protected routes - require authentication and tenant isolation
router.use(authenticateToken, tenantIsolation);

// Onboarding tasks routes (placeholder - to be implemented)
router.get("/tasks", (req, res) => {
  res.json({ message: "Onboarding tasks endpoint - coming soon!" });
});

router.post("/tasks", requireHROrAdmin, (req, res) => {
  res.json({ message: "Create onboarding task endpoint - coming soon!" });
});

export default router;
