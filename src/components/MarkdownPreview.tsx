"use client";

import { RefObject } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import rehypeRaw from "rehype-raw";
import rehypeSlug from "rehype-slug";

interface MarkdownPreviewProps {
  markdown: string;
  previewRef: RefObject<HTMLDivElement | null>;
}

export function MarkdownPreview({ markdown, previewRef }: MarkdownPreviewProps) {
  return (
    <div
      ref={previewRef}
      className="flex-1 overflow-auto p-6 md:p-8 min-h-0"
      style={{ background: "var(--preview-bg)" }}
    >
      {markdown.trim() ? (
        <article
          className="markdown-preview prose prose-zinc dark:prose-invert max-w-none
            prose-headings:font-semibold prose-headings:tracking-tight
            prose-h1:text-2xl prose-h1:pb-2
            prose-h2:text-xl prose-h2:mt-8
            prose-h3:text-lg prose-h3:mt-6
            prose-p:leading-relaxed
            prose-pre:p-0 prose-pre:bg-transparent
            prose-code:before:content-none prose-code:after:content-none"
        >
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeRaw, rehypeSlug, rehypeHighlight]}
            components={{
              a: ({ children, href, ...props }) => (
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  {...props}
                >
                  {children}
                </a>
              ),
              pre: ({ children, ...props }) => (
                <pre
                  className="overflow-x-auto rounded-md p-4 text-sm leading-relaxed"
                  style={{
                    background: "var(--code-bg)",
                    border: "1px solid var(--border-color)",
                  }}
                  {...props}
                >
                  {children}
                </pre>
              ),
              img: ({ src, alt, ...props }) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={src}
                  alt={alt || ""}
                  loading="lazy"
                  className="rounded-md"
                  {...props}
                />
              ),
            }}
          >
            {markdown}
          </ReactMarkdown>
        </article>
      ) : (
        <div className="flex flex-col items-center justify-center h-full gap-2 opacity-30">
          <svg
            width="40"
            height="40"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <line x1="10" y1="9" x2="8" y2="9" />
          </svg>
          <p className="text-sm">Type markdown to see the preview</p>
        </div>
      )}
    </div>
  );
}
