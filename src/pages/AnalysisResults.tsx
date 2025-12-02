import "./analysisResults.css";
import "../dashboard.css";
import { useState, useEffect } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import analysisService from "../services/analysisService";
import { getErrorMessage } from "../utils/api";
import type { Analysis } from "../types";
import { ResumeEditorModal } from "../components/ResumeEditorModal";

export function AnalysisResults() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams<{ id: string }>();
  const { user, logout } = useAuth();

  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const navItems = [
    { name: "Dashboard", path: "/dashboard", icon: "🏠" },
    { name: "My Resumes", path: "/resumes", icon: "📄" },
    { name: "Job Descriptions", path: "/jobs", icon: "💼" },
    { name: "Analysis", path: "/analyses", icon: "📊" },
  ];

  // Load analysis on mount
  useEffect(() => {
    if (id) {
      loadAnalysis(parseInt(id));
    } else {
      setError("Invalid analysis ID");
      setIsLoading(false);
    }
  }, [id]);

  const loadAnalysis = async (analysisId: number) => {
    setIsLoading(true);
    setError("");

    try {
      const data = await analysisService.getById(analysisId);
      setAnalysis(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const toggleRecommendation = async (index: number) => {
    if (!analysis) return;

    const updatedRecommendations = [...analysis.recommendations];
    updatedRecommendations[index].selected =
      !updatedRecommendations[index].selected;

    setAnalysis({
      ...analysis,
      recommendations: updatedRecommendations,
    });

    // Save to backend
    setIsSaving(true);
    try {
      const selectedIndices = updatedRecommendations
        .map((rec, idx) => (rec.selected ? idx : -1))
        .filter((idx) => idx !== -1);

      await analysisService.updateRecommendations(analysis.id, {
        selectedIndices,
      });
      console.log("✅ Recommendations updated");
    } catch (err) {
      console.error("Failed to save recommendations:", err);
      // Revert on error
      updatedRecommendations[index].selected =
        !updatedRecommendations[index].selected;
      setAnalysis({
        ...analysis,
        recommendations: updatedRecommendations,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportResume = async () => {
    if (!analysis) return;

    const selectedCount = analysis.recommendations.filter(
      (r) => r.selected
    ).length;
    if (selectedCount === 0) {
      alert("Please select at least one recommendation before exporting.");
      return;
    }

    setIsExporting(true);
    setError("");

    try {
      const blob = await analysisService.exportResume(analysis.id);

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Updated_Resume_${Date.now()}.docx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      alert("✅ Resume exported successfully!");
    } catch (err) {
      const errorMsg = getErrorMessage(err);
      setError(errorMsg);
      alert(`Export failed: ${errorMsg}`);
    } finally {
      setIsExporting(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        alert("✅ Copied to clipboard!");
      })
      .catch(() => {
        alert("❌ Failed to copy to clipboard");
      });
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
    });
  };

  const getMatchScoreColor = (score: number): string => {
    if (score >= 80) return "#10B981";
    if (score >= 60) return "#F59E0B";
    return "#EF4444";
  };

  const getMatchScoreDescription = (score: number): string => {
    if (score >= 80)
      return "Excellent Match! Your resume aligns well with this job.";
    if (score >= 60) return "Good Match. Some improvements recommended.";
    return "Needs Work. Significant gaps identified.";
  };

  const selectedCount =
    analysis?.recommendations.filter((r) => r.selected).length || 0;

  const [showEditor, setShowEditor] = useState(false);

  const handlePreviewAndEdit = async () => {
    // TODO: Fetch resume content as HTML from backend
    setShowEditor(true);
  };

  const handleExportFromEditor = async (editedHtml: string) => {
    // Send edited HTML to backend to convert to DOCX
    setShowEditor(false);
  };

  return (
    <div className="analysis-results-page">
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
      <main className="analysis-results-main">
        {/* Loading State */}
        {isLoading && (
          <div className="analysis-loading">
            <div className="analysis-loading-spinner"></div>
            <p>Loading analysis results...</p>
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div style={{ padding: "32px 48px" }}>
            <div className="analysis-error">
              <div className="analysis-error-icon">❌</div>
              <h2>Analysis Not Found</h2>
              <p>{error}</p>
              <button
                onClick={() => navigate("/dashboard")}
                className="btn btn-primary"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        )}

        {/* Analysis Content */}
        {analysis && !isLoading && !error && (
          <>
            {/* Header */}
            <div className="analysis-results-header">
              <button
                onClick={() => navigate("/dashboard")}
                className="analysis-results-back"
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

              <h1 className="analysis-results-title">Analysis Results</h1>

              <div className="analysis-results-meta">
                <div className="analysis-results-meta-item">
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
                  {formatDate(analysis.createdAt)}
                </div>
                <div className="analysis-results-meta-item">
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
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    />
                  </svg>
                  {analysis.industry}{" "}
                  {analysis.specialization && `- ${analysis.specialization}`}
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="analysis-results-content">
              {/* Match Score Hero */}
              <div
                className="match-score-hero"
                style={{ borderColor: getMatchScoreColor(analysis.matchScore) }}
              >
                <div className="match-score-content">
                  <div className="match-score-label">Overall Match Score</div>
                  <div
                    className="match-score-number"
                    style={{ color: getMatchScoreColor(analysis.matchScore) }}
                  >
                    {analysis.matchScore}%
                  </div>
                  <div className="match-score-description">
                    {getMatchScoreDescription(analysis.matchScore)}
                  </div>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="analysis-stats-grid">
                <div className="analysis-stat-card">
                  <div className="analysis-stat-number orange">
                    {analysis.gaps.length}
                  </div>
                  <div className="analysis-stat-label">Gaps Identified</div>
                </div>
                <div className="analysis-stat-card">
                  <div className="analysis-stat-number blue">
                    {analysis.recommendations.length}
                  </div>
                  <div className="analysis-stat-label">Recommendations</div>
                </div>
                <div className="analysis-stat-card">
                  <div className="analysis-stat-number green">
                    {selectedCount}
                  </div>
                  <div className="analysis-stat-label">Selected to Apply</div>
                </div>
              </div>

              {/* Gaps Section */}
              <div className="analysis-section">
                <div className="analysis-section-header">
                  <h2 className="analysis-section-title">
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
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                      />
                    </svg>
                    Identified Gaps
                  </h2>
                </div>

                {analysis.gaps.length > 0 ? (
                  <div className="gaps-list">
                    {analysis.gaps.map((gap, index) => (
                      <div key={index} className="gap-item">
                        <div className="gap-header">
                          <div className="gap-category">{gap.category}</div>
                          <div
                            className={`gap-importance ${gap.importance.toLowerCase()}`}
                          >
                            {gap.importance}
                          </div>
                        </div>
                        <div className="gap-text">{gap.gap}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="empty-state">
                    <div className="empty-state-icon">✅</div>
                    <p>No gaps identified! Your resume looks great.</p>
                  </div>
                )}
              </div>

              {/* Recommendations Section */}
              <div className="analysis-section">
                <div className="analysis-section-header">
                  <h2 className="analysis-section-title">
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
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    AI Recommendations
                  </h2>
                  <div style={{ color: "#9A9891", fontSize: "14px" }}>
                    {isSaving && "Saving..."}
                  </div>
                </div>

                {analysis.recommendations.length > 0 ? (
                  <div className="recommendations-list">
                    {analysis.recommendations.map((rec, index) => (
                      <div
                        key={index}
                        className={`recommendation-item ${
                          rec.selected ? "selected" : ""
                        }`}
                      >
                        <div className="recommendation-header">
                          <div
                            className="recommendation-checkbox"
                            onClick={() => toggleRecommendation(index)}
                            style={{ cursor: "pointer" }}
                          >
                            <svg
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={3}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          </div>
                          <div className="recommendation-content">
                            <div className="recommendation-section">
                              {rec.section}
                            </div>
                            <div className="recommendation-instruction">
                              {rec.instruction}
                            </div>
                            {rec.suggestedText && (
                              <div className="recommendation-suggested">
                                <div
                                  style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    marginBottom: "6px",
                                  }}
                                >
                                  <div className="recommendation-suggested-label">
                                    Suggested Text:
                                  </div>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      copyToClipboard(rec.suggestedText);
                                    }}
                                    style={{
                                      background: "transparent",
                                      border: "none",
                                      color: "#5B9FFF",
                                      cursor: "pointer",
                                      fontSize: "11px",
                                      padding: "4px 8px",
                                      borderRadius: "4px",
                                      display: "flex",
                                      alignItems: "center",
                                      gap: "4px",
                                    }}
                                  >
                                    <svg
                                      width="12"
                                      height="12"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                                      />
                                    </svg>
                                    Copy
                                  </button>
                                </div>
                                <div className="recommendation-suggested-text">
                                  {rec.suggestedText}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="empty-state">
                    <div className="empty-state-icon">💡</div>
                    <p>No recommendations at this time.</p>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="analysis-actions">
                <button
                  onClick={handleExportResume}
                  disabled={isExporting || selectedCount === 0}
                  className="btn btn-primary btn-icon"
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
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                    />
                  </svg>
                  {isExporting
                    ? "Exporting..."
                    : `Export Updated Resume (${selectedCount} changes)`}
                </button>
                <button
                  onClick={() => navigate("/create-analysis")}
                  className="btn btn-secondary btn-icon"
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
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                  Create New Analysis
                </button>
                <button
                  onClick={handlePreviewAndEdit}
                  className="btn btn-secondary btn-icon"
                >
                  📝 Preview & Edit Before Export
                </button>

                <ResumeEditorModal
                  isOpen={showEditor}
                  initialContent="..."
                  onClose={() => setShowEditor(false)}
                  onExport={handleExportFromEditor}
                />
              </div>

              <p
                style={{
                  textAlign: "center",
                  color: "#9A9891",
                  fontSize: "13px",
                  marginTop: "16px",
                }}
              >
                💡 Tip: Select recommendations, export your updated DOCX, then
                format it in Word to perfect the styling
              </p>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
