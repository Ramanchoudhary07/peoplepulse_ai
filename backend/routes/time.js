import express from "express";
import { authenticateToken, requireHROrAdmin } from "../Middlewares/auth.js";
import { tenantIsolation } from "../Middlewares/tenant.js";

const router = express.Router();

// Protected routes - require authentication and tenant isolation
router.use(authenticateToken, tenantIsolation);

// Time tracking routes (placeholder - to be implemented)
router.get("/entries", (req, res) => {
  res.json({ message: "Time entries endpoint - coming soon!" });
});

router.post("/entries", (req, res) => {
  res.json({ message: "Create time entry endpoint - coming soon!" });
});

router.get("/reports", requireHROrAdmin, (req, res) => {
  res.json({ message: "Time reports endpoint - coming soon!" });
});

export default router;
