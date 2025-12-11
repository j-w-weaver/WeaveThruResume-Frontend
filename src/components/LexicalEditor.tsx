import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { ListItemNode, ListNode } from "@lexical/list";
import { LinkNode } from "@lexical/link";
import { $generateHtmlFromNodes, $generateNodesFromDOM } from "@lexical/html";
import {
  $getRoot,
  $insertNodes,
  FORMAT_TEXT_COMMAND,
  FORMAT_ELEMENT_COMMAND,
} from "lexical";
import {
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
} from "@lexical/list";
import { $getSelection, $isRangeSelection } from "lexical";
import { useEffect, useState, useCallback } from "react";
import "./lexicalEditor.css";

interface LexicalEditorProps {
  initialContent: string;
  onContentChange?: (html: string) => void;
}

// Plugin to load initial HTML content
function InitialContentPlugin({ html }: { html: string }) {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    editor.update(() => {
      const parser = new DOMParser();
      const dom = parser.parseFromString(html, "text/html");
      const nodes = $generateNodesFromDOM(editor, dom);
      const root = $getRoot();
      root.clear();
      $insertNodes(nodes);
    });
  }, [editor, html]);

  return null;
}

// Custom OnChange Plugin
function OnChangePlugin({ onChange }: { onChange: (html: string) => void }) {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        const htmlString = $generateHtmlFromNodes(editor, null);
        onChange(htmlString);
      });
    });
  }, [editor, onChange]);

  return null;
}

// Enhanced Toolbar Component
function ToolbarPlugin() {
  const [editor] = useLexicalComposerContext();
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [fontSize, setFontSize] = useState("14");

  // Update active states
  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          setIsBold(selection.hasFormat("bold"));
          setIsItalic(selection.hasFormat("italic"));
          setIsUnderline(selection.hasFormat("underline"));
        }
      });
    });
  }, [editor]);

  const formatBold = useCallback(() => {
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold");
  }, [editor]);

  const formatItalic = useCallback(() => {
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic");
  }, [editor]);

  const formatUnderline = useCallback(() => {
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, "underline");
  }, [editor]);

  const formatAlignLeft = useCallback(() => {
    editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "left");
  }, [editor]);

  const formatAlignCenter = useCallback(() => {
    editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "center");
  }, [editor]);

  const formatAlignRight = useCallback(() => {
    editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "right");
  }, [editor]);

  const formatAlignJustify = useCallback(() => {
    editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "justify");
  }, [editor]);

  const insertBulletList = useCallback(() => {
    editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
  }, [editor]);

  const insertNumberedList = useCallback(() => {
    editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
  }, [editor]);

  const changeFontSize = useCallback(
    (size: string) => {
      setFontSize(size);
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          selection.getNodes().forEach((node) => {
            if (node.getType() === "text") {
              // Apply font size via inline style
              const element = editor.getElementByKey(node.getKey());
              if (element) {
                element.style.fontSize = `${size}px`;
              }
            }
          });
        }
      });
    },
    [editor]
  );

  return (
    <div className="lexical-toolbar">
      {/* Text Formatting */}
      <div className="toolbar-group">
        <button
          onClick={formatBold}
          className={`toolbar-btn ${isBold ? "active" : ""}`}
          title="Bold (Ctrl+B)"
        >
          <strong>B</strong>
        </button>
        <button
          onClick={formatItalic}
          className={`toolbar-btn ${isItalic ? "active" : ""}`}
          title="Italic (Ctrl+I)"
        >
          <em>I</em>
        </button>
        <button
          onClick={formatUnderline}
          className={`toolbar-btn ${isUnderline ? "active" : ""}`}
          title="Underline (Ctrl+U)"
        >
          <u>U</u>
        </button>
      </div>

      <div className="toolbar-divider" />

      {/* Font Size */}
      <div className="toolbar-group">
        <select
          value={fontSize}
          onChange={(e) => changeFontSize(e.target.value)}
          className="toolbar-select"
          title="Font Size"
        >
          <option value="10">10px</option>
          <option value="12">12px</option>
          <option value="14">14px</option>
          <option value="16">16px</option>
          <option value="18">18px</option>
          <option value="20">20px</option>
          <option value="24">24px</option>
          <option value="28">28px</option>
          <option value="32">32px</option>
        </select>
      </div>

      <div className="toolbar-divider" />

      {/* Alignment */}
      <div className="toolbar-group">
        <button
          onClick={formatAlignLeft}
          className="toolbar-btn"
          title="Align Left"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
          >
            <line x1="3" y1="6" x2="21" y2="6" strokeWidth="2" />
            <line x1="3" y1="12" x2="15" y2="12" strokeWidth="2" />
            <line x1="3" y1="18" x2="18" y2="18" strokeWidth="2" />
          </svg>
        </button>
        <button
          onClick={formatAlignCenter}
          className="toolbar-btn"
          title="Align Center"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
          >
            <line x1="3" y1="6" x2="21" y2="6" strokeWidth="2" />
            <line x1="6" y1="12" x2="18" y2="12" strokeWidth="2" />
            <line x1="4" y1="18" x2="20" y2="18" strokeWidth="2" />
          </svg>
        </button>
        <button
          onClick={formatAlignRight}
          className="toolbar-btn"
          title="Align Right"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
          >
            <line x1="3" y1="6" x2="21" y2="6" strokeWidth="2" />
            <line x1="9" y1="12" x2="21" y2="12" strokeWidth="2" />
            <line x1="6" y1="18" x2="21" y2="18" strokeWidth="2" />
          </svg>
        </button>
        <button
          onClick={formatAlignJustify}
          className="toolbar-btn"
          title="Justify"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
          >
            <line x1="3" y1="6" x2="21" y2="6" strokeWidth="2" />
            <line x1="3" y1="12" x2="21" y2="12" strokeWidth="2" />
            <line x1="3" y1="18" x2="21" y2="18" strokeWidth="2" />
          </svg>
        </button>
      </div>

      <div className="toolbar-divider" />

      {/* Lists */}
      <div className="toolbar-group">
        <button
          onClick={insertBulletList}
          className="toolbar-btn"
          title="Bullet List"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
          >
            <circle cx="5" cy="6" r="1.5" fill="currentColor" />
            <circle cx="5" cy="12" r="1.5" fill="currentColor" />
            <circle cx="5" cy="18" r="1.5" fill="currentColor" />
            <line x1="9" y1="6" x2="21" y2="6" strokeWidth="2" />
            <line x1="9" y1="12" x2="21" y2="12" strokeWidth="2" />
            <line x1="9" y1="18" x2="21" y2="18" strokeWidth="2" />
          </svg>
        </button>
        <button
          onClick={insertNumberedList}
          className="toolbar-btn"
          title="Numbered List"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
          >
            <text x="3" y="8" fontSize="10" fill="currentColor">
              1.
            </text>
            <text x="3" y="14" fontSize="10" fill="currentColor">
              2.
            </text>
            <text x="3" y="20" fontSize="10" fill="currentColor">
              3.
            </text>
            <line x1="9" y1="6" x2="21" y2="6" strokeWidth="2" />
            <line x1="9" y1="12" x2="21" y2="12" strokeWidth="2" />
            <line x1="9" y1="18" x2="21" y2="18" strokeWidth="2" />
          </svg>
        </button>
      </div>
    </div>
  );
}

export function LexicalEditor({
  initialContent,
  onContentChange,
}: LexicalEditorProps) {
  const initialConfig = {
    namespace: "ResumeEditor",
    theme: {
      paragraph: "lexical-paragraph",
      text: {
        bold: "lexical-bold",
        italic: "lexical-italic",
        underline: "lexical-underline",
      },
      list: {
        ul: "lexical-list-ul",
        ol: "lexical-list-ol",
        listitem: "lexical-list-item",
      },
    },
    nodes: [HeadingNode, QuoteNode, ListNode, ListItemNode, LinkNode],
    onError: (error: Error) => {
      console.error("Lexical error:", error);
    },
  };

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <div className="lexical-editor-container">
        <ToolbarPlugin />
        <div className="lexical-editor-inner">
          <RichTextPlugin
            contentEditable={
              <ContentEditable className="lexical-content-editable" />
            }
            placeholder={
              <div className="lexical-placeholder">
                Start editing your resume...
              </div>
            }
            ErrorBoundary={LexicalErrorBoundary}
          />
          <HistoryPlugin />
          <ListPlugin />
          {onContentChange && <OnChangePlugin onChange={onContentChange} />}
          <InitialContentPlugin html={initialContent} />
        </div>
      </div>
    </LexicalComposer>
  );
}
