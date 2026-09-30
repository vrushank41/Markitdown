import type { Theme } from "./use-converter-workspace";

interface ThemeToggleProps {
  onThemeChange: (theme: Theme) => void;
  theme: Theme;
}

export function ThemeToggle({ onThemeChange, theme }: ThemeToggleProps) {
  return (
    <div className="theme-toggle" aria-label="Theme">
      <button
        aria-label="Light theme"
        className={`theme-option ${theme === "light" ? "active" : ""}`}
        onClick={() => onThemeChange("light")}
        type="button"
      >
        <span aria-hidden="true" className="theme-icon">
          {"\u2600\uFE0F"}
        </span>
        <span className="theme-label">Light</span>
      </button>
      <button
        aria-label="Dark theme"
        className={`theme-option ${theme === "dark" ? "active" : ""}`}
        onClick={() => onThemeChange("dark")}
        type="button"
      >
        <span aria-hidden="true" className="theme-icon">
          {"\u{1F319}"}
        </span>
        <span className="theme-label">Dark</span>
      </button>
    </div>
  );
}
