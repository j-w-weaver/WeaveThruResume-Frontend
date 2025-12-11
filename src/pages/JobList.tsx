import "./jobList.css";
import "../dashboard.css";
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import jobService from "../services/jobService";
import { getErrorMessage } from "../utils/api";
import type { Job } from "../types";
import { Skeleton } from "../components/Skeleton";
import { useToast } from "../context/ToastContext";

function SkeletonJobCard() {
  return (
    <div
      style={{
        background: "#161b26",
        border: "1px solid #2d3748",
        borderRadius: "12px",
        padding: "24px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "16px",
          marginBottom: "16px",
        }}
      >
        <Skeleton width="48px" height="48px" borderRadius="8px" />
        <div style={{ flex: 1 }}>
          <Skeleton width="70%" height="20px" style={{ marginBottom: "8px" }} />
          <Skeleton width="50%" height="16px" />
        </div>
      </div>
      <Skeleton width="100%" height="60px" style={{ marginBottom: "16px" }} />
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Skeleton width="100px" height="14px" />
        <div style={{ display: "flex", gap: "8px" }}>
          <Skeleton width="80px" height="36px" borderRadius="6px" />
          <Skeleton width="40px" height="36px" borderRadius="6px" />
        </div>
      </div>
    </div>
  );
}

export function JobList() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { showToast } = useToast();

  const [jobs, setJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [isApplying, setIsApplying] = useState<number | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"date" | "company">("date");
  const [applications, setApplications] = useState<Job[]>([]);

  const navItems = [
    { name: "Dashboard", path: "/dashboard", icon: "🏠" },
    { name: "My Resumes", path: "/resumes", icon: "📄" },
    { name: "Job Descriptions", path: "/jobs", icon: "💼" },
    { name: "Analysis", path: "/analyses", icon: "📊" },
    { name: "Applications", path: "/applications", icon: "📋" },
  ];

  const loadApplications = async () => {
    try {
      const apps = await jobService.getMyJobs();
      setApplications(apps);
    } catch (err) {
      console.error("Failed to load applications:", err);
    }
  };

  useEffect(() => {
    loadJobs();
    loadApplications();
  }, []);

  useEffect(() => {
    filterAndSortJobs();
  }, [jobs, searchQuery, sortBy]);

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

  const filterAndSortJobs = () => {
    let filtered = [...jobs];

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (job) =>
          job.jobTitle.toLowerCase().includes(q) ||
          job.companyName.toLowerCase().includes(q)
      );
    }

    if (sortBy === "date") {
      filtered.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    } else {
      filtered.sort((a, b) => a.companyName.localeCompare(b.companyName));
    }

    setFilteredJobs(filtered);
  };

  const handleDelete = async (
    id: number,
    jobTitle: string,
    e: React.MouseEvent
  ) => {
    e.stopPropagation();

    if (
      !window.confirm(
        `Are you sure you want to delete "${jobTitle}"? This action cannot be undone.`
      )
    ) {
      return;
    }

    setDeletingId(id);

    try {
      await jobService.delete(id);
      setJobs((prev) => prev.filter((j) => j.id !== id));
      showToast("Job deleted successfully", "success");
    } catch (err) {
      showToast(getErrorMessage(err), "error");
    } finally {
      setDeletingId(null);
    }
  };

  const handleMarkAsApplied = async (jobId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setIsApplying(jobId);

    try {
      await jobService.markAsApplied(jobId);
      showToast("Marked as applied! Check Applications page", "success");
      await loadApplications();
    } catch (err) {
      showToast(getErrorMessage(err), "error");
    } finally {
      setIsApplying(null);
    }
  };

  const isJobApplied = (jobId: number): boolean => {
    return applications.some(
      (app) => app.id === jobId && app.status !== "Interested"
    );
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
    return text.length <= maxLength
      ? text
      : text.substring(0, maxLength) + "...";
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
      <main className="job-list-main">
        <div className="dashboard-header">
          <div>
            <h1>Job Descriptions 💼</h1>
            <p style={{ color: "#9a9891", fontSize: "15px", marginTop: "6px" }}>
              Manage and analyze job postings
            </p>
          </div>
          <button
            onClick={() => navigate("/add-job")}
            className="btn btn-primary"
            style={{ marginTop: "16px" }}
          >
            + Add Job Description
          </button>
        </div>

        <div className="job-list-content">
          {/* Error */}
          {error && <div className="alert alert-error">{error}</div>}

          {/* Search & Sort */}
          <div
            style={{
              display: "flex",
              gap: "12px",
              marginBottom: "24px",
              flexWrap: "wrap",
            }}
          >
            <div style={{ flex: "1", minWidth: "250px" }}>
              <input
                type="text"
                placeholder="Search by job title or company..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  background: "#161b26",
                  border: "1px solid #2d3748",
                  borderRadius: "8px",
                  color: "#f7f4ed",
                  fontSize: "14px",
                  outline: "none",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#5B9FFF")}
                onBlur={(e) => (e.target.style.borderColor = "#2d3748")}
              />
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              style={{
                padding: "12px 16px",
                background: "#161b26",
                border: "1px solid #2d3748",
                borderRadius: "8px",
                color: "#f7f4ed",
                fontSize: "14px",
                cursor: "pointer",
                outline: "none",
              }}
            >
              <option value="date">Sort by Date</option>
              <option value="company">Sort by Company</option>
            </select>
          </div>

          {/* Loading */}
          {isLoading && (
            <div className="job-grid">
              <SkeletonJobCard />
              <SkeletonJobCard />
              <SkeletonJobCard />
              <SkeletonJobCard />
            </div>
          )}

          {/* Job Grid */}
          {!isLoading && filteredJobs.length > 0 && (
            <div className="job-grid">
              {filteredJobs.map((job) => {
                const applied = isJobApplied(job.id);

                return (
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
                          {applied && (
                            <span
                              style={{
                                marginLeft: "10px",
                                background: "#10B981",
                                color: "white",
                                padding: "4px 10px",
                                borderRadius: "12px",
                                fontSize: "11px",
                                fontWeight: "600",
                              }}
                            >
                              ✓ Applied
                            </span>
                          )}
                        </div>
                        <div className="job-card-company">
                          🏢 {job.companyName}
                        </div>
                      </div>
                    </div>

                    <div className="job-card-preview">
                      <p>
                        {truncateText(
                          job.jobDescriptionPreview || job.jobDescription,
                          150
                        )}
                      </p>
                    </div>

                    <div className="job-card-meta">
                      <div className="job-card-date">
                        📅 {formatDate(job.createdAt)}
                      </div>

                      <div
                        className="job-card-actions"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {!applied ? (
                          <button
                            className="job-card-action-btn primary"
                            onClick={(e) => handleMarkAsApplied(job.id, e)}
                            disabled={isApplying === job.id}
                            style={{
                              background: "#10B981",
                              color: "white",
                              border: "none",
                            }}
                          >
                            {isApplying === job.id ? "..." : "Mark Applied"}
                          </button>
                        ) : (
                          <button
                            className="job-card-action-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate("/applications");
                            }}
                            style={{
                              background: "#1e3a5f",
                              color: "#5B9FFF",
                              border: "1px solid #5B9FFF",
                            }}
                          >
                            View Tracker
                          </button>
                        )}

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
                          onClick={(e) => handleDelete(job.id, job.jobTitle, e)}
                          disabled={deletingId === job.id}
                        >
                          {deletingId === job.id ? "..." : "🗑️"}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Empty States */}
          {!isLoading && filteredJobs.length === 0 && jobs.length > 0 && (
            <div className="job-empty">
              <div className="job-empty-icon">🔍</div>
              <h2>No jobs found</h2>
              <p>Try adjusting your search query</p>
              <button
                onClick={() => setSearchQuery("")}
                className="btn btn-secondary"
              >
                Clear Search
              </button>
            </div>
          )}

          {!isLoading && jobs.length === 0 && (
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
        </div>
      </main>
    </div>
  );
}
