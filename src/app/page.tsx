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
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const scrollSourceRef = useRef<"editor" | "preview" | null>(null);

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
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleDownload, handleCopyHtml]);

  useEffect(() => {
    const editor = editorRef.current;
    const preview = previewRef.current;
    if (!editor || !preview) return;

    let ticking = false;

    const handleEditorScroll = () => {
      if (!syncScroll || scrollSourceRef.current === "preview") return;
      scrollSourceRef.current = "editor";
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const ratio =
          editor.scrollTop / (editor.scrollHeight - editor.clientHeight || 1);
        preview.scrollTop =
          ratio * (preview.scrollHeight - preview.clientHeight);
        ticking = false;
        scrollSourceRef.current = null;
      });
    };

    const handlePreviewScroll = () => {
      if (!syncScroll || scrollSourceRef.current === "editor") return;
      scrollSourceRef.current = "preview";
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const ratio =
          preview.scrollTop /
          (preview.scrollHeight - preview.clientHeight || 1);
        editor.scrollTop =
          ratio * (editor.scrollHeight - editor.clientHeight);
        ticking = false;
        scrollSourceRef.current = null;
      });
    };

    editor.addEventListener("scroll", handleEditorScroll);
    preview.addEventListener("scroll", handlePreviewScroll);
    return () => {
      editor.removeEventListener("scroll", handleEditorScroll);
      preview.removeEventListener("scroll", handlePreviewScroll);
    };
  }, [syncScroll]);

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
      />
      <StatusBar
        markdown={markdown}
        syncScroll={syncScroll}
        onSyncScrollChange={setSyncScroll}
      />
    </div>
  );
}
