export type DocumentSourceType = "upload" | "url";

export type DocumentStatus =
  | "stored"
  | "converting"
  | "converted"
  | "edited"
  | "unsupported"
  | "error";

export interface StoredDocument {
  id: string;
  sessionId: string;
  fileName: string;
  mimeType: string;
  size: number;
  sourceType: DocumentSourceType;
  sourceUrl?: string;
  storagePath: string;
  markdownPath?: string;
  status: DocumentStatus;
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
  convertedAt?: string;
  lastEditedAt?: string;
}

export interface DocumentSummary {
  id: string;
  sessionId: string;
  fileName: string;
  mimeType: string;
  size: number;
  sourceType: DocumentSourceType;
  sourceUrl?: string;
  status: DocumentStatus;
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
  convertedAt?: string;
  lastEditedAt?: string;
}

export interface CreateStoredDocumentInput {
  bytes: Buffer;
  fileName: string;
  mimeType: string;
  sessionId: string;
  sourceType: DocumentSourceType;
  sourceUrl?: string;
}
