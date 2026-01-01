import "./analysisResults.css";
import "../dashboard.css";
import { useState, useEffect } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import analysisService from "../services/analysisService";
import { getErrorMessage } from "../utils/api";
import type { Analysis } from "../types";
import { ResumeEditorModal } from "../components/ResumeEditorModal";
import resumeService from "../services/resumeService";
import { Skeleton } from "../components/Skeleton";
import { SyncfusionResumeEditor } from "../components/SyncfusionResumeEditor";
import { Footer } from "../components/Footer";

// Only content area uses skeleton
function ContentSkeleton() {
  return (
    <div className="analysis-results-content">
      {/* Match Score Hero */}
      <div
        className="match-score-hero"
        style={{
          background: "linear-gradient(135deg, #1E3A8A 0%, #1E40AF 100%)",
          border: "2px solid #2D3748",
          opacity: 0.7,
        }}
      >
        <div className="match-score-content">
          <Skeleton
            width="140px"
            height="16px"
            style={{ marginBottom: "16px" }}
          />
          <Skeleton width="180px" height="80px" borderRadius="12px" />
          <Skeleton width="320px" height="16px" style={{ marginTop: "16px" }} />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="analysis-stats-grid">
        {[1, 2, 3].map((i) => (
          <div key={i} className="analysis-stat-card">
            <Skeleton
              width="80px"
              height="48px"
              style={{ margin: "0 auto 12px" }}
            />
            <Skeleton
              width="130px"
              height="14px"
              style={{ margin: "0 auto" }}
            />
          </div>
        ))}
      </div>

      {/* Gaps Section */}
      <div className="analysis-section">
        <Skeleton
          width="220px"
          height="24px"
          style={{ marginBottom: "24px" }}
        />
        <div className="gaps-list">
          {[1, 2, 3].map((i) => (
            <div key={i} className="gap-item">
              <div className="gap-header">
                <Skeleton width="100px" height="20px" />
                <Skeleton width="80px" height="20px" />
              </div>
              <Skeleton
                width="95%"
                height="16px"
                style={{ marginTop: "12px" }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Recommendations Section */}
      <div className="analysis-section">
        <Skeleton
          width="240px"
          height="24px"
          style={{ marginBottom: "24px" }}
        />
        <div className="recommendations-list">
          {[1, 2].map((i) => (
            <div key={i} className="recommendation-item">
              <div className="recommendation-header">
                <Skeleton width="24px" height="24px" borderRadius="6px" />
                <div style={{ flex: 1 }}>
                  <Skeleton
                    width="120px"
                    height="18px"
                    style={{ marginBottom: "8px" }}
                  />
                  <Skeleton width="90%" height="14px" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function AnalysisResults() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams<{ id: string }>();
  const { user, logout } = useAuth();
  const { showToast } = useToast();

  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const [resumeHtml, setResumeHtml] = useState("");
  const [isLoadingEditor, setIsLoadingEditor] = useState(false);
  const [showSyncfusionEditor, setShowSyncfusionEditor] = useState(false);

  const navItems = [
    { name: "Dashboard", path: "/dashboard", icon: "🏠" },
    { name: "My Resumes", path: "/resumes", icon: "📄" },
    { name: "Job Descriptions", path: "/jobs", icon: "💼" },
    { name: "Analysis", path: "/analyses", icon: "📊" },
    { name: "Applications", path: "/applications", icon: "📋" },
  ];

  useEffect(() => {
    if (id) {
      loadAnalysis(parseInt(id, 10));
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

  const handleOpenSyncfusionEditor = () => {
    if (!analysis) return;

    const selectedRecs = analysis.recommendations
      .filter((r) => r.selected)
      .map((r) => ({
        section: r.section,
        instruction: r.instruction,
        suggestedText: r.suggestedText,
      }));

    if (selectedRecs.length === 0) {
      showToast("Please select at least one recommendation first", "warning");
      return;
    }

    setShowSyncfusionEditor(true);
  };

  const handleExportFromSyncfusion = async (blob: Blob) => {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Resume_Edited_${Date.now()}.docx`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);

    showToast("Resume exported successfully!", "success");
    setShowSyncfusionEditor(false);
  };

  const toggleRecommendation = async (index: number) => {
    if (!analysis) return;

    const updatedRecommendations = [...analysis.recommendations];
    updatedRecommendations[index].selected =
      !updatedRecommendations[index].selected;

    setAnalysis({ ...analysis, recommendations: updatedRecommendations });
    setIsSaving(true);

    try {
      const selectedIndices = updatedRecommendations
        .map((rec, idx) => (rec.selected ? idx : -1))
        .filter((idx) => idx !== -1);

      await analysisService.updateRecommendations(analysis.id, {
        selectedIndices,
      });
    } catch (err) {
      showToast("Failed to save selection", "error");
      updatedRecommendations[index].selected =
        !updatedRecommendations[index].selected;
      setAnalysis({ ...analysis, recommendations: updatedRecommendations });
    } finally {
      setIsSaving(false);
    }
  };

  // Handler to open the editor
  const handlePreviewAndEdit = async () => {
    if (!analysis) return;

    setIsLoadingEditor(true);
    try {
      const html = await resumeService.getResumeAsHtml(analysis.resumeId);
      setResumeHtml(html);
      setShowEditor(true);
    } catch (err) {
      showToast(`Failed to load resume: ${getErrorMessage(err)}`, "error");
    } finally {
      setIsLoadingEditor(false);
    }
  };

  // Handler to export the edited resume
  const handleExportFromEditor = async (editedHtml: string) => {
    if (!analysis) return;

    try {
      const blob = await resumeService.exportEditedResume(
        analysis.resumeId,
        editedHtml
      );

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Edited_Resume_${Date.now()}.docx`;
      document.body.appendChild(a);
      a.click();

      // Cleanup
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      showToast("Resume exported successfully!", "success");
      setShowEditor(false);
    } catch (err) {
      showToast(`Export failed: ${getErrorMessage(err)}`, "error");
    }
  };

  const handleExportResume = async () => {
    if (!analysis) return;

    const selectedCount = analysis.recommendations.filter(
      (r) => r.selected
    ).length;
    if (selectedCount === 0) {
      showToast("Please select at least one recommendation", "warning");
      return;
    }

    setIsExporting(true);
    try {
      const blob = await analysisService.exportResume(analysis.id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Fluid_Resume_${
        analysis.resumeId || "Updated"
      }_${Date.now()}.docx`;
      a.click();
      window.URL.revokeObjectURL(url);
      showToast("Resume exported successfully!", "success");
    } catch (err) {
      showToast(getErrorMessage(err), "error");
    } finally {
      setIsExporting(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(
      () => showToast("Copied to clipboard!", "success"),
      () => showToast("Failed to copy", "error")
    );
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    setIsMobileMenuOpen(false);
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  const getMatchScoreColor = (score: number) => {
    if (score >= 80) return "#10B981";
    if (score >= 60) return "#F59E0B";
    return "#EF4444";
  };

  const getMatchScoreDescription = (score: number) => {
    if (score >= 80) return "Excellent Match! You're a strong candidate.";
    if (score >= 60) return "Good Match — a few improvements needed.";
    return "Needs Work — significant gaps to address.";
  };

  const handleExportWithRecommendations = async () => {
    if (!analysis || analysis.recommendations.length === 0) {
      showToast("Please select at least one recommendation", "warning");
      return;
    }

    setIsExporting(true);
    try {
      // Group recommendations by category
      const recommendations = analysis.recommendations.map((rec) => ({
        category: rec.section,
        suggestion: rec.suggestedText,
      }));

      const blob = await resumeService.exportResumeWithRecommendations(
        analysis.resumeId,
        recommendations
      );

      // Download the file
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Resume_with_AI_Recommendations_${Date.now()}.docx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      showToast("Resume exported with AI recommendations!", "success");
    } catch (err) {
      showToast(`Export failed: ${getErrorMessage(err)}`, "error");
    } finally {
      setIsExporting(false);
    }
  };

  const selectedCount =
    analysis?.recommendations.filter((r) => r.selected).length || 0;

  return (
    <div className="analysis-results-page">
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
        {/* Header — always visible */}
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

          <h1 className="analysis-results-title">
            {isLoading ? "Loading Analysis..." : "Analysis Results"}
          </h1>

          <div className="analysis-results-meta">
            {isLoading ? (
              <>
                <Skeleton width="160px" height="14px" />
                <Skeleton
                  width="200px"
                  height="14px"
                  style={{ marginLeft: "24px" }}
                />
              </>
            ) : (
              <>
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
                  {formatDate(analysis!.createdAt)}
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
                  {analysis!.industry}{" "}
                  {analysis!.specialization && `— ${analysis!.specialization}`}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Content Area — skeleton only here */}
        {isLoading ? (
          <ContentSkeleton />
        ) : error ? (
          <div className="analysis-error-container">
            <div className="analysis-error">
              <div className="analysis-error-icon">Error</div>
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
        ) : (
          analysis && (
            <div className="analysis-results-content">
              {/* Match Score */}
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

              {/* Stats */}
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

              {/* Gaps */}
              <div className="analysis-section">
                <div className="analysis-section-header">
                  <h2 className="analysis-section-title">Identified Gaps</h2>
                </div>
                {analysis.gaps.length > 0 ? (
                  <div className="gaps-list">
                    {analysis.gaps.map((gap, i) => (
                      <div key={i} className="gap-item">
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
                    <div className="empty-state-icon">Check</div>
                    <p>No gaps identified! Great job.</p>
                  </div>
                )}
              </div>

              {/* Recommendations */}
              <div className="analysis-section">
                <div className="analysis-section-header">
                  <h2 className="analysis-section-title">AI Recommendations</h2>
                  {isSaving && (
                    <span style={{ color: "#9A9891", fontSize: "14px" }}>
                      Saving...
                    </span>
                  )}
                </div>

                {analysis.recommendations.length > 0 ? (
                  <div className="recommendations-list">
                    {analysis.recommendations.map((rec, i) => (
                      <div
                        key={i}
                        className={`recommendation-item ${
                          rec.selected ? "selected" : ""
                        }`}
                        onClick={() => toggleRecommendation(i)}
                      >
                        <div className="recommendation-checkbox">
                          {rec.selected && (
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
                          )}
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
                              <div className="recommendation-suggested-label">
                                Suggested Text:
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    copyToClipboard(rec.suggestedText);
                                  }}
                                  style={{
                                    marginLeft: "8px",
                                    background: "transparent",
                                    border: "none",
                                    color: "#5B9FFF",
                                    cursor: "pointer",
                                  }}
                                >
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
                    ))}
                  </div>
                ) : (
                  <div className="empty-state">
                    <div className="empty-state-icon">Lightbulb</div>
                    <p>No recommendations generated.</p>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="analysis-actions">
                {/* <button
                  onClick={handleExportResume}
                  disabled={isExporting || selectedCount === 0}
                  className="btn btn-primary btn-icon"
                >
                  {isExporting ? "Exporting..." : "📥 Export Updated Resume"}
                </button> */}
                <button
                  onClick={handleExportWithRecommendations}
                  disabled={isExporting || selectedCount === 0}
                  className="btn btn-primary btn-icon"
                >
                  {isExporting
                    ? "Exporting..."
                    : "📥 Export Original Resume + AI Recommendations at Bottom of Page"}
                </button>
                <button
                  onClick={() => navigate("/create-analysis")}
                  className="btn btn-secondary btn-icon"
                >
                  Create New Analysis
                </button>
                <button
                  onClick={handleOpenSyncfusionEditor}
                  className="btn btn-primary"
                  disabled={selectedCount === 0}
                >
                  ✨ Open Resume in Editor with Selected Recommendations
                </button>
              </div>

              <p
                style={{
                  textAlign: "center",
                  color: "#9A9891",
                  fontSize: "13px",
                  marginTop: "24px",
                }}
              >
                Tip: Select recommendations → export → format in Word for
                perfect styling
              </p>
            </div>
          )
        )}

        {/* Resume Editor Modal */}
        <SyncfusionResumeEditor
          isOpen={showSyncfusionEditor}
          resumeId={analysis?.resumeId || 0}
          recommendations={
            analysis?.recommendations.filter((r) => r.selected) || []
          }
          onClose={() => setShowSyncfusionEditor(false)}
          onExport={handleExportFromSyncfusion}
        />
      </main>
      <Footer />
    </div>
  );
}
