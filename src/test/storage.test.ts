import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, test } from "vitest";
import {
  createStoredDocument,
  deleteStoredDocument,
  getStoredDocument,
  listStoredDocuments,
  readStoredFile,
  readStoredMarkdown,
  setStorageRootForTests,
  updateStoredMarkdown,
  updateStoredStatus,
} from "@/lib/storage";

describe("document storage", () => {
  let root: string;

  beforeEach(async () => {
    root = await mkdtemp(join(tmpdir(), "markitdown-storage-"));
    setStorageRootForTests(root);
  });

  afterEach(async () => {
    await rm(root, { force: true, recursive: true });
    setStorageRootForTests(undefined);
  });

  test("creates and lists metadata for the current session only", async () => {
    const first = await createStoredDocument({
      bytes: Buffer.from("first report"),
      fileName: "report.pdf",
      mimeType: "application/pdf",
      sessionId: "session-a",
      sourceType: "upload",
    });
    await createStoredDocument({
      bytes: Buffer.from("other report"),
      fileName: "other.pdf",
      mimeType: "application/pdf",
      sessionId: "session-b",
      sourceType: "upload",
    });

    const documents = await listStoredDocuments("session-a");

    expect(documents).toHaveLength(1);
    expect(documents[0]).toMatchObject({
      id: first.id,
      fileName: "report.pdf",
      mimeType: "application/pdf",
      sessionId: "session-a",
      status: "stored",
    });
    await expect(readStoredFile(first)).resolves.toEqual(Buffer.from("first report"));
  });

  test("persists markdown edits and status updates", async () => {
    const document = await createStoredDocument({
      bytes: Buffer.from("plain source"),
      fileName: "notes.txt",
      mimeType: "text/plain",
      sessionId: "session-a",
      sourceType: "upload",
    });

    await updateStoredStatus(document.id, "session-a", {
      markdown: "# Notes\n\nUpdated",
      status: "converted",
    });
    await updateStoredMarkdown(document.id, "session-a", "# Notes\n\nEdited");

    await expect(readStoredMarkdown(document.id, "session-a")).resolves.toBe(
      "# Notes\n\nEdited",
    );
    await expect(getStoredDocument(document.id, "session-a")).resolves.toMatchObject({
      status: "edited",
    });
  });

  test("deletes metadata and associated files", async () => {
    const document = await createStoredDocument({
      bytes: Buffer.from("delete me"),
      fileName: "delete.txt",
      mimeType: "text/plain",
      sessionId: "session-a",
      sourceType: "upload",
    });

    await deleteStoredDocument(document.id, "session-a");

    await expect(getStoredDocument(document.id, "session-a")).resolves.toBeNull();
    await expect(listStoredDocuments("session-a")).resolves.toEqual([]);
  });
});
