"use client";

import { Copy, Download, Trash2, Github } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";

interface HeaderProps {
  onCopyHtml: () => void;
  onDownload: () => void;
  onClear: () => void;
}

function ActionButton({
  onClick,
  icon: Icon,
  label,
  variant = "default",
}: {
  onClick: () => void;
  icon: React.ComponentType<{ size?: number }>;
  label: string;
  variant?: "default" | "danger";
}) {
  return (
    <button
      onClick={onClick}
      title={label}
      className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors cursor-pointer"
      style={{
        color: variant === "danger" ? "#ef4444" : "var(--fg-secondary)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "var(--bg-tertiary)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "transparent";
      }}
    >
      <Icon size={14} />
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}

export function Header({ onCopyHtml, onDownload, onClear }: HeaderProps) {
  return (
    <header
      className="flex items-center justify-between px-4 py-2 border-b shrink-0"
      style={{
        borderColor: "var(--border-color)",
        background: "var(--bg-primary)",
      }}
    >
      <div className="flex items-center gap-2">
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ color: "var(--fg-primary)" }}
        >
          <path d="M4 4h16v16H4z" rx="2" />
          <path d="M7 15V9l2.5 3L12 9v6" />
          <path d="M17 9v6l-2-2" />
        </svg>
        <h1 className="text-sm font-semibold" style={{ color: "var(--fg-primary)" }}>
          Markdown Preview
        </h1>
      </div>

      <div className="flex items-center gap-1">
        <ActionButton onClick={onCopyHtml} icon={Copy} label="Copy HTML" />
        <ActionButton onClick={onDownload} icon={Download} label="Download" />
        <ActionButton onClick={onClear} icon={Trash2} label="Clear" variant="danger" />

        <div
          className="w-px h-4 mx-1"
          style={{ background: "var(--border-color)" }}
        />

        <ThemeToggle />

        <div
          className="w-px h-4 mx-1"
          style={{ background: "var(--border-color)" }}
        />

        <a
          href="https://github.com/ozanbatuhankurucu/markdown-preview"
          target="_blank"
          rel="noopener noreferrer"
          title="View on GitHub"
          className="flex items-center justify-center w-8 h-8 rounded-md transition-colors cursor-pointer"
          style={{ color: "var(--fg-secondary)" }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "var(--bg-tertiary)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
          }}
        >
          <Github size={16} />
        </a>
      </div>
    </header>
  );
}
