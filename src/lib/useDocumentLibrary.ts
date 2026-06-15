"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import { useLocalStorage } from "./useLocalStorage";
import { defaultMarkdown } from "./default-markdown";

export type MarkdownDocument = {
  id: string;
  title: string | null;
  content: string;
  pinned: boolean;
  createdAt: number;
  updatedAt: number;
};

const DOCUMENTS_KEY = "markdown-documents";
const ACTIVE_ID_KEY = "markdown-active-doc-id";
const LEGACY_CONTENT_KEY = "markdown-content";

export const MAX_DOCUMENTS = 100;

const EMPTY_DOCUMENTS: MarkdownDocument[] = [];
const NULL_ACTIVE_ID: string | null = null;
const TITLE_MAX_LENGTH = 80;

function generateId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `doc-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function createDocumentObject(
  content: string,
  title: string | null = null,
): MarkdownDocument {
  const now = Date.now();
  return {
    id: generateId(),
    title,
    content,
    pinned: false,
    createdAt: now,
    updatedAt: now,
  };
}

function enforceLimit(docs: MarkdownDocument[]): MarkdownDocument[] {
  if (docs.length <= MAX_DOCUMENTS) return docs;

  const overflow = docs.length - MAX_DOCUMENTS;
  const removeIds = new Set(
    docs
      .filter((d) => !d.pinned)
      .sort((a, b) => a.updatedAt - b.updatedAt)
      .slice(0, overflow)
      .map((d) => d.id),
  );

  if (removeIds.size === 0) return docs;
  return docs.filter((d) => !removeIds.has(d.id));
}

function truncateForTitle(text: string): string {
  if (text.length <= TITLE_MAX_LENGTH) return text;
  return `${text.slice(0, TITLE_MAX_LENGTH).trimEnd()}…`;
}

export function deriveTitle(content: string): string {
  const trimmed = content.trim();
  if (!trimmed) return "Untitled";

  const h1Match = trimmed.match(/^#\s+(.+)$/m);
  if (h1Match) {
    const cleaned = h1Match[1].replace(/[*_`~[\]]/g, "").trim();
    if (cleaned) return truncateForTitle(cleaned);
  }

  const firstLine = trimmed.split("\n").find((l) => l.trim());
  if (firstLine) {
    const cleaned = firstLine.replace(/^[#>\-*+\d.\s]+/, "").trim();
    if (cleaned) return truncateForTitle(cleaned);
  }

  return "Untitled";
}

export function getDisplayTitle(doc: MarkdownDocument): string {
  if (doc.title !== null && doc.title.trim()) return doc.title;
  const derived = deriveTitle(doc.content);
  if (derived === "Untitled") {
    return `Untitled — ${new Date(doc.createdAt).toLocaleDateString()}`;
  }
  return derived;
}

export function relativeTime(timestamp: number, now = Date.now()): string {
  const diff = now - timestamp;
  if (diff < 0) return "just now";
  const minute = 60_000;
  const hour = 60 * minute;
  const day = 24 * hour;
  if (diff < minute) return "just now";
  if (diff < hour) return `${Math.floor(diff / minute)}m ago`;
  if (diff < day) return `${Math.floor(diff / hour)}h ago`;
  if (diff < 7 * day) return `${Math.floor(diff / day)}d ago`;
  return new Date(timestamp).toLocaleDateString();
}

export interface UseDocumentLibraryReturn {
  documents: MarkdownDocument[];
  activeDocument: MarkdownDocument | null;
  activeId: string | null;
  isHydrated: boolean;
  createDocument: (content?: string, title?: string | null) => string;
  openDocument: (id: string) => void;
  updateActiveContent: (content: string) => void;
  clearActiveContent: () => void;
  renameDocument: (id: string, title: string) => void;
  deleteDocument: (id: string) => void;
  duplicateDocument: (id: string) => void;
  togglePin: (id: string) => void;
}

export function useDocumentLibrary(): UseDocumentLibraryReturn {
  const [documents, setDocuments, isHydratedDocs] = useLocalStorage<MarkdownDocument[]>(
    DOCUMENTS_KEY,
    EMPTY_DOCUMENTS,
  );
  const [activeId, setActiveId, isHydratedActive] = useLocalStorage<string | null>(
    ACTIVE_ID_KEY,
    NULL_ACTIVE_ID,
  );

  const isHydrated = isHydratedDocs && isHydratedActive;
  const didMigrateRef = useRef(false);

  useEffect(() => {
    if (!isHydrated || didMigrateRef.current) return;
    didMigrateRef.current = true;

    if (documents.length > 0) return;

    let initialContent = defaultMarkdown;
    try {
      const legacy = window.localStorage.getItem(LEGACY_CONTENT_KEY);
      if (legacy !== null) {
        try {
          const parsed = JSON.parse(legacy);
          if (typeof parsed === "string" && parsed.trim()) {
            initialContent = parsed;
          }
        } catch {
          // Corrupted legacy value — fall back to default markdown
        }
        window.localStorage.removeItem(LEGACY_CONTENT_KEY);
      }
    } catch {
      // localStorage unavailable — proceed with default content
    }

    const seed = createDocumentObject(initialContent);
    setDocuments([seed]);
    setActiveId(seed.id);
  }, [isHydrated, documents.length, setDocuments, setActiveId]);

  const activeDocument = useMemo<MarkdownDocument | null>(() => {
    if (!documents.length) return null;
    if (activeId) {
      const found = documents.find((d) => d.id === activeId);
      if (found) return found;
    }
    return [...documents].sort((a, b) => b.updatedAt - a.updatedAt)[0] ?? null;
  }, [documents, activeId]);

  const createDocument = useCallback(
    (content = "", title: string | null = null) => {
      const doc = createDocumentObject(content, title);
      setDocuments((prev) => enforceLimit([...prev, doc]));
      setActiveId(doc.id);
      return doc.id;
    },
    [setDocuments, setActiveId],
  );

  const openDocument = useCallback(
    (id: string) => {
      setActiveId(id);
    },
    [setActiveId],
  );

  const updateActiveContent = useCallback(
    (content: string) => {
      setDocuments((prev) => {
        if (!prev.length) return prev;
        const targetId = activeId ?? prev[0]?.id;
        if (!targetId) return prev;
        const now = Date.now();
        return prev.map((d) =>
          d.id === targetId ? { ...d, content, updatedAt: now } : d,
        );
      });
    },
    [activeId, setDocuments],
  );

  const clearActiveContent = useCallback(() => {
    updateActiveContent("");
  }, [updateActiveContent]);

  const renameDocument = useCallback(
    (id: string, title: string) => {
      const trimmed = title.trim();
      setDocuments((prev) =>
        prev.map((d) =>
          d.id === id
            ? { ...d, title: trimmed ? trimmed : null, updatedAt: Date.now() }
            : d,
        ),
      );
    },
    [setDocuments],
  );

  const deleteDocument = useCallback(
    (id: string) => {
      let nextActiveId: string | null = null;
      setDocuments((prev) => {
        const remaining = prev.filter((d) => d.id !== id);
        if (remaining.length === 0) {
          const fresh = createDocumentObject("");
          nextActiveId = fresh.id;
          return [fresh];
        }
        if (activeId === id) {
          const fallback = [...remaining].sort(
            (a, b) => b.updatedAt - a.updatedAt,
          )[0];
          nextActiveId = fallback.id;
        }
        return remaining;
      });
      if (nextActiveId) setActiveId(nextActiveId);
    },
    [activeId, setDocuments, setActiveId],
  );

  const duplicateDocument = useCallback(
    (id: string) => {
      let createdId: string | null = null;
      setDocuments((prev) => {
        const source = prev.find((d) => d.id === id);
        if (!source) return prev;
        const copy = createDocumentObject(
          source.content,
          source.title ? `${source.title} (Copy)` : null,
        );
        createdId = copy.id;
        return enforceLimit([...prev, copy]);
      });
      if (createdId) setActiveId(createdId);
    },
    [setDocuments, setActiveId],
  );

  const togglePin = useCallback(
    (id: string) => {
      setDocuments((prev) =>
        prev.map((d) => (d.id === id ? { ...d, pinned: !d.pinned } : d)),
      );
    },
    [setDocuments],
  );

  return {
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
  };
}
