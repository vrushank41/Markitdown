import { describe, expect, test } from "vitest";
import { validatePublicFileUrl } from "@/lib/url-safety";

describe("validatePublicFileUrl", () => {
  test("accepts public http and https URLs", async () => {
    await expect(validatePublicFileUrl("https://example.com/file.pdf")).resolves.toEqual(
      new URL("https://example.com/file.pdf"),
    );
    await expect(validatePublicFileUrl("http://example.com/file.pdf")).resolves.toEqual(
      new URL("http://example.com/file.pdf"),
    );
  });

  test("rejects non-http schemes", async () => {
    await expect(validatePublicFileUrl("file:///etc/passwd")).rejects.toThrow(
      "Only http and https URLs are supported",
    );
  });

  test("rejects localhost and private network hosts", async () => {
    await expect(validatePublicFileUrl("https://localhost/file.pdf")).rejects.toThrow(
      "Local and private network URLs are not allowed",
    );
    await expect(validatePublicFileUrl("https://127.0.0.1/file.pdf")).rejects.toThrow(
      "Local and private network URLs are not allowed",
    );
    await expect(validatePublicFileUrl("https://192.168.1.20/file.pdf")).rejects.toThrow(
      "Local and private network URLs are not allowed",
    );
  });
});
