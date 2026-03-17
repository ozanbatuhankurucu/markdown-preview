"use client";

import { useCallback, useEffect, useRef } from "react";
import { Header } from "@/components/Header";
import { EditorLayout } from "@/components/EditorLayout";
import { StatusBar } from "@/components/StatusBar";
import { useLocalStorage } from "@/lib/useLocalStorage";
import { defaultMarkdown } from "@/lib/default-markdown";

export default function Home() {
  const [markdown, setMarkdown, isHydrated] = useLocalStorage(
    "markdown-content",
    defaultMarkdown
  );
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  const handleCopyHtml = useCallback(async () => {
    if (!previewRef.current) return;
    const article = previewRef.current.querySelector("article");
    const html = article?.innerHTML || "";
    try {
      await navigator.clipboard.writeText(html);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = html;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
    }
  }, []);

  const handleDownload = useCallback(() => {
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
  }, [markdown]);

  const handleClear = useCallback(() => {
    setMarkdown("");
    editorRef.current?.focus();
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
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const editorScrollRatio =
          editor.scrollTop / (editor.scrollHeight - editor.clientHeight || 1);
        preview.scrollTop =
          editorScrollRatio * (preview.scrollHeight - preview.clientHeight);
        ticking = false;
      });
    };

    editor.addEventListener("scroll", handleEditorScroll);
    return () => editor.removeEventListener("scroll", handleEditorScroll);
  }, []);

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
      />
      <EditorLayout
        markdown={markdown}
        onChange={setMarkdown}
        editorRef={editorRef}
        previewRef={previewRef}
      />
      <StatusBar markdown={markdown} />
    </div>
  );
}
