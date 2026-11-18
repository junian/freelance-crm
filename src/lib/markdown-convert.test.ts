import { describe, expect, it } from "vitest";

import { htmlFromMarkdown, markdownFromHTML } from "./markdown-convert";

describe("htmlFromMarkdown", () => {
  it("converts headings, emphasis, and lists to HTML", async () => {
    const html = await htmlFromMarkdown("# Hello\n\n**bold** and *em*\n\n- one\n- two");

    expect(html).toContain("<h1>Hello</h1>");
    expect(html).toContain("<strong>bold</strong>");
    expect(html).toContain("<em>em</em>");
    expect(html).toContain("<li>one</li>");
    expect(html).toContain("<li>two</li>");
  });

  it("supports GFM tables", async () => {
    const html = await htmlFromMarkdown("| Name | Role |\n| --- | --- |\n| Sam | Engineer |");

    expect(html).toContain("<table>");
    expect(html).toContain("<th>Name</th>");
    expect(html).toContain("<td>Sam</td>");
  });

  it("returns an empty string for empty input", async () => {
    await expect(htmlFromMarkdown("")).resolves.toBe("");
  });

  it("does not emit raw script tags", async () => {
    const html = await htmlFromMarkdown("<script>alert(1)</script>");
    expect(html).not.toContain("<script>");
  });
});

describe("markdownFromHTML", () => {
  it("converts HTML headings and lists back to Markdown", async () => {
    const md = await markdownFromHTML("<h2>Hi</h2><ul><li>One</li><li>Two</li></ul>");

    expect(md).toContain("## Hi");
    expect(md).toContain("- One");
    expect(md).toContain("- Two");
  });

  it("round-trips Markdown through HTML", async () => {
    const html = await htmlFromMarkdown("# Hi\n\n- one\n- two");
    const md = await markdownFromHTML(html);

    expect(md).toContain("# Hi");
    expect(md).toContain("- one");
    expect(md).toContain("- two");
  });
});
