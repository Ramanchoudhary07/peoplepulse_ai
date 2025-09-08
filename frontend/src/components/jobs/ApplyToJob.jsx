import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const ApplyToJob = () => {
  const { id } = useParams(); // job ID
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    applicantName: "",
    applicantLastName: "",
    applicantPhone: "",
    applicantEmail: "",
    coverLetter: "",
    resume: null,
  });

  useEffect(() => {
    if (id) {
      loadJobDetails();
    }
  }, [id]);

  const loadJobDetails = async () => {
    try {
      // Note: This should be a public endpoint that doesn't require authentication
      const response = await axios.get(`/jobs/${id}`);
      setJob(response.data.job);
    } catch (error) {
      console.error("Error loading job details:", error);
      setError("Job not found or no longer available");
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

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type and size
      const allowedTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ];
      const maxSize = 5 * 1024 * 1024; // 5MB

      if (!allowedTypes.includes(file.type)) {
        setError("Please upload a PDF, DOC, or DOCX file");
        return;
      }

      if (file.size > maxSize) {
        setError("File size must be less than 5MB");
        return;
      }

      setFormData((prev) => ({
        ...prev,
        resume: file,
      }));
      setError("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    // Validation
    if (!formData.applicantName || !formData.applicantEmail) {
      setError("Name and email are required");
      setSubmitting(false);
      return;
    }

    if (!formData.resume) {
      setError("Please upload your resume");
      setSubmitting(false);
      return;
    }

    try {
      // Create FormData for file upload
      const applicationData = new FormData();
      applicationData.append("applicantName", formData.applicantName);
      applicationData.append("applicantLastName", formData.applicantLastName);
      applicationData.append("applicantPhone", formData.applicantPhone);
      applicationData.append("applicantEmail", formData.applicantEmail);
      applicationData.append("coverLetter", formData.coverLetter);
      applicationData.append("resume", formData.resume);

      await axios.post(`/jobs/${id}/apply`, applicationData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setSubmitted(true);
    } catch (error) {
      console.error("Error submitting application:", error);
      setError(
        error.response?.data?.error ||
          "Failed to submit application. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const formatSalary = (min, max) => {
    if (!min && !max) return "Salary not specified";
    if (min && max)
      return `$${min.toLocaleString()} - $${max.toLocaleString()}`;
    if (min) return `$${min.toLocaleString()}+`;
    return `Up to $${max.toLocaleString()}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error && !job) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full text-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <h3 className="font-bold">Job Not Available</h3>
            <p>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full">
          <div className="bg-white shadow-lg rounded-lg p-8 text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
              <svg
                className="h-6 w-6 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                ></path>
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Application Submitted!
            </h2>
            <p className="text-gray-600 mb-6">
              Thank you for your interest in the <strong>{job?.title}</strong>{" "}
              position at {job?.company?.name}. We have received your
              application and will review it shortly.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4 text-sm text-blue-700">
              <p className="font-semibold">What happens next?</p>
              <ul className="mt-2 list-disc list-inside space-y-1">
                <li>Our HR team will review your application</li>
                <li>
                  We'll contact you if your profile matches our requirements
                </li>
                <li>
                  You may receive updates via email at {formData.applicantEmail}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Job Details Header */}
        <div className="bg-white shadow rounded-lg mb-8">
          <div className="px-6 py-6">
            <div className="text-center mb-6">
              <h1 className="text-3xl font-bold text-gray-900">{job?.title}</h1>
              <p className="text-lg text-gray-600 mt-2">{job?.company?.name}</p>
              <div className="mt-2 flex items-center justify-center text-sm text-gray-500 space-x-4">
                <span>{job?.department}</span>
                <span>•</span>
                <span>{job?.location}</span>
                <span>•</span>
                <span className="capitalize">
                  {job?.employmentType?.replace("-", " ")}
                </span>
              </div>
              <div className="mt-2 text-lg font-semibold text-green-600">
                {formatSalary(job?.salaryMin, job?.salaryMax)}
              </div>
            </div>

            {/* Job Description */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                About this role
              </h3>
              <div className="prose max-w-none text-gray-700 whitespace-pre-wrap">
                {job?.description}
              </div>
            </div>

            {/* Requirements */}
            {job?.requirements && (
              <div className="border-t border-gray-200 pt-6 mt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Requirements
                </h3>
                <div className="prose max-w-none text-gray-700 whitespace-pre-wrap">
                  {job?.requirements}
                </div>
              </div>
            )}

            {/* Benefits */}
            {job?.benefits && (
              <div className="border-t border-gray-200 pt-6 mt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  What we offer
                </h3>
                <div className="prose max-w-none text-gray-700 whitespace-pre-wrap">
                  {job?.benefits}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Application Form */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">
              Apply for this position
            </h2>
            <p className="mt-1 text-gray-600">
              Please fill out the form below to submit your application.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="px-6 py-6 space-y-6">
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                <p>{error}</p>
              </div>
            )}

            {/* Personal Information */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="applicantName"
                  className="block text-sm font-medium text-gray-700"
                >
                  First Name *
                </label>
                <input
                  type="text"
                  id="applicantName"
                  name="applicantName"
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Enter your full name"
                  value={formData.applicantName}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label
                  htmlFor="applicantLastName"
                  className="block text-sm font-medium text-gray-700"
                >
                  Last Name *
                </label>
                <input
                  type="text"
                  id="applicantLastName"
                  name="applicantLastName"
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Enter your full name"
                  value={formData.applicantLastName}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label
                  htmlFor="applicantPhone"
                  className="block text-sm font-medium text-gray-700"
                >
                  mobile number *
                </label>
                <input
                  type="text"
                  id="applicantPhone"
                  name="applicantPhone"
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Enter your full name"
                  value={formData.applicantPhone}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label
                  htmlFor="applicantEmail"
                  className="block text-sm font-medium text-gray-700"
                >
                  Email Address *
                </label>
                <input
                  type="email"
                  id="applicantEmail"
                  name="applicantEmail"
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Enter your email address"
                  value={formData.applicantEmail}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Resume Upload */}
            <div>
              <label
                htmlFor="resume"
                className="block text-sm font-medium text-gray-700"
              >
                Resume/CV *
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    stroke="currentColor"
                    fill="none"
                    viewBox="0 0 48 48"
                  >
                    <path
                      d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <div className="flex text-sm text-gray-600">
                    <label
                      htmlFor="resume"
                      className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                    >
                      <span>Upload a file</span>
                      <input
                        id="resume"
                        name="resume"
                        type="file"
                        className="sr-only"
                        accept=".pdf,.doc,.docx"
                        onChange={handleFileChange}
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">
                    PDF, DOC, DOCX up to 5MB
                  </p>
                  {formData.resume && (
                    <p className="text-sm text-green-600 font-medium">
                      ✓ {formData.resume.name}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Cover Letter */}
            <div>
              <label
                htmlFor="coverLetter"
                className="block text-sm font-medium text-gray-700"
              >
                Cover Letter (Optional)
              </label>
              <textarea
                id="coverLetter"
                name="coverLetter"
                rows={6}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Tell us why you're interested in this role and how your experience aligns with our requirements..."
                value={formData.coverLetter}
                onChange={handleChange}
              />
              <p className="mt-2 text-sm text-gray-500">
                Optional, but recommended. Share why you're excited about this
                opportunity.
              </p>
            </div>

            {/* Privacy Notice */}
            <div className="bg-gray-50 p-4 rounded-md">
              <h4 className="text-sm font-medium text-gray-900">
                Privacy Notice
              </h4>
              <p className="mt-1 text-sm text-gray-600">
                Your personal information will be used only for recruitment
                purposes and will be handled in accordance with our privacy
                policy. We will not share your information with third parties
                without your consent.
              </p>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex justify-center py-3 px-6 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
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
                    Submitting Application...
                  </span>
                ) : (
                  "Submit Application"
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Company Info Footer */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Questions about this role? Contact {job?.company?.name} HR team.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ApplyToJob;
