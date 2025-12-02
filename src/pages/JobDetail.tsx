import "./jobDetail.css";
import "../dashboard.css";
import { useState, useEffect } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import jobService from "../services/jobService";
import { getErrorMessage } from "../utils/api";
import type { Job } from "../types";

export function JobDetail() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams<{ id: string }>();
  const { user, logout } = useAuth();

  const [job, setJob] = useState<Job | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { name: "Dashboard", path: "/dashboard", icon: "🏠" },
    { name: "My Resumes", path: "/resumes", icon: "📄" },
    { name: "Job Descriptions", path: "/jobs", icon: "💼" },
    { name: "Analysis", path: "/analyses", icon: "📊" },
  ];

  // Load job on mount
  useEffect(() => {
    if (id) {
      loadJob(parseInt(id));
    } else {
      setError("Invalid job ID");
      setIsLoading(false);
    }
  }, [id]);

  const loadJob = async (jobId: number) => {
    setIsLoading(true);
    setError("");

    try {
      const data = await jobService.getById(jobId);
      setJob(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!job) return;

    setIsDeleting(true);

    try {
      await jobService.delete(job.id);
      console.log("✅ Job deleted");
      navigate("/jobs");
    } catch (err) {
      alert(getErrorMessage(err));
      setIsDeleting(false);
    }
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    setIsMobileMenuOpen(false);
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getWordCount = (text: string): number => {
    return text.trim().split(/\s+/).length;
  };

  return (
    <div className="job-detail-page">
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
      <main className="job-detail-main">
        {/* Loading State */}
        {isLoading && (
          <div className="job-detail-loading">
            <div className="job-detail-loading-spinner"></div>
            <p>Loading job details...</p>
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div style={{ padding: "32px 48px" }}>
            <div className="job-detail-error">
              <div className="job-detail-error-icon">❌</div>
              <h2>Job Not Found</h2>
              <p>{error}</p>
              <button
                onClick={() => navigate("/jobs")}
                className="btn btn-primary"
              >
                Back to Job Descriptions
              </button>
            </div>
          </div>
        )}

        {/* Job Content */}
        {job && !isLoading && !error && (
          <>
            {/* Header */}
            <div className="job-detail-header">
              <div className="job-detail-header-content">
                <a
                  onClick={() => navigate("/jobs")}
                  className="job-detail-back"
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
                  Back to Job Descriptions
                </a>

                <h1 className="job-detail-title">{job.jobTitle}</h1>
                <div className="job-detail-company">🏢 {job.companyName}</div>

                <div className="job-detail-meta">
                  <div className="job-detail-meta-item">
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
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    Added {formatDate(job.createdAt)}
                  </div>
                  <div className="job-detail-meta-item">
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
                        d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                      />
                    </svg>
                    {job.status}
                  </div>
                </div>
              </div>

              <div className="job-detail-actions">
                <button
                  onClick={() => navigate(`/create-analysis?jobId=${job.id}`)}
                  className="btn btn-primary"
                >
                  Create Analysis
                </button>
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="btn"
                  style={{ background: "#7F1D1D", color: "#FEE2E2" }}
                >
                  Delete
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="job-detail-content">
              {/* Stats Bar */}
              <div className="job-stats-bar">
                <div className="job-stat">
                  <div className="job-stat-number">
                    {getWordCount(job.jobDescriptionPreview)}
                  </div>
                  <div className="job-stat-label">Words</div>
                </div>
                <div className="job-stat">
                  <div className="job-stat-number">
                    {job.jobDescriptionLength}
                  </div>
                  <div className="job-stat-label">Characters</div>
                </div>
                <div className="job-stat">
                  <div className="job-stat-number">0</div>
                  <div className="job-stat-label">Analyses Created</div>
                </div>
              </div>

              {/* Info Cards */}
              <div className="job-info-grid">
                <div className="job-info-card">
                  <div className="job-info-card-label">Status</div>
                  <div className="job-info-card-value status saved">
                    💾 {job.status}
                  </div>
                </div>

                {job.jobUrl && (
                  <div className="job-info-card">
                    <div className="job-info-card-label">Job Posting Link</div>
                    <a
                      href={job.jobUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="job-info-card-value link"
                    >
                      View Original Posting
                      <svg
                        width="14"
                        height="14"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                        />
                      </svg>
                    </a>
                  </div>
                )}
              </div>

              {/* Job Description */}
              <div className="job-content-section">
                <h2>
                  <svg
                    width="20"
                    height="20"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  Full Job Description
                </h2>

                <div className="job-content-text">
                  {job.jobDescriptionPreview}
                </div>
              </div>
            </div>
          </>
        )}
      </main>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && job && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Delete Job Description?</h3>
            <p>
              Are you sure you want to delete <strong>{job.jobTitle}</strong> at{" "}
              <strong>{job.companyName}</strong>? This action cannot be undone.
            </p>
            <div className="modal-actions">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="btn btn-secondary"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="btn"
                style={{ background: "#7F1D1D", color: "#FEE2E2" }}
                disabled={isDeleting}
              >
                {isDeleting ? "Deleting..." : "Delete Job"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
