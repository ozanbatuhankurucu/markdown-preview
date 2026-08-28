"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Header } from "@/components/Header";
import { EditorLayout } from "@/components/EditorLayout";
import { StatusBar } from "@/components/StatusBar";
import { DocumentDrawer } from "@/components/DocumentDrawer";
import { getDisplayTitle, useDocumentLibrary } from "@/lib/useDocumentLibrary";
import {
  getEditorScrollAnchors,
  getPreviewScrollAnchors,
  getScrollOffsetForSource,
  getSourceOffsetForScroll,
} from "@/lib/scrollSync";
import { toast } from "sonner";

export default function Home() {
  const {
    documents,
    activeDocument,
    activeId,
    isHydrated,
    createDocument,
    openDocument,
    updateActiveContent,
    clearActiveContent,
    renameDocument,
    deleteDocument,
    duplicateDocument,
    togglePin,
  } = useDocumentLibrary();

  const [syncScroll, setSyncScroll] = useState(true);
  const [focusedPanel, setFocusedPanel] = useState<"editor" | "preview" | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const activePaneRef = useRef<"editor" | "preview" | null>(null);
  const syncScrollFrameRef = useRef<number | null>(null);

  const markdown = activeDocument?.content ?? "";
  const isReady = isHydrated && activeDocument !== null;
  const isEmpty = !markdown.trim();
  const documentTitle = activeDocument ? getDisplayTitle(activeDocument) : "";

  const handleCopyHtml = useCallback(async () => {
    if (!previewRef.current) return;
    const article = previewRef.current.querySelector("article");
    const html = article?.innerHTML || "";
    try {
      await navigator.clipboard.writeText(html);
      toast.success("HTML copied to clipboard");
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = html;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      toast.success("HTML copied to clipboard");
    }
  }, []);

  const handleDownload = useCallback(() => {
    if (!markdown.trim()) return;
    const blob = new Blob([markdown], {
      type: "text/markdown;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "document.md";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Markdown file downloaded");
  }, [markdown]);

  const handleClear = useCallback(() => {
    clearActiveContent();
    editorRef.current?.focus();
    toast.success("Document cleared");
  }, [clearActiveContent]);

  const handleImportFile = useCallback(
    (content: string, fileName: string) => {
      const title = fileName.replace(/\.(md|markdown|txt)$/i, "").trim() || null;
      createDocument(content, title);
      toast.success(`Imported ${fileName} as new document`);
    },
    [createDocument],
  );

  const handleCreateDocument = useCallback(() => {
    createDocument("");
    editorRef.current?.focus();
    toast.success("New document created");
  }, [createDocument]);

  const toggleDrawer = useCallback(() => {
    setIsDrawerOpen((open) => !open);
  }, []);

  const handlePreviewNavigate = useCallback(() => {
    if (syncScrollFrameRef.current !== null) {
      cancelAnimationFrame(syncScrollFrameRef.current);
      syncScrollFrameRef.current = null;
    }
    activePaneRef.current = "preview";
  }, []);

  const handleDuplicateDocument = useCallback(
    (id: string) => {
      duplicateDocument(id);
      toast.success("Document duplicated");
    },
    [duplicateDocument],
  );

  const handleDeleteDocument = useCallback(
    (id: string) => {
      deleteDocument(id);
      toast.success("Document deleted");
    },
    [deleteDocument],
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMod = e.metaKey || e.ctrlKey;

      if (isMod && e.key === "s") {
        e.preventDefault();
        handleDownload();
      }

      if (isMod && e.shiftKey && e.key === "C") {
        e.preventDefault();
        handleCopyHtml();
      }

      if (isMod && !e.shiftKey && (e.key === "b" || e.key === "B")) {
        e.preventDefault();
        toggleDrawer();
      }

      if (isMod && e.altKey && (e.key === "n" || e.key === "N" || e.code === "KeyN")) {
        e.preventDefault();
        handleCreateDocument();
      }

      if (e.key === "Escape" && !isDrawerOpen) {
        setFocusedPanel(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleDownload, handleCopyHtml, toggleDrawer, handleCreateDocument, isDrawerOpen]);

  useEffect(() => {
    const editor = editorRef.current;
    const preview = previewRef.current;
    if (!editor || !preview) return;

    const lineCount = markdown.split("\n").length;
    let editorAnchors = getEditorScrollAnchors(editor, lineCount);
    let previewAnchors = getPreviewScrollAnchors(preview, lineCount);

    const rebuildAnchors = () => {
      editorAnchors = getEditorScrollAnchors(editor, lineCount);
      previewAnchors = getPreviewScrollAnchors(preview, lineCount);
    };

    const syncFromEditor = () => {
      const sourceOffset = getSourceOffsetForScroll(
        editorAnchors,
        editor.scrollTop,
      );
      preview.scrollTop = getScrollOffsetForSource(
        previewAnchors,
        sourceOffset,
      );
    };

    const syncFromPreview = () => {
      const sourceOffset = getSourceOffsetForScroll(
        previewAnchors,
        preview.scrollTop,
      );
      editor.scrollTop = getScrollOffsetForSource(editorAnchors, sourceOffset);
    };

    const scheduleSync = (source: "editor" | "preview") => {
      if (!syncScroll || activePaneRef.current !== source) return;
      if (syncScrollFrameRef.current !== null) return;

      syncScrollFrameRef.current = requestAnimationFrame(() => {
        if (activePaneRef.current === source) {
          if (source === "editor") {
            syncFromEditor();
          } else {
            syncFromPreview();
          }
        }
        syncScrollFrameRef.current = null;
      });
    };

    const activatePane = (pane: "editor" | "preview") => {
      if (activePaneRef.current === pane) return;

      if (syncScrollFrameRef.current !== null) {
        cancelAnimationFrame(syncScrollFrameRef.current);
        syncScrollFrameRef.current = null;
      }
      activePaneRef.current = pane;
    };

    const activateEditor = () => activatePane("editor");
    const activatePreview = () => activatePane("preview");
    const handleEditorScroll = () => scheduleSync("editor");
    const handlePreviewScroll = () => scheduleSync("preview");
    const handleResize = () => {
      rebuildAnchors();
      const activePane = activePaneRef.current;
      if (activePane) scheduleSync(activePane);
    };

    editor.addEventListener("pointerenter", activateEditor);
    editor.addEventListener("pointerdown", activateEditor);
    editor.addEventListener("wheel", activateEditor, { passive: true });
    editor.addEventListener("touchstart", activateEditor, { passive: true });
    editor.addEventListener("focus", activateEditor);
    preview.addEventListener("pointerenter", activatePreview);
    preview.addEventListener("pointerdown", activatePreview);
    preview.addEventListener("wheel", activatePreview, { passive: true });
    preview.addEventListener("touchstart", activatePreview, { passive: true });
    editor.addEventListener("scroll", handleEditorScroll, { passive: true });
    preview.addEventListener("scroll", handlePreviewScroll, { passive: true });

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(editor);
    resizeObserver.observe(preview);
    const article = preview.querySelector("article");
    if (article) resizeObserver.observe(article);

    handleResize();

    return () => {
      editor.removeEventListener("pointerenter", activateEditor);
      editor.removeEventListener("pointerdown", activateEditor);
      editor.removeEventListener("wheel", activateEditor);
      editor.removeEventListener("touchstart", activateEditor);
      editor.removeEventListener("focus", activateEditor);
      preview.removeEventListener("pointerenter", activatePreview);
      preview.removeEventListener("pointerdown", activatePreview);
      preview.removeEventListener("wheel", activatePreview);
      preview.removeEventListener("touchstart", activatePreview);
      editor.removeEventListener("scroll", handleEditorScroll);
      preview.removeEventListener("scroll", handlePreviewScroll);
      resizeObserver.disconnect();
      if (syncScrollFrameRef.current !== null) {
        cancelAnimationFrame(syncScrollFrameRef.current);
        syncScrollFrameRef.current = null;
      }
    };
  }, [syncScroll, isReady, focusedPanel, markdown]);

  if (!isReady) {
    return (
      <div
        className="flex flex-col h-dvh"
        style={{ background: "var(--bg-primary)" }}
      />
    );
  }

  return (
    <div className="flex flex-col h-dvh">
      <Header
        onCopyHtml={handleCopyHtml}
        onDownload={handleDownload}
        onClear={handleClear}
        onCreateDocument={handleCreateDocument}
        onToggleLibrary={toggleDrawer}
        isDownloadDisabled={isEmpty}
        documentTitle={documentTitle}
        activeDocumentId={activeDocument.id}
        onRenameDocument={renameDocument}
      />
      <EditorLayout
        markdown={markdown}
        onChange={updateActiveContent}
        onImportFile={handleImportFile}
        editorRef={editorRef}
        previewRef={previewRef}
        focusedPanel={focusedPanel}
        onFocusedPanelChange={setFocusedPanel}
        onPreviewNavigate={handlePreviewNavigate}
      />
      <StatusBar
        markdown={markdown}
        syncScroll={syncScroll}
        onSyncScrollChange={setSyncScroll}
      />
      <DocumentDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        documents={documents}
        activeId={activeId}
        onCreateDocument={handleCreateDocument}
        onOpenDocument={openDocument}
        onRenameDocument={renameDocument}
        onDuplicateDocument={handleDuplicateDocument}
        onDeleteDocument={handleDeleteDocument}
        onTogglePin={togglePin}
      />
    </div>
  );
}
