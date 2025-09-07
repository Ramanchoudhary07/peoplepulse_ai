import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import axios from "axios";

const Jobs = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: "",
    department: "",
  });
  const navigate = useNavigate();

  useEffect(() => {
    loadJobs();
  }, [filters]);

  const loadJobs = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.status) params.append("status", filters.status);
      if (filters.department) params.append("department", filters.department);

      const response = await axios.get(`/jobs?${params.toString()}`);
      setJobs(response.data.jobs || []);
    } catch (error) {
      console.error("Error loading jobs:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteJob = async (jobId) => {
    if (!window.confirm("Are you sure you want to delete this job posting?")) {
      return;
    }

    try {
      await axios.delete(`/jobs/${jobId}`);
      setJobs(jobs.filter((job) => job.id !== jobId));
    } catch (error) {
      console.error("Error deleting job:", error);
      alert("Failed to delete job. Please try again.");
    }
  };

  const canManageJobs = user?.role === "admin" || user?.role === "hr";

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link
                to="/dashboard"
                className="text-2xl font-bold text-blue-600"
              >
                PeoplePulse AI
              </Link>
            </div>

            <div className="flex items-center space-x-4">
              <Link
                to="/dashboard"
                className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
              >
                Dashboard
              </Link>
              <span className="text-sm text-gray-700">
                {user?.firstName} {user?.lastName}
              </span>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Job Postings</h1>
              <p className="mt-2 text-gray-600">
                Manage your company's job openings
              </p>
            </div>

            {canManageJobs && (
              <Link
                to="/jobs/create"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Post New Job
              </Link>
            )}
          </div>

          {/* Filters */}
          <div className="bg-white shadow rounded-lg mb-6">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Filter Jobs</h3>
            </div>
            <div className="px-6 py-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div>
                  <label
                    htmlFor="status"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Status
                  </label>
                  <select
                    id="status"
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                    value={filters.status}
                    onChange={(e) =>
                      setFilters({ ...filters, status: e.target.value })
                    }
                  >
                    <option value="">All Statuses</option>
                    <option value="active">Active</option>
                    <option value="paused">Paused</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="department"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Department
                  </label>
                  <select
                    id="department"
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                    value={filters.department}
                    onChange={(e) =>
                      setFilters({ ...filters, department: e.target.value })
                    }
                  >
                    <option value="">All Departments</option>
                    <option value="Engineering">Engineering</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Sales">Sales</option>
                    <option value="HR">HR</option>
                    <option value="Finance">Finance</option>
                    <option value="Operations">Operations</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Jobs List */}
          <div className="bg-white shadow rounded-lg">
            {jobs.length > 0 ? (
              <>
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">
                    {jobs.length} Job{jobs.length !== 1 ? "s" : ""} Found
                  </h3>
                </div>

                <div className="divide-y divide-gray-200">
                  {jobs.map((job) => (
                    <div key={job.id} className="px-6 py-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center">
                            <h3 className="text-lg font-semibold text-gray-900 truncate">
                              <Link
                                to={`/jobs/${job.id}`}
                                className="text-blue-600 hover:text-blue-800"
                              >
                                {job.title}
                              </Link>
                            </h3>

                            <span
                              className={`ml-3 px-2 py-1 text-xs font-semibold rounded-full ${
                                job.status === "active"
                                  ? "bg-green-100 text-green-800"
                                  : job.status === "paused"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {job.status.charAt(0).toUpperCase() +
                                job.status.slice(1)}
                            </span>
                          </div>

                          <div className="mt-2 flex items-center text-sm text-gray-500">
                            <span>{job.department}</span>
                            <span className="mx-2">•</span>
                            <span>{job.location}</span>
                            <span className="mx-2">•</span>
                            <span className="capitalize">
                              {job.employmentType.replace("-", " ")}
                            </span>

                            {(job.salaryMin || job.salaryMax) && (
                              <>
                                <span className="mx-2">•</span>
                                <span>
                                  ${job.salaryMin?.toLocaleString() || "?"} - $
                                  {job.salaryMax?.toLocaleString() || "?"}
                                </span>
                              </>
                            )}
                          </div>

                          <div className="mt-2 flex items-center text-sm text-gray-500">
                            <span>Posted by {job.postedBy}</span>
                            <span className="mx-2">•</span>
                            <span>
                              {new Date(job.createdAt).toLocaleDateString()}
                            </span>

                            {job.applicationCount > 0 && (
                              <>
                                <span className="mx-2">•</span>
                                <span className="font-medium text-blue-600">
                                  {job.applicationCount} application
                                  {job.applicationCount !== 1 ? "s" : ""}
                                </span>
                              </>
                            )}
                          </div>

                          {job.description && (
                            <p className="mt-3 text-sm text-gray-600 line-clamp-2">
                              {job.description.length > 150
                                ? job.description.substring(0, 150) + "..."
                                : job.description}
                            </p>
                          )}
                        </div>

                        <div className="flex-shrink-0 ml-6">
                          <div className="flex items-center space-x-3">
                            <Link
                              to={`/jobs/${job.id}`}
                              className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                            >
                              View Details
                            </Link>

                            {canManageJobs && (
                              <>
                                <Link
                                  to={`/jobs/${job.id}/edit`}
                                  className="text-green-600 hover:text-green-900 text-sm font-medium"
                                >
                                  Edit
                                </Link>

                                {job.applicationCount > 0 && (
                                  <Link
                                    to={`/jobs/${job.id}/applications`}
                                    className="text-purple-600 hover:text-purple-900 text-sm font-medium"
                                  >
                                    Applications ({job.applicationCount})
                                  </Link>
                                )}

                                <button
                                  onClick={() => handleDeleteJob(job.id)}
                                  className="text-red-600 hover:text-red-900 text-sm font-medium"
                                >
                                  Delete
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="px-6 py-12 text-center">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6l-8 0V4"
                  />
                </svg>
                <h3 className="mt-4 text-lg font-medium text-gray-900">
                  No jobs found
                </h3>
                <p className="mt-2 text-gray-500">
                  {filters.status || filters.department
                    ? "Try adjusting your filters to see more results."
                    : "Get started by posting your first job opening."}
                </p>

                {canManageJobs && !filters.status && !filters.department && (
                  <div className="mt-6">
                    <Link
                      to="/jobs/create"
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                    >
                      Post Your First Job
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Jobs;
