import { beforeEach, describe, expect, test, vi } from "vitest";
import { convertBytesToMarkdown } from "@/lib/converter";

type ExecFileCallback = (
  error: NodeJS.ErrnoException | null,
  stdout?: unknown,
  stderr?: string,
) => void;

const childProcessMock = vi.hoisted(() => ({
  execFile: vi.fn(),
}));

vi.mock("node:child_process", () => ({
  default: childProcessMock,
  execFile: childProcessMock.execFile,
}));

const execFileMock = childProcessMock.execFile;

function mockMissingDefaultMarkItDown() {
  execFileMock.mockImplementation((_command, _args, _options, callback) => {
    const error = Object.assign(new Error("spawn markitdown ENOENT"), {
      code: "ENOENT",
    });
    (callback as ExecFileCallback)(error);
    return undefined;
  });
}

describe("convertBytesToMarkdown", () => {
  beforeEach(() => {
    delete process.env.MARKITDOWN_COMMAND;
    delete process.env.MARKITDOWN_ARGS;
    mockMissingDefaultMarkItDown();
  });

  test("uses Microsoft MarkItDown CLI by default when it is available", async () => {
    execFileMock.mockImplementation((_command, _args, _options, callback) => {
      (callback as ExecFileCallback)(
        null,
        { stdout: " # Converted by MarkItDown\r\n" },
        "",
      );
      return undefined;
    });

    const markdown = await convertBytesToMarkdown({
      bytes: Buffer.from("source"),
      fileName: "report.docx",
      mimeType:
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    });

    expect(markdown).toBe("# Converted by MarkItDown");
    expect(execFileMock).toHaveBeenCalledWith(
      "markitdown",
      expect.arrayContaining([expect.stringMatching(/report\.docx$/)]),
      expect.objectContaining({ timeout: 60_000 }),
      expect.any(Function),
    );
  });

  test("returns plain text content as editable markdown", async () => {
    const markdown = await convertBytesToMarkdown({
      bytes: Buffer.from("# Existing Markdown\n\nKeep this text."),
      fileName: "notes.txt",
      mimeType: "text/plain",
    });

    expect(markdown).toBe("# Existing Markdown\n\nKeep this text.");
  });

  test("formats JSON as a fenced code block", async () => {
    const markdown = await convertBytesToMarkdown({
      bytes: Buffer.from('{"title":"Report","pages":4}'),
      fileName: "report.json",
      mimeType: "application/json",
    });

    expect(markdown).toBe(
      '```json\n{\n  "title": "Report",\n  "pages": 4\n}\n```',
    );
  });

  test("converts CSV rows into a markdown table", async () => {
    const markdown = await convertBytesToMarkdown({
      bytes: Buffer.from("name,score\nAda,99\nLinus,95"),
      fileName: "scores.csv",
      mimeType: "text/csv",
    });

    expect(markdown).toBe(
      "| name | score |\n| --- | --- |\n| Ada | 99 |\n| Linus | 95 |",
    );
  });

  test("returns a useful fallback document for unsupported files", async () => {
    const markdown = await convertBytesToMarkdown({
      bytes: Buffer.from([0, 1, 2, 3]),
      fileName: "archive.zip",
      mimeType: "application/zip",
    });

    expect(markdown).toContain("# archive.zip");
    expect(markdown).toContain("This file was stored, but no local converter is configured");
  });
});
