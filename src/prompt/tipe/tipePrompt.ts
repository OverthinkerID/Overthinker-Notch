export const KATEGORI_PROMPT_BAWAAN = [
  "Umum",
  "Coding",
  "Debugging",
  "Arsitektur",
  "Penulisan",
  "Riset",
  "Desain UI/UX",
  "Produktivitas",
] as const;

export interface VersiPrompt {
  id: string;
  promptId: string;
  nomorVersi: number;
  templatePrompt: string;
  catatanPerubahan: string;
  dibuatPada: string;
}

export interface PromptItem {
  id: string;
  projectId: string | null;
  judul: string;
  kategori: string;
  templatePrompt: string;
  daftarVariabel: string[];
  daftarTag: string[];
  favorit: boolean;
  riwayatVersi: VersiPrompt[];
  dibuatPada: string;
  diperbaruiPada: string;
}

export interface MasukanSimpanPrompt {
  id?: string;
  projectId?: string | null;
  judul: string;
  kategori: string;
  templatePrompt: string;
  daftarTag: string[];
  favorit: boolean;
  catatanPerubahan?: string;
}
