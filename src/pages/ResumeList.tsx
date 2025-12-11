import "../dashboard.css";
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import resumeService from "../services/resumeService";
import { getErrorMessage } from "../utils/api";
import { SkeletonList } from "../components/Skeleton";
import type { Resume } from "../types";
import { useToast } from "../context/ToastContext";
import { ConfirmModal } from "../components/ConfirmModal";

export function ResumeList() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { showToast } = useToast();

  const [resumes, setResumes] = useState<Resume[]>([]);
  const [filteredResumes, setFilteredResumes] = useState<Resume[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"date" | "name">("date");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [isDeleting] = useState(false);

  // NEW: modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);

  const navItems = [
    { name: "Dashboard", path: "/dashboard", icon: "🏠" },
    { name: "My Resumes", path: "/resumes", icon: "📄" },
    { name: "Job Descriptions", path: "/jobs", icon: "💼" },
    { name: "Analysis", path: "/analyses", icon: "📊" },
    { name: "Applications", path: "/applications", icon: "📋" },
  ];

  useEffect(() => {
    loadResumes();
  }, []);

  useEffect(() => {
    filterAndSortResumes();
  }, [resumes, searchQuery, sortBy]);

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

  const filterAndSortResumes = () => {
    let filtered = [...resumes];

    if (searchQuery) {
      filtered = filtered.filter((resume) =>
        resume.fileName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (sortBy === "date") {
      filtered.sort(
        (a, b) =>
          new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
      );
    } else {
      filtered.sort((a, b) => a.fileName.localeCompare(b.fileName));
    }

    setFilteredResumes(filtered);
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
      await resumeService.delete(deleteTargetId);
      setResumes((prev) => prev.filter((a) => a.id !== deleteTargetId));
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

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="dashboard">
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
      <main className="dashboard-main">
        <div className="dashboard-header">
          <div>
            <h1>My Resumes 📄</h1>
            <p style={{ color: "#9a9891", fontSize: "15px", marginTop: "6px" }}>
              Manage your uploaded resumes
            </p>
          </div>
          <button
            onClick={() => navigate("/upload-resume")}
            className="btn btn-primary"
            style={{ marginTop: "16px" }}
          >
            + Upload New Resume
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
              Error {error}
            </div>
          )}

          {/* Search & Sort — ALWAYS visible */}
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
                placeholder="Search resumes..."
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
              onChange={(e) => setSortBy(e.target.value as "date" | "name")}
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
              <option value="name">Sort by Name</option>
            </select>
          </div>

          {/* Only the list is loading */}
          {isLoading && <SkeletonList />}

          {/* List */}
          {!isLoading && filteredResumes.length > 0 && (
            <div
              style={{
                background: "#161b26",
                border: "1px solid #2d3748",
                borderRadius: "10px",
                overflow: "hidden",
              }}
            >
              {filteredResumes.map((resume, index) => (
                <div
                  key={resume.id}
                  style={{
                    padding: "20px",
                    borderBottom:
                      index < filteredResumes.length - 1
                        ? "1px solid #2d3748"
                        : "none",
                    transition: "background 0.2s",
                    display: "flex",
                    alignItems: "center",
                    gap: "20px",
                    opacity: deletingId === resume.id ? 0.5 : 1,
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
                      width: "48px",
                      height: "48px",
                      background: "linear-gradient(135deg, #5b9fff, #4a8ae6)",
                      borderRadius: "8px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <svg
                      width="24"
                      height="24"
                      fill="none"
                      stroke="white"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>

                  <div
                    onClick={() => navigate(`/resumes/${resume.id}`)}
                    style={{ flex: 1, cursor: "pointer" }}
                  >
                    <div
                      style={{
                        color: "#f7f4ed",
                        fontSize: "16px",
                        fontWeight: "600",
                        marginBottom: "6px",
                      }}
                    >
                      {resume.fileName}
                    </div>
                    <div
                      style={{
                        display: "flex",
                        gap: "16px",
                        color: "#9a9891",
                        fontSize: "13px",
                        flexWrap: "wrap",
                      }}
                    >
                      <span>Date {formatDate(resume.uploadedAt)}</span>
                      <span>Size {formatFileSize(resume.fileSizeBytes)}</span>
                      <span>
                        Type{" "}
                        {resume.contentType.includes("pdf") ? "PDF" : "DOCX"}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: "8px", flexShrink: 0 }}>
                    <button
                      onClick={() => navigate(`/resumes/${resume.id}`)}
                      style={{
                        background: "transparent",
                        border: "1px solid #2d3748",
                        borderRadius: "8px",
                        padding: "10px",
                        color: "#5B9FFF",
                        cursor: "pointer",
                        transition: "all 0.2s",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "#1e3a5f";
                        e.currentTarget.style.borderColor = "#5B9FFF";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "transparent";
                        e.currentTarget.style.borderColor = "#2d3748";
                      }}
                      title="View details"
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
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                    </button>

                    <button
                      onClick={() => openDeleteModal(resume.id)}
                      disabled={deletingId === resume.id}
                      style={{
                        background: "transparent",
                        border: "1px solid #2d3748",
                        borderRadius: "8px",
                        padding: "10px",
                        color: "#EF4444",
                        cursor: "pointer",
                        transition: "all 0.2s",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "#7F1D1D";
                        e.currentTarget.style.borderColor = "#EF4444";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "transparent";
                        e.currentTarget.style.borderColor = "#2d3748";
                      }}
                      title="Delete resume"
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
                </div>
              ))}
            </div>
          )}

          {/* Empty States */}
          {!isLoading && filteredResumes.length === 0 && resumes.length > 0 && (
            <div
              style={{
                background: "#161B26",
                border: "1px solid #2D3748",
                borderRadius: "10px",
                padding: "48px",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: "48px", marginBottom: "16px" }}>
                Search
              </div>
              <h2
                style={{
                  color: "#F7F4ED",
                  fontSize: "20px",
                  marginBottom: "12px",
                }}
              >
                No resumes found
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

          {!isLoading && resumes.length === 0 && (
            <div
              style={{
                background: "#161B26",
                border: "1px solid #2D3748",
                borderRadius: "10px",
                padding: "48px",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: "64px", marginBottom: "16px" }}>
                Document
              </div>
              <h2
                style={{
                  color: "#F7F4ED",
                  fontSize: "24px",
                  marginBottom: "12px",
                }}
              >
                No resumes yet
              </h2>
              <p style={{ color: "#9A9891", marginBottom: "24px" }}>
                Upload your first resume to get started with AI-powered
                optimization
              </p>
              <button
                onClick={() => navigate("/upload-resume")}
                className="btn btn-primary"
              >
                Upload Resume
              </button>
            </div>
          )}
        </div>
      </main>

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
