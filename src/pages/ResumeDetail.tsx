import "./resumeDetail.css";
import "../dashboard.css";
import { useState, useEffect } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import resumeService from "../services/resumeService";
import { getErrorMessage } from "../utils/api";
import type { Resume } from "../types";
import { Skeleton } from "../components/Skeleton";

// Only the main content area uses skeleton
function ContentSkeleton() {
  return (
    <div className="resume-detail-content">
      {/* Info Cards Skeleton */}
      <div className="resume-info-grid">
        {[1, 2, 3].map((i) => (
          <div key={i} className="resume-info-card">
            <Skeleton
              width="80px"
              height="12px"
              style={{ marginBottom: "8px" }}
            />
            <Skeleton width="140px" height="18px" />
          </div>
        ))}
      </div>

      {/* Resume Preview Skeleton */}
      <div className="resume-content-section">
        <Skeleton
          width="260px"
          height="20px"
          style={{ marginBottom: "24px" }}
        />
        <div className="resume-content-text">
          {[...Array(10)].map((_, i) => (
            <Skeleton
              key={i}
              width={`${85 + (i % 5) * 3}%`}
              height="16px"
              style={{ marginBottom: i === 9 ? 0 : "14px" }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export function ResumeDetail() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams<{ id: string }>();
  const { user, logout } = useAuth();
  const { showToast } = useToast();

  const [resume, setResume] = useState<Resume | null>(null);
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

  useEffect(() => {
    if (id) {
      loadResume(parseInt(id, 10));
    } else {
      setError("Invalid resume ID");
      setIsLoading(false);
    }
  }, [id]);

  const loadResume = async (resumeId: number) => {
    setIsLoading(true);
    setError("");
    try {
      const data = await resumeService.getById(resumeId);
      setResume(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!resume) return;
    setIsDeleting(true);
    try {
      await resumeService.delete(resume.id);
      showToast("Resume deleted successfully", "success");
      navigate("/resumes");
    } catch (err) {
      showToast(getErrorMessage(err), "error");
      setIsDeleting(false);
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

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getFileExtension = (filename: string): string => {
    return filename.split(".").pop()?.toUpperCase() || "FILE";
  };

  return (
    <div className="resume-detail-page">
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
                viewBox="0 0 0 24 24"
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
      <main className="resume-detail-main">
        {/* Always show header — even during loading */}
        <div className="resume-detail-header">
          <div className="resume-detail-header-content">
            <button
              onClick={() => navigate("/resumes")}
              className="resume-detail-back"
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
              Back to My Resumes
            </button>

            <h1 className="resume-detail-title">
              {isLoading ? "Loading resume..." : resume?.fileName}
            </h1>

            {isLoading ? (
              <div className="resume-detail-meta" style={{ opacity: 0.6 }}>
                <Skeleton width="180px" height="14px" />
                <Skeleton
                  width="80px"
                  height="14px"
                  style={{ marginLeft: "24px" }}
                />
                <Skeleton
                  width="100px"
                  height="14px"
                  style={{ marginLeft: "24px" }}
                />
              </div>
            ) : (
              <div className="resume-detail-meta">
                <div className="resume-detail-meta-item">
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
                  {formatDate(resume!.uploadedAt)}
                </div>
                <div className="resume-detail-meta-item">
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
                      d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                    />
                  </svg>
                  {getFileExtension(resume!.fileName)}
                </div>
                <div className="resume-detail-meta-item">
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
                      d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4"
                    />
                  </svg>
                  {formatFileSize(resume!.fileSizeBytes)}
                </div>
              </div>
            )}
          </div>

          <div className="resume-detail-actions">
            <button
              onClick={() => navigate(`/create-analysis?resumeId=${id}`)}
              className="btn btn-primary"
              disabled={isLoading}
            >
              Create Analysis
            </button>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="btn"
              disabled={isLoading}
              style={{
                background: isLoading ? "#666" : "#7F1D1D",
                color: "#FEE2E2",
              }}
            >
              Delete
            </button>
          </div>
        </div>

        {/* Only the content area uses skeleton */}
        {isLoading ? (
          <ContentSkeleton />
        ) : error ? (
          <div className="resume-detail-error-container">
            <div className="resume-detail-error">
              <div className="resume-detail-error-icon">Error</div>
              <h2>Resume Not Found</h2>
              <p>{error}</p>
              <button
                onClick={() => navigate("/resumes")}
                className="btn btn-primary"
              >
                Back to My Resumes
              </button>
            </div>
          </div>
        ) : (
          resume && (
            <div className="resume-detail-content">
              {/* Info Cards */}
              <div className="resume-info-grid">
                <div className="resume-info-card">
                  <div className="resume-info-card-label">File Type</div>
                  <div className="resume-info-card-value">
                    {resume.contentType.includes("pdf")
                      ? "PDF Document"
                      : "Word Document"}
                  </div>
                </div>

                <div className="resume-info-card">
                  <div className="resume-info-card-label">File Size</div>
                  <div className="resume-info-card-value">
                    {formatFileSize(resume.fileSizeBytes)}
                  </div>
                </div>

                <div className="resume-info-card">
                  <div className="resume-info-card-label">Status</div>
                  <div className="resume-info-card-value status active">
                    Active
                  </div>
                </div>
              </div>

              {/* Resume Preview */}
              <div className="resume-content-section">
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
                  Resume Content Preview
                </h2>

                {resume.parsedContentPreview ? (
                  <div className="resume-content-text">
                    {resume.parsedContentPreview}
                  </div>
                ) : (
                  <div className="resume-content-empty">
                    <div className="resume-content-empty-icon">Document</div>
                    <p>No content preview available for this resume</p>
                  </div>
                )}
              </div>
            </div>
          )
        )}
      </main>

      {/* Delete Modal */}
      {showDeleteModal && resume && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Delete Resume?</h3>
            <p>
              Are you sure you want to delete <strong>{resume.fileName}</strong>
              ? This action cannot be undone.
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
                {isDeleting ? "Deleting..." : "Delete Resume"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
