"use client";

import { FileText, Copy, Download, Trash2 } from "lucide-react";
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
      className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-all duration-200 cursor-pointer"
      style={{
        background: "var(--bg-tertiary)",
        color: variant === "danger" ? "#ef4444" : "var(--fg-secondary)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "var(--border-color)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "var(--bg-tertiary)";
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
      className="flex items-center justify-between px-4 py-2.5 border-b shrink-0"
      style={{ borderColor: "var(--border-color)", background: "var(--bg-secondary)" }}
    >
      <div className="flex items-center gap-2.5">
        <div
          className="flex items-center justify-center w-8 h-8 rounded-lg"
          style={{ background: "var(--accent)", color: "#ffffff" }}
        >
          <FileText size={18} />
        </div>
        <h1 className="text-lg font-bold tracking-tight" style={{ color: "var(--fg-primary)" }}>
          Markdown<span style={{ color: "var(--accent)" }}>Preview</span>
        </h1>
      </div>

      <div className="flex items-center gap-2">
        <ActionButton onClick={onCopyHtml} icon={Copy} label="Copy HTML" />
        <ActionButton onClick={onDownload} icon={Download} label="Download" />
        <ActionButton onClick={onClear} icon={Trash2} label="Clear" variant="danger" />
        <div className="w-px h-6 mx-1" style={{ background: "var(--border-color)" }} />
        <ThemeToggle />
      </div>
    </header>
  );
}
