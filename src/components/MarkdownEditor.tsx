"use client";

import {
  RefObject,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
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
  const mirrorRef = useRef<HTMLDivElement>(null);
  const [activeLine, setActiveLine] = useState(1);
  const [lineHeights, setLineHeights] = useState<number[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const dragCounterRef = useRef(0);
  const lines = useMemo(() => value.split("\n"), [value]);

  const updateLineMetrics = useCallback(() => {
    const textarea = editorRef.current;
    const mirror = mirrorRef.current;
    if (!textarea || !mirror) return;

    mirror.style.width = `${textarea.clientWidth}px`;
    const nextHeights = Array.from(
      mirror.querySelectorAll<HTMLElement>("[data-editor-line]"),
      (line) => line.offsetHeight,
    );

    setLineHeights((currentHeights) => {
      const isUnchanged =
        currentHeights.length === nextHeights.length &&
        currentHeights.every((height, index) => height === nextHeights[index]);
      return isUnchanged ? currentHeights : nextHeights;
    });
  }, [editorRef]);

  useLayoutEffect(() => {
    updateLineMetrics();
  }, [lines, updateLineMetrics]);

  useEffect(() => {
    const textarea = editorRef.current;
    if (!textarea) return;

    const observer = new ResizeObserver(updateLineMetrics);
    observer.observe(textarea);

    let isActive = true;
    void document.fonts?.ready.then(() => {
      if (isActive) updateLineMetrics();
    });

    return () => {
      isActive = false;
      observer.disconnect();
    };
  }, [editorRef, updateLineMetrics]);

  const updateActiveLine = useCallback(() => {
    if (editorRef.current) {
      setActiveLine(getActiveLine(editorRef.current));
    }
  }, [editorRef]);

  const updateHighlightPosition = useCallback(() => {
    const textarea = editorRef.current;
    const highlight = highlightRef.current;
    const line = mirrorRef.current?.querySelector<HTMLElement>(
      `[data-editor-line="${activeLine}"]`,
    );
    if (!textarea || !highlight || !line) return;

    highlight.style.top = `${line.offsetTop - textarea.scrollTop}px`;
    highlight.style.height = `${line.offsetHeight}px`;
  }, [activeLine, editorRef]);

  useLayoutEffect(() => {
    updateHighlightPosition();
  }, [lineHeights, updateHighlightPosition]);

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
        {lines.map((_, i) => (
          <div
            key={i + 1}
            style={{
              height: lineHeights[i],
              ...(i + 1 === activeLine
                ? {
                    color: "var(--fg-primary)",
                    background: "var(--active-line-bg)",
                    borderRadius: "2px",
                  }
                : undefined),
            }}
          >
            {i + 1}
          </div>
        ))}
      </div>
      <div className="relative flex-1 min-h-0">
        <div
          ref={mirrorRef}
          data-editor-mirror
          className="absolute top-0 left-0 p-4 font-mono text-sm leading-[1.7rem] pointer-events-none"
          style={{
            boxSizing: "border-box",
            visibility: "hidden",
            whiteSpace: "pre-wrap",
            overflowWrap: "break-word",
            tabSize: 8,
            width: "100%",
          }}
          aria-hidden="true"
        >
          {lines.map((line, index) => (
            <div
              key={index}
              data-editor-line={index + 1}
              style={{
                minHeight: "1.7rem",
                whiteSpace: "pre-wrap",
                overflowWrap: "break-word",
              }}
            >
              {line || "\u200b"}
            </div>
          ))}
        </div>
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
            whiteSpace: "pre-wrap",
            overflowWrap: "break-word",
            tabSize: 8,
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
