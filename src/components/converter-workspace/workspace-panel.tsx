"use client";

import { motion, useReducedMotion } from "motion/react";
import type { DocumentSummary } from "@/lib/types";
import { MarkdownPreview } from "@/components/markdown-preview";
import { AnimatedBackground } from "./animated-background";
import type { WorkspaceTab } from "./use-converter-workspace";

interface WorkspacePanelProps {
  activeDocument: DocumentSummary | null;
  activeStatus: string;
  activeWorkspaceTab: WorkspaceTab;
  isBusy: boolean;
  markdown: string;
  message: string;
  onCopyMarkdown: () => void;
  onDownloadMarkdown: () => void;
  onSaveMarkdown: () => void;
  onTabChange: (tab: WorkspaceTab) => void;
  originalMarkdown: string;
  setMarkdown: (markdown: string) => void;
}

export function WorkspacePanel({
  activeDocument,
  activeStatus,
  activeWorkspaceTab,
  isBusy,
  markdown,
  message,
  onCopyMarkdown,
  onDownloadMarkdown,
  onSaveMarkdown,
  onTabChange,
  originalMarkdown,
  setMarkdown,
}: WorkspacePanelProps) {
  const reduceMotion = useReducedMotion();

  return (
    <section className="workspace" aria-label="Markdown workspace">
      <div className="workspace-top">
        <div className="tabs" role="tablist" aria-label="Workspace views">
          <AnimatedBackground value={activeWorkspaceTab}>
            <button
              aria-selected={activeWorkspaceTab === "markdown"}
              className="tab"
              data-id="markdown"
              onClick={() => onTabChange("markdown")}
              role="tab"
              type="button"
            >
              Markdown
            </button>
            <button
              aria-selected={activeWorkspaceTab === "preview"}
              className="tab"
              data-id="preview"
              onClick={() => onTabChange("preview")}
              role="tab"
              type="button"
            >
              Rendered preview
            </button>
            <button
              aria-selected={activeWorkspaceTab === "original"}
              className="tab"
              data-id="original"
              onClick={() => onTabChange("original")}
              role="tab"
              type="button"
            >
              Original file
            </button>
          </AnimatedBackground>
        </div>
        <div className="tool-actions">
          <button
            className="tool"
            disabled={!markdown}
            onClick={onCopyMarkdown}
            type="button"
          >
            Copy
          </button>
          <button
            className="tool"
            disabled={!markdown}
            onClick={onDownloadMarkdown}
            type="button"
          >
            Download .md
          </button>
          <button
            className="tool"
            disabled={!markdown}
            onClick={() => setMarkdown(originalMarkdown)}
            type="button"
          >
            Reset
          </button>
          <button
            className="tool"
            disabled={!activeDocument || isBusy}
            onClick={onSaveMarkdown}
            type="button"
          >
            Save
          </button>
        </div>
      </div>
      <div className="workspace-pane">
        <motion.div
          key={activeWorkspaceTab}
          initial={reduceMotion ? false : { opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reduceMotion ? 0 : 0.16 }}
        >
          {activeWorkspaceTab === "markdown" && (
            <textarea
              aria-label="Markdown editor"
              className="editor"
              onChange={(event) => setMarkdown(event.target.value)}
              placeholder="# Converted Markdown"
              value={markdown}
            />
          )}

          {activeWorkspaceTab === "preview" && (
            <div className="rendered">
              <MarkdownPreview markdown={markdown} />
            </div>
          )}

          {activeWorkspaceTab === "original" && (
            <div className="original-file-panel">
              <h2>Original file</h2>
              {activeDocument ? (
                <>
                  <p>{activeDocument.fileName} is stored for this browser session.</p>
                  <a
                    className="button secondary original-file-link"
                    href={`/api/documents/${activeDocument.id}/file`}
                    rel="noreferrer"
                    target="_blank"
                  >
                    Open original file
                  </a>
                </>
              ) : (
                <p className="empty-preview">
                  Convert or open a saved document to access its original file.
                </p>
              )}
            </div>
          )}
        </motion.div>
      </div>
      <div className="workspace-status">
        <span>{activeStatus}</span>
        <span>{message || "Ready when you are."}</span>
      </div>
    </section>
  );
}
