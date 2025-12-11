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
import { Skeleton } from "../components/Skeleton";

// Skeleton only for the main content area
function ContentSkeleton() {
  return (
    <div className="create-analysis-content">
      {/* Steps Skeleton */}
      <div className="analysis-steps">
        {[1, 2, 3].map((i) => (
          <div key={i} className="analysis-step">
            <Skeleton width="40px" height="40px" borderRadius="50%" />
            <Skeleton
              width="100px"
              height="14px"
              style={{ marginTop: "12px" }}
            />
          </div>
        ))}
      </div>

      {/* Form Sections Skeleton */}
      {[1, 2, 3].map((i) => (
        <div key={i} className="form-section" style={{ marginBottom: "32px" }}>
          <Skeleton
            width="200px"
            height="24px"
            style={{ marginBottom: "20px" }}
          />
          <Skeleton
            width="100%"
            height="48px"
            borderRadius="8px"
            style={{ marginBottom: "12px" }}
          />
          <Skeleton width="320px" height="60px" borderRadius="8px" />
        </div>
      ))}

      <div style={{ display: "flex", gap: "12px", marginTop: "40px" }}>
        <Skeleton width="120px" height="48px" borderRadius="8px" />
        <Skeleton width="180px" height="48px" borderRadius="8px" />
      </div>
    </div>
  );
}

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
    { name: "Applications", path: "/applications", icon: "📋" },
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoadingData(true);
    setError("");

    try {
      const [resumesData, jobsData] = await Promise.all([
        resumeService.getMyResumes(),
        jobService.getMyJobs(),
      ]);

      setResumes(resumesData);
      setJobs(jobsData);

      if (resumesData.length === 0) {
        setError("You need to upload at least one resume to continue.");
      } else if (jobsData.length === 0) {
        setError("You need to add at least one job description to continue.");
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

    if (
      !formData.resumeId ||
      !formData.jobApplicationId ||
      !formData.industry
    ) {
      setError("Please complete all required fields");
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

      navigate(`/analysis/${response.id}`);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
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
      {/* Mobile Menu */}
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
              {user?.name?.charAt(0).toUpperCase() || "?"}
            </div>
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">{user?.name || "User"}</div>
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
        {/* Header — always visible instantly */}
        <div className="create-analysis-header">
          <button
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
          </button>

          <h1>Create Analysis</h1>
          <p>Analyze your resume against a job description with AI</p>
        </div>

        {/* Content Area — skeleton only here */}
        {isLoadingData ? (
          <ContentSkeleton />
        ) : error && (resumes.length === 0 || jobs.length === 0) ? (
          /* Empty States */
          <div className="create-analysis-content">
            <div
              className="analysis-form"
              style={{ textAlign: "center", padding: "60px 24px" }}
            >
              <div style={{ fontSize: "80px", marginBottom: "24px" }}>
                {resumes.length === 0 ? "Document" : "Briefcase"}
              </div>
              <h2
                style={{
                  color: "#F7F4ED",
                  fontSize: "24px",
                  marginBottom: "16px",
                }}
              >
                {resumes.length === 0
                  ? "No Resumes Found"
                  : "No Job Descriptions"}
              </h2>
              <p
                style={{
                  color: "#9A9891",
                  marginBottom: "32px",
                  maxWidth: "400px",
                  marginLeft: "auto",
                  marginRight: "auto",
                }}
              >
                {resumes.length === 0
                  ? "You need to upload a resume before creating an analysis"
                  : "You need to add a job description before creating an analysis"}
              </p>
              <button
                onClick={() =>
                  navigate(resumes.length === 0 ? "/upload-resume" : "/add-job")
                }
                className="btn btn-primary"
              >
                {resumes.length === 0 ? "Upload Resume" : "Add Job Description"}
              </button>
            </div>
          </div>
        ) : (
          /* Main Form */
          <div className="create-analysis-content">
            {/* Progress Steps */}
            <div className="analysis-steps">
              <div
                className={`analysis-step ${currentStep >= 1 ? "active" : ""} ${
                  currentStep > 1 ? "completed" : ""
                }`}
              >
                <div className="analysis-step-circle">
                  {currentStep > 1 ? "Check" : "1"}
                </div>
                <div className="analysis-step-label">Select Resume</div>
              </div>
              <div
                className={`analysis-step ${currentStep >= 2 ? "active" : ""} ${
                  currentStep > 2 ? "completed" : ""
                }`}
              >
                <div className="analysis-step-circle">
                  {currentStep > 2 ? "Check" : "2"}
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

            {error && <div className="alert alert-error">{error}</div>}

            <form onSubmit={handleSubmit} className="analysis-form">
              {/* Step 1: Resume */}
              <div className="form-section">
                <div className="form-section-title">Step 1: Select Resume</div>
                <div className="form-group">
                  <label
                    htmlFor="resumeId"
                    className="form-label form-label-required"
                  >
                    Choose a resume
                  </label>
                  <select
                    id="resumeId"
                    value={formData.resumeId}
                    onChange={(e) =>
                      setFormData({ ...formData, resumeId: e.target.value })
                    }
                    className="form-select"
                    disabled={isProcessing}
                  >
                    <option value="">-- Select a resume --</option>
                    {resumes.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.fileName}
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

              {/* Step 2: Job */}
              <div className="form-section">
                <div className="form-section-title">
                  Step 2: Select Job Description
                </div>
                <div className="form-group">
                  <label
                    htmlFor="jobApplicationId"
                    className="form-label form-label-required"
                  >
                    Choose a job
                  </label>
                  <select
                    id="jobApplicationId"
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
                    {jobs.map((j) => (
                      <option key={j.id} value={j.id}>
                        {j.jobTitle} at {j.companyName}
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

              {/* Step 3: Industry */}
              <div className="form-section">
                <div className="form-section-title">
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
                    value={formData.industry}
                    onChange={(e) =>
                      setFormData({ ...formData, industry: e.target.value })
                    }
                    className="form-select"
                    disabled={isProcessing}
                  >
                    <option value="">-- Select industry --</option>
                    <option>Technology</option>
                    <option>Software</option>
                    <option>Healthcare</option>
                    <option>Finance</option>
                    <option>Education</option>
                    <option>Marketing</option>
                    <option>Sales</option>
                    <option>Manufacturing</option>
                    <option>Retail</option>
                    <option>Consulting</option>
                    <option>Other</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="specialization" className="form-label">
                    Specialization (Optional)
                  </label>
                  <input
                    type="text"
                    id="specialization"
                    value={formData.specialization}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        specialization: e.target.value,
                      })
                    }
                    className="form-input"
                    placeholder="e.g. Full-Stack, Data Science, UX Design"
                    disabled={isProcessing}
                  />
                </div>
              </div>

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
                  {isProcessing ? "Creating Analysis..." : "Create Analysis"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Processing Modal */}
        {isProcessing && (
          <div className="processing-modal">
            <div className="processing-content">
              <div className="processing-spinner"></div>
              <h3>Creating Analysis...</h3>
              <p>
                Our AI engine is comparing your resume to the job description.
                This usually takes about 10–15 seconds.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
