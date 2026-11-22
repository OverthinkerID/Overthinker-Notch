import { z } from "zod";

export const SkemaBahasaCuplikan = z.enum([
  "html",
  "css",
  "javascript",
  "typescript",
  "python",
  "java",
  "cpp",
  "csharp",
  "sql",
  "json",
  "yaml",
  "shell",
  "rust",
  "php",
]);

export const SkemaVersiCuplikan = z.object({
  id: z.string().min(1),
  snippetId: z.string().min(1),
  nomorVersi: z.number().int().min(1),
  kode: z.string(),
  catatanPerubahan: z.string(),
  dibuatPada: z.string(),
});

export const SkemaCuplikanKodeItem = z.object({
  id: z.string().min(1),
  projectId: z.string().nullable(),
  judul: z.string().min(1),
  bahasa: SkemaBahasaCuplikan,
  kategori: z.string().min(1),
  kode: z.string(),
  deskripsi: z.string(),
  daftarTag: z.array(z.string()),
  favorit: z.boolean(),
  riwayatVersi: z.array(SkemaVersiCuplikan),
  dibuatPada: z.string(),
  diperbaruiPada: z.string(),
});

export const SkemaMasukanSimpanCuplikan = z.object({
  id: z.string().optional(),
  projectId: z.string().nullable().optional(),
  judul: z.string().trim().min(1, "Judul snippet nggak boleh kosong.").max(180),
  bahasa: SkemaBahasaCuplikan,
  kategori: z.string().trim().min(1).max(60),
  kode: z.string().max(300_000),
  deskripsi: z.string().max(1000),
  daftarTag: z.array(z.string().max(40)).max(25),
  favorit: z.boolean(),
  catatanPerubahan: z.string().max(200).optional(),
});

export const SkemaEksporCuplikan = z.object({
  aplikasi: z.string().optional(),
  modul: z.string().optional(),
  cuplikan: z.array(SkemaCuplikanKodeItem),
});
