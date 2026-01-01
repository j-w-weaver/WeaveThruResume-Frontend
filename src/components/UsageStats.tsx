import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import subscriptionService, {
  type SubscriptionStatus,
} from "../services/subscriptionService";
import { getErrorMessage } from "../utils/api";
import "./usageStats.css";

export function UsageStats() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<SubscriptionStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStatus();
  }, []);

  const loadStatus = async () => {
    setIsLoading(true);
    try {
      const data = await subscriptionService.getStatus();
      setStatus(data);
    } catch (err) {
      console.error(
        "Failed to load subscription status:",
        getErrorMessage(err)
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="usage-stats-skeleton">
        <div className="usage-stat-card skeleton">
          <div
            className="skeleton-bar"
            style={{ width: "60%", height: "20px" }}
          />
          <div
            className="skeleton-bar"
            style={{ width: "100%", height: "8px", marginTop: "12px" }}
          />
          <div
            className="skeleton-bar"
            style={{ width: "40%", height: "14px", marginTop: "8px" }}
          />
        </div>
        <div className="usage-stat-card skeleton">
          <div
            className="skeleton-bar"
            style={{ width: "60%", height: "20px" }}
          />
          <div
            className="skeleton-bar"
            style={{ width: "100%", height: "8px", marginTop: "12px" }}
          />
          <div
            className="skeleton-bar"
            style={{ width: "40%", height: "14px", marginTop: "8px" }}
          />
        </div>
        <div className="usage-stat-card skeleton">
          <div
            className="skeleton-bar"
            style={{ width: "60%", height: "20px" }}
          />
          <div
            className="skeleton-bar"
            style={{ width: "100%", height: "8px", marginTop: "12px" }}
          />
          <div
            className="skeleton-bar"
            style={{ width: "40%", height: "14px", marginTop: "8px" }}
          />
        </div>
      </div>
    );
  }

  if (!status) return null;

  const getProgressColor = (used: number, limit: number) => {
    if (limit === -1) return "#10B981"; // Unlimited = green
    const percentage = (used / limit) * 100;
    if (percentage >= 90) return "#EF4444"; // Red
    if (percentage >= 70) return "#F59E0B"; // Orange
    return "#5B9FFF"; // Blue
  };

  const formatUsage = (used: number, limit: number) => {
    if (limit === -1) return "Unlimited";
    return `${used} / ${limit}`;
  };

  const getPercentage = (used: number, limit: number) => {
    if (limit === -1) return 0; // Don't show bar for unlimited
    return Math.min((used / limit) * 100, 100);
  };

  return (
    <div className="usage-stats">
      {/* Tier Badge */}
      {status.tier !== "Free" && (
        <div className="usage-tier-badge">
          <span className="tier-icon">✨</span>
          <span className="tier-name">{status.tier} Plan</span>
          {status.cancelAtPeriodEnd && (
            <span className="tier-warning">
              Cancels {new Date(status.endDate!).toLocaleDateString()}
            </span>
          )}
        </div>
      )}

      {/* Usage Cards */}
      <div className="usage-stats-grid">
        {/* Analyses */}
        <div className="usage-stat-card">
          <div className="usage-stat-header">
            <span className="usage-stat-icon">📊</span>
            <span className="usage-stat-title">AI Analyses</span>
          </div>
          <div className="usage-stat-value">
            {formatUsage(status.usage.analysesUsed, status.usage.analysesLimit)}
          </div>
          {status.usage.analysesLimit !== -1 && (
            <>
              <div className="usage-progress-bar">
                <div
                  className="usage-progress-fill"
                  style={{
                    width: `${getPercentage(
                      status.usage.analysesUsed,
                      status.usage.analysesLimit
                    )}%`,
                    backgroundColor: getProgressColor(
                      status.usage.analysesUsed,
                      status.usage.analysesLimit
                    ),
                  }}
                />
              </div>
              {status.usage.analysesRemaining === 0 && (
                <button
                  onClick={() => navigate("/pricing")}
                  className="usage-upgrade-btn"
                >
                  Upgrade for unlimited
                </button>
              )}
            </>
          )}
        </div>

        {/* Resumes */}
        <div className="usage-stat-card">
          <div className="usage-stat-header">
            <span className="usage-stat-icon">📄</span>
            <span className="usage-stat-title">Resumes</span>
          </div>
          <div className="usage-stat-value">
            {formatUsage(status.usage.resumesUsed, status.usage.resumesLimit)}
          </div>
          {status.usage.resumesLimit !== -1 && (
            <>
              <div className="usage-progress-bar">
                <div
                  className="usage-progress-fill"
                  style={{
                    width: `${getPercentage(
                      status.usage.resumesUsed,
                      status.usage.resumesLimit
                    )}%`,
                    backgroundColor: getProgressColor(
                      status.usage.resumesUsed,
                      status.usage.resumesLimit
                    ),
                  }}
                />
              </div>
              {status.usage.resumesRemaining === 0 && (
                <button
                  onClick={() => navigate("/pricing")}
                  className="usage-upgrade-btn"
                >
                  Upgrade for unlimited
                </button>
              )}
            </>
          )}
        </div>

        {/* Jobs */}
        <div className="usage-stat-card">
          <div className="usage-stat-header">
            <span className="usage-stat-icon">💼</span>
            <span className="usage-stat-title">Saved Jobs</span>
          </div>
          <div className="usage-stat-value">
            {formatUsage(status.usage.jobsUsed, status.usage.jobsLimit)}
          </div>
          {status.usage.jobsLimit !== -1 && (
            <>
              <div className="usage-progress-bar">
                <div
                  className="usage-progress-fill"
                  style={{
                    width: `${getPercentage(
                      status.usage.jobsUsed,
                      status.usage.jobsLimit
                    )}%`,
                    backgroundColor: getProgressColor(
                      status.usage.jobsUsed,
                      status.usage.jobsLimit
                    ),
                  }}
                />
              </div>
              {status.usage.jobsRemaining === 0 && (
                <button
                  onClick={() => navigate("/pricing")}
                  className="usage-upgrade-btn"
                >
                  Upgrade for unlimited
                </button>
              )}
            </>
          )}
        </div>

        {/* Applications */}
        <div className="usage-stat-card">
          <div className="usage-stat-header">
            <span className="usage-stat-icon">📋</span>
            <span className="usage-stat-title">Applications</span>
          </div>
          <div className="usage-stat-value">
            {formatUsage(
              status.usage.applicationsUsed,
              status.usage.applicationsLimit
            )}
          </div>
          {status.usage.applicationsLimit !== -1 && (
            <>
              <div className="usage-progress-bar">
                <div
                  className="usage-progress-fill"
                  style={{
                    width: `${getPercentage(
                      status.usage.applicationsUsed,
                      status.usage.applicationsLimit
                    )}%`,
                    backgroundColor: getProgressColor(
                      status.usage.applicationsUsed,
                      status.usage.applicationsLimit
                    ),
                  }}
                />
              </div>
              {status.usage.applicationsRemaining === 0 && (
                <button
                  onClick={() => navigate("/pricing")}
                  className="usage-upgrade-btn"
                >
                  Upgrade for unlimited
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Free Tier CTA */}
      {status.tier === "Free" && (
        <div className="usage-upgrade-cta">
          <div className="usage-upgrade-content">
            <h3>🚀 Unlock Unlimited Access</h3>
            <p>
              Upgrade to Pro for unlimited analyses, resumes, and job tracking
            </p>
            <button
              onClick={() => navigate("/pricing")}
              className="btn btn-primary"
            >
              View Pricing Plans
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
