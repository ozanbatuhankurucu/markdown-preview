"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Check,
  Copy,
  FileText,
  Pencil,
  Pin,
  PinOff,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import {
  getDisplayTitle,
  MAX_DOCUMENTS,
  relativeTime,
  type MarkdownDocument,
} from "@/lib/useDocumentLibrary";

interface DocumentDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  documents: MarkdownDocument[];
  activeId: string | null;
  onCreateDocument: () => void;
  onOpenDocument: (id: string) => void;
  onRenameDocument: (id: string, title: string) => void;
  onDuplicateDocument: (id: string) => void;
  onDeleteDocument: (id: string) => void;
  onTogglePin: (id: string) => void;
}

export function DocumentDrawer({
  isOpen,
  onClose,
  documents,
  activeId,
  onCreateDocument,
  onOpenDocument,
  onRenameDocument,
  onDuplicateDocument,
  onDeleteDocument,
  onTogglePin,
}: DocumentDrawerProps) {
  const [query, setQuery] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState("");
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [prevOpen, setPrevOpen] = useState(isOpen);
  const editingInputRef = useRef<HTMLInputElement>(null);

  if (prevOpen !== isOpen) {
    setPrevOpen(isOpen);
    if (!isOpen) {
      setQuery("");
      setEditingId(null);
      setPendingDeleteId(null);
    }
  }

  useEffect(() => {
    if (!isOpen) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (editingId) {
        e.stopPropagation();
        setEditingId(null);
      } else if (pendingDeleteId) {
        e.stopPropagation();
        setPendingDeleteId(null);
      } else {
        e.stopPropagation();
        onClose();
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose, editingId, pendingDeleteId]);

  useEffect(() => {
    if (editingId && editingInputRef.current) {
      editingInputRef.current.focus();
      editingInputRef.current.select();
    }
  }, [editingId]);

  const sortedDocuments = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = q
      ? documents.filter((d) => {
          const haystack = `${getDisplayTitle(d)}\n${d.content}`.toLowerCase();
          return haystack.includes(q);
        })
      : documents;
    return [...filtered].sort((a, b) => {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
      return b.updatedAt - a.updatedAt;
    });
  }, [documents, query]);

  const startEditing = useCallback((doc: MarkdownDocument) => {
    setEditingId(doc.id);
    setEditingValue(getDisplayTitle(doc));
    setPendingDeleteId(null);
  }, []);

  const commitRename = useCallback(() => {
    if (!editingId) return;
    onRenameDocument(editingId, editingValue);
    setEditingId(null);
  }, [editingId, editingValue, onRenameDocument]);

  return (
    <>
      <div
        className={`fixed inset-0 z-40 transition-opacity duration-200 ${
          isOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        style={{ background: "rgba(0, 0, 0, 0.35)" }}
        onClick={onClose}
        aria-hidden="true"
      />
      <aside
        className={`fixed top-0 left-0 z-50 h-dvh w-80 flex flex-col border-r shadow-xl transition-transform duration-200 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{
          background: "var(--bg-primary)",
          borderColor: "var(--border-color)",
        }}
        aria-label="Document library"
        aria-hidden={!isOpen}
      >
        <div
          className="flex items-center justify-between px-4 py-3 border-b shrink-0"
          style={{ borderColor: "var(--border-color)" }}
        >
          <h2
            className="text-sm font-semibold"
            style={{ color: "var(--fg-primary)" }}
          >
            Documents
          </h2>
          <button
            onClick={onClose}
            title="Close (Esc)"
            className="flex items-center justify-center w-7 h-7 rounded-md transition-colors cursor-pointer"
            style={{ color: "var(--fg-muted)" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "var(--bg-tertiary)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
            }}
          >
            <X size={14} />
          </button>
        </div>

        <div
          className="px-3 py-3 flex flex-col gap-2 border-b shrink-0"
          style={{ borderColor: "var(--border-color)" }}
        >
          <button
            onClick={() => {
              onCreateDocument();
              onClose();
            }}
            className="flex items-center justify-center gap-1.5 w-full rounded-md px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer"
            style={{
              background: "var(--bg-tertiary)",
              color: "var(--fg-primary)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "var(--border-color)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "var(--bg-tertiary)";
            }}
          >
            <Plus size={14} />
            New document
          </button>
          <div className="relative">
            <Search
              size={12}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ color: "var(--fg-muted)" }}
            />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search documents..."
              className="w-full rounded-md pl-7 pr-2 py-1.5 text-xs outline-none border"
              style={{
                background: "var(--bg-secondary)",
                color: "var(--fg-primary)",
                borderColor: "var(--border-color)",
              }}
            />
          </div>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto py-1">
          {sortedDocuments.length === 0 ? (
            <div
              className="px-4 py-6 text-center text-xs"
              style={{ color: "var(--fg-muted)" }}
            >
              {query.trim()
                ? "No documents match your search."
                : "No documents yet."}
            </div>
          ) : (
            sortedDocuments.map((doc) => {
              const isActive = doc.id === activeId;
              const isEditing = doc.id === editingId;
              const isPendingDelete = doc.id === pendingDeleteId;
              const title = getDisplayTitle(doc);
              const preview =
                doc.content
                  .trim()
                  .split("\n")
                  .find((l) => l.trim() && !l.trim().startsWith("#"))
                  ?.slice(0, 60) || "";

              return (
                <div
                  key={doc.id}
                  className="group relative px-3 py-2 mx-1 my-0.5 rounded-md cursor-pointer transition-colors"
                  style={{
                    background: isActive ? "var(--bg-tertiary)" : "transparent",
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = "var(--bg-secondary)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = "transparent";
                    }
                  }}
                  onClick={() => {
                    if (isEditing || isPendingDelete) return;
                    onOpenDocument(doc.id);
                    onClose();
                  }}
                >
                  <div className="flex items-start gap-2">
                    <FileText
                      size={13}
                      className="shrink-0 mt-0.5"
                      style={{ color: "var(--fg-muted)" }}
                    />
                    <div className="flex-1 min-w-0">
                      {isEditing ? (
                        <input
                          ref={editingInputRef}
                          type="text"
                          value={editingValue}
                          onChange={(e) => setEditingValue(e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                          onBlur={commitRename}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              commitRename();
                            } else if (e.key === "Escape") {
                              e.preventDefault();
                              e.stopPropagation();
                              setEditingId(null);
                            }
                          }}
                          className="w-full text-xs font-medium rounded px-1 py-0.5 outline-none border"
                          style={{
                            background: "var(--bg-primary)",
                            color: "var(--fg-primary)",
                            borderColor: "var(--border-color)",
                          }}
                        />
                      ) : (
                        <div
                          className="text-xs font-medium truncate"
                          style={{ color: "var(--fg-primary)" }}
                          title={title}
                        >
                          {title}
                        </div>
                      )}
                      <div
                        className="text-[10px] mt-0.5 flex items-center gap-1.5"
                        style={{ color: "var(--fg-muted)" }}
                      >
                        <span>{relativeTime(doc.updatedAt)}</span>
                        {preview && !isEditing && (
                          <>
                            <span>·</span>
                            <span className="truncate">{preview}</span>
                          </>
                        )}
                      </div>
                    </div>
                    {doc.pinned && !isEditing && (
                      <Pin
                        size={11}
                        className="shrink-0 mt-1"
                        style={{ color: "var(--fg-secondary)" }}
                      />
                    )}
                  </div>

                  {!isEditing && !isPendingDelete && (
                    <div
                      className="absolute right-1 top-1 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity rounded"
                      style={{ background: "var(--bg-tertiary)" }}
                    >
                      <RowActionButton
                        icon={doc.pinned ? PinOff : Pin}
                        title={doc.pinned ? "Unpin" : "Pin"}
                        onClick={(e) => {
                          e.stopPropagation();
                          onTogglePin(doc.id);
                        }}
                      />
                      <RowActionButton
                        icon={Pencil}
                        title="Rename"
                        onClick={(e) => {
                          e.stopPropagation();
                          startEditing(doc);
                        }}
                      />
                      <RowActionButton
                        icon={Copy}
                        title="Duplicate"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDuplicateDocument(doc.id);
                        }}
                      />
                      <RowActionButton
                        icon={Trash2}
                        title="Delete"
                        danger
                        onClick={(e) => {
                          e.stopPropagation();
                          setPendingDeleteId(doc.id);
                        }}
                      />
                    </div>
                  )}

                  {isPendingDelete && (
                    <div
                      className="mt-2 flex items-center justify-between gap-2 rounded p-1.5"
                      style={{
                        background: "var(--bg-primary)",
                        border: "1px solid var(--border-color)",
                      }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <span
                        className="text-[10px]"
                        style={{ color: "var(--fg-secondary)" }}
                      >
                        Delete this document?
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setPendingDeleteId(null);
                          }}
                          className="rounded px-1.5 py-0.5 text-[10px] cursor-pointer"
                          style={{ color: "var(--fg-secondary)" }}
                        >
                          Cancel
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteDocument(doc.id);
                            setPendingDeleteId(null);
                          }}
                          className="flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] cursor-pointer"
                          style={{ color: "#ef4444" }}
                        >
                          <Check size={10} />
                          Delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        <div
          className="px-3 py-2 border-t text-[10px] shrink-0"
          style={{
            borderColor: "var(--border-color)",
            color: "var(--fg-muted)",
          }}
        >
          {documents.length} / {MAX_DOCUMENTS} documents
        </div>
      </aside>
    </>
  );
}

function RowActionButton({
  icon: Icon,
  title,
  onClick,
  danger = false,
}: {
  icon: React.ComponentType<{ size?: number }>;
  title: string;
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className="flex items-center justify-center w-6 h-6 rounded transition-colors cursor-pointer"
      style={{ color: danger ? "#ef4444" : "var(--fg-secondary)" }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "var(--bg-secondary)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "transparent";
      }}
    >
      <Icon size={11} />
    </button>
  );
}
