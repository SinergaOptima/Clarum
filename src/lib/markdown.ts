export type MarkdownBlock =
  | { type: "heading"; level: 1 | 2 | 3; text: string }
  | { type: "paragraph"; text: string }
  | { type: "list"; items: string[] };

function pushParagraph(blocks: MarkdownBlock[], lines: string[]) {
  if (lines.length === 0) return;
  blocks.push({ type: "paragraph", text: lines.join(" ") });
  lines.length = 0;
}

function pushList(blocks: MarkdownBlock[], items: string[]) {
  if (items.length === 0) return;
  blocks.push({ type: "list", items: [...items] });
  items.length = 0;
}

export function renderMarkdown(markdown: string): MarkdownBlock[] {
  const blocks: MarkdownBlock[] = [];
  const paragraph: string[] = [];
  const listItems: string[] = [];

  for (const line of markdown.split(/\r?\n/)) {
    const trimmed = line.trim();

    if (trimmed.length === 0) {
      pushParagraph(blocks, paragraph);
      pushList(blocks, listItems);
      continue;
    }

    if (/^#{1,3}$/.test(trimmed) || trimmed === "-") {
      pushParagraph(blocks, paragraph);
      pushList(blocks, listItems);
      continue;
    }

    if (trimmed.startsWith("### ")) {
      pushParagraph(blocks, paragraph);
      pushList(blocks, listItems);
      const text = trimmed.slice(4).trim();
      if (text.length > 0) {
        blocks.push({ type: "heading", level: 3, text });
      }
      continue;
    }

    if (trimmed.startsWith("## ")) {
      pushParagraph(blocks, paragraph);
      pushList(blocks, listItems);
      const text = trimmed.slice(3).trim();
      if (text.length > 0) {
        blocks.push({ type: "heading", level: 2, text });
      }
      continue;
    }

    if (trimmed.startsWith("# ")) {
      pushParagraph(blocks, paragraph);
      pushList(blocks, listItems);
      const text = trimmed.slice(2).trim();
      if (text.length > 0) {
        blocks.push({ type: "heading", level: 1, text });
      }
      continue;
    }

    if (trimmed.startsWith("- ")) {
      pushParagraph(blocks, paragraph);
      const item = trimmed.slice(2).trim();
      if (item.length > 0) {
        listItems.push(item);
      }
      continue;
    }

    paragraph.push(trimmed);
  }

  pushParagraph(blocks, paragraph);
  pushList(blocks, listItems);

  return blocks;
}
