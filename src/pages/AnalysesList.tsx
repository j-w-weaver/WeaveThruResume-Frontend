import "./analysesList.css";
import "../dashboard.css";
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import analysisService from "../services/analysisService";
import { getErrorMessage } from "../utils/api";
import type { AnalysisSummary } from "../types";
import { SkeletonAnalysisCard } from "../components/Skeleton";
import { ConfirmModal } from "../components/ConfirmModal"; // ← only new import
import { useToast } from "../context/ToastContext";

export function AnalysesList() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [analyses, setAnalyses] = useState<AnalysisSummary[]>([]);
  const [filteredAnalyses, setFilteredAnalyses] = useState<AnalysisSummary[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"date" | "score">("date");
  const [isDeleting, setIsDeleting] = useState(false);

  // NEW: modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);

  const navItems = [
    { name: "Dashboard", path: "/dashboard", icon: "🏠" },
    { name: "My Resumes", path: "/resumes", icon: "📄" },
    { name: "Job Descriptions", path: "/jobs", icon: "💼" },
    { name: "Analysis", path: "/analyses", icon: "📊" },
  ];

  useEffect(() => {
    loadAnalyses();
  }, []);

  useEffect(() => {
    filterAndSortAnalyses();
  }, [analyses, searchQuery, sortBy]);

  const loadAnalyses = async () => {
    setIsLoading(true);
    setError("");

    try {
      const data = await analysisService.getMyAnalyses();
      setAnalyses(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const filterAndSortAnalyses = () => {
    let filtered = [...analyses];

    if (searchQuery) {
      filtered = filtered.filter(
        (analysis) =>
          analysis.industry.toLowerCase().includes(searchQuery.toLowerCase()) ||
          analysis.specialization
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase())
      );
    }

    if (sortBy === "date") {
      filtered.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    } else if (sortBy === "score") {
      filtered.sort((a, b) => b.matchScore - a.matchScore);
    }

    setFilteredAnalyses(filtered);
  };

  // NEW: open modal instead of window.confirm
  const openDeleteModal = (id: number) => {
    setDeleteTargetId(id);
    setShowDeleteModal(true);
  };

  // NEW: real delete after confirm
  const confirmDelete = async () => {
    if (!deleteTargetId) return;

    setDeletingId(deleteTargetId);

    try {
      await analysisService.delete(deleteTargetId);
      setAnalyses((prev) => prev.filter((a) => a.id !== deleteTargetId));
      showToast("Analysis deleted successfully", "success");
    } catch (err) {
      showToast(`Failed to delete: ${getErrorMessage(err)}`, "error");
    } finally {
      setDeletingId(null);
      setShowDeleteModal(false);
      setDeleteTargetId(null);
    }
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    setIsMobileMenuOpen(false);
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getMatchScoreColor = (score: number): string => {
    if (score >= 80) return "#10B981";
    if (score >= 60) return "#F59E0B";
    return "#EF4444";
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
          <div>
            <h1>My Analyses 📊</h1>
            <p style={{ color: "#9a9891", fontSize: "15px", marginTop: "6px" }}>
              View all your resume analyses
            </p>
          </div>
          <button
            onClick={() => navigate("/create-analysis")}
            className="btn btn-primary"
            style={{ marginTop: "16px" }}
          >
            + Create New Analysis
          </button>
        </div>

        <div className="dashboard-content">
          {/* Error */}
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

          {/* Search & Sort - ALWAYS visible */}
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
                placeholder="Search by industry or specialization..."
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
              onChange={(e) => setSortBy(e.target.value as "date" | "score")}
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
              <option value="score">Sort by Match Score</option>
            </select>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div
              style={{ display: "flex", flexDirection: "column", gap: "12px" }}
            >
              <SkeletonAnalysisCard />
              <SkeletonAnalysisCard />
              <SkeletonAnalysisCard />
              <SkeletonAnalysisCard />
              <SkeletonAnalysisCard />
            </div>
          )}

          {/* Analyses List */}
          {!isLoading && filteredAnalyses.length > 0 && (
            <div
              style={{
                background: "#161b26",
                border: "1px solid #2d3748",
                borderRadius: "10px",
                overflow: "hidden",
              }}
            >
              {filteredAnalyses.map((analysis, index) => (
                <div
                  key={analysis.id}
                  style={{
                    padding: "20px",
                    borderBottom:
                      index < filteredAnalyses.length - 1
                        ? "1px solid #2d3748"
                        : "none",
                    transition: "background 0.2s",
                    display: "flex",
                    alignItems: "center",
                    gap: "20px",
                    opacity: deletingId === analysis.id ? 0.5 : 1,
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "#1e2533")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "transparent")
                  }
                >
                  {/* Match Score Circle */}
                  <div
                    onClick={() => navigate(`/analysis/${analysis.id}`)}
                    style={{
                      width: "70px",
                      height: "70px",
                      borderRadius: "50%",
                      border: `3px solid ${getMatchScoreColor(
                        analysis.matchScore
                      )}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      cursor: "pointer",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "20px",
                        fontWeight: "bold",
                        color: getMatchScoreColor(analysis.matchScore),
                      }}
                    >
                      {analysis.matchScore}%
                    </span>
                  </div>

                  {/* Analysis Info */}
                  <div
                    onClick={() => navigate(`/analysis/${analysis.id}`)}
                    style={{ flex: 1, cursor: "pointer" }}
                  >
                    <div
                      style={{
                        color: "#f7f4ed",
                        fontSize: "18px",
                        fontWeight: "600",
                        marginBottom: "8px",
                      }}
                    >
                      {analysis.industry}
                      {analysis.specialization &&
                        ` - ${analysis.specialization}`}
                    </div>
                    <div
                      style={{
                        display: "flex",
                        gap: "16px",
                        color: "#9a9891",
                        fontSize: "14px",
                        flexWrap: "wrap",
                      }}
                    >
                      <span>🔍 {analysis.gapCount} gaps</span>
                      <span>
                        💡 {analysis.recommendationCount} recommendations
                      </span>
                      <span>
                        ✅ {analysis.selectedRecommendationCount} selected
                      </span>
                      <span>📅 {formatDate(analysis.createdAt)}</span>
                    </div>
                  </div>

                  {/* Delete Button - now opens modal */}
                  <button
                    onClick={() => openDeleteModal(analysis.id)}
                    disabled={deletingId === analysis.id}
                    style={{
                      background: "transparent",
                      border: "1px solid #2d3748",
                      borderRadius: "8px",
                      padding: "10px",
                      color: "#EF4444",
                      cursor: "pointer",
                      transition: "all 0.2s",
                      flexShrink: 0,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "#7F1D1D";
                      e.currentTarget.style.borderColor = "#EF4444";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "transparent";
                      e.currentTarget.style.borderColor = "#2d3748";
                    }}
                    title="Delete analysis"
                  >
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
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Empty States */}
          {/* ... exactly the same as you already have ... */}
          {!isLoading &&
            filteredAnalyses.length === 0 &&
            analyses.length > 0 && (
              <div
                style={{
                  background: "#161B26",
                  border: "1px solid #2D3748",
                  borderRadius: "10px",
                  padding: "48px",
                  textAlign: "center",
                }}
              >
                <div style={{ fontSize: "48px", marginBottom: "16px" }}>🔍</div>
                <h2
                  style={{
                    color: "#F7F4ED",
                    fontSize: "20px",
                    marginBottom: "12px",
                  }}
                >
                  No analyses found
                </h2>
                <p style={{ color: "#9A9891", marginBottom: "24px" }}>
                  Try adjusting your search query
                </p>
                <button
                  onClick={() => setSearchQuery("")}
                  className="btn btn-secondary"
                >
                  Clear Search
                </button>
              </div>
            )}

          {!isLoading && analyses.length === 0 && (
            <div
              style={{
                background: "#161B26",
                border: "1px solid #2D3748",
                borderRadius: "10px",
                padding: "48px",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: "64px", marginBottom: "16px" }}>📊</div>
              <h2
                style={{
                  color: "#F7F4ED",
                  fontSize: "24px",
                  marginBottom: "12px",
                }}
              >
                No analyses yet
              </h2>
              <p style={{ color: "#9A9891", marginBottom: "24px" }}>
                Create your first analysis to get AI-powered resume
                recommendations
              </p>
              <button
                onClick={() => navigate("/create-analysis")}
                className="btn btn-primary"
              >
                Create Analysis
              </button>
            </div>
          )}
        </div>
      </main>

      {/* NEW: Confirm Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        title="Delete Analysis?"
        message="Are you sure you want to delete this analysis? This action cannot be undone."
        confirmText="Delete Analysis"
        cancelText="Cancel"
        confirmButtonStyle="danger"
        isLoading={isDeleting}
        onConfirm={confirmDelete}
        onCancel={() => {
          setShowDeleteModal(false);
          setDeleteTargetId(null);
        }}
      />
    </div>
  );
}
