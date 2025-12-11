import "./addJob.css";
import "../dashboard.css";
import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import jobService from "../services/jobService";
import { getErrorMessage } from "../utils/api";

export function AddJob() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [formData, setFormData] = useState({
    jobTitle: "",
    companyName: "",
    jobDescription: "",
    jobUrl: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const navItems = [
    { name: "Dashboard", path: "/dashboard", icon: "🏠" },
    { name: "My Resumes", path: "/resumes", icon: "📄" },
    { name: "Job Descriptions", path: "/jobs", icon: "💼" },
    { name: "Analysis", path: "/analyses", icon: "📊" },
    { name: "Applications", path: "/applications", icon: "📋" },
  ];

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    // Validation
    if (!formData.jobTitle.trim()) {
      setError("Job title is required");
      return;
    }

    if (!formData.companyName.trim()) {
      setError("Company name is required");
      return;
    }

    if (!formData.jobDescription.trim()) {
      setError("Job description is required");
      return;
    }

    if (formData.jobDescription.length < 50) {
      setError("Job description must be at least 50 characters");
      return;
    }

    setIsSubmitting(true);

    try {
      await jobService.create(formData);
      setSuccess(true);

      // Navigate to jobs list after 1.5 seconds
      setTimeout(() => {
        navigate("/jobs");
      }, 1500);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    setIsMobileMenuOpen(false);
  };

  const descriptionLength = formData.jobDescription.length;
  const isDescriptionTooShort = descriptionLength > 0 && descriptionLength < 50;

  return (
    <div className="add-job-page">
      {/* Mobile Menu Button */}
      <button
        className="mobile-menu-btn"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        aria-label="Toggle menu"
      >
        {isMobileMenuOpen ? (
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        ) : (
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        )}
      </button>

      {/* Overlay */}
      <div
        className={`sidebar-overlay ${isMobileMenuOpen ? "active" : ""}`}
        onClick={() => setIsMobileMenuOpen(false)}
      />

      {/* Sidebar */}
      <aside className={`sidebar ${isMobileMenuOpen ? "mobile-open" : ""}`}>
        <div className="sidebar-header">
          <div className="nav-logo">
            <div className="nav-icon">FR</div>
            <span className="nav-brand">Fluid Resume</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <button
              key={item.path}
              onClick={() => handleNavigation(item.path)}
              className={`sidebar-nav-item ${
                location.pathname === item.path ? "active" : ""
              }`}
            >
              <span className="sidebar-nav-icon">{item.icon}</span>
              <span>{item.name}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-avatar">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">{user?.name}</div>
              <div className="sidebar-user-email">{user?.email}</div>
            </div>
            <button onClick={logout} className="sidebar-logout" title="Logout">
              <svg
                width="16"
                height="16"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="add-job-main">
        <div className="add-job-header">
          <a onClick={() => navigate("/jobs")} className="add-job-back">
            <svg
              width="16"
              height="16"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to Job Descriptions
          </a>

          <h1>Add Job Description</h1>
          <p>Save a job posting to analyze against your resume</p>
        </div>

        <div className="add-job-content">
          {/* Error Alert */}
          {error && <div className="alert alert-error">{error}</div>}

          {/* Success Alert */}
          {success && (
            <div className="alert alert-success">
              ✅ Job saved successfully! Redirecting...
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="add-job-form">
            {/* Job Title */}
            <div className="form-group">
              <label
                htmlFor="jobTitle"
                className="form-label form-label-required"
              >
                Job Title
              </label>
              <input
                type="text"
                id="jobTitle"
                name="jobTitle"
                value={formData.jobTitle}
                onChange={handleChange}
                className="form-input"
                placeholder="e.g., Senior Software Engineer"
                disabled={isSubmitting}
              />
            </div>

            {/* Company Name */}
            <div className="form-group">
              <label
                htmlFor="companyName"
                className="form-label form-label-required"
              >
                Company Name
              </label>
              <input
                type="text"
                id="companyName"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                className="form-input"
                placeholder="e.g., Anthropic"
                disabled={isSubmitting}
              />
            </div>

            {/* Job URL */}
            <div className="form-group">
              <label htmlFor="jobUrl" className="form-label">
                Job Posting URL
              </label>
              <input
                type="url"
                id="jobUrl"
                name="jobUrl"
                value={formData.jobUrl}
                onChange={handleChange}
                className="form-input"
                placeholder="https://careers.example.com/job/12345"
                disabled={isSubmitting}
              />
              <span className="form-hint">
                Optional: Link to the original job posting
              </span>
            </div>

            {/* Job Description */}
            <div className="form-group">
              <label
                htmlFor="jobDescription"
                className="form-label form-label-required"
              >
                Job Description
              </label>
              <textarea
                id="jobDescription"
                name="jobDescription"
                value={formData.jobDescription}
                onChange={handleChange}
                className="form-input form-textarea"
                placeholder="Paste the full job description here..."
                disabled={isSubmitting}
              />
              <span
                className={`char-count ${
                  isDescriptionTooShort ? "warning" : ""
                }`}
              >
                {descriptionLength} characters{" "}
                {isDescriptionTooShort ? "(minimum 50)" : ""}
              </span>
            </div>

            {/* Actions */}
            <div className="form-actions">
              <button
                type="button"
                onClick={() => navigate("/jobs")}
                className="btn btn-secondary"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Saving..." : "Save Job Description"}
              </button>
            </div>
          </form>

          {/* Help Text */}
          <div className="add-job-help">
            <h3>Tips for saving job descriptions:</h3>
            <ul>
              <li>Copy the complete job description from the posting</li>
              <li>
                Include requirements, responsibilities, and qualifications
              </li>
              <li>More detail = better AI analysis results</li>
              <li>You can add the job URL to easily reference later</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}
