import type { DocumentSummary } from "@/lib/types";

interface SavedDocumentsPanelProps {
  documents: DocumentSummary[];
  onOpenDocument: (document: DocumentSummary) => void;
}

function fileExtension(fileName: string) {
  return fileName.split(".").at(-1)?.slice(0, 3).toUpperCase();
}

export function SavedDocumentsPanel({
  documents,
  onOpenDocument,
}: SavedDocumentsPanelProps) {
  return (
    <section className="saved-documents-panel">
      <div className="device">
        <strong>Saved documents</strong>
        <div className="library">
          {documents.length === 0 ? (
            <span className="small-muted">Converted documents appear here.</span>
          ) : (
            documents.map((document) => (
              <div className="library-item" key={document.id}>
                <span className="file-icon">{fileExtension(document.fileName)}</span>
                <span>
                  <strong>{document.fileName}</strong>
                  <span className="small-muted">{document.status}</span>
                </span>
                <button
                  className="button secondary"
                  onClick={() => onOpenDocument(document)}
                  type="button"
                >
                  Open
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
