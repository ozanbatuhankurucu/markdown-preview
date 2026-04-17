"use client";

import { Group, Panel, Separator } from "react-resizable-panels";
import { GripVertical, Maximize2, Minimize2 } from "lucide-react";
import { MarkdownEditor } from "./MarkdownEditor";
import { MarkdownPreview } from "./MarkdownPreview";
import { TableOfContents } from "./TableOfContents";
import { RefObject } from "react";

interface EditorLayoutProps {
  markdown: string;
  onChange: (value: string) => void;
  editorRef: RefObject<HTMLTextAreaElement | null>;
  previewRef: RefObject<HTMLDivElement | null>;
  focusedPanel: "editor" | "preview" | null;
  onFocusedPanelChange: (panel: "editor" | "preview" | null) => void;
}

function PanelHeader({
  label,
  badge,
  panelId,
  focusedPanel,
  onFocusedPanelChange,
  children,
}: {
  label: string;
  badge: string;
  panelId: "editor" | "preview";
  focusedPanel: "editor" | "preview" | null;
  onFocusedPanelChange: (panel: "editor" | "preview" | null) => void;
  children?: React.ReactNode;
}) {
  const isFocused = focusedPanel === panelId;

  return (
    <div
      className="flex items-center px-4 py-1.5 border-b text-xs font-medium"
      style={{
        borderColor: "var(--border-color)",
        color: "var(--fg-muted)",
        background: "var(--bg-secondary)",
      }}
    >
      <span>{label}</span>
      {children}
      <span className="ml-auto font-mono text-[10px]">{badge}</span>
      <button
        onClick={() => onFocusedPanelChange(isFocused ? null : panelId)}
        title={isFocused ? "Exit fullscreen" : "Fullscreen"}
        className="ml-2 flex items-center justify-center w-5 h-5 rounded transition-colors cursor-pointer"
        style={{ color: "var(--fg-muted)" }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "var(--bg-tertiary)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "transparent";
        }}
      >
        {isFocused ? <Minimize2 size={11} /> : <Maximize2 size={11} />}
      </button>
    </div>
  );
}

export function EditorLayout({
  markdown,
  onChange,
  editorRef,
  previewRef,
  focusedPanel,
  onFocusedPanelChange,
}: EditorLayoutProps) {
  if (focusedPanel === "editor") {
    return (
      <div className="flex-1 min-h-0 flex flex-col" style={{ background: "var(--editor-bg)" }}>
        <PanelHeader
          label="Editor"
          badge="Markdown"
          panelId="editor"
          focusedPanel={focusedPanel}
          onFocusedPanelChange={onFocusedPanelChange}
        />
        <MarkdownEditor value={markdown} onChange={onChange} editorRef={editorRef} />
      </div>
    );
  }

  if (focusedPanel === "preview") {
    return (
      <div className="flex-1 min-h-0 flex flex-col" style={{ background: "var(--preview-bg)" }}>
        <PanelHeader
          label="Preview"
          badge="HTML"
          panelId="preview"
          focusedPanel={focusedPanel}
          onFocusedPanelChange={onFocusedPanelChange}
        >
          <TableOfContents markdown={markdown} previewRef={previewRef} />
        </PanelHeader>
        <MarkdownPreview markdown={markdown} previewRef={previewRef} />
      </div>
    );
  }

  return (
    <Group orientation="horizontal" className="flex-1 min-h-0">
      <Panel defaultSize={50} minSize={25} id="editor">
        <div className="h-full flex flex-col" style={{ background: "var(--editor-bg)" }}>
          <PanelHeader
            label="Editor"
            badge="Markdown"
            panelId="editor"
            focusedPanel={focusedPanel}
            onFocusedPanelChange={onFocusedPanelChange}
          />
          <MarkdownEditor value={markdown} onChange={onChange} editorRef={editorRef} />
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
          <PanelHeader
            label="Preview"
            badge="HTML"
            panelId="preview"
            focusedPanel={focusedPanel}
            onFocusedPanelChange={onFocusedPanelChange}
          >
            <TableOfContents markdown={markdown} previewRef={previewRef} />
          </PanelHeader>
          <MarkdownPreview markdown={markdown} previewRef={previewRef} />
        </div>
      </Panel>
    </Group>
  );
}
