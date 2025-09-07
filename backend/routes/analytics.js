import express from "express";
import { authenticateToken, requireHROrAdmin } from "../Middlewares/auth.js";
import { tenantIsolation } from "../Middlewares/tenant.js";

const router = express.Router();

// Protected routes - require authentication and tenant isolation
router.use(authenticateToken, tenantIsolation);

// Analytics and reporting routes (placeholder - to be implemented)
router.get("/dashboard", requireHROrAdmin, (req, res) => {
  res.json({ message: "Analytics dashboard endpoint - coming soon!" });
});

router.get("/hiring-funnel", requireHROrAdmin, (req, res) => {
  res.json({ message: "Hiring funnel analytics endpoint - coming soon!" });
});

router.get("/turnover", requireHROrAdmin, (req, res) => {
  res.json({ message: "Turnover analytics endpoint - coming soon!" });
});

export default router;
