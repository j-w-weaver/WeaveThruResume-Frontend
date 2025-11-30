import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../dashboard.css";

export function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const navItems = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: "🏠",
    },
    {
      name: "My Resumes",
      path: "/resumes",
      icon: "📄",
    },
    {
      name: "Job Descriptions",
      path: "/jobs",
      icon: "💼",
    },
    {
      name: "Analysis",
      path: "/analyses",
      icon: "📊",
    },
  ];

  const quickActions = [
    {
      title: "Upload Resume",
      description:
        "Upload your resume to start getting AI-powered recommendations",
      icon: "↑",
      color: "blue",
      path: "/upload-resume",
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
      path: "/analyses",
    },
  ];

  return (
    <div className="dashboard">
      {/* Sidebar */}
      <aside className="sidebar">
        {/* Logo */}
        <div className="sidebar-header">
          <div className="nav-logo">
            <div className="nav-icon">W</div>
            <span className="nav-brand">WeavThruResume</span>
          </div>
        </div>

        {/* Navigation */}
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

        {/* User Profile */}
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
        {/* Header */}
        <div className="dashboard-header">
          <h1>Welcome back, {user?.name}!</h1>
          <p>Transform your resume with AI-powered insights</p>
        </div>

        {/* Content */}
        <div className="dashboard-content">
          {/* Quick Actions Section */}
          <div className="dashboard-section">
            <h2 className="dashboard-section-title">Quick Actions</h2>

            <div className="dashboard-grid">
              {quickActions.map((action) => (
                <div
                  key={action.title}
                  className="dashboard-card"
                  onClick={() => navigate(action.path)}
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

            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-number blue">0</div>
                <div className="stat-label">Resumes Uploaded</div>
              </div>
              <div className="stat-card">
                <div className="stat-number purple">0</div>
                <div className="stat-label">Jobs Tracked</div>
              </div>
              <div className="stat-card">
                <div className="stat-number green">0</div>
                <div className="stat-label">AI Analyses</div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
