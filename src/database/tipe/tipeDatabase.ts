export const DAFTAR_18_TABEL_WAJIB = [
  "workspaces",
  "projects",
  "tasks",
  "notes",
  "tags",
  "note_tags",
  "files",
  "snippets",
  "snippet_versions",
  "prompts",
  "prompt_versions",
  "clipboard_items",
  "music_history",
  "lyrics_cache",
  "focus_sessions",
  "app_settings",
  "activity_logs",
  "backups",
] as const;

export type NamaTabelWajib = (typeof DAFTAR_18_TABEL_WAJIB)[number];

export interface InfoTabelDatabase {
  namaTabel: string;
  jumlahBaris: number;
}

export interface RingkasanDatabase {
  pathDatabase: string;
  ukuranByte: number;
  modeJurnal: string;
  foreignKeysAktif: boolean;
  totalTabel: number;
  integritasOk: boolean;
  daftarTabel: InfoTabelDatabase[];
  jumlahBackup: number;
  modeNativeAktif: boolean;
}

export interface HasilIntegrityCheck {
  sehat: boolean;
  detail: string[];
  diperiksaPada: string;
}

export interface CatatanBackup {
  id: string;
  jenisBackup: "otomatis" | "manual" | "pra_restore";
  pathBerkas: string;
  ukuranByte: number;
  checksumSha256: string;
  statusIntegritas: "terverifikasi" | "gagal" | "belum_dicek";
  catatan: string;
  dibuatPada: string;
}

export interface KebijakanRetensi {
  backupOtomatisAktif: boolean;
  intervalBackupJam: number;
  maksimalBackupOtomatis: number;
  hariRetensiClipboard: number;
  hariRetensiFileSementara: number;
}

export interface HasilPembersihanRetensi {
  clipboardDihapus: number;
  backupLamaDihapus: number;
  dijalankanPada: string;
}
