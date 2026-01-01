import "@syncfusion/ej2-base/styles/material.css";
import "@syncfusion/ej2-buttons/styles/material.css";
import "@syncfusion/ej2-inputs/styles/material.css";
import "@syncfusion/ej2-popups/styles/material.css";
import "@syncfusion/ej2-lists/styles/material.css";
import "@syncfusion/ej2-navigations/styles/material.css";
import "@syncfusion/ej2-splitbuttons/styles/material.css";
import "@syncfusion/ej2-dropdowns/styles/material.css";
import "@syncfusion/ej2-react-documenteditor/styles/material.css";
import "./syncfusionResumeEditor.css";
import { useRef, useEffect, useState } from "react";
import {
  colorProperty,
  DocumentEditorContainerComponent,
  Toolbar,
} from "@syncfusion/ej2-react-documenteditor";
import { registerLicense } from "@syncfusion/ej2-base";
import "./syncfusionResumeEditor.css";

registerLicense(
  "NxYtGyMROh0gHDMgDk1jXU9FaF5FVmJLYVB3WmpQdldgdVRMZVVbQX9PIiBoS35Rc0RhWXdccnRcRGVVUUdzVEFc"
);

interface SyncfusionResumeEditorProps {
  isOpen: boolean;
  resumeId: number;
  recommendations: Array<{
    section: string;
    instruction: string;
    suggestedText: string;
  }>;
  onClose: () => void;
  onExport: (blob: Blob) => void;
}

export function SyncfusionResumeEditor({
  isOpen,
  resumeId,
  recommendations,
  onClose,
  onExport,
}: SyncfusionResumeEditorProps) {
  const editorRef = useRef<DocumentEditorContainerComponent>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState("");
  const [documentData, setDocumentData] = useState<string | null>(null);
  const [hasInsertedRecommendations, setHasInsertedRecommendations] =
    useState(false);
  const [editorHeight, setEditorHeight] = useState("700px");
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const calculateHeight = () => {
      const viewportHeight = window.innerHeight;
      const calculatedHeight = viewportHeight * 0.9 - 140; // 90vh minus header/footer
      setEditorHeight(`${calculatedHeight}px`);
    };

    calculateHeight();
    window.addEventListener("resize", calculateHeight);
    return () => window.removeEventListener("resize", calculateHeight);
  }, []);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    if (isOpen && resumeId) {
      console.log("🔵 Opening editor for resume ID:", resumeId);
      loadDocument();
    }
  }, [isOpen, resumeId]);

  // Reset flag when modal closes
  useEffect(() => {
    if (!isOpen) {
      setHasInsertedRecommendations(false);
    }
  }, [isOpen]);

  const loadDocument = async () => {
    setIsLoading(true);
    setError("");
    setDocumentData(null);

    try {
      console.log("🔵 Fetching resume from backend...");

      const response = await fetch(
        `https://localhost:7089/api/resume/${resumeId}/docx`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      console.log("🔵 Response status:", response.status);

      if (!response.ok) {
        throw new Error(
          `Failed to load resume: ${response.status} ${response.statusText}`
        );
      }

      const blob = await response.blob();
      console.log("🔵 Blob received, size:", blob.size, "bytes");

      if (blob.size === 0) {
        throw new Error("Received empty file from server");
      }

      const base64 = await blobToBase64(blob);
      console.log("🔵 Base64 ready, length:", base64.length);

      setDocumentData(base64);
      setIsLoading(false);
    } catch (err) {
      console.error("❌ Error loading document:", err);
      setError(err instanceof Error ? err.message : "Failed to load document");
      setIsLoading(false);
    }
  };

  const onEditorCreated = () => {
    console.log("✅ Editor created event fired");

    if (documentData && editorRef.current?.documentEditor) {
      console.log("🔵 Opening document in editor...");

      try {
        // Add document change listener to know when document is fully loaded
        editorRef.current.documentEditor.documentChange = () => {
          console.log("📄 Document change event fired");
          if (!hasInsertedRecommendations && recommendations.length > 0) {
            console.log("🔵 Document loaded, inserting recommendations...");
            // Small delay to ensure everything is ready
            setTimeout(() => {
              insertRecommendationsAsComments();
              setHasInsertedRecommendations(true);
            }, 300);
          }
        };

        editorRef.current.documentEditor.open(documentData);
        console.log("✅ Document opened successfully");
      } catch (err) {
        console.error("❌ Error opening document:", err);
        setError("Failed to open document in editor");
      }
    }
  };

  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        if (base64.includes(",")) {
          const base64Data = base64.split(",")[1];
          resolve(base64Data);
        } else {
          resolve(base64);
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const insertRecommendationsAsComments = () => {
    if (!editorRef.current?.documentEditor) {
      console.log("⚠️ Cannot add recommendations - editor not ready");
      return;
    }

    const editor = editorRef.current.documentEditor;

    try {
      console.log("🔵 Inserting recommendations:", recommendations.length);

      editor.selection.moveToDocumentEnd();
      editor.editor.insertPageBreak();
      editor.editor.insertText("\n");
      editor.editor.insertText("AI-POWERED RECOMMENDATIONS\n\n");

      recommendations.forEach((rec, index) => {
        const text = `${index + 1}. Section: ${rec.section}\n   ${
          rec.instruction
        }\n   Suggested: ${rec.suggestedText || "See instruction above"}\n\n`;
        editor.editor.insertText(text);
      });

      editor.selection.moveToDocumentStart();

      console.log("✅ Recommendations added successfully");
    } catch (err) {
      console.warn("⚠️ Could not add recommendations:", err);
    }
  };

  const handleExport = async () => {
    if (!editorRef.current?.documentEditor) return;

    setIsExporting(true);
    try {
      console.log("🔵 Exporting document...");
      const blob = await editorRef.current.documentEditor.saveAsBlob("Docx");
      console.log("✅ Export successful");
      onExport(blob);
    } catch (err) {
      console.error("❌ Export error:", err);
      setError("Failed to export document");
    } finally {
      setIsExporting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="syncfusion-editor-overlay" onClick={onClose}>
      <div
        className="syncfusion-editor-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="syncfusion-editor-header">
          <h2>Edit Resume with AI Recommendations</h2>
          <button onClick={onClose} className="syncfusion-editor-close">
            ✕
          </button>
        </div>

        {isLoading && (
          <div className="syncfusion-editor-loading">
            <div className="loading-spinner"></div>
            <p>Loading your resume...</p>
          </div>
        )}

        {error && (
          <div className="syncfusion-editor-error">
            <p>❌ {error}</p>
            <button onClick={loadDocument} className="btn btn-secondary">
              Retry
            </button>
          </div>
        )}

        {!isLoading && !error && (
          <>
            <div className="syncfusion-editor-body">
              <DocumentEditorContainerComponent
                ref={editorRef}
                enableToolbar={true}
                height="calc(90vh - 140px)"
                serviceUrl="https://ej2services.syncfusion.com/production/web-services/api/documenteditor/"
                created={onEditorCreated}
              />
            </div>

            <div className="syncfusion-editor-footer">
              <div
                className="syncfusion-editor-info"
                style={{ color: "white", fontSize: isMobile ? "10px" : "15px" }}
              >
                💡 AI recommendations have been added at the end of the
                document.
              </div>
              <div className="syncfusion-editor-actions">
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
                  {isExporting ? "Exporting..." : "📥 Export Updated Resume"}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
