import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Radio, Copy, Square } from "lucide-react";
import { Card } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useT } from "@/lib/i18n";
import { useAppData } from "@/lib/app-data";
import { startSync, stopSync, makeRoomId, type SyncState } from "@/lib/webrtc-sync";

const HASH_PREFIX = "#sync-";

export function SyncCard() {
  const { t } = useT();
  const { prefs, deleteDemoData } = useAppData();
  const [state, setState] = useState<SyncState>({ status: "idle", peers: 0, progress: 0 });
  const startedRef = useRef(false);

  const buildUrl = (roomId: string) => {
    if (typeof window === "undefined") return "";
    const { origin, pathname } = window.location;
    return `${origin}${pathname}${HASH_PREFIX}${roomId}`;
  };

  const begin = async (roomId: string) => {
    if (startedRef.current) return;
    startedRef.current = true;
    if (prefs.hasDemoData) {
      try {
        await deleteDemoData();
        toast.info(t("sync.demoRemoved"));
      } catch {
        /* noop */
      }
    }
    if (typeof window !== "undefined") {
      window.location.hash = `${HASH_PREFIX}${roomId}`;
    }
    await startSync(roomId, setState);
  };

  const stop = async () => {
    await stopSync();
    startedRef.current = false;
    setState({ status: "idle", peers: 0, progress: 0 });
    if (typeof window !== "undefined" && window.location.hash.startsWith(HASH_PREFIX)) {
      history.replaceState(null, "", window.location.pathname);
    }
  };

  // If URL already has a sync hash, auto-start.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const h = window.location.hash;
    if (h.startsWith(HASH_PREFIX)) {
      const roomId = h.slice(HASH_PREFIX.length);
      if (roomId) void begin(roomId);
    }
    return () => {
      void stopSync();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleStart = () => {
    const roomId = makeRoomId();
    void begin(roomId);
  };

  const url = state.roomId ? buildUrl(state.roomId) : "";
  const active = state.status !== "idle" && state.status !== "error";

  const statusLabel: Record<SyncState["status"], string> = {
    idle: "",
    starting: t("sync.connecting"),
    waiting: t("sync.waiting"),
    connecting: t("sync.connecting"),
    syncing: t("sync.syncing"),
    connected: t("sync.done"),
    error: t("sync.error"),
  };

  const copyUrl = async () => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success(t("sync.copied"));
    } catch {
      /* noop */
    }
  };

  return (
    <Card className="p-5 md:col-span-2">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <div className="font-semibold flex items-center gap-2">
            <Radio className="w-4 h-4" />
            {t("sync.title")}
          </div>
          <p className="text-xs text-slate-500 mt-1">{t("sync.subtitle")}</p>
        </div>
        {!active ? (
          <Button onClick={handleStart} size="sm" className="gap-1.5">
            <Radio className="w-4 h-4" />
            {t("sync.start")}
          </Button>
        ) : (
          <Button onClick={stop} variant="outline" size="sm" className="gap-1.5">
            <Square className="w-4 h-4" />
            {t("sync.stop")}
          </Button>
        )}
      </div>

      {active && (
        <div className="space-y-3">
          {url && (
            <div>
              <p className="text-xs text-slate-500 mb-1.5">{t("sync.shareInstruction")}</p>
              <div className="flex gap-2">
                <Input readOnly value={url} onFocus={(e) => e.currentTarget.select()} className="font-mono text-xs" />
                <Button variant="outline" size="sm" onClick={copyUrl} className="gap-1.5 shrink-0">
                  <Copy className="w-4 h-4" />
                  {t("sync.copyUrl")}
                </Button>
              </div>
            </div>
          )}

          <div>
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-slate-600 dark:text-slate-400">{statusLabel[state.status]}</span>
              <span className="tabular-nums text-slate-500">{state.progress}%</span>
            </div>
            <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-indigo-500 transition-[width] duration-500"
                style={{ width: `${state.progress}%` }}
              />
            </div>
            <div className="text-xs text-slate-500 mt-2">
              {t("sync.peers")}: <strong>{state.peers}</strong>
            </div>
          </div>
        </div>
      )}

      {state.status === "error" && state.error && (
        <p className="text-xs text-rose-600 dark:text-rose-400 mt-2">{state.error}</p>
      )}
    </Card>
  );
}
