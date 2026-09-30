import { randomUUID } from "node:crypto";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { basename, join } from "node:path";
import type {
  CreateStoredDocumentInput,
  DocumentStatus,
  DocumentSummary,
  StoredDocument,
} from "@/lib/types";

const DEFAULT_DATA_ROOT = join(process.cwd(), ".data", "markitdown");
let testStorageRoot: string | undefined;

interface MetadataFile {
  documents: StoredDocument[];
}

function storageRoot() {
  return testStorageRoot ?? process.env.MARKITDOWN_DATA_DIR ?? DEFAULT_DATA_ROOT;
}

function metadataPath() {
  return join(storageRoot(), "metadata.json");
}

function filesRoot() {
  return join(storageRoot(), "files");
}

function markdownRoot() {
  return join(storageRoot(), "markdown");
}

function nowIso() {
  return new Date().toISOString();
}

function safeFileName(fileName: string) {
  const cleanName = basename(fileName).replaceAll(/[^a-zA-Z0-9._-]/g, "-");
  return cleanName.length > 0 ? cleanName : "document";
}

function summarizeDocument(document: StoredDocument): DocumentSummary {
  return {
    id: document.id,
    sessionId: document.sessionId,
    fileName: document.fileName,
    mimeType: document.mimeType,
    size: document.size,
    sourceType: document.sourceType,
    sourceUrl: document.sourceUrl,
    status: document.status,
    errorMessage: document.errorMessage,
    createdAt: document.createdAt,
    updatedAt: document.updatedAt,
    convertedAt: document.convertedAt,
    lastEditedAt: document.lastEditedAt,
  };
}

async function ensureStorage() {
  await mkdir(filesRoot(), { recursive: true });
  await mkdir(markdownRoot(), { recursive: true });
}

async function readMetadata(): Promise<MetadataFile> {
  await ensureStorage();
  try {
    const raw = await readFile(metadataPath(), "utf8");
    return JSON.parse(raw) as MetadataFile;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return { documents: [] };
    }
    throw error;
  }
}

async function writeMetadata(metadata: MetadataFile) {
  await ensureStorage();
  await writeFile(metadataPath(), JSON.stringify(metadata, null, 2));
}

function requireSessionDocument(
  metadata: MetadataFile,
  documentId: string,
  sessionId: string,
) {
  const document = metadata.documents.find(
    (item) => item.id === documentId && item.sessionId === sessionId,
  );
  if (!document) {
    throw new Error("Document not found");
  }
  return document;
}

export function setStorageRootForTests(root: string | undefined) {
  testStorageRoot = root;
}

export async function createStoredDocument(input: CreateStoredDocumentInput) {
  const id = randomUUID();
  const timestamp = nowIso();
  const cleanName = safeFileName(input.fileName);
  const storagePath = `${id}-${cleanName}`;
  const document: StoredDocument = {
    id,
    sessionId: input.sessionId,
    fileName: cleanName,
    mimeType: input.mimeType || "application/octet-stream",
    size: input.bytes.byteLength,
    sourceType: input.sourceType,
    sourceUrl: input.sourceUrl,
    storagePath,
    status: "stored",
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  const metadata = await readMetadata();
  metadata.documents.push(document);
  await writeFile(join(filesRoot(), storagePath), input.bytes);
  await writeMetadata(metadata);
  return document;
}

export async function listStoredDocuments(sessionId: string) {
  const metadata = await readMetadata();
  return metadata.documents
    .filter((document) => document.sessionId === sessionId)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .map(summarizeDocument);
}

export async function getStoredDocument(documentId: string, sessionId: string) {
  const metadata = await readMetadata();
  const document = metadata.documents.find(
    (item) => item.id === documentId && item.sessionId === sessionId,
  );
  return document ?? null;
}

export async function readStoredFile(document: StoredDocument) {
  return readFile(join(filesRoot(), document.storagePath));
}

export async function readStoredMarkdown(documentId: string, sessionId: string) {
  const metadata = await readMetadata();
  const document = requireSessionDocument(metadata, documentId, sessionId);
  if (!document.markdownPath) {
    return "";
  }
  return readFile(join(markdownRoot(), document.markdownPath), "utf8");
}

export async function updateStoredStatus(
  documentId: string,
  sessionId: string,
  input: {
    errorMessage?: string;
    markdown?: string;
    status: DocumentStatus;
  },
) {
  const metadata = await readMetadata();
  const document = requireSessionDocument(metadata, documentId, sessionId);
  const timestamp = nowIso();
  document.status = input.status;
  document.errorMessage = input.errorMessage;
  document.updatedAt = timestamp;

  if (input.markdown !== undefined) {
    const markdownPath = `${document.id}.md`;
    document.markdownPath = markdownPath;
    document.convertedAt = timestamp;
    await writeFile(join(markdownRoot(), markdownPath), input.markdown);
  }

  await writeMetadata(metadata);
  return document;
}

export async function updateStoredMarkdown(
  documentId: string,
  sessionId: string,
  markdown: string,
) {
  const metadata = await readMetadata();
  const document = requireSessionDocument(metadata, documentId, sessionId);
  const timestamp = nowIso();
  const markdownPath = document.markdownPath ?? `${document.id}.md`;
  document.markdownPath = markdownPath;
  document.status = "edited";
  document.updatedAt = timestamp;
  document.lastEditedAt = timestamp;
  await writeFile(join(markdownRoot(), markdownPath), markdown);
  await writeMetadata(metadata);
  return document;
}

export async function deleteStoredDocument(documentId: string, sessionId: string) {
  const metadata = await readMetadata();
  const document = requireSessionDocument(metadata, documentId, sessionId);
  metadata.documents = metadata.documents.filter((item) => item.id !== document.id);
  await rm(join(filesRoot(), document.storagePath), { force: true });
  if (document.markdownPath) {
    await rm(join(markdownRoot(), document.markdownPath), { force: true });
  }
  await writeMetadata(metadata);
}
