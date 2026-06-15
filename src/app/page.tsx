"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Header } from "@/components/Header";
import { EditorLayout } from "@/components/EditorLayout";
import { StatusBar } from "@/components/StatusBar";
import { DocumentDrawer } from "@/components/DocumentDrawer";
import { getDisplayTitle, useDocumentLibrary } from "@/lib/useDocumentLibrary";
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

    let rafId: number | null = null;

    const onEditorEnter = () => { activePaneRef.current = "editor"; };
    const onPreviewEnter = () => { activePaneRef.current = "preview"; };

    const handleEditorScroll = () => {
      if (!syncScroll || activePaneRef.current !== "editor") return;
      if (rafId !== null) return;
      rafId = requestAnimationFrame(() => {
        const maxEditor = editor.scrollHeight - editor.clientHeight;
        const maxPreview = preview.scrollHeight - preview.clientHeight;
        if (maxEditor > 0) {
          preview.scrollTop = (editor.scrollTop / maxEditor) * maxPreview;
        }
        rafId = null;
      });
    };

    const handlePreviewScroll = () => {
      if (!syncScroll || activePaneRef.current !== "preview") return;
      if (rafId !== null) return;
      rafId = requestAnimationFrame(() => {
        const maxPreview = preview.scrollHeight - preview.clientHeight;
        const maxEditor = editor.scrollHeight - editor.clientHeight;
        if (maxPreview > 0) {
          editor.scrollTop = (preview.scrollTop / maxPreview) * maxEditor;
        }
        rafId = null;
      });
    };

    editor.addEventListener("pointerenter", onEditorEnter);
    preview.addEventListener("pointerenter", onPreviewEnter);
    editor.addEventListener("scroll", handleEditorScroll, { passive: true });
    preview.addEventListener("scroll", handlePreviewScroll, { passive: true });
    return () => {
      editor.removeEventListener("pointerenter", onEditorEnter);
      preview.removeEventListener("pointerenter", onPreviewEnter);
      editor.removeEventListener("scroll", handleEditorScroll);
      preview.removeEventListener("scroll", handlePreviewScroll);
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  }, [syncScroll, isReady, focusedPanel]);

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
