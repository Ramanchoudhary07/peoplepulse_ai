import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import axios from "axios";

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState({
    totalJobs: 0,
    activeJobs: 0,
    totalApplications: 0,
    pendingApplications: 0,
  });
  const [recentJobs, setRecentJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Load jobs
      const jobsResponse = await axios.get("/jobs");
      const jobs = jobsResponse.data.jobs || [];

      setStats({
        totalJobs: jobs.length,
        activeJobs: jobs.filter((job) => job.status === "active").length,
        totalApplications: jobs.reduce(
          (sum, job) => sum + job.applicationCount,
          0
        ),
        pendingApplications: 0, // We'll calculate this when we have application status data
      });

      setRecentJobs(jobs.slice(0, 5)); // Show 5 most recent jobs
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

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
              <h1 className="text-2xl font-bold text-blue-600">
                PeoplePulse AI
              </h1>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-sm">
                <span className="text-gray-700">
                  Welcome, {user?.firstName} {user?.lastName}
                </span>
                <div className="text-xs text-gray-500">
                  {user?.company?.name}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Link
                  to="/jobs"
                  className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Jobs
                </Link>

                {(user?.role === "admin" || user?.role === "hr") && (
                  <>
                    <Link
                      to="/analytics"
                      className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                    >
                      Analytics
                    </Link>
                    <Link
                      to="/employees"
                      className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                    >
                      Employees
                    </Link>
                  </>
                )}

                <button
                  onClick={handleLogout}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Welcome Section */}
          <div className="bg-white overflow-hidden shadow rounded-lg mb-8">
            <div className="px-4 py-5 sm:p-6">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Welcome to your HR Dashboard
              </h2>
              <p className="text-gray-600 mb-4">
                Manage your company's hiring, onboarding, and HR operations all
                in one place.
              </p>

              {(user?.role === "admin" || user?.role === "hr") && (
                <div className="flex space-x-4">
                  <Link
                    to="/jobs/create"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                  >
                    Post New Job
                  </Link>
                  <Link
                    to="/jobs"
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                  >
                    View All Jobs
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
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
                          d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6l-8 0V4"
                        />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Total Jobs
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {stats.totalJobs}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
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
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Active Jobs
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {stats.activeJobs}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
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
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Applications
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {stats.totalApplications}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
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
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Pending Review
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {stats.pendingApplications}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Jobs */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Recent Job Postings
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                Your most recently posted positions
              </p>
            </div>

            {recentJobs.length > 0 ? (
              <ul className="divide-y divide-gray-200">
                {recentJobs.map((job) => (
                  <li key={job.id} className="px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center">
                          <h4 className="text-lg font-medium text-blue-600 truncate">
                            <Link
                              to={`/jobs/${job.id}`}
                              className="hover:underline"
                            >
                              {job.title}
                            </Link>
                          </h4>
                          <span
                            className={`ml-2 px-2 py-1 text-xs font-semibold rounded-full ${
                              job.status === "active"
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {job.status}
                          </span>
                        </div>
                        <div className="mt-1 flex items-center text-sm text-gray-500">
                          <span>{job.department}</span>
                          <span className="mx-2">•</span>
                          <span>{job.location}</span>
                          <span className="mx-2">•</span>
                          <span>{job.employmentType}</span>
                          {job.applicationCount > 0 && (
                            <>
                              <span className="mx-2">•</span>
                              <span className="font-medium text-blue-600">
                                {job.applicationCount} applications
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="flex-shrink-0">
                        <Link
                          to={`/jobs/${job.id}`}
                          className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                        >
                          View Details →
                        </Link>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="px-6 py-8 text-center">
                <div className="text-gray-500">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400 mb-4"
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
                  <p className="text-lg font-medium">No jobs posted yet</p>
                  <p className="text-sm">
                    Get started by posting your first job opening
                  </p>

                  {(user?.role === "admin" || user?.role === "hr") && (
                    <Link
                      to="/jobs/create"
                      className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                    >
                      Post Your First Job
                    </Link>
                  )}
                </div>
              </div>
            )}

            {recentJobs.length > 0 && (
              <div className="px-6 py-3 bg-gray-50 text-center border-t border-gray-200">
                <Link
                  to="/jobs"
                  className="text-sm font-medium text-blue-600 hover:text-blue-500"
                >
                  View all jobs →
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
