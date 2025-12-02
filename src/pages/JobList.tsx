import "./jobList.css";
import "../dashboard.css";
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import jobService from "../services/jobService";
import { getErrorMessage } from "../utils/api";
import type { Job } from "../types";

export function JobList() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { name: "Dashboard", path: "/dashboard", icon: "🏠" },
    { name: "My Resumes", path: "/resumes", icon: "📄" },
    { name: "Job Descriptions", path: "/jobs", icon: "💼" },
    { name: "Analysis", path: "/analyses", icon: "📊" },
  ];

  // Load jobs on mount
  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    setIsLoading(true);
    setError("");

    try {
      const data = await jobService.getMyJobs();
      setJobs(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number, jobTitle: string) => {
    if (
      !window.confirm(
        `Are you sure you want to delete "${jobTitle}" at ${
          jobs.find((j) => j.id === id)?.companyName
        }?`
      )
    ) {
      return;
    }

    setDeletingId(id);

    try {
      await jobService.delete(id);
      setJobs(jobs.filter((j) => j.id !== id));
      console.log("✅ Job deleted");
    } catch (err) {
      alert(getErrorMessage(err));
    } finally {
      setDeletingId(null);
    }
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    setIsMobileMenuOpen(false);
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const truncateText = (text: string, maxLength: number): string => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  return (
    <div className="job-list-page">
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
            <span className="nav-brand">WeavThruResume</span>
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
      <main className="job-list-main">
        <div className="job-list-header">
          <div className="job-list-header-content">
            <h1>Job Descriptions</h1>
            <p>Manage and analyze job postings</p>
          </div>
          <button
            onClick={() => navigate("/add-job")}
            className="btn btn-primary"
          >
            Add Job Description
          </button>
        </div>

        <div className="job-list-content">
          {/* Loading State */}
          {isLoading && (
            <div className="job-loading">
              <div className="job-loading-spinner"></div>
              <p>Loading jobs...</p>
            </div>
          )}

          {/* Error State */}
          {error && !isLoading && (
            <div className="alert alert-error">{error}</div>
          )}

          {/* Empty State */}
          {!isLoading && !error && jobs.length === 0 && (
            <div className="job-empty">
              <div className="job-empty-icon">💼</div>
              <h2>No job descriptions yet</h2>
              <p>
                Add your first job posting to start analyzing against your
                resume
              </p>
              <button
                onClick={() => navigate("/add-job")}
                className="btn btn-primary btn-large"
              >
                Add Your First Job
              </button>
            </div>
          )}

          {/* Job Grid */}
          {!isLoading && !error && jobs.length > 0 && (
            <div className="job-grid">
              {jobs.map((job) => (
                <div
                  key={job.id}
                  className="job-card"
                  onClick={() => navigate(`/job/${job.id}`)}
                >
                  <div className="job-card-header">
                    <div className="job-company-icon">💼</div>
                    <div className="job-card-info">
                      <div className="job-card-title" title={job.jobTitle}>
                        {job.jobTitle}
                      </div>
                      <div className="job-card-company">
                        🏢 {job.companyName}
                      </div>
                    </div>
                  </div>

                  <div className="job-card-preview">
                    <p>{truncateText(job.jobDescriptionPreview, 150)}</p>
                  </div>

                  <div className="job-card-meta">
                    <div className="job-card-date">
                      📅 {formatDate(job.createdAt)}
                    </div>
                    <div
                      className="job-card-actions"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        className="job-card-action-btn primary"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/create-analysis?jobId=${job.id}`);
                        }}
                      >
                        Analyze
                      </button>
                      <button
                        className="job-card-action-btn danger"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(job.id, job.jobTitle);
                        }}
                        disabled={deletingId === job.id}
                      >
                        {deletingId === job.id ? "..." : "🗑️"}
                      </button>
                    </div>
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
