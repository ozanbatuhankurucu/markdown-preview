# Markdown Preview

A live markdown editor and previewer built with Next.js. Paste or type markdown on the left, see the rendered output on the right.

## Features

- **Live preview** — Rendered output updates as you type
- **GitHub Flavored Markdown** — Tables, task lists, strikethrough, footnotes, and autolinks
- **Syntax highlighting** — Code blocks with language detection via highlight.js
- **Resizable panels** — Drag the divider to resize the editor and preview panes
- **Fullscreen mode** — Expand either panel to full width; press Escape to restore the split layout
- **Dark and light mode** — System, light, and dark theme options
- **Document library** — Keep up to 100 markdown documents in a left slide-in drawer; search, rename, pin, duplicate, and delete from one place
- **Active document in the header** — A breadcrumb-style header shows the active document's title; click it (or the pencil affordance) to rename inline, press `Enter` to commit or `Escape` to cancel
- **One-click new document** — A primary `+ New` button in the header (and a keyboard shortcut) creates a fresh document without losing the current one
- **Auto-save per document** — Every edit is written to localStorage against the active document so nothing is lost when you switch
- **Scroll sync** — Editor and preview scroll positions stay in sync using pointer-tracking
- **Active line highlighting** — Current line is highlighted in both the editor and the gutter
- **Auto-pairing** — Brackets, backticks, quotes, and markdown characters auto-close; selections are wrapped automatically
- **Copy button on code blocks** — Hover over a code block in the preview to reveal a one-click copy button
- **Drag-and-drop import** — Drop a `.md`, `.markdown`, or `.txt` file onto the editor to import it as a new document
- **Table of contents** — Click the list icon in the preview header to navigate headings
- **Copy as HTML** — Copy the rendered HTML to clipboard
- **Download** — Export your markdown as a `.md` file
- **Keyboard shortcuts** — `Ctrl+B` to toggle the document library, `Ctrl/Cmd+Alt+N` to create a new document, `Ctrl+S` to download, `Ctrl+Shift+C` to copy HTML, `Escape` to exit fullscreen

## Tech Stack

- [Next.js 16](https://nextjs.org/) (App Router, TypeScript)
- [Tailwind CSS v4](https://tailwindcss.com/)
- [react-markdown](https://github.com/remarkjs/react-markdown) + [remark-gfm](https://github.com/remarkjs/remark-gfm)
- [rehype-highlight](https://github.com/rehypejs/rehype-highlight) + [rehype-raw](https://github.com/rehypejs/rehype-raw) + [rehype-slug](https://github.com/rehypejs/rehype-slug)
- [react-resizable-panels](https://github.com/bvaughn/react-resizable-panels)
- [next-themes](https://github.com/pacocoursey/next-themes)
- [lucide-react](https://lucide.dev/) (icons)
- [sonner](https://sonner.emilkowal.dev/) (toast notifications)

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Scripts

| Command         | Description                  |
|:----------------|:-----------------------------|
| `npm run dev`   | Start the development server |
| `npm run build` | Create a production build    |
| `npm run start` | Serve the production build   |
| `npm run lint`  | Run ESLint                   |

## Project Structure

```
src/
  app/
    layout.tsx            Root layout, ThemeProvider, SEO metadata
    page.tsx              Main page, state management, scroll sync, keyboard shortcuts
    globals.css           Tailwind config, theme variables, syntax highlighting, scrollbar styles
  components/
    Providers.tsx         next-themes ThemeProvider wrapper
    Header.tsx            App header, library toggle, active document title with inline rename, `+ New` button, action buttons, GitHub link
    ThemeToggle.tsx       Light / Dark / System mode switcher
    EditorLayout.tsx      Resizable split-pane layout with fullscreen mode
    MarkdownEditor.tsx    Textarea with line numbers, active line highlighting, auto-pairing, drag-and-drop
    MarkdownPreview.tsx   react-markdown renderer with plugins and copy-code buttons
    TableOfContents.tsx   Heading extraction and popover navigation for the preview
    DocumentDrawer.tsx    Left slide-in document library with search, pin, rename, duplicate, delete
    StatusBar.tsx         Word, character, and line counts; sync scroll toggle
  lib/
    default-markdown.ts   Sample markdown content
    useLocalStorage.ts    localStorage hook via useSyncExternalStore
    useDocumentLibrary.ts Multi-document store with 100-doc cap, pinning, and legacy migration
```

## License

MIT
