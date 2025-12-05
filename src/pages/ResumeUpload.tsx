import "./resumeUpload.css";
import "../dashboard.css";
import { useState, useRef } from "react";
import type { DragEvent, ChangeEvent } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import resumeService from "../services/resumeService";
import { getErrorMessage } from "../utils/api";

export function ResumeUpload() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { name: "Dashboard", path: "/dashboard", icon: "🏠" },
    { name: "My Resumes", path: "/resumes", icon: "📄" },
    { name: "Job Descriptions", path: "/jobs", icon: "💼" },
    { name: "Analysis", path: "/analyses", icon: "📊" },
  ];

  // Validate file
  const validateFile = (file: File): boolean => {
    setError("");

    // Check file type
    const validTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (!validTypes.includes(file.type)) {
      setError("Please upload a PDF or DOCX file");
      return false;
    }

    // Check file size (10MB max)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      setError("File size must be less than 10MB");
      return false;
    }

    return true;
  };

  // Handle file selection from input
  const handleFileInput = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && validateFile(file)) {
      setSelectedFile(file);
      setSuccess(false);
    }
  };

  // Handle drag events
  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file && validateFile(file)) {
      setSelectedFile(file);
      setSuccess(false);
    }
  };

  // Trigger file input click
  const handleClick = () => {
    fileInputRef.current?.click();
  };

  // Upload file
  const handleUpload = async () => {
    if (!selectedFile) {
      setError("Please select a file first");
      return;
    }

    setIsUploading(true);
    setError("");

    try {
      await resumeService.upload(selectedFile);
      setSuccess(true);

      // Navigate to resumes list after 1.5 seconds
      setTimeout(() => {
        navigate("/resumes");
      }, 1500);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsUploading(false);
    }
  };

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="upload-page">
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
      <main className="upload-main">
        <div className="upload-header">
          <h1>Upload Resume</h1>
          <p>
            Upload your resume to get AI-powered optimization recommendations
          </p>
        </div>

        <div className="upload-content">
          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx"
            onChange={handleFileInput}
            style={{ display: "none" }}
          />

          {/* Drop Zone */}
          <div
            onClick={handleClick}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className={`upload-dropzone ${isDragging ? "drag-over" : ""}`}
          >
            <div className="upload-icon">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
            </div>
            <h3>Drop your resume here</h3>
            <p>or click to browse</p>
            <p className="file-types">Supported: PDF, DOCX (max 10MB)</p>
          </div>

          {/* Selected File Preview */}
          {selectedFile && (
            <div className="file-preview">
              <div className="file-preview-header">
                <div className="file-icon">📄</div>
                <div className="file-info">
                  <div className="file-name">{selectedFile.name}</div>
                  <div className="file-size">
                    {formatFileSize(selectedFile.size)}
                  </div>
                </div>
                <button
                  onClick={() => setSelectedFile(null)}
                  className="file-remove"
                  title="Remove file"
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
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>
          )}

          {/* Error Alert */}
          {error && <div className="alert alert-error">{error}</div>}

          {/* Success Alert */}
          {success && (
            <div className="alert alert-success">
              ✅ Resume uploaded successfully! Redirecting...
            </div>
          )}

          {/* Upload Actions */}
          <div className="upload-actions">
            <button
              onClick={() => navigate("/dashboard")}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              onClick={handleUpload}
              disabled={!selectedFile || isUploading}
              className="btn btn-primary"
            >
              {isUploading ? "Uploading..." : "Upload Resume"}
            </button>
          </div>

          {/* Help Text */}
          <div className="upload-help">
            <h3>Tips for best results:</h3>
            <ul>
              <li>Use DOCX format for automatic resume updates</li>
              <li>PDF format is supported for analysis only</li>
              <li>Ensure your resume is well-formatted and up-to-date</li>
              <li>File size limit: 10MB</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}
