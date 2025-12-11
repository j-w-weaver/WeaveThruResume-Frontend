import { useState } from "react";
import { LexicalEditor } from "./LexicalEditor";
import "./resumeEditorModal.css";

interface ResumeEditorModalProps {
  isOpen: boolean;
  initialContent: string; // HTML content
  onClose: () => void;
  onExport: (editedHtml: string) => void;
}

export function ResumeEditorModal({
  isOpen,
  initialContent,
  onClose,
  onExport,
}: ResumeEditorModalProps) {
  const [editedContent, setEditedContent] = useState(initialContent);
  const [isExporting, setIsExporting] = useState(false);

  if (!isOpen) return null;

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await onExport(editedContent);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="editor-modal-overlay" onClick={onClose}>
      <div className="editor-modal" onClick={(e) => e.stopPropagation()}>
        <div className="editor-modal-header">
          <h2>Edit Resume</h2>
          <button onClick={onClose} className="editor-modal-close">
            ✕
          </button>
        </div>

        <div className="editor-modal-body">
          <LexicalEditor
            initialContent={initialContent}
            onContentChange={setEditedContent}
          />
        </div>

        <div className="editor-modal-footer">
          <button
            onClick={onClose}
            className="btn btn-secondary"
            disabled={isExporting}
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            className="btn btn-primary"
            disabled={isExporting}
          >
            {isExporting ? "Exporting..." : "Export as DOCX"}
          </button>
        </div>
      </div>
    </div>
  );
}
