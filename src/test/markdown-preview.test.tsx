import { render, screen, within } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import { MarkdownPreview } from "@/components/markdown-preview";

describe("MarkdownPreview", () => {
  test("renders headings and GitHub-flavored tables", () => {
    render(
      <MarkdownPreview
        markdown={[
          "# Report",
          "",
          "| name | score |",
          "| --- | --- |",
          "| Ada | 99 |",
        ].join("\n")}
      />,
    );

    expect(screen.getByRole("heading", { name: "Report" })).toBeInTheDocument();
    const table = screen.getByRole("table");
    expect(within(table).getByText("Ada")).toBeInTheDocument();
    expect(within(table).getByText("99")).toBeInTheDocument();
  });
});
