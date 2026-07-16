import "prosekit/basic/style.css";
import "prosekit/basic/typography.css";

import { defineBasicExtension } from "prosekit/basic";
import { createEditor, jsonFromHTML } from "prosekit/core";
import { ProseKit, useDocChange } from "prosekit/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { htmlFromMarkdown, markdownFromHTML } from "@/lib/markdown-convert";
import { ProseKitToolbar } from "@/components/prosekit-toolbar";
import { useT } from "@/lib/i18n";

type Props = {
  value: string;
  onChange: (markdown: string) => void;
  debounceMs?: number;
};

export default function MarkdownEditorInner({ value, onChange, debounceMs = 500 }: Props) {
  const [ready, setReady] = useState(false);
  const [initialHtml, setInitialHtml] = useState<string>("");

  useEffect(() => {
    let cancelled = false;
    htmlFromMarkdown(value).then((html) => {
      if (!cancelled) {
        setInitialHtml(html);
        setReady(true);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!ready) {
    return (
      <div className="min-h-[400px] rounded-md border border-input bg-background p-4 text-sm text-muted-foreground">
        Loading editor…
      </div>
    );
  }
  return <Bound initialHtml={initialHtml} onChange={onChange} debounceMs={debounceMs} />;
}

function Bound({
  initialHtml,
  onChange,
  debounceMs,
}: {
  initialHtml: string;
  onChange: (md: string) => void;
  debounceMs: number;
}) {
  const editor = useMemo(() => {
    const extension = defineBasicExtension();
    const ed = createEditor({ extension });
    try {
      const json = jsonFromHTML(initialHtml || "<p></p>", { schema: ed.schema });
      ed.setContent(json);
    } catch {
      // ignore
    }
    return ed;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const timer = useRef<number | null>(null);
  const handleDocChange = useCallback(() => {
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(async () => {
      const html = editor.getDocHTML();
      const md = await markdownFromHTML(html);
      onChange(md);
    }, debounceMs);
  }, [editor, onChange, debounceMs]);
  useDocChange(handleDocChange, { editor });

  useEffect(() => {
    return () => {
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, []);

  const { t } = useT();
  const toolbarLabels = {
    undo: t("editor.undo"),
    redo: t("editor.redo"),
    h1: t("editor.h1"),
    h2: t("editor.h2"),
    h3: t("editor.h3"),
    bold: t("editor.bold"),
    italic: t("editor.italic"),
    underline: t("editor.underline"),
    strike: t("editor.strike"),
    code: t("editor.code"),
    bulletList: t("editor.bulletList"),
    orderedList: t("editor.orderedList"),
    blockquote: t("editor.blockquote"),
    codeBlock: t("editor.codeBlock"),
    hr: t("editor.hr"),
  };

  return (
    <ProseKit editor={editor}>
      <div className="rounded-md border border-input bg-background shadow-sm overflow-hidden">
        <ProseKitToolbar labels={toolbarLabels} />
        <div
          ref={editor.mount}
          className="ProseMirror prose prose-slate dark:prose-invert max-w-none min-h-[400px] px-5 py-4 outline-none focus:outline-none"
        />
      </div>
    </ProseKit>
  );
}
