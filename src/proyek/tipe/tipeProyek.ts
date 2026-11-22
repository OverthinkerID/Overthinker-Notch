export const STATUS_PROYEK = [
  "aktif",
  "dijeda",
  "selesai",
  "arsip",
] as const;

export type StatusProyek = (typeof STATUS_PROYEK)[number];

export const STATUS_TUGAS = ["todo", "proses", "selesai"] as const;
export type StatusTugas = (typeof STATUS_TUGAS)[number];

export const PRIORITAS_TUGAS = [
  "rendah",
  "sedang",
  "tinggi",
  "kritis",
] as const;

export type PrioritasTugas = (typeof PRIORITAS_TUGAS)[number];

export const WARNA_PROYEK_BAWAAN = [
  "#55A7FF",
  "#A879FF",
  "#66E5D2",
  "#F59E0B",
  "#EC4899",
  "#22C55E",
] as const;

export interface WorkspaceItem {
  id: string;
  nama: string;
  deskripsi: string;
  ikon: string;
  warna: string;
  dibuatPada: string;
  diperbaruiPada: string;
}

export interface ProjectItem {
  id: string;
  workspaceId: string;
  nama: string;
  deskripsi: string;
  status: StatusProyek;
  warna: string;
  progresPersen: number;
  diarsipkan: boolean;
  dibuatPada: string;
  diperbaruiPada: string;
}

export interface TaskItem {
  id: string;
  projectId: string;
  judul: string;
  deskripsi: string;
  status: StatusTugas;
  prioritas: PrioritasTugas;
  tenggatPada: string | null;
  selesaiPada: string | null;
  urutan: number;
  dibuatPada: string;
  diperbaruiPada: string;
}

export interface RingkasanAsetProyek {
  projectId: string;
  jumlahCatatan: number;
  jumlahBerkas: number;
  jumlahCuplikan: number;
  jumlahPrompt: number;
  jumlahSesiFokus: number;
}

export interface MasukanSimpanWorkspace {
  id?: string;
  nama: string;
  deskripsi: string;
  ikon?: string;
  warna?: string;
}

export interface MasukanSimpanProyek {
  id?: string;
  workspaceId: string;
  nama: string;
  deskripsi: string;
  status: StatusProyek;
  warna: string;
  progresPersen?: number;
  diarsipkan?: boolean;
}

export interface MasukanSimpanTugas {
  id?: string;
  projectId: string;
  judul: string;
  deskripsi?: string;
  status: StatusTugas;
  prioritas: PrioritasTugas;
  tenggatPada?: string | null;
  urutan?: number;
}
