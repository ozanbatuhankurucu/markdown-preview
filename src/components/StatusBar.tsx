"use client";

import { useMemo } from "react";

interface StatusBarProps {
  markdown: string;
}

export function StatusBar({ markdown }: StatusBarProps) {
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
      className="flex items-center justify-between px-4 py-1.5 border-t text-xs shrink-0"
      style={{
        borderColor: "var(--border-color)",
        background: "var(--bg-secondary)",
        color: "var(--fg-muted)",
      }}
    >
      <div className="flex items-center gap-4">
        <span>
          <strong className="font-semibold" style={{ color: "var(--fg-secondary)" }}>
            {stats.words.toLocaleString()}
          </strong>{" "}
          words
        </span>
        <span>
          <strong className="font-semibold" style={{ color: "var(--fg-secondary)" }}>
            {stats.characters.toLocaleString()}
          </strong>{" "}
          characters
        </span>
        <span>
          <strong className="font-semibold" style={{ color: "var(--fg-secondary)" }}>
            {stats.lines.toLocaleString()}
          </strong>{" "}
          lines
        </span>
      </div>
      <div className="flex items-center gap-2">
        <span className="hidden sm:inline">
          <kbd className="px-1 py-0.5 rounded text-[10px] font-mono" style={{ background: "var(--bg-tertiary)" }}>
            Ctrl+S
          </kbd>{" "}
          Save
        </span>
        <span className="hidden sm:inline">
          <kbd className="px-1 py-0.5 rounded text-[10px] font-mono" style={{ background: "var(--bg-tertiary)" }}>
            Ctrl+Shift+C
          </kbd>{" "}
          Copy HTML
        </span>
      </div>
    </footer>
  );
}
