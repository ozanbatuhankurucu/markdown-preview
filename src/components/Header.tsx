"use client";

import { Copy, Download, Trash2, Github, PanelLeft, Plus } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";

interface HeaderProps {
  onCopyHtml: () => void;
  onDownload: () => void;
  onClear: () => void;
  onCreateDocument: () => void;
  onToggleLibrary: () => void;
  isDownloadDisabled?: boolean;
  documentTitle: string;
}

function PrimaryActionButton({
  onClick,
  icon: Icon,
  label,
  shortcut,
}: {
  onClick: () => void;
  icon: React.ComponentType<{ size?: number }>;
  label: string;
  shortcut?: string;
}) {
  return (
    <button
      onClick={onClick}
      title={shortcut ? `${label} (${shortcut})` : label}
      className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors cursor-pointer"
      style={{
        background: "var(--accent)",
        color: "var(--bg-primary)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "var(--accent-hover)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "var(--accent)";
      }}
    >
      <Icon size={14} />
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}

function ActionButton({
  onClick,
  icon: Icon,
  label,
  variant = "default",
  disabled = false,
}: {
  onClick: () => void;
  icon: React.ComponentType<{ size?: number }>;
  label: string;
  variant?: "default" | "danger";
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      title={label}
      disabled={disabled}
      className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
      style={{
        color: variant === "danger" ? "#ef4444" : "var(--fg-secondary)",
      }}
      onMouseEnter={(e) => {
        if (!e.currentTarget.disabled)
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

export function Header({ onCopyHtml, onDownload, onClear, onCreateDocument, onToggleLibrary, isDownloadDisabled, documentTitle }: HeaderProps) {
  const isMac = typeof navigator !== "undefined" && /Mac|iPod|iPhone|iPad/.test(navigator.platform);
  const newShortcut = isMac ? "⌘⌥N" : "Ctrl+Alt+N";
  return (
    <header
      className="flex items-center justify-between gap-3 px-4 py-2 border-b shrink-0"
      style={{
        borderColor: "var(--border-color)",
        background: "var(--bg-primary)",
      }}
    >
      <div className="flex items-center gap-2 min-w-0">
        <button
          onClick={onToggleLibrary}
          title="Documents (Ctrl+B)"
          className="flex items-center justify-center w-8 h-8 rounded-md transition-colors cursor-pointer shrink-0"
          style={{ color: "var(--fg-secondary)" }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "var(--bg-tertiary)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
          }}
        >
          <PanelLeft size={16} />
        </button>
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="shrink-0"
          style={{ color: "var(--fg-primary)" }}
        >
          <path d="M4 4h16v16H4z" rx="2" />
          <path d="M7 15V9l2.5 3L12 9v6" />
          <path d="M17 9v6l-2-2" />
        </svg>
        <span
          className="hidden md:inline text-xs shrink-0"
          style={{ color: "var(--fg-muted)" }}
        >
          Markdown Preview
        </span>
        <span
          className="hidden md:inline text-xs shrink-0"
          style={{ color: "var(--fg-muted)" }}
          aria-hidden="true"
        >
          /
        </span>
        <h1
          className="text-sm font-semibold truncate"
          style={{ color: "var(--fg-primary)" }}
          title={documentTitle}
        >
          {documentTitle}
        </h1>
      </div>

      <div className="flex items-center gap-1">
        <PrimaryActionButton
          onClick={onCreateDocument}
          icon={Plus}
          label="New"
          shortcut={newShortcut}
        />

        <div
          className="w-px h-4 mx-1"
          style={{ background: "var(--border-color)" }}
        />

        <ActionButton onClick={onCopyHtml} icon={Copy} label="Copy HTML" />
        <ActionButton onClick={onDownload} icon={Download} label="Download" disabled={isDownloadDisabled} />
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
