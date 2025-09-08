import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import axios from "axios";

const ApplicationsManagement = () => {
  const { id } = useParams(); // job ID
  const { user } = useAuth();
  const [job, setJob] = useState(null);
  const [applications, setApplications] = useState([]);
  const [filteredApplications, setFilteredApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: "",
    search: "",
  });

  useEffect(() => {
    if (id) {
      loadJobAndApplications();
    }
  }, [id]);

  useEffect(() => {
    filterApplications();
  }, [applications, filters]);

  const loadJobAndApplications = async () => {
    try {
      // Load job details
      const jobResponse = await axios.get(`/jobs/${id}`);
      setJob(jobResponse.data.job);

      // Load applications
      const applicationsResponse = await axios.get(`/jobs/${id}/applications`);
      setApplications(applicationsResponse.data.applications || []);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterApplications = () => {
    let filtered = [...applications];

    // Filter by status
    if (filters.status) {
      filtered = filtered.filter((app) => app.status === filters.status);
    }

    // Filter by search term (name or email)
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(
        (app) =>
          app.applicantName.toLowerCase().includes(searchLower) ||
          app.applicantEmail.toLowerCase().includes(searchLower)
      );
    }

    setFilteredApplications(filtered);
  };

  const updateApplicationStatus = async (applicationId, newStatus) => {
    try {
      await axios.put(`/jobs/applications/${applicationId}/status`, {
        status: newStatus,
      });

      // Update local state
      setApplications((prev) =>
        prev.map((app) =>
          app.id === applicationId ? { ...app, status: newStatus } : app
        )
      );
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update application status");
    }
  };

  const downloadResume = async (applicationId, fileName) => {
    try {
      const response = await axios.get(
        `/jobs/applications/${applicationId}/resume`,
        {
          responseType: "blob",
        }
      );

      // Create blob link to download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", fileName || "resume.pdf");
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Error downloading resume:", error);
      alert("Failed to download resume");
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
      reviewing: "bg-blue-100 text-blue-800 border-blue-200",
      interviewed: "bg-purple-100 text-purple-800 border-purple-200",
      hired: "bg-green-100 text-green-800 border-green-200",
      rejected: "bg-red-100 text-red-800 border-red-200",
    };
    return colors[status] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  const canManageApplications = user?.role === "admin" || user?.role === "hr";

  if (!canManageApplications) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full text-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <h3 className="font-bold">Access Denied</h3>
            <p>Only HR staff and administrators can manage applications.</p>
          </div>
          <Link
            to="/dashboard"
            className="mt-4 inline-block text-blue-600 hover:text-blue-500"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

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
                to="/jobs"
                className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
              >
                All Jobs
              </Link>
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
          {/* Breadcrumb */}
          <nav className="flex mb-8" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-4">
              <li>
                <Link to="/jobs" className="text-gray-400 hover:text-gray-500">
                  Jobs
                </Link>
              </li>
              <li className="flex">
                <svg
                  className="flex-shrink-0 h-5 w-5 text-gray-300"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                <Link
                  to={`/jobs/${id}`}
                  className="ml-4 text-gray-400 hover:text-gray-500"
                >
                  {job?.title}
                </Link>
              </li>
              <li className="flex">
                <svg
                  className="flex-shrink-0 h-5 w-5 text-gray-300"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="ml-4 text-gray-500">Applications</span>
              </li>
            </ol>
          </nav>

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Applications for {job?.title}
            </h1>
            <p className="mt-2 text-gray-600">
              Manage and review applications for this position
            </p>

            {/* Stats */}
            <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                      <svg
                        className="w-5 h-5 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                        />
                      </svg>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Total
                        </dt>
                        <dd className="text-lg font-medium text-gray-900">
                          {applications.length}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
                      <svg
                        className="w-5 h-5 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Pending
                        </dt>
                        <dd className="text-lg font-medium text-gray-900">
                          {
                            applications.filter(
                              (app) => app.status === "pending"
                            ).length
                          }
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-blue-600 rounded-md flex items-center justify-center">
                      <svg
                        className="w-5 h-5 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Reviewing
                        </dt>
                        <dd className="text-lg font-medium text-gray-900">
                          {
                            applications.filter(
                              (app) => app.status === "reviewing"
                            ).length
                          }
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                      <svg
                        className="w-5 h-5 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Hired
                        </dt>
                        <dd className="text-lg font-medium text-gray-900">
                          {
                            applications.filter((app) => app.status === "hired")
                              .length
                          }
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-red-500 rounded-md flex items-center justify-center">
                      <svg
                        className="w-5 h-5 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Rejected
                        </dt>
                        <dd className="text-lg font-medium text-gray-900">
                          {
                            applications.filter(
                              (app) => app.status === "rejected"
                            ).length
                          }
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white shadow rounded-lg mb-6">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                Filter Applications
              </h3>
            </div>
            <div className="px-6 py-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
                    <option value="pending">Pending</option>
                    <option value="reviewing">Reviewing</option>
                    <option value="interviewed">Interviewed</option>
                    <option value="hired">Hired</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="search"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Search
                  </label>
                  <input
                    type="text"
                    id="search"
                    placeholder="Search by name or email..."
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    value={filters.search}
                    onChange={(e) =>
                      setFilters({ ...filters, search: e.target.value })
                    }
                  />
                </div>

                <div className="flex items-end">
                  <button
                    onClick={() => setFilters({ status: "", search: "" })}
                    className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md text-sm font-medium"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Applications List */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                Applications ({filteredApplications.length})
              </h3>
            </div>

            {filteredApplications.length > 0 ? (
              <div className="divide-y divide-gray-200">
                {filteredApplications.map((application) => (
                  <div key={application.id} className="px-6 py-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center">
                              <span className="text-sm font-medium text-white">
                                {application.applicantName
                                  .charAt(0)
                                  .toUpperCase()}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <h4 className="text-lg font-medium text-gray-900">
                              {application.applicantName}
                            </h4>
                            <p className="text-sm text-gray-500">
                              {application.applicantEmail}
                            </p>
                            <p className="text-sm text-gray-500">
                              Applied {formatDate(application.appliedAt)}
                            </p>
                          </div>
                        </div>

                        {application.coverLetter && (
                          <div className="mt-4 ml-14">
                            <h5 className="text-sm font-medium text-gray-900 mb-2">
                              Cover Letter:
                            </h5>
                            <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md line-clamp-3">
                              {application.coverLetter}
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center space-x-4">
                        {/* Status Badge */}
                        <span
                          className={`px-3 py-1 text-sm font-semibold rounded-full border ${getStatusColor(
                            application.status
                          )}`}
                        >
                          {application.status.charAt(0).toUpperCase() +
                            application.status.slice(1)}
                        </span>

                        {/* Action Buttons */}
                        <div className="flex space-x-2">
                          {application.resumeFileName && (
                            <button
                              onClick={() =>
                                downloadResume(
                                  application.id,
                                  application.resumeFileName
                                )
                              }
                              className="bg-green-100 hover:bg-green-200 text-green-800 px-3 py-1 rounded text-sm font-medium"
                            >
                              Download Resume
                            </button>
                          )}

                          <div className="relative">
                            <select
                              value={application.status}
                              onChange={(e) =>
                                updateApplicationStatus(
                                  application.id,
                                  e.target.value
                                )
                              }
                              className="bg-white border border-gray-300 rounded text-sm px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="pending">Pending</option>
                              <option value="reviewing">Reviewing</option>
                              <option value="interviewed">Interviewed</option>
                              <option value="hired">Hired</option>
                              <option value="rejected">Rejected</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
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
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                <h3 className="mt-4 text-lg font-medium text-gray-900">
                  {applications.length === 0
                    ? "No applications yet"
                    : "No applications match your filters"}
                </h3>
                <p className="mt-2 text-gray-500">
                  {applications.length === 0
                    ? "Applications will appear here when candidates apply for this position."
                    : "Try adjusting your search criteria or filters."}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplicationsManagement;
