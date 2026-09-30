import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { describe, expect, test } from "vitest";

async function css() {
  return readFile(join(process.cwd(), "src/app/globals.css"), "utf8");
}

function selectorBlock(styles: string, selector: string) {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return styles.match(new RegExp(`${escaped}\\s*\\{([^}]*)\\}`))?.[1] ?? "";
}

describe("cursor affordances", () => {
  test("clickable custom controls use pointer cursors", async () => {
    const styles = await css();

    expect(selectorBlock(styles, ".dropzone")).toContain("cursor: pointer");
    expect(selectorBlock(styles, ".button")).toContain("cursor: pointer");
    expect(selectorBlock(styles, ".tool")).toContain("cursor: pointer");
  });

  test("disabled controls communicate unavailable actions", async () => {
    const styles = await css();

    expect(selectorBlock(styles, "button:disabled")).toContain(
      "cursor: not-allowed",
    );
  });
});
