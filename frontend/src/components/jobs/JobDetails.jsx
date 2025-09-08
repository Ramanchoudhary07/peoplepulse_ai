import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import axios from "axios";

const JobDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (id) {
      loadJobDetails();
      loadApplications();
    }
  }, [id]);

  const loadJobDetails = async () => {
    try {
      const response = await axios.get(`/jobs/${id}`);
      setJob(response.data.job);
    } catch (error) {
      console.error("Error loading job details:", error);
      setError("Failed to load job details");
    }
  };

  const loadApplications = async () => {
    try {
      const response = await axios.get(`/jobs/${id}/applications`);
      setApplications(response.data.applications || []);
    } catch (error) {
      console.error("Error loading applications:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteJob = async () => {
    if (
      !window.confirm(
        "Are you sure you want to delete this job posting? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      await axios.delete(`/jobs/${id}`);
      navigate("/jobs");
    } catch (error) {
      console.error("Error deleting job:", error);
      alert("Failed to delete job. Please try again.");
    }
  };

  const updateApplicationStatus = async (applicationId, newStatus) => {
    try {
      await axios.put(`/jobs/applications/${applicationId}/status`, {
        status: newStatus,
      });
      // Reload applications to show updated status
      loadApplications();
    } catch (error) {
      console.error("Error updating application status:", error);
      alert("Failed to update application status");
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatSalary = (min, max) => {
    if (!min && !max) return "Salary not specified";
    if (min && max)
      return `$${min.toLocaleString()} - $${max.toLocaleString()}`;
    if (min) return `$${min.toLocaleString()}+`;
    return `Up to $${max.toLocaleString()}`;
  };

  const canManageJob = user?.role === "admin" || user?.role === "hr";

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full text-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <h3 className="font-bold">Job Not Found</h3>
            <p>{error || "The job you are looking for does not exist."}</p>
          </div>
          <Link
            to="/jobs"
            className="mt-4 inline-block text-blue-600 hover:text-blue-500"
          >
            ← Back to Jobs
          </Link>
        </div>
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
                <span className="ml-4 text-gray-500 truncate">{job.title}</span>
              </li>
            </ol>
          </nav>

          <div className="lg:grid lg:grid-cols-3 lg:gap-6">
            {/* Job Details - Left Column */}
            <div className="lg:col-span-2">
              <div className="bg-white shadow rounded-lg">
                {/* Job Header */}
                <div className="px-6 py-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h1 className="text-3xl font-bold text-gray-900">
                        {job.title}
                      </h1>
                      <div className="mt-2 flex items-center text-sm text-gray-500">
                        <span>{job.department}</span>
                        <span className="mx-2">•</span>
                        <span>{job.location}</span>
                        <span className="mx-2">•</span>
                        <span className="capitalize">
                          {job.employmentType.replace("-", " ")}
                        </span>
                      </div>
                      <div className="mt-2 text-lg font-semibold text-green-600">
                        {formatSalary(job.salaryMin, job.salaryMax)}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span
                        className={`px-3 py-1 text-sm font-semibold rounded-full ${
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
                  </div>

                  {canManageJob && (
                    <div className="mt-6 flex space-x-3">
                      <Link
                        to={`/jobs/${job.id}/edit`}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                      >
                        Edit Job
                      </Link>
                      <button
                        onClick={handleDeleteJob}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                      >
                        Delete Job
                      </button>
                      <Link
                        to={`/jobs/${job.id}/applications`}
                        className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                      >
                        Manage Applications ({applications.length})
                      </Link>
                    </div>
                  )}
                </div>

                {/* Job Description */}
                <div className="px-6 py-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Job Description
                  </h3>
                  <div className="prose max-w-none text-gray-700 whitespace-pre-wrap">
                    {job.description}
                  </div>
                </div>

                {/* Requirements */}
                {job.requirements && (
                  <div className="px-6 py-6 border-t border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      Requirements
                    </h3>
                    <div className="prose max-w-none text-gray-700 whitespace-pre-wrap">
                      {job.requirements}
                    </div>
                  </div>
                )}

                {/* Benefits */}
                {job.benefits && (
                  <div className="px-6 py-6 border-t border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      Benefits
                    </h3>
                    <div className="prose max-w-none text-gray-700 whitespace-pre-wrap">
                      {job.benefits}
                    </div>
                  </div>
                )}

                {/* Job Meta Info */}
                <div className="px-6 py-6 border-t border-gray-200 bg-gray-50">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Posted:</span>
                      <span className="ml-1 text-gray-900">
                        {formatDate(job.createdAt)}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Posted by:</span>
                      <span className="ml-1 text-gray-900">{job.postedBy}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Sidebar */}
            <div className="mt-6 lg:mt-0">
              {/* Application Stats */}
              <div className="bg-white shadow rounded-lg p-6 mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Application Statistics
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Total Applications:</span>
                    <span className="font-semibold text-gray-900">
                      {applications.length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Pending Review:</span>
                    <span className="font-semibold text-yellow-600">
                      {
                        applications.filter((app) => app.status === "pending")
                          .length
                      }
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Under Review:</span>
                    <span className="font-semibold text-blue-600">
                      {
                        applications.filter((app) => app.status === "reviewing")
                          .length
                      }
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Hired:</span>
                    <span className="font-semibold text-green-600">
                      {
                        applications.filter((app) => app.status === "hired")
                          .length
                      }
                    </span>
                  </div>
                </div>
              </div>

              {/* Recent Applications */}
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Recent Applications
                </h3>
                {applications.length > 0 ? (
                  <div className="space-y-4">
                    {applications.slice(0, 5).map((application) => (
                      <div
                        key={application.id}
                        className="border-l-4 border-blue-400 pl-4"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {application.applicantName}
                            </p>
                            <p className="text-xs text-gray-500">
                              Applied {formatDate(application.appliedAt)}
                            </p>
                          </div>
                          <span
                            className={`px-2 py-1 text-xs font-semibold rounded-full ${
                              application.status === "pending"
                                ? "bg-yellow-100 text-yellow-800"
                                : application.status === "reviewing"
                                ? "bg-blue-100 text-blue-800"
                                : application.status === "hired"
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {application.status}
                          </span>
                        </div>
                        {canManageJob && (
                          <div className="mt-2 flex space-x-2">
                            <button
                              onClick={() =>
                                updateApplicationStatus(
                                  application.id,
                                  "reviewing"
                                )
                              }
                              className="text-xs bg-blue-100 hover:bg-blue-200 text-blue-800 px-2 py-1 rounded"
                            >
                              Review
                            </button>
                            <button
                              onClick={() =>
                                updateApplicationStatus(application.id, "hired")
                              }
                              className="text-xs bg-green-100 hover:bg-green-200 text-green-800 px-2 py-1 rounded"
                            >
                              Hire
                            </button>
                            <button
                              onClick={() =>
                                updateApplicationStatus(
                                  application.id,
                                  "rejected"
                                )
                              }
                              className="text-xs bg-red-100 hover:bg-red-200 text-red-800 px-2 py-1 rounded"
                            >
                              Reject
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                    {applications.length > 5 && (
                      <div className="text-center">
                        <Link
                          to={`/jobs/${job.id}/applications`}
                          className="text-blue-600 hover:text-blue-500 text-sm font-medium"
                        >
                          View all {applications.length} applications →
                        </Link>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No applications yet</p>
                )}
              </div>

              {/* Public Job Link */}
              <div className="bg-white shadow rounded-lg p-6 mt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Share Job
                </h3>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Public Job URL:
                  </label>
                  <div className="flex">
                    <input
                      type="text"
                      readOnly
                      value={`${window.location.origin}/apply/${job.id}`}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md text-sm bg-gray-50"
                    />
                    <button
                      onClick={() =>
                        navigator.clipboard.writeText(
                          `${window.location.origin}/apply/${job.id}`
                        )
                      }
                      className="px-4 py-2 bg-blue-600 text-white text-sm rounded-r-md hover:bg-blue-700"
                    >
                      Copy
                    </button>
                  </div>
                  <p className="text-xs text-gray-500">
                    Share this link with candidates to apply for this position.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDetails;
