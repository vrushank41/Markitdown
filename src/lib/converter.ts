import { execFile } from "node:child_process";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const DEFAULT_MARKITDOWN_COMMAND = "markitdown";

export interface ConvertBytesInput {
  bytes: Buffer;
  fileName: string;
  mimeType: string;
}

function fileExtension(fileName: string) {
  const dotIndex = fileName.lastIndexOf(".");
  return dotIndex >= 0 ? fileName.slice(dotIndex).toLowerCase() : "";
}

function isTextLike(input: ConvertBytesInput) {
  const extension = fileExtension(input.fileName);
  return (
    input.mimeType.startsWith("text/") ||
    [".md", ".markdown", ".txt"].includes(extension)
  );
}

function isJson(input: ConvertBytesInput) {
  return input.mimeType.includes("json") || fileExtension(input.fileName) === ".json";
}

function isCsv(input: ConvertBytesInput) {
  return input.mimeType.includes("csv") || fileExtension(input.fileName) === ".csv";
}

function isHtml(input: ConvertBytesInput) {
  const extension = fileExtension(input.fileName);
  return input.mimeType.includes("html") || [".html", ".htm"].includes(extension);
}

function isPdf(input: ConvertBytesInput) {
  return input.mimeType === "application/pdf" || fileExtension(input.fileName) === ".pdf";
}

function normalizeMarkdown(markdown: string) {
  return markdown.replaceAll(/\r\n/g, "\n").trim();
}

function convertJson(bytes: Buffer) {
  const parsed = JSON.parse(bytes.toString("utf8"));
  return `\`\`\`json\n${JSON.stringify(parsed, null, 2)}\n\`\`\``;
}

function escapeTableCell(value: string) {
  return value.trim().replaceAll("|", "\\|");
}

function convertCsv(bytes: Buffer) {
  const rows = bytes
    .toString("utf8")
    .trim()
    .split(/\r?\n/)
    .map((row) => row.split(",").map(escapeTableCell));

  const [header, ...body] = rows;
  if (!header || header.length === 0) {
    return "";
  }

  const divider = header.map(() => "---");
  return [header, divider, ...body]
    .map((row) => `| ${row.join(" | ")} |`)
    .join("\n");
}

function convertHtml(bytes: Buffer) {
  return normalizeMarkdown(
    bytes
      .toString("utf8")
      .replaceAll(/<script[\s\S]*?<\/script>/gi, "")
      .replaceAll(/<style[\s\S]*?<\/style>/gi, "")
      .replaceAll(/<\/(h[1-6]|p|li|tr|div|section|article)>/gi, "\n")
      .replaceAll(/<[^>]+>/g, "")
      .replaceAll(/&nbsp;/g, " ")
      .replaceAll(/&amp;/g, "&")
      .replaceAll(/&lt;/g, "<")
      .replaceAll(/&gt;/g, ">"),
  );
}

async function convertPdf(bytes: Buffer) {
  const { PDFParse } = await import("pdf-parse");
  const parser = new PDFParse({ data: bytes });
  try {
    const result = await parser.getText();
    return normalizeMarkdown(result.text);
  } finally {
    await parser.destroy();
  }
}

async function convertWithCommand(input: ConvertBytesInput, command: string) {
  const tempRoot = await mkdtemp(join(tmpdir(), "markitdown-command-"));
  const tempFile = join(tempRoot, input.fileName);
  try {
    await writeFile(tempFile, input.bytes);
    const extraArgs = process.env.MARKITDOWN_ARGS?.split(/\s+/).filter(Boolean) ?? [];
    const { stdout } = await execFileAsync(command, [...extraArgs, tempFile], {
      maxBuffer: 20 * 1024 * 1024,
      timeout: 60_000,
    });
    return normalizeMarkdown(stdout);
  } finally {
    await rm(tempRoot, { force: true, recursive: true });
  }
}

function isMissingCommandError(error: unknown) {
  return (
    error instanceof Error &&
    "code" in error &&
    (error as NodeJS.ErrnoException).code === "ENOENT"
  );
}

function fallbackMarkdown(input: ConvertBytesInput) {
  return [
    `# ${input.fileName}`,
    "",
    "This file was stored, but no local converter is configured for this format.",
    "",
    `- MIME type: ${input.mimeType || "unknown"}`,
    `- Size: ${input.bytes.byteLength} bytes`,
    "",
    "Install Microsoft MarkItDown or configure `MARKITDOWN_COMMAND` to use a compatible conversion worker.",
  ].join("\n");
}

async function convertWithBuiltInFallback(input: ConvertBytesInput) {
  if (isJson(input)) {
    return convertJson(input.bytes);
  }
  if (isCsv(input)) {
    return convertCsv(input.bytes);
  }
  if (isTextLike(input)) {
    return normalizeMarkdown(input.bytes.toString("utf8"));
  }
  if (isHtml(input)) {
    return convertHtml(input.bytes);
  }
  if (isPdf(input)) {
    const markdown = await convertPdf(input.bytes);
    return markdown || fallbackMarkdown(input);
  }

  return fallbackMarkdown(input);
}

export async function convertBytesToMarkdown(input: ConvertBytesInput) {
  const configuredCommand = process.env.MARKITDOWN_COMMAND?.trim();
  const command = configuredCommand || DEFAULT_MARKITDOWN_COMMAND;

  try {
    return await convertWithCommand(input, command);
  } catch (error) {
    if (!configuredCommand && isMissingCommandError(error)) {
      return convertWithBuiltInFallback(input);
    }
    throw error;
  }
}
