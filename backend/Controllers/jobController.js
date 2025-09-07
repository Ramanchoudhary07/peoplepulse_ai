import { query } from "../config/database.js";
import multer from "multer";
import path from "path";
import { promises as fs } from "fs";
import { fileURLToPath } from "url";
import { dirname } from "path";

// ES modules equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configure multer for resume uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(__dirname, "../uploads/resumes");
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [".pdf", ".doc", ".docx"];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error("Only PDF, DOC, and DOCX files are allowed"));
    }
  },
});

// Get all jobs for the company
export const getJobs = async (req, res) => {
  try {
    const { status, department } = req.query;
    const companyId = req.user.company_id;

    let queryText = `
            SELECT j.*, u.first_name, u.last_name,
                   COUNT(a.id) as application_count
            FROM jobs j
            LEFT JOIN users u ON j.posted_by = u.id
            LEFT JOIN applications a ON j.id = a.job_id
            WHERE j.company_id = $1
        `;

    const params = [companyId];
    let paramIndex = 2;

    if (status) {
      queryText += ` AND j.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    if (department) {
      queryText += ` AND j.department = $${paramIndex}`;
      params.push(department);
      paramIndex++;
    }

    queryText += `
            GROUP BY j.id, u.first_name, u.last_name
            ORDER BY j.created_at DESC
        `;

    const result = await query(queryText, params);

    res.json({
      jobs: result.rows.map((job) => ({
        id: job.id,
        title: job.title,
        department: job.department,
        location: job.location,
        employmentType: job.employment_type,
        status: job.status,
        salaryMin: job.salary_min,
        salaryMax: job.salary_max,
        applicationCount: parseInt(job.application_count),
        postedBy:
          job.first_name && job.last_name
            ? `${job.first_name} ${job.last_name}`
            : "Unknown",
        createdAt: job.created_at,
        updatedAt: job.updated_at,
      })),
    });
  } catch (error) {
    console.error("Get jobs error:", error);
    res.status(500).json({ error: "Failed to fetch jobs" });
  }
};

// Get single job by ID
export const getJob = async (req, res) => {
  try {
    const { id } = req.params;
    const companyId = req.user.company_id;

    const result = await query(
      `SELECT j.*, u.first_name, u.last_name,
                    COUNT(a.id) as application_count
             FROM jobs j
             LEFT JOIN users u ON j.posted_by = u.id
             LEFT JOIN applications a ON j.id = a.job_id
             WHERE j.id = $1 AND j.company_id = $2
             GROUP BY j.id, u.first_name, u.last_name`,
      [id, companyId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Job not found" });
    }

    const job = result.rows[0];

    res.json({
      job: {
        id: job.id,
        title: job.title,
        description: job.description,
        department: job.department,
        location: job.location,
        employmentType: job.employment_type,
        status: job.status,
        salaryMin: job.salary_min,
        salaryMax: job.salary_max,
        requirements: job.requirements,
        benefits: job.benefits,
        applicationCount: parseInt(job.application_count),
        postedBy:
          job.first_name && job.last_name
            ? `${job.first_name} ${job.last_name}`
            : "Unknown",
        createdAt: job.created_at,
        updatedAt: job.updated_at,
      },
    });
  } catch (error) {
    console.error("Get job error:", error);
    res.status(500).json({ error: "Failed to fetch job" });
  }
};

// Create new job
export const createJob = async (req, res) => {
  try {
    const {
      title,
      description,
      department,
      location,
      employmentType = "full-time",
      salaryMin,
      salaryMax,
      requirements,
      benefits,
    } = req.body;

    const companyId = req.user.company_id;
    const postedBy = req.user.id;

    if (!title || !description) {
      return res.status(400).json({
        error: "Title and description are required",
      });
    }

    const result = await query(
      `INSERT INTO jobs 
             (company_id, title, description, department, location, employment_type, 
              salary_min, salary_max, requirements, benefits, posted_by)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
             RETURNING *`,
      [
        companyId,
        title,
        description,
        department,
        location,
        employmentType,
        salaryMin,
        salaryMax,
        requirements,
        benefits,
        postedBy,
      ]
    );

    res.status(201).json({
      message: "Job created successfully",
      job: {
        id: result.rows[0].id,
        title: result.rows[0].title,
        description: result.rows[0].description,
        department: result.rows[0].department,
        location: result.rows[0].location,
        employmentType: result.rows[0].employment_type,
        status: result.rows[0].status,
        createdAt: result.rows[0].created_at,
      },
    });
  } catch (error) {
    console.error("Create job error:", error);
    res.status(500).json({ error: "Failed to create job" });
  }
};

// Update job
export const updateJob = async (req, res) => {
  try {
    const { id } = req.params;
    const companyId = req.user.company_id;
    const {
      title,
      description,
      department,
      location,
      employmentType,
      salaryMin,
      salaryMax,
      requirements,
      benefits,
      status,
    } = req.body;

    const result = await query(
      `UPDATE jobs 
             SET title = $1, description = $2, department = $3, location = $4,
                 employment_type = $5, salary_min = $6, salary_max = $7,
                 requirements = $8, benefits = $9, status = $10, updated_at = CURRENT_TIMESTAMP
             WHERE id = $11 AND company_id = $12
             RETURNING *`,
      [
        title,
        description,
        department,
        location,
        employmentType,
        salaryMin,
        salaryMax,
        requirements,
        benefits,
        status,
        id,
        companyId,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Job not found" });
    }

    res.json({
      message: "Job updated successfully",
      job: result.rows[0],
    });
  } catch (error) {
    console.error("Update job error:", error);
    res.status(500).json({ error: "Failed to update job" });
  }
};

// Delete job
export const deleteJob = async (req, res) => {
  try {
    const { id } = req.params;
    const companyId = req.user.company_id;

    const result = await query(
      "DELETE FROM jobs WHERE id = $1 AND company_id = $2 RETURNING id",
      [id, companyId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Job not found" });
    }

    res.json({ message: "Job deleted successfully" });
  } catch (error) {
    console.error("Delete job error:", error);
    res.status(500).json({ error: "Failed to delete job" });
  }
};

// Get applications for a job
export const getApplications = async (req, res) => {
  try {
    const { jobId } = req.params;
    const companyId = req.user.company_id;
    const { status } = req.query;

    // Verify job belongs to company
    const jobCheck = await query(
      "SELECT id FROM jobs WHERE id = $1 AND company_id = $2",
      [jobId, companyId]
    );

    if (jobCheck.rows.length === 0) {
      return res.status(404).json({ error: "Job not found" });
    }

    let queryText = `
            SELECT * FROM applications 
            WHERE job_id = $1 AND company_id = $2
        `;

    const params = [jobId, companyId];

    if (status) {
      queryText += " AND status = $3";
      params.push(status);
    }

    queryText += " ORDER BY applied_at DESC";

    const result = await query(queryText, params);

    res.json({
      applications: result.rows.map((app) => ({
        id: app.id,
        firstName: app.first_name,
        lastName: app.last_name,
        email: app.email,
        phone: app.phone,
        resumeFilename: app.resume_filename,
        coverLetter: app.cover_letter,
        status: app.status,
        notes: app.notes,
        appliedAt: app.applied_at,
        updatedAt: app.updated_at,
      })),
    });
  } catch (error) {
    console.error("Get applications error:", error);
    res.status(500).json({ error: "Failed to fetch applications" });
  }
};

// Apply to job (public endpoint)
export const applyToJobHandler = async (req, res) => {
  try {
    const { jobId } = req.params;
    const { firstName, lastName, email, phone, coverLetter } = req.body;

    if (!firstName || !lastName || !email) {
      return res.status(400).json({
        error: "First name, last name, and email are required",
      });
    }

    // Get job and company info
    const jobResult = await query(
      "SELECT id, company_id, title FROM jobs WHERE id = $1 AND status = $2",
      [jobId, "active"]
    );

    if (jobResult.rows.length === 0) {
      return res.status(404).json({ error: "Job not found or not active" });
    }

    const job = jobResult.rows[0];
    let resumeFilename = null;

    // Handle resume upload if provided
    if (req.file) {
      resumeFilename = req.file.filename;
    }

    const result = await query(
      `INSERT INTO applications 
             (job_id, company_id, first_name, last_name, email, phone, resume_filename, cover_letter)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
             RETURNING *`,
      [
        job.id,
        job.company_id,
        firstName,
        lastName,
        email,
        phone,
        resumeFilename,
        coverLetter,
      ]
    );

    res.status(201).json({
      message: "Application submitted successfully",
      application: {
        id: result.rows[0].id,
        status: result.rows[0].status,
        appliedAt: result.rows[0].applied_at,
      },
    });
  } catch (error) {
    console.error("Apply to job error:", error);
    res.status(500).json({ error: "Failed to submit application" });
  }
};

// Export with multer middleware
export const applyToJob = [upload.single("resume"), applyToJobHandler];

// Update application status
export const updateApplicationStatus = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { status, notes } = req.body;
    const companyId = req.user.company_id;

    const validStatuses = [
      "pending",
      "reviewing",
      "interview",
      "rejected",
      "hired",
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        error: "Invalid status",
        validStatuses,
      });
    }

    const result = await query(
      `UPDATE applications 
             SET status = $1, notes = $2, updated_at = CURRENT_TIMESTAMP
             WHERE id = $3 AND company_id = $4
             RETURNING *`,
      [status, notes, applicationId, companyId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Application not found" });
    }

    res.json({
      message: "Application status updated successfully",
      application: result.rows[0],
    });
  } catch (error) {
    console.error("Update application status error:", error);
    res.status(500).json({ error: "Failed to update application status" });
  }
};

export default {
  getJobs,
  getJob,
  createJob,
  updateJob,
  deleteJob,
  getApplications,
  applyToJob,
  updateApplicationStatus,
};
