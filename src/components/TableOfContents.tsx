"use client";

import { RefObject, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { List, X } from "lucide-react";

interface Heading {
  level: number;
  text: string;
  slug: string;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

interface TableOfContentsProps {
  markdown: string;
  previewRef: RefObject<HTMLDivElement | null>;
}

export function TableOfContents({ markdown, previewRef }: TableOfContentsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const headings = useMemo<Heading[]>(() => {
    const matches: Heading[] = [];
    const regex = /^(#{1,6})\s+(.+)$/gm;
    let match;
    while ((match = regex.exec(markdown)) !== null) {
      matches.push({
        level: match[1].length,
        text: match[2].replace(/[*_`~\[\]]/g, ""),
        slug: slugify(match[2].replace(/[*_`~\[\]]/g, "")),
      });
    }
    return matches;
  }, [markdown]);

  const handleClick = useCallback(
    (slug: string) => {
      const container = previewRef.current;
      if (!container) return;
      const el = container.querySelector(`#${CSS.escape(slug)}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
      setIsOpen(false);
    },
    [previewRef]
  );

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  if (headings.length === 0) return null;

  const minLevel = Math.min(...headings.map((h) => h.level));

  return (
    <div className="relative ml-2">
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        title="Table of contents"
        className="flex items-center justify-center w-5 h-5 rounded transition-colors cursor-pointer"
        style={{ color: "var(--fg-muted)" }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "var(--bg-tertiary)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "transparent";
        }}
      >
        {isOpen ? <X size={11} /> : <List size={11} />}
      </button>

      {isOpen && (
        <div
          ref={popoverRef}
          className="absolute top-full left-0 mt-1.5 z-50 w-64 max-h-72 overflow-y-auto rounded-md py-2 text-xs shadow-lg"
          style={{
            background: "var(--bg-primary)",
            border: "1px solid var(--border-color)",
          }}
        >
          <div
            className="px-3 pb-1.5 mb-1 text-[10px] font-semibold uppercase tracking-wider"
            style={{
              color: "var(--fg-muted)",
              borderBottom: "1px solid var(--border-color)",
            }}
          >
            On this page
          </div>
          {headings.map((heading, i) => (
            <button
              key={`${heading.slug}-${i}`}
              onClick={() => handleClick(heading.slug)}
              className="block w-full text-left px-3 py-1 transition-colors cursor-pointer truncate"
              style={{
                paddingLeft: `${0.75 + (heading.level - minLevel) * 0.75}rem`,
                color: heading.level <= 2 ? "var(--fg-primary)" : "var(--fg-secondary)",
                fontWeight: heading.level <= 2 ? 500 : 400,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "var(--bg-tertiary)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
              }}
            >
              {heading.text}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
