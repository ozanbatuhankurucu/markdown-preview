export const defaultMarkdown = `# Welcome to Markdown Preview

A **fast** and _beautiful_ markdown editor with live preview. Start typing on the left to see your content rendered in real time.

---

## Features

- **Live Preview** — See your markdown rendered as you type
- **GitHub Flavored Markdown** — Tables, task lists, strikethrough, and more
- **Syntax Highlighting** — Beautiful code blocks with language detection
- **Dark & Light Mode** — Toggle between themes with one click
- **Resizable Panels** — Drag the divider to adjust the layout
- **Persistent Content** — Your work is saved automatically in the browser

---

## Headings

# Heading 1
## Heading 2
### Heading 3
#### Heading 4
##### Heading 5
###### Heading 6

---

## Text Formatting

This is **bold text** and this is *italic text*. You can also use ~~strikethrough~~ and \`inline code\`.

> "The best way to predict the future is to invent it."
> — Alan Kay

---

## Code Blocks

\`\`\`typescript
interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "user";
}

async function getUser(id: string): Promise<User> {
  const response = await fetch(\`/api/users/\${id}\`);
  if (!response.ok) {
    throw new Error("User not found");
  }
  return response.json();
}
\`\`\`

\`\`\`python
def fibonacci(n: int) -> list[int]:
    """Generate the first n Fibonacci numbers."""
    sequence = []
    a, b = 0, 1
    for _ in range(n):
        sequence.append(a)
        a, b = b, a + b
    return sequence

print(fibonacci(10))
\`\`\`

---

## Tables

| Feature          | Status | Priority |
|:-----------------|:------:|:--------:|
| Live Preview     |   ✅   |   High   |
| Syntax Highlight |   ✅   |   High   |
| Dark Mode        |   ✅   |  Medium  |
| Export to PDF    |   ❌   |   Low    |
| Collaboration    |   ❌   |   Low    |

---

## Task Lists

- [x] Set up Next.js project
- [x] Add markdown parsing
- [x] Implement live preview
- [x] Add syntax highlighting
- [ ] Add export to PDF
- [ ] Add collaboration features

---

## Links & Images

Visit [GitHub](https://github.com) for more information.

![Placeholder Image](https://picsum.photos/600/300)

---

## Lists

### Unordered List
- First item
- Second item
  - Nested item A
  - Nested item B
- Third item

### Ordered List
1. First step
2. Second step
3. Third step
   1. Sub-step A
   2. Sub-step B

---

## Horizontal Rule

Three dashes create a horizontal rule:

---

## Footnotes

Here is a sentence with a footnote[^1].

[^1]: This is the footnote content.

---

*Start editing to see the magic happen!* ✨
`;
