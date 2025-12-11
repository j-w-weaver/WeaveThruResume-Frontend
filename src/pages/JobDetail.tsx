import "./jobDetail.css";
import "../dashboard.css";
import { useState, useEffect } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import jobService from "../services/jobService";
import { getErrorMessage } from "../utils/api";
import type { Job } from "../types";
import { Skeleton } from "../components/Skeleton";
import { ConfirmModal } from "../components/ConfirmModal";

function ContentSkeleton() {
  return (
    <div className="job-detail-content">
      {/* Stats Bar */}
      <div className="job-stats-bar">
        {[1, 2, 3].map((i) => (
          <div key={i} className="job-stat">
            <Skeleton
              width="60px"
              height="32px"
              style={{ margin: "0 auto 8px" }}
            />
            <Skeleton width="90px" height="13px" style={{ margin: "0 auto" }} />
          </div>
        ))}
      </div>

      {/* Info Cards */}
      <div className="job-info-grid">
        <div className="job-info-card">
          <Skeleton
            width="70px"
            height="12px"
            style={{ marginBottom: "8px" }}
          />
          <Skeleton width="130px" height="18px" />
        </div>
        <div className="job-info-card">
          <Skeleton
            width="110px"
            height="12px"
            style={{ marginBottom: "8px" }}
          />
          <Skeleton width="180px" height="14px" />
        </div>
      </div>

      {/* Job Description */}
      <div className="job-content-section">
        <Skeleton
          width="260px"
          height="22px"
          style={{ marginBottom: "24px" }}
        />
        <div className="job-content-text">
          {[...Array(10)].map((_, i) => (
            <Skeleton
              key={i}
              width={`${85 + (i % 6) * 2.5}%`}
              height="16px"
              style={{ marginBottom: i === 9 ? 0 : "14px" }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export function JobDetail() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams<{ id: string }>();
  const { user, logout } = useAuth();
  const { showToast } = useToast();

  const [job, setJob] = useState<Job | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Confirm modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const navItems = [
    { name: "Dashboard", path: "/dashboard", icon: "🏠" },
    { name: "My Resumes", path: "/resumes", icon: "📄" },
    { name: "Job Descriptions", path: "/jobs", icon: "💼" },
    { name: "Analysis", path: "/analyses", icon: "📊" },
    { name: "Applications", path: "/applications", icon: "📋" },
  ];

  useEffect(() => {
    if (id) {
      loadJob(parseInt(id, 10));
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
      showToast("Job deleted successfully", "success");
      navigate("/jobs");
    } catch (err) {
      showToast(getErrorMessage(err), "error");
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const handleMarkAsApplied = async () => {
    if (!job) return;

    setIsApplying(true);
    try {
      await jobService.markAsApplied(job.id);
      showToast("Marked as applied!", "success");
      await loadJob(job.id); // refresh
    } catch (err) {
      showToast(getErrorMessage(err), "error");
    } finally {
      setIsApplying(false);
    }
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    setIsMobileMenuOpen(false);
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getWordCount = (text: string | undefined): number => {
    if (!text) return 0;
    return text.trim().split(/\s+/).filter(Boolean).length;
  };

  const isApplied = job && job.status !== "Interested";

  return (
    <div className="job-detail-page">
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
      <main className="job-detail-main">
        {/* Header */}
        <div className="job-detail-header">
          <div className="job-detail-header-content">
            <button
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
            </button>

            <h1 className="job-detail-title">
              {isLoading ? "Loading job description..." : job?.jobTitle}
              {isApplied && job?.appliedDate && (
                <span
                  style={{
                    marginLeft: "16px",
                    background: "#10B981",
                    color: "white",
                    padding: "6px 14px",
                    borderRadius: "16px",
                    fontSize: "14px",
                    fontWeight: "600",
                  }}
                >
                  Applied {formatDate(job.appliedDate)}
                </span>
              )}
            </h1>

            <div className="job-detail-company">
              {isLoading ? (
                <Skeleton width="220px" height="20px" />
              ) : (
                <>Company: {job?.companyName}</>
              )}
            </div>

            <div className="job-detail-meta">
              {isLoading ? (
                <>
                  <Skeleton width="170px" height="14px" />
                  <Skeleton
                    width="100px"
                    height="14px"
                    style={{ marginLeft: "24px" }}
                  />
                </>
              ) : (
                <>
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
                    Added {formatDate(job!.createdAt)}
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
                    {job!.status}
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="job-detail-actions">
            {!isApplied ? (
              <button
                onClick={handleMarkAsApplied}
                className="btn"
                style={{ background: "#10B981", color: "white" }}
                disabled={isApplying}
              >
                {isApplying ? "Marking..." : "Mark as Applied"}
              </button>
            ) : (
              <button
                onClick={() => navigate("/applications")}
                className="btn"
                style={{
                  background: "#1e3a5f",
                  color: "#5B9FFF",
                  border: "1px solid #5B9FFF",
                }}
              >
                View in Tracker
              </button>
            )}

            <button
              onClick={() => navigate(`/create-analysis?jobId=${job?.id}`)}
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
        {isLoading ? (
          <ContentSkeleton />
        ) : error ? (
          <div className="job-detail-error-container">
            <div className="job-detail-error">
              <div className="job-detail-error-icon">Error</div>
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
        ) : (
          job && (
            <div className="job-detail-content">
              {/* Stats */}
              <div className="job-stats-bar">
                <div className="job-stat">
                  <div className="job-stat-number">
                    {getWordCount(job.jobDescription)}
                  </div>
                  <div className="job-stat-label">Words</div>
                </div>
                <div className="job-stat">
                  <div className="job-stat-number">
                    {job.jobDescription?.length}
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
                    {job.status}
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

              {/* Full Job Description */}
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
                <div className="job-content-text">{job.jobDescription}</div>
              </div>
            </div>
          )
        )}
      </main>

      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        title="Delete Job Description?"
        message={
          <span>
            Are you sure you want to delete <strong>{job?.jobTitle}</strong> at{" "}
            <strong>{job?.companyName}</strong>?
            <br />
            This action cannot be undone.
          </span>
        }
        confirmText="Delete Job"
        cancelText="Cancel"
        confirmButtonStyle="danger"
        isLoading={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteModal(false)}
      />
    </div>
  );
}
