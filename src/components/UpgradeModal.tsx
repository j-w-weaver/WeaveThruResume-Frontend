import { useNavigate } from "react-router-dom";
import "./upgradeModal.css";

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  feature: string;
  message: string;
  used?: number;
  limit?: number;
}

export function UpgradeModal({
  isOpen,
  onClose,
  feature,
  message,
  used,
  limit,
}: UpgradeModalProps) {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const featureNames: Record<string, string> = {
    analysis: "AI Resume Analysis",
    resume_upload: "Resume Uploads",
    job_save: "Saved Jobs",
    application_track: "Application Tracking",
    resume_export: "Resume Exports",
  };

  const featureIcons: Record<string, string> = {
    analysis: "📊",
    resume_upload: "📄",
    job_save: "💼",
    application_track: "📋",
    resume_export: "⬇️",
  };

  const handleUpgrade = () => {
    navigate("/pricing");
  };

  return (
    <>
      <div className="upgrade-modal-overlay" onClick={onClose} />
      <div className="upgrade-modal">
        <button
          className="upgrade-modal-close"
          onClick={onClose}
          aria-label="Close"
        >
          <svg
            width="24"
            height="24"
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

        <div className="upgrade-modal-icon">
          {featureIcons[feature] || "🔒"}
        </div>

        <h2 className="upgrade-modal-title">Upgrade to Continue</h2>

        <p className="upgrade-modal-message">{message}</p>

        {used !== undefined && limit !== undefined && (
          <div className="upgrade-modal-usage">
            <div className="usage-bar">
              <div
                className="usage-bar-fill"
                style={{ width: `${Math.min((used / limit) * 100, 100)}%` }}
              />
            </div>
            <span className="usage-text">
              {used} / {limit} {featureNames[feature] || "uses"}
            </span>
          </div>
        )}

        <div className="upgrade-modal-benefits">
          <h3>Upgrade to Pro and get:</h3>
          <ul>
            <li>
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
                  d="M5 13l4 4L19 7"
                />
              </svg>
              Unlimited AI resume analyses
            </li>
            <li>
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
                  d="M5 13l4 4L19 7"
                />
              </svg>
              Unlimited resume uploads & edits
            </li>
            <li>
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
                  d="M5 13l4 4L19 7"
                />
              </svg>
              Unlimited job tracking
            </li>
            <li>
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
                  d="M5 13l4 4L19 7"
                />
              </svg>
              Priority support
            </li>
          </ul>
        </div>

        <div className="upgrade-modal-actions">
          <button onClick={onClose} className="btn btn-secondary">
            Maybe Later
          </button>
          <button onClick={handleUpgrade} className="btn btn-primary">
            Upgrade to Pro
          </button>
        </div>

        <p className="upgrade-modal-footer">
          Starting at just $8.33/month • Cancel anytime
        </p>
      </div>
    </>
  );
}
