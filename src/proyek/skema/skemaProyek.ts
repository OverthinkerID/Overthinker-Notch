import { z } from "zod";
import {
  PRIORITAS_TUGAS,
  STATUS_PROYEK,
  STATUS_TUGAS,
} from "@/proyek/tipe/tipeProyek";

export const skemaSimpanWorkspace = z.object({
  id: z.string().optional(),
  nama: z
    .string()
    .trim()
    .min(1, "Nama workspace nggak boleh kosong.")
    .max(120, "Nama workspace maksimal 120 karakter."),
  deskripsi: z.string().max(500).default(""),
  ikon: z.string().trim().min(1).default("layers"),
  warna: z.string().trim().min(4).default("#55A7FF"),
});

export const skemaSimpanProyek = z.object({
  id: z.string().optional(),
  workspaceId: z.string().trim().min(1, "Workspace wajib dipilih."),
  nama: z
    .string()
    .trim()
    .min(1, "Nama proyek nggak boleh kosong.")
    .max(140, "Nama proyek maksimal 140 karakter."),
  deskripsi: z.string().max(1000).default(""),
  status: z.enum(STATUS_PROYEK).default("aktif"),
  warna: z.string().trim().min(4).default("#55A7FF"),
  progresPersen: z.number().int().min(0).max(100).optional(),
  diarsipkan: z.boolean().default(false),
});

export const skemaSimpanTugas = z.object({
  id: z.string().optional(),
  projectId: z.string().trim().min(1, "Proyek wajib dipilih."),
  judul: z
    .string()
    .trim()
    .min(1, "Judul tugas nggak boleh kosong.")
    .max(200, "Judul tugas maksimal 200 karakter."),
  deskripsi: z.string().max(1000).default(""),
  status: z.enum(STATUS_TUGAS).default("todo"),
  prioritas: z.enum(PRIORITAS_TUGAS).default("sedang"),
  tenggatPada: z.string().nullable().optional(),
  urutan: z.number().int().min(0).optional(),
});
