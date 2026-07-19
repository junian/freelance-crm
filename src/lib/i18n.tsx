import { createContext, useContext, useMemo, type ReactNode } from "react";
import { useAppData } from "./app-data";

export type Language = "en" | "id";

export const LANGUAGES: { value: Language; label: string }[] = [
  { value: "en", label: "English" },
  { value: "id", label: "Bahasa Indonesia" },
];

type Dict = Record<string, string>;

const en: Dict = {
  // nav
  "nav.dashboard": "Dashboard",
  "nav.clients": "Clients",
  "nav.proposals": "Proposals",
  "nav.interviews": "Interviews",
  "nav.invoices": "Invoices",
  "nav.about": "About",
  "nav.privacy": "Privacy",
  "nav.settings": "Settings",
  "nav.general": "General",
  "nav.quickAdd": "Quick add",
  "nav.newClient": "New client",
  "nav.newProposal": "New proposal",
  "nav.newInvoice": "New invoice",
  "nav.storedLocally": "Stored in this browser",
  "nav.openNav": "Open navigation",
  "nav.closeNav": "Close navigation",
  "nav.expandSidebar": "Expand sidebar",
  "nav.collapseSidebar": "Collapse sidebar",
  "nav.developer": "Junian Dev",
  "nav.buyMeCoffee": "Buy me a Coffee",
  "nav.links": "Links",
  "sync.title": "Peer-to-peer sync",
  "sync.subtitle": "Sync this browser with another device over WebRTC. Nothing is stored on a server; the signaling server only helps peers find each other.",
  "sync.start": "Start sync",
  "sync.stop": "Stop syncing",
  "sync.copyUrl": "Copy sync URL",
  "sync.copied": "Sync URL copied",
  "sync.shareInstruction": "Open this URL on another browser or device to start syncing:",
  "sync.waiting": "Waiting for the other device to connect…",
  "sync.connecting": "Connecting to peer…",
  "sync.syncing": "Syncing data…",
  "sync.done": "Sync complete",
  "sync.peers": "Connected peers",
  "sync.error": "Sync error",
  "sync.demoRemoved": "Demo data removed before syncing",
  "common.loading": "Loading local data…",
  "common.cancel": "Cancel",
  "common.save": "Save",
  "common.delete": "Delete",
  // settings
  "settings.title": "Settings",
  "settings.subtitle": "All data lives in this browser.",
  "settings.appearance": "Appearance",
  "settings.theme": "Theme",
  "settings.themeLight": "Light",
  "settings.themeDark": "Dark",
  "settings.themeSystem": "System",
  "settings.language": "Language",
  "settings.languageSection": "Language",
  "settings.counts": "Local record counts",
  "settings.backup": "Backup & restore",
  "settings.exportBackup": "Export JSON backup",
  "settings.importBackup": "Import JSON backup",
  "settings.backupHint": "Backups are generated locally in your browser. No data leaves your device.",
  "settings.csv": "CSV exports",
  "settings.exportProposalsCsv": "Export proposals CSV",
  "settings.exportInvoicesCsv": "Export invoices CSV",
  "settings.storage": "Storage usage",
  "settings.storageHint": "Estimates come from your browser. Quotas vary by device and free disk space.",
  "settings.refresh": "Refresh",
  "settings.thisApp": "This app",
  "settings.otherData": "Other site data",
  "settings.available": "Available",
  "settings.totalQuota": "Total quota",
  "settings.danger": "Danger zone",
  "settings.deleteDemo": "Delete demo data",
  "settings.resetAll": "Reset all data",
  "settings.resetHint": "Reset permanently deletes every record stored by this app in this browser.",
  "settings.privacy": "Privacy",
  "settings.privacyBody":
    "Your CRM and invoice data is stored only in this browser using IndexedDB. It is never sent to any server. Clearing browser storage or switching devices will remove your local records. Keep regular JSON backups.",
  // editor toolbar
  "editor.undo": "Undo",
  "editor.redo": "Redo",
  "editor.h1": "Heading 1",
  "editor.h2": "Heading 2",
  "editor.h3": "Heading 3",
  "editor.bold": "Bold",
  "editor.italic": "Italic",
  "editor.underline": "Underline",
  "editor.strike": "Strikethrough",
  "editor.code": "Inline code",
  "editor.bulletList": "Bullet list",
  "editor.orderedList": "Numbered list",
  "editor.blockquote": "Quote",
  "editor.codeBlock": "Code block",
  "editor.hr": "Horizontal rule",
  // about
  "about.credits": "Credits",
  "about.creditsIntro": "This app is built on top of the following open-source libraries.",
  "about.developer": "Developer",
  "about.developerIntro": "Made by Junian Dev.",
  "about.visitDeveloper": "Visit Junian Dev",
};

const id: Dict = {
  "nav.dashboard": "Dasbor",
  "nav.clients": "Klien",
  "nav.proposals": "Proposal",
  "nav.interviews": "Wawancara",
  "nav.invoices": "Faktur",
  "nav.about": "Tentang",
  "nav.privacy": "Privasi",
  "nav.settings": "Pengaturan",
  "nav.general": "Umum",
  "nav.quickAdd": "Tambah cepat",
  "nav.newClient": "Klien baru",
  "nav.newProposal": "Proposal baru",
  "nav.newInvoice": "Faktur baru",
  "nav.storedLocally": "Disimpan di peramban ini",
  "nav.openNav": "Buka navigasi",
  "nav.closeNav": "Tutup navigasi",
  "nav.expandSidebar": "Perluas bilah sisi",
  "nav.collapseSidebar": "Ciutkan bilah sisi",
  "nav.developer": "Junian Dev",
  "nav.buyMeCoffee": "Buy me a Coffee",
  "nav.links": "Tautan",
  "sync.title": "Sinkronisasi peer-to-peer",
  "sync.subtitle": "Sinkronkan peramban ini dengan perangkat lain melalui WebRTC. Tidak ada data yang disimpan di server; server sinyal hanya membantu peer saling menemukan.",
  "sync.start": "Mulai sinkron",
  "sync.stop": "Hentikan sinkron",
  "sync.copyUrl": "Salin URL sinkron",
  "sync.copied": "URL sinkron disalin",
  "sync.shareInstruction": "Buka URL ini di peramban atau perangkat lain untuk mulai sinkron:",
  "sync.waiting": "Menunggu perangkat lain terhubung…",
  "sync.connecting": "Menghubungkan ke peer…",
  "sync.syncing": "Menyinkronkan data…",
  "sync.done": "Sinkronisasi selesai",
  "sync.peers": "Peer terhubung",
  "sync.error": "Kesalahan sinkron",
  "common.loading": "Memuat data lokal…",
  "common.cancel": "Batal",
  "common.save": "Simpan",
  "common.delete": "Hapus",
  "settings.title": "Pengaturan",
  "settings.subtitle": "Semua data tersimpan di peramban ini.",
  "settings.appearance": "Tampilan",
  "settings.theme": "Tema",
  "settings.themeLight": "Terang",
  "settings.themeDark": "Gelap",
  "settings.themeSystem": "Sistem",
  "settings.language": "Bahasa",
  "settings.languageSection": "Bahasa",
  "settings.counts": "Jumlah data lokal",
  "settings.backup": "Cadangkan & pulihkan",
  "settings.exportBackup": "Ekspor cadangan JSON",
  "settings.importBackup": "Impor cadangan JSON",
  "settings.backupHint": "Cadangan dibuat secara lokal di peramban Anda. Tidak ada data yang dikirim keluar.",
  "settings.csv": "Ekspor CSV",
  "settings.exportProposalsCsv": "Ekspor proposal CSV",
  "settings.exportInvoicesCsv": "Ekspor faktur CSV",
  "settings.storage": "Penggunaan penyimpanan",
  "settings.storageHint": "Estimasi berasal dari peramban Anda. Kuota bervariasi tergantung perangkat dan ruang disk kosong.",
  "settings.refresh": "Segarkan",
  "settings.thisApp": "Aplikasi ini",
  "settings.otherData": "Data situs lain",
  "settings.available": "Tersedia",
  "settings.totalQuota": "Total kuota",
  "settings.danger": "Zona berbahaya",
  "settings.deleteDemo": "Hapus data demo",
  "settings.resetAll": "Reset semua data",
  "settings.resetHint": "Reset akan menghapus permanen semua data yang tersimpan di peramban ini.",
  "settings.privacy": "Privasi",
  "settings.privacyBody":
    "Data CRM dan faktur Anda hanya tersimpan di peramban ini menggunakan IndexedDB. Data tidak pernah dikirim ke server manapun. Menghapus penyimpanan peramban atau berpindah perangkat akan menghapus data lokal Anda. Selalu simpan cadangan JSON secara berkala.",
  "editor.undo": "Urungkan",
  "editor.redo": "Ulangi",
  "editor.h1": "Judul 1",
  "editor.h2": "Judul 2",
  "editor.h3": "Judul 3",
  "editor.bold": "Tebal",
  "editor.italic": "Miring",
  "editor.underline": "Garis bawah",
  "editor.strike": "Coret",
  "editor.code": "Kode sebaris",
  "editor.bulletList": "Daftar poin",
  "editor.orderedList": "Daftar bernomor",
  "editor.blockquote": "Kutipan",
  "editor.codeBlock": "Blok kode",
  "editor.hr": "Garis horizontal",
  // about
  "about.credits": "Kredit",
  "about.creditsIntro": "Aplikasi ini dibangun di atas library sumber terbuka berikut.",
  "about.developer": "Pengembang",
  "about.developerIntro": "Dibuat oleh Junian Dev.",
  "about.visitDeveloper": "Kunjungi Junian Dev",
};

const DICTS: Record<Language, Dict> = { en, id };

type Ctx = {
  lang: Language;
  t: (key: string, fallback?: string) => string;
};

const I18nContext = createContext<Ctx | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const { prefs } = useAppData();
  const lang: Language = prefs.language === "id" ? "id" : "en";
  const value = useMemo<Ctx>(() => {
    const dict = DICTS[lang];
    return {
      lang,
      t: (key, fallback) => dict[key] ?? DICTS.en[key] ?? fallback ?? key,
    };
  }, [lang]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useT() {
  const ctx = useContext(I18nContext);
  if (!ctx) return { lang: "en" as Language, t: (k: string, f?: string) => f ?? k };
  return ctx;
}
