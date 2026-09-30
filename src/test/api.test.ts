import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, test } from "vitest";
import {
  convertDocumentForSession,
  deleteDocumentForSession,
  getDocumentMarkdownForSession,
  listDocumentsForSession,
  saveDocumentMarkdownForSession,
  storeUploadForSession,
} from "@/lib/document-service";
import { setStorageRootForTests } from "@/lib/storage";

describe("document service", () => {
  let root: string;

  beforeEach(async () => {
    root = await mkdtemp(join(tmpdir(), "markitdown-api-"));
    setStorageRootForTests(root);
  });

  afterEach(async () => {
    await rm(root, { force: true, recursive: true });
    setStorageRootForTests(undefined);
  });

  test("stores uploads and lists saved documents for a session", async () => {
    const stored = await storeUploadForSession("session-a", {
      bytes: Buffer.from("hello"),
      fileName: "hello.txt",
      mimeType: "text/plain",
    });

    const documents = await listDocumentsForSession("session-a");

    expect(stored).toMatchObject({ fileName: "hello.txt", status: "stored" });
    expect(documents).toHaveLength(1);
    expect(documents[0]).toMatchObject({ id: stored.id, fileName: "hello.txt" });
  });

  test("converts a document and persists editable markdown", async () => {
    const stored = await storeUploadForSession("session-a", {
      bytes: Buffer.from("# Hello"),
      fileName: "hello.txt",
      mimeType: "text/plain",
    });

    const converted = await convertDocumentForSession(stored.id, "session-a");

    expect(converted).toMatchObject({ id: stored.id, status: "converted" });
    await expect(getDocumentMarkdownForSession(stored.id, "session-a")).resolves.toBe(
      "# Hello",
    );

    await saveDocumentMarkdownForSession(stored.id, "session-a", "# Edited");
    await expect(getDocumentMarkdownForSession(stored.id, "session-a")).resolves.toBe(
      "# Edited",
    );
  });

  test("deletes a saved document", async () => {
    const stored = await storeUploadForSession("session-a", {
      bytes: Buffer.from("delete me"),
      fileName: "delete.txt",
      mimeType: "text/plain",
    });

    await deleteDocumentForSession(stored.id, "session-a");

    await expect(listDocumentsForSession("session-a")).resolves.toEqual([]);
  });
});
