import express from "express";
import { authenticateToken, requireHROrAdmin } from "../Middlewares/auth.js";
import { tenantIsolation } from "../Middlewares/tenant.js";
import {
  getJobs,
  getJob,
  createJob,
  updateJob,
  deleteJob,
  getApplications,
  applyToJob,
  updateApplicationStatus,
} from "../Controllers/jobController.js";

const router = express.Router();

// Public routes (for job applications)
router.post("/:jobId/apply", applyToJob);

// Protected routes - require authentication and tenant isolation
router.use(authenticateToken, tenantIsolation);

// Job management routes
router.get("/", getJobs);
router.get("/:id", getJob);
router.post("/", requireHROrAdmin, createJob);
router.put("/:id", requireHROrAdmin, updateJob);
router.delete("/:id", requireHROrAdmin, deleteJob);

// Application management routes
router.get("/:jobId/applications", requireHROrAdmin, getApplications);
router.put(
  "/applications/:applicationId/status",
  requireHROrAdmin,
  updateApplicationStatus
);

export default router;
