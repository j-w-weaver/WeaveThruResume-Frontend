import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import resumeService from "../services/resumeService";
import jobService from "../services/jobService";
import analysisService from "../services/analysisService";
import { getErrorMessage } from "../utils/api";
import type { Resume, Job, AnalysisSummary } from "../types";
import { SkeletonStatCard, SkeletonAnalysisCard } from "../components/Skeleton";

export function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // ✅ Add state for data
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [analyses, setAnalyses] = useState<AnalysisSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const navItems = [
    { name: "Dashboard", path: "/dashboard", icon: "🏠" },
    { name: "My Resumes", path: "/resumes", icon: "📄" },
    { name: "Job Descriptions", path: "/jobs", icon: "💼" },
    { name: "Analysis", path: "/analyses", icon: "📊" },
    { name: "Applications", path: "/applications", icon: "📋" },
  ];

  const quickActions = [
    {
      title: "Upload Resume",
      description:
        "Upload your resume to start getting AI-powered recommendations",
      icon: "↑",
      color: "blue",
      path: "/resumes",
    },
    {
      title: "My Resumes",
      description: "View and manage your uploaded resumes",
      icon: "📄",
      color: "purple",
      path: "/resumes",
    },
    {
      title: "Job Descriptions",
      description: "Save and manage job postings",
      icon: "💼",
      color: "green",
      path: "/jobs",
    },
    {
      title: "AI Analysis",
      description: "Get AI-powered recommendations",
      icon: "📊",
      color: "orange",
      path: "/create-analysis",
    },
  ];

  // ✅ Load dashboard data on mount
  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    setError("");

    try {
      // Load all data in parallel
      const [resumesData, jobsData, analysesData] = await Promise.all([
        resumeService.getMyResumes(),
        jobService.getMyJobs(), // We'll add this method next
        analysisService.getMyAnalyses(),
      ]);

      setResumes(resumesData);
      setJobs(jobsData);
      setAnalyses(analysesData);
    } catch (err) {
      setError(getErrorMessage(err));
      console.error("Failed to load dashboard data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="dashboard">
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
      <main className="dashboard-main">
        <div className="dashboard-header">
          <h1>Welcome back, {user?.name}! 👋</h1>
          <p>Transform your resume with AI-powered insights</p>
        </div>

        <div className="dashboard-content">
          {/* Error State */}
          {error && (
            <div
              style={{
                background: "#7F1D1D",
                border: "1px solid #FEE2E2",
                borderRadius: "8px",
                padding: "16px",
                marginBottom: "24px",
                color: "#FEE2E2",
              }}
            >
              ❌ {error}
            </div>
          )}

          {/* Quick Actions Section */}
          <div className="dashboard-section">
            <h2 className="dashboard-section-title">Quick Actions</h2>
            <div className="dashboard-grid">
              {quickActions.map((action) => (
                <div
                  key={action.title}
                  className="dashboard-card"
                  onClick={() => handleNavigation(action.path)}
                >
                  <div className={`dashboard-card-icon ${action.color}`}>
                    {action.icon}
                  </div>
                  <h3>{action.title}</h3>
                  <p>{action.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Stats Section */}
          <div className="dashboard-section">
            <h2 className="dashboard-section-title">Your Progress</h2>

            {isLoading ? (
              <div className="stats-grid">
                <SkeletonStatCard />
                <SkeletonStatCard />
                <SkeletonStatCard />
              </div>
            ) : (
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-number blue">{resumes.length}</div>
                  <div className="stat-label">Resumes Uploaded</div>
                </div>
                <div className="stat-card">
                  <div className="stat-number purple">{jobs.length}</div>
                  <div className="stat-label">Jobs Tracked</div>
                </div>
                <div className="stat-card">
                  <div className="stat-number green">{analyses.length}</div>
                  <div className="stat-label">AI Analyses</div>
                </div>
              </div>
            )}
          </div>

          {/* Recent Analyses Section */}
          {isLoading ? (
            <div className="dashboard-section">
              <h2 className="dashboard-section-title">Recent Analyses</h2>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                }}
              >
                <SkeletonAnalysisCard />
                <SkeletonAnalysisCard />
                <SkeletonAnalysisCard />
              </div>
            </div>
          ) : !isLoading && analyses.length > 0 ? (
            <div className="dashboard-section">
              <h2 className="dashboard-section-title">Recent Analyses</h2>
              <div
                style={{
                  background: "#161b26",
                  border: "1px solid #2d3748",
                  borderRadius: "10px",
                  padding: "16px",
                }}
              >
                {analyses.slice(0, 5).map((analysis) => (
                  <div
                    key={analysis.id}
                    onClick={() => navigate(`/analysis/${analysis.id}`)}
                    style={{
                      padding: "16px",
                      borderBottom: "1px solid #2d3748",
                      cursor: "pointer",
                      transition: "background 0.2s",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = "#1e2533")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = "transparent")
                    }
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "16px",
                      }}
                    >
                      <div
                        style={{
                          fontSize: "24px",
                          fontWeight: "bold",
                          color:
                            analysis.matchScore >= 80
                              ? "#10B981"
                              : analysis.matchScore >= 60
                              ? "#F59E0B"
                              : "#EF4444",
                        }}
                      >
                        {analysis.matchScore}%
                      </div>
                      <div style={{ flex: 1 }}>
                        <div
                          style={{
                            color: "#f7f4ed",
                            fontWeight: "600",
                            marginBottom: "4px",
                          }}
                        >
                          {analysis.industry}
                          {analysis.specialization &&
                            ` - ${analysis.specialization}`}
                        </div>
                        <div style={{ color: "#9a9891", fontSize: "13px" }}>
                          {analysis.gapCount} gaps •{" "}
                          {analysis.recommendationCount} recommendations
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </main>
    </div>
  );
}
