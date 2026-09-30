"use client";

import { SavedDocumentsPanel } from "@/components/converter-workspace/saved-documents-panel";
import { SourcePanel } from "@/components/converter-workspace/source-panel";
import { ThemeToggle } from "@/components/converter-workspace/theme-toggle";
import {
  type ConverterWorkspaceProps,
  useConverterWorkspace,
} from "@/components/converter-workspace/use-converter-workspace";
import { WorkspacePanel } from "@/components/converter-workspace/workspace-panel";

export function ConverterWorkspace({
  initialDocuments = [],
  initialMarkdown = "",
}: ConverterWorkspaceProps) {
  const workspace = useConverterWorkspace({ initialDocuments, initialMarkdown });

  return (
    <>
      <nav className="nav" aria-label="Primary">
        <div className="brand">
          <span className="brand-mark">M</span>
          <span>MarkItDown</span>
        </div>
        <ThemeToggle onThemeChange={workspace.applyTheme} theme={workspace.theme} />
      </nav>

      <section className="hero">
        <h1>Convert documents to Markdown</h1>
        <p>
          Upload a file or fetch a public URL, confirm the document, then edit
          the generated Markdown with a live rendered preview.
        </p>
      </section>

      <section className="screen-grid">
        <SourcePanel
          canConvert={workspace.canConvert}
          documentsCount={workspace.documents.length}
          fileInputRef={workspace.fileInputRef}
          isBusy={workspace.isBusy}
          isDragging={workspace.isDragging}
          onConvertDocument={workspace.convertDocument}
          onFetchUrl={workspace.fetchUrl}
          onFileSelected={workspace.onFileSelected}
          onUrlInputChange={workspace.setUrlInput}
          pendingDocument={workspace.pendingDocument}
          selectedFile={workspace.selectedFile}
          setIsDragging={workspace.setIsDragging}
          urlInput={workspace.urlInput}
        />

        <WorkspacePanel
          activeDocument={workspace.activeDocument}
          activeStatus={workspace.activeStatus}
          activeWorkspaceTab={workspace.activeWorkspaceTab}
          isBusy={workspace.isBusy}
          markdown={workspace.markdown}
          message={workspace.message}
          onCopyMarkdown={workspace.copyMarkdown}
          onDownloadMarkdown={workspace.downloadMarkdown}
          onSaveMarkdown={workspace.saveMarkdown}
          onTabChange={workspace.setActiveWorkspaceTab}
          originalMarkdown={workspace.originalMarkdown}
          setMarkdown={workspace.setMarkdown}
        />
      </section>

      <SavedDocumentsPanel
        documents={workspace.documents}
        onOpenDocument={workspace.openDocument}
      />
    </>
  );
}
