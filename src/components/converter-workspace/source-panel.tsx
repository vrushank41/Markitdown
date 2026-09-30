import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type { RefObject } from "react";
import type { DocumentSummary } from "@/lib/types";

interface SourcePanelProps {
  canConvert: boolean;
  documentsCount: number;
  fileInputRef: RefObject<HTMLInputElement | null>;
  isBusy: boolean;
  isDragging: boolean;
  onConvertDocument: () => void;
  onFetchUrl: () => void;
  onFileSelected: (file: File | undefined) => void;
  onUrlInputChange: (value: string) => void;
  pendingDocument: DocumentSummary | null;
  selectedFile: File | null;
  setIsDragging: (isDragging: boolean) => void;
  urlInput: string;
}

function formatBytes(size: number) {
  if (size < 1024) {
    return `${size} B`;
  }
  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(1)} KB`;
  }
  return `${(size / 1024 / 1024).toFixed(1)} MB`;
}

function fileExtension(fileName: string) {
  return fileName.split(".").at(-1)?.slice(0, 3).toUpperCase();
}

export function SourcePanel({
  canConvert,
  documentsCount,
  fileInputRef,
  isBusy,
  isDragging,
  onConvertDocument,
  onFetchUrl,
  onFileSelected,
  onUrlInputChange,
  pendingDocument,
  selectedFile,
  setIsDragging,
  urlInput,
}: SourcePanelProps) {
  const reduceMotion = useReducedMotion();

  return (
    <div className="stack">
      <motion.section
        animate={{ opacity: 1, y: 0 }}
        className="panel"
        initial={reduceMotion ? false : { opacity: 0, y: 10 }}
      >
        <div className="step-title">
          <span className="step-num">1</span>
          Upload file to convert
        </div>
        <motion.div
          animate={{
            borderColor: isDragging ? "var(--primary)" : "var(--line-strong)",
            scale: isDragging && !reduceMotion ? 1.01 : 1,
          }}
          className="dropzone"
          onClick={() => fileInputRef.current?.click()}
          onDragEnter={() => setIsDragging(true)}
          onDragLeave={() => setIsDragging(false)}
          onDragOver={(event) => {
            event.preventDefault();
            setIsDragging(true);
          }}
          onDrop={(event) => {
            event.preventDefault();
            setIsDragging(false);
            onFileSelected(event.dataTransfer.files.item(0) ?? undefined);
          }}
          role="button"
          tabIndex={0}
        >
          <div>
            <div className="dropzone-icon">+</div>
            <strong>Upload your file</strong>
            <div className="hint">
              Drag and drop a PDF, Word, PowerPoint, Excel, image, HTML, CSV,
              JSON, XML, EPUB, ZIP, or text file.
            </div>
            <span className="button fake-button">Select file</span>
            <input
              aria-label="Select file"
              className="sr-only"
              onChange={(event) => onFileSelected(event.target.files?.[0])}
              ref={fileInputRef}
              type="file"
            />
          </div>
        </motion.div>

        <div className="divider">
          <span>or from website / public file URL</span>
        </div>
        <div className="url-row">
          <input
            className="input"
            onChange={(event) => onUrlInputChange(event.target.value)}
            placeholder="https://example.com/file.pdf"
            value={urlInput}
          />
          <button
            className="button secondary"
            disabled={isBusy || !urlInput.trim()}
            onClick={onFetchUrl}
            type="button"
          >
            Fetch
          </button>
        </div>
        <div className="meta-row">
          <span>{documentsCount}/3 documents this session</span>
          <span className="small-muted">Max 25 MB</span>
        </div>
        <button
          className="button full-width"
          disabled={!canConvert || isBusy}
          onClick={onConvertDocument}
          type="button"
        >
          Convert
        </button>
      </motion.section>

      <AnimatePresence>
        {(selectedFile || pendingDocument) && (
          <motion.section
            animate={{ opacity: 1, y: 0 }}
            className="panel soft"
            exit={reduceMotion ? undefined : { opacity: 0, y: -8 }}
            initial={reduceMotion ? false : { opacity: 0, y: 8 }}
          >
            <div className="step-title">
              <span className="step-num">2</span>
              Confirm selected file
            </div>
            <div className="file-card">
              <div className="file-icon">
                {fileExtension(selectedFile?.name ?? pendingDocument?.fileName ?? "DOC")}
              </div>
              <div>
                <strong>{selectedFile?.name ?? pendingDocument?.fileName}</strong>
                <span className="small-muted">
                  {selectedFile ? (
                    <>
                      <span>{selectedFile.type || "application/octet-stream"}</span>
                      <span> {"\u2022"} {formatBytes(selectedFile.size)}</span>
                    </>
                  ) : (
                    pendingDocument?.mimeType
                  )}
                </span>
              </div>
              <span className="status">Ready</span>
            </div>
            <button
              className="button full-width"
              disabled={isBusy}
              onClick={onConvertDocument}
              type="button"
            >
              Convert to Markdown
            </button>
          </motion.section>
        )}
      </AnimatePresence>

      <div className="note">
        <strong>PDF note:</strong> text-based PDFs work best. Scanned PDFs should
        trigger an OCR notice or upgrade path instead of failing silently.
      </div>
    </div>
  );
}
