// Peer-to-peer sync using RxDB WebRTC replication.
// Browser-only. All imports are dynamic to avoid pulling simple-peer into SSR.

import { STORE_LIST, getRawCollection } from "./storage";

export type SyncStatus =
  | "idle"
  | "starting"
  | "waiting"
  | "connecting"
  | "syncing"
  | "connected"
  | "error";

export type SyncState = {
  status: SyncStatus;
  peers: number;
  progress: number; // 0-100
  error?: string;
  roomId?: string;
};

type Pool = { cancel: () => Promise<void>; peerStates$: { subscribe: (fn: (m: Map<unknown, unknown>) => void) => { unsubscribe: () => void } } };

let activePools: Pool[] = [];
let activeSubs: { unsubscribe: () => void }[] = [];

export async function startSync(
  roomId: string,
  onState: (s: SyncState) => void,
): Promise<void> {
  onState({ status: "starting", peers: 0, progress: 5, roomId });

  // Process.nextTick shim for simple-peer / readable-stream.
  if (typeof window !== "undefined") {
    const w = window as unknown as { process?: { nextTick?: (fn: () => void) => void } };
    if (!w.process) w.process = {} as { nextTick?: (fn: () => void) => void };
    if (!w.process.nextTick) w.process.nextTick = (fn: () => void) => queueMicrotask(fn);
  }

  const { replicateWebRTC, getConnectionHandlerSimplePeer } = await import(
    "rxdb/plugins/replication-webrtc"
  );

  onState({ status: "waiting", peers: 0, progress: 15, roomId });

  const total = STORE_LIST.length;
  let doneCount = 0;
  const perCollectionPeers = new Map<string, number>();

  const updateAggregate = () => {
    const peers = Math.max(...Array.from(perCollectionPeers.values()), 0);
    if (peers === 0) {
      onState({ status: "waiting", peers: 0, progress: 15 + Math.round((doneCount / total) * 20), roomId });
    } else {
      const base = 40;
      const progress = Math.min(100, base + Math.round((doneCount / total) * 60));
      const status: SyncStatus = progress >= 100 ? "connected" : "syncing";
      onState({ status, peers, progress, roomId });
    }
  };

  try {
    for (const name of STORE_LIST) {
      const collection = await getRawCollection(name);
      const pool = await replicateWebRTC({
        collection,
        topic: `fcrm-${roomId}-${name}`,
        connectionHandlerCreator: getConnectionHandlerSimplePeer({}),
        pull: {},
        push: {},
      });
      activePools.push(pool as unknown as Pool);

      const sub = pool.peerStates$.subscribe((states) => {
        perCollectionPeers.set(name, states.size);
        updateAggregate();
      });
      activeSubs.push(sub);

      pool.awaitFirstPeer().then(() => {
        doneCount += 1;
        updateAggregate();
      }).catch(() => {});
    }
  } catch (err) {
    await stopSync();
    onState({
      status: "error",
      peers: 0,
      progress: 0,
      error: err instanceof Error ? err.message : "Sync failed",
      roomId,
    });
  }
}

export async function stopSync(): Promise<void> {
  for (const s of activeSubs) {
    try { s.unsubscribe(); } catch { /* noop */ }
  }
  activeSubs = [];
  for (const p of activePools) {
    try { await p.cancel(); } catch { /* noop */ }
  }
  activePools = [];
}

export function makeRoomId(): string {
  return typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2) + Date.now().toString(36);
}
