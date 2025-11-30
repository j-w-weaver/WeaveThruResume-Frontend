import "./ResumeList.css";
import "../dashboard.css";
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import resumeService from "../services/resumeService";
import { getErrorMessage } from "../utils/api";
import type { Resume } from "../types";

export function ResumeList() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const [resumes, setResumes] = useState<Resume[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const navItems = [
    { name: "Dashboard", path: "/dashboard", icon: "🏠" },
    { name: "My Resumes", path: "/resumes", icon: "📄" },
    { name: "Job Descriptions", path: "/jobs", icon: "💼" },
    { name: "Analysis", path: "/analyses", icon: "📊" },
  ];

  // Load resumes on mount
  useEffect(() => {
    loadResumes();
  }, []);

  const loadResumes = async () => {
    setIsLoading(true);
    setError("");

    try {
      const data = await resumeService.getMyResumes();
      setResumes(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number, fileName: string) => {
    if (!window.confirm(`Are you sure you want to delete "${fileName}"?`)) {
      return;
    }

    setDeletingId(id);

    try {
      await resumeService.delete(id);
      setResumes(resumes.filter((r) => r.id !== id));
      console.log("✅ Resume deleted");
    } catch (err) {
      alert(getErrorMessage(err));
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const getFileType = (contentType: string): "pdf" | "docx" => {
    if (contentType.includes("pdf")) return "pdf";
    return "docx";
  };

  return (
    <div className="resume-list-page">
      {/* Sidebar */}
      <aside className="sidebar">
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
              onClick={() => navigate(item.path)}
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
      <main className="resume-list-main">
        <div className="resume-list-header">
          <div className="resume-list-header-content">
            <h1>My Resumes</h1>
            <p>View and manage your uploaded resumes</p>
          </div>
          <button
            onClick={() => navigate("/upload-resume")}
            className="btn btn-primary"
          >
            Upload Resume
          </button>
        </div>

        <div className="resume-list-content">
          {/* Loading State */}
          {isLoading && (
            <div className="resume-loading">
              <div className="resume-loading-spinner"></div>
              <p>Loading resumes...</p>
            </div>
          )}

          {/* Error State */}
          {error && !isLoading && (
            <div className="alert alert-error">{error}</div>
          )}

          {/* Empty State */}
          {!isLoading && !error && resumes.length === 0 && (
            <div className="resume-empty">
              <div className="resume-empty-icon">📄</div>
              <h2>No resumes yet</h2>
              <p>
                Upload your first resume to get started with AI-powered
                optimization
              </p>
              <button
                onClick={() => navigate("/upload-resume")}
                className="btn btn-primary btn-large"
              >
                Upload Your First Resume
              </button>
            </div>
          )}

          {/* Resume Grid */}
          {!isLoading && !error && resumes.length > 0 && (
            <div className="resume-grid">
              {resumes.map((resume) => (
                <div key={resume.id} className="resume-card">
                  <div className="resume-card-header">
                    <div
                      className={`resume-file-icon ${getFileType(
                        resume.contentType
                      )}`}
                    >
                      {getFileType(resume.contentType) === "pdf" ? "📕" : "📘"}
                    </div>
                    <div className="resume-card-info">
                      <div
                        className="resume-card-title"
                        title={resume.fileName}
                      >
                        {resume.fileName}
                      </div>
                      <div className="resume-card-meta">
                        <span>📅 {formatDate(resume.uploadedAt)}</span>
                        <span>💾 {formatFileSize(resume.fileSizeBytes)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="resume-card-preview">
                    <p>
                      {resume.parsedContentPreview || "No preview available"}
                    </p>
                  </div>

                  <div className="resume-card-actions">
                    <button
                      className="btn btn-secondary"
                      onClick={() => navigate(`/resume/${resume.id}`)}
                    >
                      View Details
                    </button>
                    <button
                      className="btn btn-primary"
                      onClick={() =>
                        navigate(`/create-analysis?resumeId=${resume.id}`)
                      }
                    >
                      Analyze
                    </button>
                    <button
                      className="btn"
                      style={{
                        background: "#7F1D1D",
                        color: "#FEE2E2",
                        opacity: deletingId === resume.id ? 0.5 : 1,
                      }}
                      onClick={() => handleDelete(resume.id, resume.fileName)}
                      disabled={deletingId === resume.id}
                    >
                      {deletingId === resume.id ? "..." : "🗑️"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
