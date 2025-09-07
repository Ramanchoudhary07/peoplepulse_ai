import { query } from "../config/database.js";

// Middleware to ensure all database queries are scoped to the authenticated user's company
export const tenantIsolation = (req, res, next) => {
  if (!req.user || !req.user.company_id) {
    return res.status(401).json({ error: "Company context required" });
  }

  // Add company_id to request for easy access
  req.companyId = req.user.company_id;
  next();
};

// Helper function to add company_id filter to queries
export const addTenantFilter = (queryStr, companyId, paramIndex = 1) => {
  const whereClause = queryStr.toLowerCase().includes("where")
    ? ` AND company_id = $${paramIndex}`
    : ` WHERE company_id = $${paramIndex}`;

  return queryStr + whereClause;
};

// Helper function to validate that a resource belongs to the user's company
export const validateTenantResource = async (
  resourceTable,
  resourceId,
  companyId
) => {
  const result = await query(
    `SELECT id FROM ${resourceTable} WHERE id = $1 AND company_id = $2`,
    [resourceId, companyId]
  );

  return result.rows.length > 0;
};

export default {
  tenantIsolation,
  addTenantFilter,
  validateTenantResource,
};
