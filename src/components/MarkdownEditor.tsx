"use client";

import { RefObject, useCallback, useEffect, useRef, useState } from "react";

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  editorRef: RefObject<HTMLTextAreaElement | null>;
}

export function MarkdownEditor({ value, onChange, editorRef }: MarkdownEditorProps) {
  const lineNumbersRef = useRef<HTMLDivElement>(null);
  const [lineCount, setLineCount] = useState(1);

  useEffect(() => {
    setLineCount(value.split("\n").length);
  }, [value]);

  const handleScroll = useCallback(() => {
    if (editorRef.current && lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = editorRef.current.scrollTop;
    }
  }, [editorRef]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Tab") {
        e.preventDefault();
        const textarea = e.currentTarget;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const newValue = value.substring(0, start) + "  " + value.substring(end);
        onChange(newValue);
        requestAnimationFrame(() => {
          textarea.selectionStart = textarea.selectionEnd = start + 2;
        });
      }
    },
    [value, onChange]
  );

  return (
    <div className="flex flex-1 min-h-0 overflow-hidden">
      <div
        ref={lineNumbersRef}
        className="select-none overflow-hidden text-right py-4 pr-3 pl-2 font-mono text-xs leading-[1.7rem]"
        style={{
          color: "var(--fg-muted)",
          background: "var(--bg-secondary)",
          borderRight: "1px solid var(--border-color)",
          minWidth: "3.5rem",
        }}
        aria-hidden="true"
      >
        {Array.from({ length: lineCount }, (_, i) => (
          <div key={i + 1}>{i + 1}</div>
        ))}
      </div>
      <textarea
        ref={editorRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onScroll={handleScroll}
        onKeyDown={handleKeyDown}
        className="flex-1 resize-none p-4 outline-none font-mono text-sm leading-[1.7rem] min-h-0"
        style={{
          background: "var(--editor-bg)",
          color: "var(--fg-primary)",
          caretColor: "var(--accent)",
        }}
        spellCheck={false}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        placeholder="Paste or type your markdown here..."
      />
    </div>
  );
}
