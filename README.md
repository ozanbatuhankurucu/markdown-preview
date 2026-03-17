# Markdown Preview

A live markdown editor and previewer built with Next.js. Paste or type markdown on the left, see the rendered output on the right.

## Features

- **Live preview** — Rendered output updates as you type
- **GitHub Flavored Markdown** — Tables, task lists, strikethrough, footnotes, and autolinks
- **Syntax highlighting** — Code blocks with language detection via highlight.js
- **Resizable panels** — Drag the divider to resize the editor and preview panes
- **Dark and light mode** — System, light, and dark theme options
- **Persistent content** — Your markdown is saved to localStorage automatically
- **Scroll sync** — Editor and preview scroll positions stay in sync
- **Copy as HTML** — Copy the rendered HTML to clipboard
- **Download** — Export your markdown as a `.md` file
- **Keyboard shortcuts** — `Ctrl+S` to download, `Ctrl+Shift+C` to copy HTML
- **SEO optimized** — Full metadata, Open Graph, Twitter cards, and JSON-LD structured data

## Tech Stack

- [Next.js 16](https://nextjs.org/) (App Router, TypeScript)
- [Tailwind CSS v4](https://tailwindcss.com/)
- [react-markdown](https://github.com/remarkjs/react-markdown) + [remark-gfm](https://github.com/remarkjs/remark-gfm)
- [rehype-highlight](https://github.com/rehypejs/rehype-highlight) + [rehype-raw](https://github.com/rehypejs/rehype-raw) + [rehype-slug](https://github.com/rehypejs/rehype-slug)
- [react-resizable-panels](https://github.com/bvaughn/react-resizable-panels)
- [next-themes](https://github.com/pacocoursey/next-themes)

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
    layout.tsx          Root layout, ThemeProvider, SEO metadata
    page.tsx            Main page, state management, keyboard shortcuts
    globals.css         Tailwind config, theme variables, syntax theme
  components/
    Providers.tsx       next-themes ThemeProvider wrapper
    Header.tsx          App header, action buttons, GitHub link
    ThemeToggle.tsx     Light / Dark / System mode switcher
    EditorLayout.tsx    Resizable split-pane layout
    MarkdownEditor.tsx  Textarea with line numbers
    MarkdownPreview.tsx react-markdown renderer with plugins
    StatusBar.tsx       Word, character, and line counts
  lib/
    default-markdown.ts Sample markdown content
    useLocalStorage.ts  localStorage hook via useSyncExternalStore
```

## License

MIT
