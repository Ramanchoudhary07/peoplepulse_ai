import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import axios from "axios";

const EditJob = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    department: "",
    location: "",
    employmentType: "full-time",
    salaryMin: "",
    salaryMax: "",
    requirements: "",
    benefits: "",
    status: "active",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (id) {
      loadJob();
    }
  }, [id]);

  const loadJob = async () => {
    try {
      const response = await axios.get(`/jobs/${id}`);
      const job = response.data.job;

      setFormData({
        title: job.title || "",
        description: job.description || "",
        department: job.department || "",
        location: job.location || "",
        employmentType: job.employmentType || "full-time",
        salaryMin: job.salaryMin || "",
        salaryMax: job.salaryMax || "",
        requirements: job.requirements || "",
        benefits: job.benefits || "",
        status: job.status || "active",
      });
    } catch (error) {
      console.error("Error loading job:", error);
      setError("Failed to load job details");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    // Basic validation
    if (!formData.title || !formData.description) {
      setError("Title and description are required");
      setSaving(false);
      return;
    }

    try {
      const response = await axios.put(`/jobs/${id}`, {
        ...formData,
        salaryMin: formData.salaryMin ? parseFloat(formData.salaryMin) : null,
        salaryMax: formData.salaryMax ? parseFloat(formData.salaryMax) : null,
      });

      // Redirect to job details page
      navigate(`/jobs/${id}`);
    } catch (error) {
      console.error("Error updating job:", error);
      setError(error.response?.data?.error || "Failed to update job");
    } finally {
      setSaving(false);
    }
  };

  // Check if user can edit jobs
  if (user?.role !== "admin" && user?.role !== "hr") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full text-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <h3 className="font-bold">Access Denied</h3>
            <p>Only HR staff and administrators can edit job postings.</p>
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

      <div className="max-w-3xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Header */}
          <div className="mb-8">
            <nav className="flex" aria-label="Breadcrumb">
              <ol className="flex items-center space-x-4">
                <li>
                  <Link
                    to="/jobs"
                    className="text-gray-400 hover:text-gray-500"
                  >
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
                    {formData.title || "Job Details"}
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
                  <span className="ml-4 text-gray-500">Edit</span>
                </li>
              </ol>
            </nav>

            <h1 className="mt-4 text-3xl font-bold text-gray-900">
              Edit Job Posting
            </h1>
            <p className="mt-2 text-gray-600">
              Update the details for this job posting
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-8">
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
                <span className="block sm:inline">{error}</span>
              </div>
            )}

            {/* Basic Information */}
            <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
              <div className="md:grid md:grid-cols-3 md:gap-6">
                <div className="md:col-span-1">
                  <h3 className="text-lg font-medium leading-6 text-gray-900">
                    Basic Information
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Update the essential details about this position
                  </p>
                </div>

                <div className="mt-5 md:mt-0 md:col-span-2">
                  <div className="grid grid-cols-6 gap-6">
                    <div className="col-span-6">
                      <label
                        htmlFor="title"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Job Title *
                      </label>
                      <input
                        type="text"
                        name="title"
                        id="title"
                        required
                        className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                        placeholder="e.g., Senior Software Engineer"
                        value={formData.title}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="col-span-6 sm:col-span-3">
                      <label
                        htmlFor="department"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Department
                      </label>
                      <select
                        id="department"
                        name="department"
                        className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        value={formData.department}
                        onChange={handleChange}
                      >
                        <option value="">Select Department</option>
                        <option value="Engineering">Engineering</option>
                        <option value="Marketing">Marketing</option>
                        <option value="Sales">Sales</option>
                        <option value="HR">HR</option>
                        <option value="Finance">Finance</option>
                        <option value="Operations">Operations</option>
                        <option value="Customer Success">
                          Customer Success
                        </option>
                        <option value="Design">Design</option>
                        <option value="Product">Product</option>
                      </select>
                    </div>

                    <div className="col-span-6 sm:col-span-3">
                      <label
                        htmlFor="location"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Location
                      </label>
                      <input
                        type="text"
                        name="location"
                        id="location"
                        className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                        placeholder="e.g., San Francisco, CA or Remote"
                        value={formData.location}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="col-span-6 sm:col-span-3">
                      <label
                        htmlFor="employmentType"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Employment Type
                      </label>
                      <select
                        id="employmentType"
                        name="employmentType"
                        className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        value={formData.employmentType}
                        onChange={handleChange}
                      >
                        <option value="full-time">Full-time</option>
                        <option value="part-time">Part-time</option>
                        <option value="contract">Contract</option>
                        <option value="internship">Internship</option>
                      </select>
                    </div>

                    <div className="col-span-6 sm:col-span-3">
                      <label
                        htmlFor="status"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Job Status
                      </label>
                      <select
                        id="status"
                        name="status"
                        className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        value={formData.status}
                        onChange={handleChange}
                      >
                        <option value="active">Active</option>
                        <option value="paused">Paused</option>
                        <option value="closed">Closed</option>
                      </select>
                    </div>

                    <div className="col-span-6">
                      <label
                        htmlFor="description"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Job Description *
                      </label>
                      <textarea
                        id="description"
                        name="description"
                        rows={6}
                        required
                        className="mt-1 shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        placeholder="Describe the role, responsibilities, and what the candidate will be doing..."
                        value={formData.description}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Compensation */}
            <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
              <div className="md:grid md:grid-cols-3 md:gap-6">
                <div className="md:col-span-1">
                  <h3 className="text-lg font-medium leading-6 text-gray-900">
                    Compensation
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Salary range for this position
                  </p>
                </div>

                <div className="mt-5 md:mt-0 md:col-span-2">
                  <div className="grid grid-cols-6 gap-6">
                    <div className="col-span-3">
                      <label
                        htmlFor="salaryMin"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Minimum Salary ($)
                      </label>
                      <input
                        type="number"
                        name="salaryMin"
                        id="salaryMin"
                        className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                        placeholder="75000"
                        value={formData.salaryMin}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="col-span-3">
                      <label
                        htmlFor="salaryMax"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Maximum Salary ($)
                      </label>
                      <input
                        type="number"
                        name="salaryMax"
                        id="salaryMax"
                        className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                        placeholder="120000"
                        value={formData.salaryMax}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Requirements & Benefits */}
            <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
              <div className="md:grid md:grid-cols-3 md:gap-6">
                <div className="md:col-span-1">
                  <h3 className="text-lg font-medium leading-6 text-gray-900">
                    Details
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Requirements, qualifications, and benefits
                  </p>
                </div>

                <div className="mt-5 md:mt-0 md:col-span-2">
                  <div className="grid grid-cols-6 gap-6">
                    <div className="col-span-6">
                      <label
                        htmlFor="requirements"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Requirements & Qualifications
                      </label>
                      <textarea
                        id="requirements"
                        name="requirements"
                        rows={5}
                        className="mt-1 shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        placeholder="• Bachelor's degree in Computer Science&#10;• 3+ years of experience with React&#10;• Strong problem-solving skills"
                        value={formData.requirements}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="col-span-6">
                      <label
                        htmlFor="benefits"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Benefits & Perks
                      </label>
                      <textarea
                        id="benefits"
                        name="benefits"
                        rows={4}
                        className="mt-1 shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        placeholder="• Health, dental, and vision insurance&#10;• 401(k) with company matching&#10;• Flexible working hours&#10;• Remote work options"
                        value={formData.benefits}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Submit */}
            <div className="flex justify-end space-x-3">
              <Link
                to={`/jobs/${id}`}
                className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </Link>

              <button
                type="submit"
                disabled={saving}
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <span className="flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Updating Job...
                  </span>
                ) : (
                  "Update Job"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditJob;
