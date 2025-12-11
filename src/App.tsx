import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Landing } from "./pages/Landing";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { Dashboard } from "./pages/Dashboard";
import { ResumeUpload } from "./pages/ResumeUpload";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { ResumeList } from "./pages/ResumeList";
import { PublicRoute } from "./components/PublicRoute";
import { ResumeDetail } from "./pages/ResumeDetail";
import { AddJob } from "./pages/AddJob";
import { JobList } from "./pages/JobList";
import { JobDetail } from "./pages/JobDetail";
import { CreateAnalysis } from "./pages/CreateAnalysis";
import { AnalysisResults } from "./pages/AnalysisResults";
import { AnalysesList } from "./pages/AnalysesList";
import { ToastProvider } from "./context/ToastContext";
import { ToastContainer } from "./components/Toast";
import { Applications } from "./pages/Applications";

function ResumesPlaceholder() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const location = useLocation();

  const navItems = [
    { name: "Dashboard", path: "/dashboard", icon: "🏠" },
    { name: "My Resumes", path: "/resumes", icon: "📄" },
    { name: "Job Descriptions", path: "/jobs", icon: "💼" },
    { name: "Analysis", path: "/analyses", icon: "📊" },
    { name: "Applications", path: "/applications", icon: "📋" },
  ];

  return (
    <div className="dashboard">
      <aside className="sidebar">
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

      <main className="dashboard-main">
        <div className="dashboard-header">
          <h1>My Resumes 📄</h1>
          <p>View and manage your uploaded resumes</p>
        </div>

        <div className="dashboard-content">
          <div
            style={{
              background: "#161B26",
              border: "1px solid #2D3748",
              borderRadius: "10px",
              padding: "48px",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>📄</div>
            <h2
              style={{
                color: "#F7F4ED",
                fontSize: "24px",
                marginBottom: "12px",
              }}
            >
              Resume uploaded successfully!
            </h2>
            <p style={{ color: "#9A9891", marginBottom: "24px" }}>
              Your resume has been uploaded. We'll build the full list view
              next!
            </p>
            <div
              style={{ display: "flex", gap: "12px", justifyContent: "center" }}
            >
              <button
                onClick={() => navigate("/upload-resume")}
                className="btn btn-secondary"
              >
                Upload Another
              </button>
              <button
                onClick={() => navigate("/dashboard")}
                className="btn btn-primary"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            {/* <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} /> */}

            {/* Public Routes - Redirect to dashboard if logged in */}
            <Route
              path="/"
              element={
                <PublicRoute>
                  <Landing />
                </PublicRoute>
              }
            />
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              }
            />
            <Route
              path="/register"
              element={
                <PublicRoute>
                  <Register />
                </PublicRoute>
              }
            />

            {/* Protected Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/upload-resume"
              element={
                <ProtectedRoute>
                  <ResumeUpload />
                </ProtectedRoute>
              }
            />

            <Route
              path="/resumes"
              element={
                <ProtectedRoute>
                  <ResumeList />
                </ProtectedRoute>
              }
            />

            <Route
              path="/resumes/:id"
              element={
                <ProtectedRoute>
                  <ResumeDetail />
                </ProtectedRoute>
              }
            />

            <Route
              path="/add-job"
              element={
                <ProtectedRoute>
                  <AddJob />
                </ProtectedRoute>
              }
            />

            <Route
              path="/jobs"
              element={
                <ProtectedRoute>
                  <JobList />
                </ProtectedRoute>
              }
            />

            <Route
              path="/job/:id"
              element={
                <ProtectedRoute>
                  <JobDetail />
                </ProtectedRoute>
              }
            />

            <Route
              path="/create-analyses"
              element={
                <ProtectedRoute>
                  <CreateAnalysis />
                </ProtectedRoute>
              }
            />

            <Route
              path="/analysis/:id"
              element={
                <ProtectedRoute>
                  <AnalysisResults />
                </ProtectedRoute>
              }
            />

            <Route
              path="/analyses"
              element={
                <ProtectedRoute>
                  <AnalysesList />
                </ProtectedRoute>
              }
            />

            <Route
              path="/create-analysis"
              element={
                <ProtectedRoute>
                  <CreateAnalysis />
                </ProtectedRoute>
              }
            />

            <Route
              path="/applications"
              element={
                <ProtectedRoute>
                  <Applications />
                </ProtectedRoute>
              }
            />

            {/* Catch all - MUST BE LAST */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <ToastContainer />
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
