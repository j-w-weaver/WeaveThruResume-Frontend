// src/components/ResumeEditorModal.tsx
import { useState } from "react";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";

interface ResumeEditorModalProps {
  isOpen: boolean;
  initialContent: string;
  onClose: () => void;
  onExport: (html: string) => void;
}

export function ResumeEditorModal({
  isOpen,
  initialContent,
  onClose,
  onExport,
}: ResumeEditorModalProps) {
  if (!isOpen) return null;

  const initialConfig = {
    namespace: "ResumeEditor",
    theme: {
      // Custom styling
    },
    onError: (error: Error) => console.error(error),
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Edit Resume Preview</h2>
          <button onClick={onClose}>✕</button>
        </div>

        <LexicalComposer initialConfig={initialConfig}>
          <div className="editor-container">
            {/* Toolbar */}
            <div className="toolbar">
              <button>Bold</button>
              <button>Italic</button>
              <button>Bullet List</button>
            </div>

            {/* Editor */}
            <RichTextPlugin
              contentEditable={<ContentEditable className="editor-input" />}
              placeholder={<div>Start editing...</div>}
              ErrorBoundary={LexicalErrorBoundary}
            />
            <HistoryPlugin />
            <ListPlugin />
          </div>
        </LexicalComposer>

        <div className="modal-actions">
          <button onClick={onClose}>Cancel</button>
          <button onClick={() => onExport("html-content")}>Export DOCX</button>
        </div>
      </div>
    </div>
  );
}
