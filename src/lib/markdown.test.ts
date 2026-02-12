import { describe, expect, it } from "vitest";
import { renderMarkdown } from "@/lib/markdown";

describe("renderMarkdown", () => {
  it("parses headings, paragraphs, and lists", () => {
    const input = [
      "# Title",
      "",
      "Intro line one",
      "line two",
      "",
      "- item one",
      "- item two",
      "",
      "## Subhead",
      "Paragraph.",
    ].join("\n");

    expect(renderMarkdown(input)).toEqual([
      { type: "heading", level: 1, text: "Title" },
      { type: "paragraph", text: "Intro line one line two" },
      { type: "list", items: ["item one", "item two"] },
      { type: "heading", level: 2, text: "Subhead" },
      { type: "paragraph", text: "Paragraph." },
    ]);
  });

  it("coalesces whitespace into single paragraphs", () => {
    const input = ["First line", "", "Second paragraph"].join("\n");

    expect(renderMarkdown(input)).toEqual([
      { type: "paragraph", text: "First line" },
      { type: "paragraph", text: "Second paragraph" },
    ]);
  });

  it("ignores empty headings and list items", () => {
    const input = ["#   ", "- ", "- Item", "", "##", "Text"].join("\n");

    expect(renderMarkdown(input)).toEqual([
      { type: "list", items: ["Item"] },
      { type: "paragraph", text: "Text" },
    ]);
  });
});
