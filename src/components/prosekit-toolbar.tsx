import type { BasicExtension } from "prosekit/basic";
import type { Editor } from "prosekit/core";
import { useEditorDerivedValue } from "prosekit/react";
import {
  Bold,
  Code,
  Code2,
  Heading1,
  Heading2,
  Heading3,
  Italic,
  List,
  ListOrdered,
  Minus,
  Quote,
  Redo2,
  Strikethrough,
  Underline,
  Undo2,
} from "lucide-react";
import type { ReactNode } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

function getToolbarItems(editor: Editor<BasicExtension>) {
  return {
    undo: editor.commands.undo
      ? { isActive: false, canExec: editor.commands.undo.canExec(), command: () => editor.commands.undo() }
      : undefined,
    redo: editor.commands.redo
      ? { isActive: false, canExec: editor.commands.redo.canExec(), command: () => editor.commands.redo() }
      : undefined,
    bold: editor.commands.toggleBold
      ? { isActive: editor.marks.bold.isActive(), canExec: editor.commands.toggleBold.canExec(), command: () => editor.commands.toggleBold() }
      : undefined,
    italic: editor.commands.toggleItalic
      ? { isActive: editor.marks.italic.isActive(), canExec: editor.commands.toggleItalic.canExec(), command: () => editor.commands.toggleItalic() }
      : undefined,
    underline: editor.commands.toggleUnderline
      ? { isActive: editor.marks.underline.isActive(), canExec: editor.commands.toggleUnderline.canExec(), command: () => editor.commands.toggleUnderline() }
      : undefined,
    strike: editor.commands.toggleStrike
      ? { isActive: editor.marks.strike.isActive(), canExec: editor.commands.toggleStrike.canExec(), command: () => editor.commands.toggleStrike() }
      : undefined,
    code: editor.commands.toggleCode
      ? { isActive: editor.marks.code.isActive(), canExec: editor.commands.toggleCode.canExec(), command: () => editor.commands.toggleCode() }
      : undefined,
    codeBlock: editor.commands.insertCodeBlock
      ? {
          isActive: editor.nodes.codeBlock?.isActive() ?? false,
          canExec: editor.commands.insertCodeBlock.canExec({ language: "text" }),
          command: () => editor.commands.insertCodeBlock({ language: "text" }),
        }
      : undefined,
    heading1: editor.commands.toggleHeading
      ? { isActive: editor.nodes.heading.isActive({ level: 1 }), canExec: editor.commands.toggleHeading.canExec({ level: 1 }), command: () => editor.commands.toggleHeading({ level: 1 }) }
      : undefined,
    heading2: editor.commands.toggleHeading
      ? { isActive: editor.nodes.heading.isActive({ level: 2 }), canExec: editor.commands.toggleHeading.canExec({ level: 2 }), command: () => editor.commands.toggleHeading({ level: 2 }) }
      : undefined,
    heading3: editor.commands.toggleHeading
      ? { isActive: editor.nodes.heading.isActive({ level: 3 }), canExec: editor.commands.toggleHeading.canExec({ level: 3 }), command: () => editor.commands.toggleHeading({ level: 3 }) }
      : undefined,
    blockquote: editor.commands.toggleBlockquote
      ? { isActive: editor.nodes.blockquote?.isActive() ?? false, canExec: editor.commands.toggleBlockquote.canExec(), command: () => editor.commands.toggleBlockquote() }
      : undefined,
    bulletList: editor.commands.toggleList
      ? { isActive: editor.nodes.list?.isActive({ kind: "bullet" }) ?? false, canExec: editor.commands.toggleList.canExec({ kind: "bullet" }), command: () => editor.commands.toggleList({ kind: "bullet" }) }
      : undefined,
    orderedList: editor.commands.toggleList
      ? { isActive: editor.nodes.list?.isActive({ kind: "ordered" }) ?? false, canExec: editor.commands.toggleList.canExec({ kind: "ordered" }), command: () => editor.commands.toggleList({ kind: "ordered" }) }
      : undefined,
    horizontalRule: editor.commands.insertHorizontalRule
      ? { isActive: false, canExec: editor.commands.insertHorizontalRule.canExec(), command: () => editor.commands.insertHorizontalRule() }
      : undefined,
  };
}

function TbButton({
  pressed,
  disabled,
  onClick,
  tooltip,
  children,
}: {
  pressed?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  tooltip: string;
  children: ReactNode;
}) {
  const btn = (
    <button
      type="button"
      data-state={pressed ? "on" : "off"}
      disabled={disabled}
      onClick={onClick}
      onMouseDown={(e) => e.preventDefault()}
      aria-label={tooltip}
      className={cn(
        "inline-flex items-center justify-center rounded-md h-8 w-8 text-sm transition",
        "text-slate-700 dark:text-slate-200",
        "hover:bg-slate-100 dark:hover:bg-slate-800",
        "disabled:pointer-events-none disabled:opacity-40",
        pressed && "bg-slate-200 dark:bg-slate-700",
      )}
    >
      {children}
    </button>
  );
  return (
    <Tooltip>
      <TooltipTrigger asChild>{btn}</TooltipTrigger>
      <TooltipContent side="bottom">{tooltip}</TooltipContent>
    </Tooltip>
  );
}

function Divider() {
  return <span className="mx-1 h-5 w-px bg-slate-200 dark:bg-slate-700" aria-hidden />;
}

export function ProseKitToolbar({ labels }: { labels?: Partial<Record<string, string>> }) {
  const items = useEditorDerivedValue(getToolbarItems);
  const t = (k: string, d: string) => labels?.[k] ?? d;

  return (
    <div className="flex flex-wrap items-center gap-0.5 border-b border-slate-200 dark:border-slate-800 px-2 py-1.5 bg-slate-50/60 dark:bg-slate-900/40 rounded-t-md">
      {items.undo && (
        <TbButton pressed={items.undo.isActive} disabled={!items.undo.canExec} onClick={items.undo.command} tooltip={t("undo", "Undo")}>
          <Undo2 className="w-4 h-4" />
        </TbButton>
      )}
      {items.redo && (
        <TbButton pressed={items.redo.isActive} disabled={!items.redo.canExec} onClick={items.redo.command} tooltip={t("redo", "Redo")}>
          <Redo2 className="w-4 h-4" />
        </TbButton>
      )}
      <Divider />
      {items.heading1 && (
        <TbButton pressed={items.heading1.isActive} disabled={!items.heading1.canExec} onClick={items.heading1.command} tooltip={t("h1", "Heading 1")}>
          <Heading1 className="w-4 h-4" />
        </TbButton>
      )}
      {items.heading2 && (
        <TbButton pressed={items.heading2.isActive} disabled={!items.heading2.canExec} onClick={items.heading2.command} tooltip={t("h2", "Heading 2")}>
          <Heading2 className="w-4 h-4" />
        </TbButton>
      )}
      {items.heading3 && (
        <TbButton pressed={items.heading3.isActive} disabled={!items.heading3.canExec} onClick={items.heading3.command} tooltip={t("h3", "Heading 3")}>
          <Heading3 className="w-4 h-4" />
        </TbButton>
      )}
      <Divider />
      {items.bold && (
        <TbButton pressed={items.bold.isActive} disabled={!items.bold.canExec} onClick={items.bold.command} tooltip={t("bold", "Bold")}>
          <Bold className="w-4 h-4" />
        </TbButton>
      )}
      {items.italic && (
        <TbButton pressed={items.italic.isActive} disabled={!items.italic.canExec} onClick={items.italic.command} tooltip={t("italic", "Italic")}>
          <Italic className="w-4 h-4" />
        </TbButton>
      )}
      {items.underline && (
        <TbButton pressed={items.underline.isActive} disabled={!items.underline.canExec} onClick={items.underline.command} tooltip={t("underline", "Underline")}>
          <Underline className="w-4 h-4" />
        </TbButton>
      )}
      {items.strike && (
        <TbButton pressed={items.strike.isActive} disabled={!items.strike.canExec} onClick={items.strike.command} tooltip={t("strike", "Strikethrough")}>
          <Strikethrough className="w-4 h-4" />
        </TbButton>
      )}
      {items.code && (
        <TbButton pressed={items.code.isActive} disabled={!items.code.canExec} onClick={items.code.command} tooltip={t("code", "Inline code")}>
          <Code className="w-4 h-4" />
        </TbButton>
      )}
      <Divider />
      {items.bulletList && (
        <TbButton pressed={items.bulletList.isActive} disabled={!items.bulletList.canExec} onClick={items.bulletList.command} tooltip={t("bulletList", "Bullet list")}>
          <List className="w-4 h-4" />
        </TbButton>
      )}
      {items.orderedList && (
        <TbButton pressed={items.orderedList.isActive} disabled={!items.orderedList.canExec} onClick={items.orderedList.command} tooltip={t("orderedList", "Numbered list")}>
          <ListOrdered className="w-4 h-4" />
        </TbButton>
      )}
      {items.blockquote && (
        <TbButton pressed={items.blockquote.isActive} disabled={!items.blockquote.canExec} onClick={items.blockquote.command} tooltip={t("blockquote", "Quote")}>
          <Quote className="w-4 h-4" />
        </TbButton>
      )}
      {items.codeBlock && (
        <TbButton pressed={items.codeBlock.isActive} disabled={!items.codeBlock.canExec} onClick={items.codeBlock.command} tooltip={t("codeBlock", "Code block")}>
          <Code2 className="w-4 h-4" />
        </TbButton>
      )}
      {items.horizontalRule && (
        <TbButton disabled={!items.horizontalRule.canExec} onClick={items.horizontalRule.command} tooltip={t("hr", "Horizontal rule")}>
          <Minus className="w-4 h-4" />
        </TbButton>
      )}
    </div>
  );
}
