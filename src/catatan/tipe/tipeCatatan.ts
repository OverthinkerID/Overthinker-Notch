export type FormatCatatan = "markdown" | "rich_text" | "checklist";

export type FilterArsipCatatan = "aktif" | "arsip" | "semua";

export interface CatatanItem {
  id: string;
  projectId: string | null;
  judul: string;
  kontenMarkdown: string;
  formatKonten: FormatCatatan;
  disematkan: boolean;
  diarsipkan: boolean;
  daftarTag: string[];
  dibuatPada: string;
  diperbaruiPada: string;
}

export interface MasukanSimpanCatatan {
  id?: string;
  projectId?: string | null;
  judul: string;
  kontenMarkdown: string;
  formatKonten: FormatCatatan;
  disematkan: boolean;
  diarsipkan: boolean;
  daftarTag: string[];
}

export interface ItemChecklist {
  indeksBaris: number;
  teks: string;
  selesai: boolean;
}
