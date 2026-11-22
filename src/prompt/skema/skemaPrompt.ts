import { z } from "zod";

export const SkemaVersiPrompt = z.object({
  id: z.string().min(1),
  promptId: z.string().min(1),
  nomorVersi: z.number().int().min(1),
  templatePrompt: z.string(),
  catatanPerubahan: z.string(),
  dibuatPada: z.string(),
});

export const SkemaPromptItem = z.object({
  id: z.string().min(1),
  projectId: z.string().nullable(),
  judul: z.string().min(1),
  kategori: z.string().min(1),
  templatePrompt: z.string().min(1),
  daftarVariabel: z.array(z.string()),
  daftarTag: z.array(z.string()),
  favorit: z.boolean(),
  riwayatVersi: z.array(SkemaVersiPrompt),
  dibuatPada: z.string(),
  diperbaruiPada: z.string(),
});

export const SkemaMasukanSimpanPrompt = z.object({
  id: z.string().optional(),
  projectId: z.string().nullable().optional(),
  judul: z.string().trim().min(1, "Judul prompt nggak boleh kosong.").max(180),
  kategori: z.string().trim().min(1).max(60),
  templatePrompt: z
    .string()
    .trim()
    .min(1, "Template prompt nggak boleh kosong.")
    .max(100_000),
  daftarTag: z.array(z.string().max(40)).max(25),
  favorit: z.boolean(),
  catatanPerubahan: z.string().max(200).optional(),
});

export const SkemaEksporPrompt = z.object({
  aplikasi: z.string().optional(),
  modul: z.string().optional(),
  prompts: z.array(SkemaPromptItem),
});
