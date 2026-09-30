import type { DocumentSummary } from "@/lib/types";

interface ApiDocumentResponse {
  document: DocumentSummary;
}

interface ApiDocumentsResponse {
  documents: DocumentSummary[];
}

interface ApiMarkdownResponse {
  markdown: string;
}

async function parseJson<T>(response: Response) {
  const body = (await response.json()) as T & { error?: string };
  if (!response.ok) {
    throw new Error(body.error ?? "Request failed.");
  }
  return body;
}

export async function listDocuments() {
  const body = await parseJson<ApiDocumentsResponse>(await fetch("/api/documents"));
  return body.documents;
}

export async function fetchRemoteDocument(url: string) {
  const body = await parseJson<ApiDocumentResponse>(
    await fetch("/api/documents/fetch-url", {
      body: JSON.stringify({ url }),
      headers: { "content-type": "application/json" },
      method: "POST",
    }),
  );
  return body.document;
}

export async function uploadDocument(file: File) {
  const formData = new FormData();
  formData.set("file", file);
  const body = await parseJson<ApiDocumentResponse>(
    await fetch("/api/documents/upload", {
      body: formData,
      method: "POST",
    }),
  );
  return body.document;
}

export async function convertStoredDocument(documentId: string) {
  const body = await parseJson<ApiDocumentResponse>(
    await fetch(`/api/documents/${documentId}/convert`, { method: "POST" }),
  );
  return body.document;
}

export async function readDocumentMarkdown(documentId: string) {
  const body = await parseJson<ApiMarkdownResponse>(
    await fetch(`/api/documents/${documentId}/markdown`),
  );
  return body.markdown;
}

export async function updateDocumentMarkdown(documentId: string, markdown: string) {
  const body = await parseJson<ApiDocumentResponse>(
    await fetch(`/api/documents/${documentId}/markdown`, {
      body: JSON.stringify({ markdown }),
      headers: { "content-type": "application/json" },
      method: "PUT",
    }),
  );
  return body.document;
}
