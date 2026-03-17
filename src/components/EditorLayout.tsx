"use client";

import { Group, Panel, Separator } from "react-resizable-panels";
import { GripVertical } from "lucide-react";
import { MarkdownEditor } from "./MarkdownEditor";
import { MarkdownPreview } from "./MarkdownPreview";
import { RefObject } from "react";

interface EditorLayoutProps {
  markdown: string;
  onChange: (value: string) => void;
  editorRef: RefObject<HTMLTextAreaElement | null>;
  previewRef: RefObject<HTMLDivElement | null>;
}

export function EditorLayout({
  markdown,
  onChange,
  editorRef,
  previewRef,
}: EditorLayoutProps) {
  return (
    <Group orientation="horizontal" className="flex-1 min-h-0">
      <Panel defaultSize={50} minSize={25} id="editor">
        <div className="h-full flex flex-col" style={{ background: "var(--editor-bg)" }}>
          <div
            className="flex items-center px-4 py-1.5 border-b text-xs font-medium"
            style={{
              borderColor: "var(--border-color)",
              color: "var(--fg-muted)",
              background: "var(--bg-secondary)",
            }}
          >
            <span>Editor</span>
            <span className="ml-auto font-mono text-[10px]">Markdown</span>
          </div>
          <MarkdownEditor
            value={markdown}
            onChange={onChange}
            editorRef={editorRef}
          />
        </div>
      </Panel>

      <Separator className="relative flex items-center justify-center w-1.5 group">
        <div className="absolute inset-y-0 -left-1 -right-1 z-10" />
        <div
          className="absolute top-1/2 -translate-y-1/2 flex items-center justify-center w-4 h-8 rounded opacity-0 group-hover:opacity-100 transition-opacity z-20"
          style={{ background: "var(--bg-tertiary)" }}
        >
          <GripVertical size={10} style={{ color: "var(--fg-muted)" }} />
        </div>
      </Separator>

      <Panel defaultSize={50} minSize={20} id="preview">
        <div className="h-full flex flex-col" style={{ background: "var(--preview-bg)" }}>
          <div
            className="flex items-center px-4 py-1.5 border-b text-xs font-medium"
            style={{
              borderColor: "var(--border-color)",
              color: "var(--fg-muted)",
              background: "var(--bg-secondary)",
            }}
          >
            <span>Preview</span>
            <span className="ml-auto font-mono text-[10px]">HTML</span>
          </div>
          <MarkdownPreview markdown={markdown} previewRef={previewRef} />
        </div>
      </Panel>
    </Group>
  );
}
