import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { describe, expect, test } from "vitest";

async function css() {
  return readFile(join(process.cwd(), "src/app/globals.css"), "utf8");
}

describe("responsive theme control", () => {
  test("keeps nav horizontal while collapsing theme labels to icons on mobile", async () => {
    const styles = await css();
    const mobileStyles = styles.slice(styles.indexOf("@media (max-width: 620px)"));

    expect(mobileStyles).not.toMatch(/\.nav,\s*\.workspace-top/);
    expect(mobileStyles).toContain(".theme-label");
    expect(mobileStyles).toContain("display: none");
    expect(mobileStyles).toContain(".theme-icon");
    expect(mobileStyles).toContain("display: inline");
  });
});
