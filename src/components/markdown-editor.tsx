import { lazy, Suspense, useEffect, useState } from "react";

const Inner = lazy(() => import("./markdown-editor-inner"));

type Props = {
  value: string;
  onChange: (markdown: string) => void;
  debounceMs?: number;
};

export function MarkdownEditor(props: Props) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) {
    return (
      <div className="min-h-[400px] rounded-md border border-input bg-background p-4 text-sm text-muted-foreground">
        Loading editor…
      </div>
    );
  }
  return (
    <Suspense
      fallback={
        <div className="min-h-[400px] rounded-md border border-input bg-background p-4 text-sm text-muted-foreground">
          Loading editor…
        </div>
      }
    >
      <Inner {...props} />
    </Suspense>
  );
}
