"use client";

import { RefObject, useCallback, useEffect, useRef, useState } from "react";
import { List, X } from "lucide-react";

interface Heading {
  level: number;
  text: string;
  id: string;
}

function getRenderedHeadings(container: HTMLDivElement): HTMLElement[] {
  return Array.from(
    container.querySelectorAll<HTMLElement>(
      "article h1, article h2, article h3, article h4, article h5, article h6",
    ),
  );
}

interface TableOfContentsProps {
  previewRef: RefObject<HTMLDivElement | null>;
  onNavigate: () => void;
}

export function TableOfContents({ previewRef, onNavigate }: TableOfContentsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [headings, setHeadings] = useState<Heading[]>([]);
  const popoverRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const container = previewRef.current;
    if (!container) return;

    const updateHeadings = () => {
      const nextHeadings = getRenderedHeadings(container).map((heading) => ({
        level: Number(heading.tagName.slice(1)),
        text: heading.textContent?.trim() || "",
        id: heading.id,
      }));

      setHeadings((currentHeadings) => {
        const isUnchanged =
          currentHeadings.length === nextHeadings.length &&
          currentHeadings.every(
            (heading, index) =>
              heading.id === nextHeadings[index].id &&
              heading.level === nextHeadings[index].level &&
              heading.text === nextHeadings[index].text,
          );

        return isUnchanged ? currentHeadings : nextHeadings;
      });
    };

    updateHeadings();

    const observer = new MutationObserver(updateHeadings);
    observer.observe(container, {
      childList: true,
      subtree: true,
      characterData: true,
    });

    return () => observer.disconnect();
  }, [previewRef]);

  const handleClick = useCallback(
    (headingIndex: number) => {
      const container = previewRef.current;
      if (!container) return;

      const target = getRenderedHeadings(container)[headingIndex];
      if (target) {
        onNavigate();

        const targetTop =
          container.scrollTop +
          target.getBoundingClientRect().top -
          container.getBoundingClientRect().top;
        const maxScrollTop = container.scrollHeight - container.clientHeight;

        container.scrollTop = Math.max(0, Math.min(targetTop, maxScrollTop));
      }

      setIsOpen(false);
    },
    [onNavigate, previewRef],
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
              key={`${heading.id}-${i}`}
              onClick={() => handleClick(i)}
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
