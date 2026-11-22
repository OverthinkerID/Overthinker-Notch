export const DAFTAR_14_BAHASA = [
  { id: "html", label: "HTML" },
  { id: "css", label: "CSS" },
  { id: "javascript", label: "JavaScript" },
  { id: "typescript", label: "TypeScript" },
  { id: "python", label: "Python" },
  { id: "java", label: "Java" },
  { id: "cpp", label: "C++" },
  { id: "csharp", label: "C#" },
  { id: "sql", label: "SQL" },
  { id: "json", label: "JSON" },
  { id: "yaml", label: "YAML" },
  { id: "shell", label: "Bash" },
  { id: "rust", label: "Rust" },
  { id: "php", label: "PHP" },
] as const;

export type BahasaCuplikan = (typeof DAFTAR_14_BAHASA)[number]["id"];

export const KATEGORI_CUPLIKAN_BAWAAN = [
  "Umum",
  "Frontend",
  "Backend",
  "Database",
  "DevOps",
  "Utilitas",
  "Algoritma",
] as const;

export interface VersiCuplikan {
  id: string;
  snippetId: string;
  nomorVersi: number;
  kode: string;
  catatanPerubahan: string;
  dibuatPada: string;
}

export interface CuplikanKodeItem {
  id: string;
  projectId: string | null;
  judul: string;
  bahasa: BahasaCuplikan;
  kategori: string;
  kode: string;
  deskripsi: string;
  daftarTag: string[];
  favorit: boolean;
  riwayatVersi: VersiCuplikan[];
  dibuatPada: string;
  diperbaruiPada: string;
}

export interface MasukanSimpanCuplikan {
  id?: string;
  projectId?: string | null;
  judul: string;
  bahasa: BahasaCuplikan;
  kategori: string;
  kode: string;
  deskripsi: string;
  daftarTag: string[];
  favorit: boolean;
  catatanPerubahan?: string;
}
