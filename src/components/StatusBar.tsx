"use client";

import { useMemo } from "react";

interface StatusBarProps {
  markdown: string;
  syncScroll: boolean;
  onSyncScrollChange: (value: boolean) => void;
}

export function StatusBar({ markdown, syncScroll, onSyncScrollChange }: StatusBarProps) {
  const stats = useMemo(() => {
    const lines = markdown.split("\n").length;
    const characters = markdown.length;
    const words = markdown.trim()
      ? markdown.trim().split(/\s+/).length
      : 0;
    return { lines, characters, words };
  }, [markdown]);

  return (
    <footer
      className="flex items-center justify-between px-4 py-1 border-t text-[11px] shrink-0"
      style={{
        borderColor: "var(--border-color)",
        background: "var(--bg-secondary)",
        color: "var(--fg-muted)",
      }}
    >
      <div className="flex items-center gap-3">
        <span>
          <strong className="font-medium" style={{ color: "var(--fg-secondary)" }}>
            {stats.words.toLocaleString()}
          </strong>{" "}
          words
        </span>
        <span>
          <strong className="font-medium" style={{ color: "var(--fg-secondary)" }}>
            {stats.characters.toLocaleString()}
          </strong>{" "}
          chars
        </span>
        <span>
          <strong className="font-medium" style={{ color: "var(--fg-secondary)" }}>
            {stats.lines.toLocaleString()}
          </strong>{" "}
          lines
        </span>

        <div
          className="w-px h-3"
          style={{ background: "var(--border-color)" }}
        />

        <label className="flex items-center gap-1.5 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={syncScroll}
            onChange={(e) => onSyncScrollChange(e.target.checked)}
            className="accent-current w-3 h-3 cursor-pointer"
            style={{ accentColor: "var(--fg-secondary)" }}
          />
          <span>Sync scroll</span>
        </label>
      </div>
      <div className="flex items-center gap-3">
        <span className="hidden sm:inline">
          <kbd
            className="px-1 py-0.5 rounded text-[10px] font-mono"
            style={{ background: "var(--bg-tertiary)" }}
          >
            Ctrl+S
          </kbd>{" "}
          Save
        </span>
        <span className="hidden sm:inline">
          <kbd
            className="px-1 py-0.5 rounded text-[10px] font-mono"
            style={{ background: "var(--bg-tertiary)" }}
          >
            Ctrl+Shift+C
          </kbd>{" "}
          Copy HTML
        </span>
      </div>
    </footer>
  );
}
