"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Header } from "@/components/Header";
import { EditorLayout } from "@/components/EditorLayout";
import { StatusBar } from "@/components/StatusBar";
import { useLocalStorage } from "@/lib/useLocalStorage";
import { defaultMarkdown } from "@/lib/default-markdown";
import { toast } from "sonner";

export default function Home() {
  const [markdown, setMarkdown, isHydrated] = useLocalStorage(
    "markdown-content",
    defaultMarkdown
  );
  const [syncScroll, setSyncScroll] = useState(true);
  const [focusedPanel, setFocusedPanel] = useState<"editor" | "preview" | null>(null);
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const activePaneRef = useRef<"editor" | "preview" | null>(null);

  const isEmpty = !markdown.trim();

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
    setMarkdown("");
    editorRef.current?.focus();
    toast.success("Editor cleared");
  }, [setMarkdown]);

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

      if (e.key === "Escape") {
        setFocusedPanel(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleDownload, handleCopyHtml]);

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
  }, [syncScroll, isHydrated, focusedPanel]);

  if (!isHydrated) {
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
        isDownloadDisabled={isEmpty}
      />
      <EditorLayout
        markdown={markdown}
        onChange={setMarkdown}
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
    </div>
  );
}
