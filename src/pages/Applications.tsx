import "./applications.css";
import "../dashboard.css";
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import jobService from "../services/jobService";
import { getErrorMessage } from "../utils/api";
import type { Job, JobStats, JobStatus } from "../types";
import { ApplicationKanban } from "../components/ApplicationKanban";
import { ApplicationTable } from "../components/ApplicationTable";

type ViewMode = "kanban" | "table";

export function Applications() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { showToast } = useToast();

  const [applications, setApplications] = useState<Job[]>([]);
  const [stats, setStats] = useState<JobStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("table");
  const [showArchived, setShowArchived] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const navItems = [
    { name: "Dashboard", path: "/dashboard", icon: "🏠" },
    { name: "My Resumes", path: "/resumes", icon: "📄" },
    { name: "Job Descriptions", path: "/jobs", icon: "💼" },
    { name: "Analysis", path: "/analyses", icon: "📊" },
    { name: "Applications", path: "/applications", icon: "📋" },
  ];

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Force table view on mobile
  useEffect(() => {
    if (isMobile && viewMode === "kanban") {
      setViewMode("table");
    }
  }, [isMobile, viewMode]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    setError("");

    try {
      const [appsData, statsData] = await Promise.all([
        jobService.getMyJobs(),
        jobService.getStats(),
      ]);

      setApplications(appsData);
      setStats(statsData);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (id: number, newStatus: JobStatus) => {
    console.log("🎯 Attempting to change status:", { id, newStatus });

    const originalApplications = [...applications];

    setApplications((prev) =>
      prev.map((app) => (app.id === id ? { ...app, status: newStatus } : app))
    );

    try {
      console.log("🚀 Calling updateStatus API...");
      await jobService.updateStatus(id, newStatus);
      console.log("✅ Status updated successfully");
      showToast("Status updated successfully", "success");

      const statsData = await jobService.getStats();
      setStats(statsData);
    } catch (err) {
      console.error("❌ Status update failed:", err);
      setApplications(originalApplications);
      showToast(`Failed to update status: ${getErrorMessage(err)}`, "error");
    }
  };

  const handleViewDetails = (application: Job) => {
    navigate(`/job/${application.id}`);
  };

  const handleDelete = async (id: number) => {
    try {
      await jobService.delete(id);
      setApplications((prev) => prev.filter((app) => app.id !== id));
      showToast("Application deleted", "success");

      const statsData = await jobService.getStats();
      setStats(statsData);
    } catch (err) {
      showToast(`Failed to delete: ${getErrorMessage(err)}`, "error");
    }
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    setIsMobileMenuOpen(false);
  };

  const filteredApplications = showArchived
    ? applications
    : applications.filter(
        (app) => app.status !== "Rejected" && app.status !== "Withdrawn"
      );

  return (
    <div className="applications-page">
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

      <main className="dashboard-main">
        <div className="dashboard-header">
          <div>
            <a onClick={() => navigate("/dashboard")} className="add-job-back">
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
            <h2>Application Tracker 📋</h2>
            <p style={{ color: "#9a9891", fontSize: "15px", marginTop: "6px" }}>
              Track your job applications through the hiring process
            </p>
          </div>
          <button
            onClick={() => navigate("/jobs")}
            className="btn btn-primary"
            style={{ marginTop: "16px" }}
          >
            + Browse Jobs
          </button>
        </div>

        <div className="applications-content">
          {error && (
            <div className="applications-error">
              ❌ {error}
              <button onClick={loadData} className="btn btn-secondary">
                Retry
              </button>
            </div>
          )}

          {isLoading && (
            <div className="applications-loading">
              <div className="loading-spinner"></div>
              <p>Loading your applications...</p>
            </div>
          )}

          {!isLoading && !error && (
            <>
              {/* Only show stats on desktop */}
              {stats && !isMobile && (
                <div className="applications-stats">
                  <div className="applications-stat">
                    <div
                      className="applications-stat-number"
                      style={{ color: "#6B7280" }}
                    >
                      {stats.interested}
                    </div>
                    <div className="applications-stat-label">Interested</div>
                  </div>
                  <div className="applications-stat">
                    <div
                      className="applications-stat-number"
                      style={{ color: "#3B82F6" }}
                    >
                      {stats.applied}
                    </div>
                    <div className="applications-stat-label">Applied</div>
                  </div>
                  <div className="applications-stat">
                    <div
                      className="applications-stat-number"
                      style={{ color: "#F59E0B" }}
                    >
                      {stats.interviewing}
                    </div>
                    <div className="applications-stat-label">Interviewing</div>
                  </div>
                  <div className="applications-stat">
                    <div
                      className="applications-stat-number"
                      style={{ color: "#10B981" }}
                    >
                      {stats.offer}
                    </div>
                    <div className="applications-stat-label">Offers</div>
                  </div>
                  <div className="applications-stat">
                    <div
                      className="applications-stat-number"
                      style={{ color: "#EF4444" }}
                    >
                      {stats.rejected}
                    </div>
                    <div className="applications-stat-label">Rejected</div>
                  </div>
                  <div className="applications-stat">
                    <div
                      className="applications-stat-number"
                      style={{ color: "#9A9891" }}
                    >
                      {stats.total}
                    </div>
                    <div className="applications-stat-label">Total</div>
                  </div>
                </div>
              )}

              {/* Mobile: Show compact stats */}
              {stats && isMobile && (
                <div className="applications-stats-mobile">
                  <div className="stat-mobile">
                    <span
                      className="stat-mobile-number"
                      style={{ color: "#3B82F6" }}
                    >
                      {stats.applied}
                    </span>
                    <span className="stat-mobile-label">Applied</span>
                  </div>
                  <div className="stat-mobile">
                    <span
                      className="stat-mobile-number"
                      style={{ color: "#F59E0B" }}
                    >
                      {stats.interviewing}
                    </span>
                    <span className="stat-mobile-label">Interviewing</span>
                  </div>
                  <div className="stat-mobile">
                    <span
                      className="stat-mobile-number"
                      style={{ color: "#10B981" }}
                    >
                      {stats.offer}
                    </span>
                    <span className="stat-mobile-label">Offers</span>
                  </div>
                  <div className="stat-mobile">
                    <span
                      className="stat-mobile-number"
                      style={{ color: "#9A9891" }}
                    >
                      {stats.total}
                    </span>
                    <span className="stat-mobile-label">Total</span>
                  </div>
                </div>
              )}

              <div className="applications-controls">
                {/* Only show view toggle on desktop */}
                {!isMobile && (
                  <div className="applications-view-toggle">
                    <button
                      onClick={() => setViewMode("table")}
                      className={`view-toggle-btn ${
                        viewMode === "table" ? "active" : ""
                      }`}
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
                          d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                        />
                      </svg>
                      Table
                    </button>
                    <button
                      onClick={() => setViewMode("kanban")}
                      className={`view-toggle-btn ${
                        viewMode === "kanban" ? "active" : ""
                      }`}
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
                          d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2"
                        />
                      </svg>
                      Kanban
                    </button>
                  </div>
                )}

                {viewMode === "kanban" && !isMobile && (
                  <label className="applications-checkbox">
                    <input
                      type="checkbox"
                      checked={showArchived}
                      onChange={(e) => setShowArchived(e.target.checked)}
                    />
                    <span>Show Archived (Rejected/Withdrawn)</span>
                  </label>
                )}
              </div>

              {applications.length === 0 && (
                <div className="applications-empty">
                  <div className="applications-empty-icon">📋</div>
                  <h2>No applications yet</h2>
                  <p>
                    Start tracking your job applications by marking jobs as
                    applied
                  </p>
                  <button
                    onClick={() => navigate("/jobs")}
                    className="btn btn-primary"
                  >
                    Browse Jobs
                  </button>
                </div>
              )}

              {applications.length > 0 && viewMode === "kanban" && (
                <ApplicationKanban
                  applications={filteredApplications}
                  onStatusChange={handleStatusChange}
                  onViewDetails={handleViewDetails}
                  showArchived={showArchived}
                />
              )}

              {applications.length > 0 && viewMode === "table" && (
                <ApplicationTable
                  applications={applications}
                  onStatusChange={handleStatusChange}
                  onViewDetails={handleViewDetails}
                  onDelete={handleDelete}
                />
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
