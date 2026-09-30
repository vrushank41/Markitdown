import { fireEvent, render, screen } from "@testing-library/react";
import { act } from "react";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, test, vi } from "vitest";
import { ConverterWorkspace } from "@/components/converter-workspace";

describe("ConverterWorkspace", () => {
  afterEach(() => {
    document.body.removeAttribute("data-theme");
    localStorage.clear();
    vi.restoreAllMocks();
  });

  test("toggles and stores dark theme preference", () => {
    render(<ConverterWorkspace />);

    fireEvent.click(screen.getByRole("button", { name: "Dark theme" }));

    expect(document.body).toHaveAttribute("data-theme", "dark");
    expect(localStorage.getItem("markitdown-theme")).toBe("dark");
  });

  test("hydrates without theme mismatch when stored preference is dark", async () => {
    localStorage.setItem("markitdown-theme", "dark");
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    const container = document.createElement("div");
    container.innerHTML = renderToString(<ConverterWorkspace />);
    document.body.append(container);
    let root: ReturnType<typeof hydrateRoot> | undefined;

    try {
      await act(async () => {
        root = hydrateRoot(container, <ConverterWorkspace />);
        await Promise.resolve();
      });

      expect(consoleError.mock.calls.flat().join("\n")).not.toContain(
        "hydrated but some attributes",
      );
    } finally {
      if (root) {
        await act(async () => root?.unmount());
      }
      container.remove();
    }
  });

  test("keeps accessible theme labels with compact icon text for mobile", () => {
    const { container } = render(<ConverterWorkspace />);

    expect(screen.getByRole("button", { name: "Light theme" })).toHaveTextContent(
      "☀️",
    );
    expect(screen.getByRole("button", { name: "Dark theme" })).toHaveTextContent(
      "🌙",
    );
    expect(container.querySelector(".theme-label")).toHaveTextContent("Light");
  });

  test("keeps Convert disabled until a file or URL is selected", () => {
    render(<ConverterWorkspace />);

    expect(screen.getByRole("button", { name: "Convert" })).toBeDisabled();
  });

  test("shows selected file confirmation and enables conversion", () => {
    render(<ConverterWorkspace />);

    const file = new File(["# Hello"], "hello.txt", { type: "text/plain" });
    const input = screen.getByLabelText("Select file");
    fireEvent.change(input, { target: { files: [file] } });

    expect(screen.getByText("hello.txt")).toBeInTheDocument();
    expect(screen.getByText("text/plain")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Convert to Markdown" })).toBeEnabled();
  });

  test("uses tabs so rendered preview is not duplicated below the editor", () => {
    render(<ConverterWorkspace initialMarkdown="# Initial" />);

    const editor = screen.getByLabelText("Markdown editor");
    fireEvent.change(editor, { target: { value: "# Edited" } });

    expect(screen.queryByRole("heading", { name: "Edited" })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("tab", { name: "Rendered preview" }));

    expect(screen.queryByLabelText("Markdown editor")).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Edited" })).toBeInTheDocument();
  });

  test("does not show implementation notes in the user-facing workflow", () => {
    render(<ConverterWorkspace />);

    expect(screen.getByText("Saved documents")).toBeInTheDocument();
    expect(screen.queryByText("No auth model yet")).not.toBeInTheDocument();
    expect(screen.queryByText("Serverless boundary")).not.toBeInTheDocument();
  });
});
