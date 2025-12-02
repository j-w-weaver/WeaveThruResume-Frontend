import "./createAnalysis.css";
import "../dashboard.css";
import { useState, useEffect } from "react";
import type { FormEvent } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import resumeService from "../services/resumeService";
import jobService from "../services/jobService";
import analysisService from "../services/analysisService";
import { getErrorMessage } from "../utils/api";
import type { Resume, Job } from "../types";

export function CreateAnalysis() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { user, logout } = useAuth();

  const [resumes, setResumes] = useState<Resume[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [formData, setFormData] = useState({
    resumeId: searchParams.get("resumeId") || "",
    jobApplicationId: searchParams.get("jobId") || "",
    industry: "",
    specialization: "",
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");

  const navItems = [
    { name: "Dashboard", path: "/dashboard", icon: "🏠" },
    { name: "My Resumes", path: "/resumes", icon: "📄" },
    { name: "Job Descriptions", path: "/jobs", icon: "💼" },
    { name: "Analysis", path: "/analyses", icon: "📊" },
  ];

  // Load resumes and jobs on mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoadingData(true);

    try {
      const [resumesData, jobsData] = await Promise.all([
        resumeService.getMyResumes(),
        jobService.getMyJobs(),
      ]);

      setResumes(resumesData);
      setJobs(jobsData);

      // If no resumes or jobs, show error
      if (resumesData.length === 0) {
        setError(
          "You need to upload at least one resume before creating an analysis."
        );
      } else if (jobsData.length === 0) {
        setError(
          "You need to add at least one job description before creating an analysis."
        );
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    // Validation
    if (!formData.resumeId) {
      setError("Please select a resume");
      return;
    }

    if (!formData.jobApplicationId) {
      setError("Please select a job description");
      return;
    }

    if (!formData.industry) {
      setError("Please select an industry");
      return;
    }

    setIsProcessing(true);

    try {
      const response = await analysisService.create({
        resumeId: parseInt(formData.resumeId),
        jobApplicationId: parseInt(formData.jobApplicationId),
        industry: formData.industry,
        specialization: formData.specialization || undefined,
      });

      console.log("✅ Analysis created:", response.id);

      // Navigate to analysis results
      navigate(`/analysis/${response.id}`);
    } catch (err) {
      setError(getErrorMessage(err));
      setIsProcessing(false);
    }
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    setIsMobileMenuOpen(false);
  };

  const selectedResume = resumes.find(
    (r) => r.id === parseInt(formData.resumeId)
  );
  const selectedJob = jobs.find(
    (j) => j.id === parseInt(formData.jobApplicationId)
  );

  const currentStep = !formData.resumeId
    ? 1
    : !formData.jobApplicationId
    ? 2
    : 3;

  return (
    <div className="create-analysis-page">
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
            <div className="nav-icon">W</div>
            <span className="nav-brand">WeavThru</span>
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
      <main className="create-analysis-main">
        <div className="create-analysis-header">
          <a
            onClick={() => navigate("/dashboard")}
            className="create-analysis-back"
          >
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
            Back to Dashboard
          </a>

          <h1>Create Analysis</h1>
          <p>Analyze your resume against a job description with AI</p>
        </div>

        <div className="create-analysis-content">
          {/* Progress Steps */}
          <div className="analysis-steps">
            <div
              className={`analysis-step ${currentStep >= 1 ? "active" : ""} ${
                currentStep > 1 ? "completed" : ""
              }`}
            >
              <div className="analysis-step-circle">
                {currentStep > 1 ? "✓" : "1"}
              </div>
              <div className="analysis-step-label">Select Resume</div>
            </div>
            <div
              className={`analysis-step ${currentStep >= 2 ? "active" : ""} ${
                currentStep > 2 ? "completed" : ""
              }`}
            >
              <div className="analysis-step-circle">
                {currentStep > 2 ? "✓" : "2"}
              </div>
              <div className="analysis-step-label">Select Job</div>
            </div>
            <div
              className={`analysis-step ${currentStep >= 3 ? "active" : ""}`}
            >
              <div className="analysis-step-circle">3</div>
              <div className="analysis-step-label">Industry Info</div>
            </div>
          </div>

          {/* Error Alert */}
          {error && <div className="alert alert-error">{error}</div>}

          {/* Loading State */}
          {isLoadingData && (
            <div className="alert alert-info">
              Loading your resumes and jobs...
            </div>
          )}

          {/* Form */}
          {!isLoadingData && resumes.length > 0 && jobs.length > 0 && (
            <form onSubmit={handleSubmit} className="analysis-form">
              {/* Step 1: Select Resume */}
              <div className="form-section">
                <div className="form-section-title">
                  <span>📄</span>
                  Step 1: Select Resume
                </div>

                <div className="form-group">
                  <label
                    htmlFor="resumeId"
                    className="form-label form-label-required"
                  >
                    Choose a resume
                  </label>
                  <select
                    id="resumeId"
                    name="resumeId"
                    value={formData.resumeId}
                    onChange={(e) =>
                      setFormData({ ...formData, resumeId: e.target.value })
                    }
                    className="form-select"
                    disabled={isProcessing}
                  >
                    <option value="">-- Select a resume --</option>
                    {resumes.map((resume) => (
                      <option key={resume.id} value={resume.id}>
                        {resume.fileName}
                      </option>
                    ))}
                  </select>

                  {selectedResume && (
                    <div className="selected-item-preview">
                      <div className="selected-item-icon resume">📄</div>
                      <div className="selected-item-info">
                        <div className="selected-item-title">
                          {selectedResume.fileName}
                        </div>
                        <div className="selected-item-subtitle">
                          Uploaded{" "}
                          {new Date(
                            selectedResume.uploadedAt
                          ).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Step 2: Select Job */}
              <div className="form-section">
                <div className="form-section-title">
                  <span>💼</span>
                  Step 2: Select Job Description
                </div>

                <div className="form-group">
                  <label
                    htmlFor="jobApplicationId"
                    className="form-label form-label-required"
                  >
                    Choose a job description
                  </label>
                  <select
                    id="jobApplicationId"
                    name="jobApplicationId"
                    value={formData.jobApplicationId}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        jobApplicationId: e.target.value,
                      })
                    }
                    className="form-select"
                    disabled={isProcessing}
                  >
                    <option value="">-- Select a job --</option>
                    {jobs.map((job) => (
                      <option key={job.id} value={job.id}>
                        {job.jobTitle} at {job.companyName}
                      </option>
                    ))}
                  </select>

                  {selectedJob && (
                    <div className="selected-item-preview">
                      <div className="selected-item-icon job">💼</div>
                      <div className="selected-item-info">
                        <div className="selected-item-title">
                          {selectedJob.jobTitle}
                        </div>
                        <div className="selected-item-subtitle">
                          {selectedJob.companyName}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Step 3: Industry Info */}
              <div className="form-section">
                <div className="form-section-title">
                  <span>🏭</span>
                  Step 3: Industry Information
                </div>

                <div className="form-group">
                  <label
                    htmlFor="industry"
                    className="form-label form-label-required"
                  >
                    Industry
                  </label>
                  <select
                    id="industry"
                    name="industry"
                    value={formData.industry}
                    onChange={(e) =>
                      setFormData({ ...formData, industry: e.target.value })
                    }
                    className="form-select"
                    disabled={isProcessing}
                  >
                    <option value="">-- Select an industry --</option>
                    <option value="Technology">Technology</option>
                    <option value="Software">Software</option>
                    <option value="Healthcare">Healthcare</option>
                    <option value="Finance">Finance</option>
                    <option value="Education">Education</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Sales">Sales</option>
                    <option value="Manufacturing">Manufacturing</option>
                    <option value="Retail">Retail</option>
                    <option value="Consulting">Consulting</option>
                    <option value="Other">Other</option>
                  </select>
                  <span className="form-hint">
                    Choose the industry that best matches the job
                  </span>
                </div>

                <div className="form-group">
                  <label htmlFor="specialization" className="form-label">
                    Specialization (Optional)
                  </label>
                  <input
                    type="text"
                    id="specialization"
                    name="specialization"
                    value={formData.specialization}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        specialization: e.target.value,
                      })
                    }
                    className="form-input"
                    placeholder="e.g., Full-Stack Development, Data Science, UX Design"
                    disabled={isProcessing}
                  />
                  <span className="form-hint">
                    Add a specific specialization for more targeted analysis
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="form-actions">
                <button
                  type="button"
                  onClick={() => navigate("/dashboard")}
                  className="btn btn-secondary"
                  disabled={isProcessing}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isProcessing}
                >
                  Create Analysis
                </button>
              </div>
            </form>
          )}

          {/* Empty States */}
          {!isLoadingData && resumes.length === 0 && (
            <div className="analysis-form">
              <div style={{ textAlign: "center", padding: "48px 24px" }}>
                <div style={{ fontSize: "64px", marginBottom: "20px" }}>📄</div>
                <h2
                  style={{
                    color: "#F7F4ED",
                    fontSize: "24px",
                    marginBottom: "12px",
                  }}
                >
                  No Resumes Found
                </h2>
                <p style={{ color: "#9A9891", marginBottom: "24px" }}>
                  You need to upload a resume before creating an analysis
                </p>
                <button
                  onClick={() => navigate("/upload-resume")}
                  className="btn btn-primary"
                >
                  Upload Resume
                </button>
              </div>
            </div>
          )}

          {!isLoadingData && resumes.length > 0 && jobs.length === 0 && (
            <div className="analysis-form">
              <div style={{ textAlign: "center", padding: "48px 24px" }}>
                <div style={{ fontSize: "64px", marginBottom: "20px" }}>💼</div>
                <h2
                  style={{
                    color: "#F7F4ED",
                    fontSize: "24px",
                    marginBottom: "12px",
                  }}
                >
                  No Job Descriptions Found
                </h2>
                <p style={{ color: "#9A9891", marginBottom: "24px" }}>
                  You need to add a job description before creating an analysis
                </p>
                <button
                  onClick={() => navigate("/add-job")}
                  className="btn btn-primary"
                >
                  Add Job Description
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Processing Modal */}
      {isProcessing && (
        <div className="processing-modal">
          <div className="processing-content">
            <div className="processing-spinner"></div>
            <h3>Creating Analysis...</h3>
            <p>
              Our AI is analyzing your resume against the job description. This
              may take 30-60 seconds.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
