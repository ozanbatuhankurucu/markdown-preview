"use client";

import {
  RefObject,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { Upload } from "lucide-react";
import { toast } from "sonner";

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  onImportFile: (content: string, fileName: string) => void;
  editorRef: RefObject<HTMLTextAreaElement | null>;
}

const PAIRS: Record<string, string> = {
  "(": ")",
  "[": "]",
  "{": "}",
  '"': '"',
  "'": "'",
  "`": "`",
  "*": "*",
  _: "_",
};

const CLOSING_CHARS = new Set(Object.values(PAIRS));

function getActiveLine(textarea: HTMLTextAreaElement): number {
  const text = textarea.value.substring(0, textarea.selectionStart);
  return text.split("\n").length;
}

export function MarkdownEditor({
  value,
  onChange,
  onImportFile,
  editorRef,
}: MarkdownEditorProps) {
  const lineNumbersRef = useRef<HTMLDivElement>(null);
  const highlightRef = useRef<HTMLDivElement>(null);
  const [lineCount, setLineCount] = useState(1);
  const [activeLine, setActiveLine] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const dragCounterRef = useRef(0);

  useEffect(() => {
    setLineCount(value.split("\n").length);
  }, [value]);

  const updateActiveLine = useCallback(() => {
    if (editorRef.current) {
      setActiveLine(getActiveLine(editorRef.current));
    }
  }, [editorRef]);

  const updateHighlightPosition = useCallback(() => {
    const textarea = editorRef.current;
    const highlight = highlightRef.current;
    if (!textarea || !highlight) return;
    const lineHeight = parseFloat(getComputedStyle(textarea).lineHeight);
    const paddingTop = parseFloat(getComputedStyle(textarea).paddingTop);
    const top =
      (activeLine - 1) * lineHeight - textarea.scrollTop + paddingTop;
    highlight.style.top = `${top}px`;
    highlight.style.height = `${lineHeight}px`;
  }, [activeLine, editorRef]);

  useEffect(() => {
    updateHighlightPosition();
  }, [updateHighlightPosition]);

  const handleScroll = useCallback(() => {
    if (editorRef.current && lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = editorRef.current.scrollTop;
    }
    updateHighlightPosition();
  }, [editorRef, updateHighlightPosition]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      const textarea = e.currentTarget;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const hasSelection = start !== end;

      if (e.key === "Tab") {
        e.preventDefault();
        const newValue =
          value.substring(0, start) + "  " + value.substring(end);
        onChange(newValue);
        requestAnimationFrame(() => {
          textarea.selectionStart = textarea.selectionEnd = start + 2;
        });
        return;
      }

      if (e.key === "Backspace" && !hasSelection && start > 0) {
        const charBefore = value[start - 1];
        const charAfter = value[start];
        if (PAIRS[charBefore] && PAIRS[charBefore] === charAfter) {
          e.preventDefault();
          const newValue =
            value.substring(0, start - 1) + value.substring(start + 1);
          onChange(newValue);
          requestAnimationFrame(() => {
            textarea.selectionStart = textarea.selectionEnd = start - 1;
          });
          return;
        }
      }

      if (PAIRS[e.key]) {
        e.preventDefault();
        const open = e.key;
        const close = PAIRS[e.key];
        if (hasSelection) {
          const selected = value.substring(start, end);
          const newValue =
            value.substring(0, start) +
            open +
            selected +
            close +
            value.substring(end);
          onChange(newValue);
          requestAnimationFrame(() => {
            textarea.selectionStart = start + 1;
            textarea.selectionEnd = end + 1;
          });
        } else {
          const newValue =
            value.substring(0, start) + open + close + value.substring(end);
          onChange(newValue);
          requestAnimationFrame(() => {
            textarea.selectionStart = textarea.selectionEnd = start + 1;
          });
        }
        return;
      }

      if (CLOSING_CHARS.has(e.key) && !hasSelection && value[start] === e.key) {
        const matchingOpen = Object.entries(PAIRS).find(
          ([, v]) => v === e.key
        );
        if (matchingOpen && matchingOpen[0] !== e.key) {
          e.preventDefault();
          requestAnimationFrame(() => {
            textarea.selectionStart = textarea.selectionEnd = start + 1;
          });
          return;
        }
      }
    },
    [value, onChange]
  );

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    dragCounterRef.current++;
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    dragCounterRef.current--;
    if (dragCounterRef.current === 0) {
      setIsDragging(false);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      dragCounterRef.current = 0;
      setIsDragging(false);

      const file = Array.from(e.dataTransfer.files).find((f) =>
        /\.(md|markdown|txt)$/i.test(f.name)
      );
      if (!file) {
        toast.error("Please drop a .md, .markdown, or .txt file");
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result;
        if (typeof content === "string") {
          onImportFile(content, file.name);
        }
      };
      reader.readAsText(file);
    },
    [onImportFile]
  );

  return (
    <div
      className="relative flex flex-1 min-h-0 overflow-hidden"
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
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
          <div
            key={i + 1}
            style={
              i + 1 === activeLine
                ? {
                    color: "var(--fg-primary)",
                    background: "var(--active-line-bg)",
                    borderRadius: "2px",
                  }
                : undefined
            }
          >
            {i + 1}
          </div>
        ))}
      </div>
      <div className="relative flex-1 min-h-0">
        <div
          ref={highlightRef}
          className="absolute left-0 right-0 pointer-events-none"
          style={{ background: "var(--active-line-bg)" }}
        />
        <textarea
          ref={editorRef}
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            updateActiveLine();
          }}
          onScroll={handleScroll}
          onKeyDown={handleKeyDown}
          onKeyUp={updateActiveLine}
          onMouseUp={updateActiveLine}
          onSelect={updateActiveLine}
          className="absolute inset-0 w-full h-full resize-none p-4 outline-none font-mono text-sm leading-[1.7rem]"
          style={{
            background: "var(--editor-bg)",
            color: "var(--fg-primary)",
            willChange: "scroll-position",
            caretColor: "var(--fg-primary)",
          }}
          spellCheck={false}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          placeholder="Paste or type your markdown here..."
        />
      </div>

      {isDragging && (
        <div
          className="absolute inset-0 z-50 flex flex-col items-center justify-center gap-3 rounded-md"
          style={{
            background: "var(--bg-primary)",
            opacity: 0.95,
            border: "2px dashed var(--fg-muted)",
          }}
        >
          <Upload size={32} style={{ color: "var(--fg-muted)" }} />
          <p
            className="text-sm font-medium"
            style={{ color: "var(--fg-secondary)" }}
          >
            Drop .md file to import
          </p>
        </div>
      )}
    </div>
  );
}
