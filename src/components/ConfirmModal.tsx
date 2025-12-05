import type { ReactNode } from "react";
import "./confirmModal.css";

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string | ReactNode;
  confirmText?: string;
  cancelText?: string;
  confirmButtonStyle?: "danger" | "primary";
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function ConfirmModal({
  isOpen,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  confirmButtonStyle = "danger",
  onConfirm,
  onCancel,
  isLoading = false,
}: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{title}</h3>
        </div>

        <div className="modal-body">
          {typeof message === "string" ? <p>{message}</p> : message}
        </div>

        <div className="modal-actions">
          <button
            onClick={onCancel}
            className="btn btn-secondary"
            disabled={isLoading}
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`btn ${
              confirmButtonStyle === "danger" ? "btn-danger" : "btn-primary"
            }`}
            disabled={isLoading}
          >
            {isLoading ? "Processing..." : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
