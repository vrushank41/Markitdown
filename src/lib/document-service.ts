import { convertBytesToMarkdown } from "@/lib/converter";
import {
  createStoredDocument,
  deleteStoredDocument,
  getStoredDocument,
  listStoredDocuments,
  readStoredFile,
  readStoredMarkdown,
  updateStoredMarkdown,
  updateStoredStatus,
} from "@/lib/storage";
import { validatePublicFileUrl } from "@/lib/url-safety";

export const MAX_FILE_BYTES = 25 * 1024 * 1024;

export interface UploadDocumentInput {
  bytes: Buffer;
  fileName: string;
  mimeType: string;
}

function assertFileSize(bytes: Buffer) {
  if (bytes.byteLength > MAX_FILE_BYTES) {
    throw new Error("This file is larger than the 25 MB limit.");
  }
}

function fileNameFromUrl(url: URL) {
  const lastSegment = url.pathname.split("/").filter(Boolean).at(-1);
  return lastSegment ? decodeURIComponent(lastSegment) : "remote-document";
}

export async function listDocumentsForSession(sessionId: string) {
  return listStoredDocuments(sessionId);
}

export async function storeUploadForSession(
  sessionId: string,
  input: UploadDocumentInput,
) {
  assertFileSize(input.bytes);
  return createStoredDocument({
    bytes: input.bytes,
    fileName: input.fileName,
    mimeType: input.mimeType || "application/octet-stream",
    sessionId,
    sourceType: "upload",
  });
}

export async function storeUrlForSession(sessionId: string, input: { url: string }) {
  const url = await validatePublicFileUrl(input.url);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15_000);

  try {
    const response = await fetch(url, {
      redirect: "follow",
      signal: controller.signal,
    });
    if (!response.ok) {
      throw new Error(`Could not fetch URL (${response.status})`);
    }

    const contentLength = Number(response.headers.get("content-length") ?? "0");
    if (contentLength > MAX_FILE_BYTES) {
      throw new Error("This file is larger than the 25 MB limit.");
    }

    const bytes = Buffer.from(await response.arrayBuffer());
    assertFileSize(bytes);

    return createStoredDocument({
      bytes,
      fileName: fileNameFromUrl(url),
      mimeType: response.headers.get("content-type") ?? "application/octet-stream",
      sessionId,
      sourceType: "url",
      sourceUrl: url.toString(),
    });
  } finally {
    clearTimeout(timeout);
  }
}

export async function getDocumentForSession(documentId: string, sessionId: string) {
  return getStoredDocument(documentId, sessionId);
}

export async function getDocumentFileForSession(documentId: string, sessionId: string) {
  const document = await getStoredDocument(documentId, sessionId);
  if (!document) {
    return null;
  }
  return {
    bytes: await readStoredFile(document),
    document,
  };
}

export async function convertDocumentForSession(
  documentId: string,
  sessionId: string,
) {
  const document = await getStoredDocument(documentId, sessionId);
  if (!document) {
    throw new Error("Document not found");
  }

  await updateStoredStatus(document.id, sessionId, { status: "converting" });

  try {
    const bytes = await readStoredFile(document);
    const markdown = await convertBytesToMarkdown({
      bytes,
      fileName: document.fileName,
      mimeType: document.mimeType,
    });

    return updateStoredStatus(document.id, sessionId, {
      markdown,
      status: "converted",
    });
  } catch (error) {
    await updateStoredStatus(document.id, sessionId, {
      errorMessage:
        error instanceof Error ? error.message : "We could not convert this document.",
      status: "error",
    });
    throw error;
  }
}

export async function getDocumentMarkdownForSession(
  documentId: string,
  sessionId: string,
) {
  return readStoredMarkdown(documentId, sessionId);
}

export async function saveDocumentMarkdownForSession(
  documentId: string,
  sessionId: string,
  markdown: string,
) {
  return updateStoredMarkdown(documentId, sessionId, markdown);
}

export async function deleteDocumentForSession(documentId: string, sessionId: string) {
  await deleteStoredDocument(documentId, sessionId);
}
