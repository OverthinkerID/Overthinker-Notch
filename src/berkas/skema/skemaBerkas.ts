import { z } from "zod";

export const SkemaBerkasItem = z.object({
  id: z.string().min(1),
  projectId: z.string().nullable(),
  namaAsli: z.string().min(1),
  namaTampil: z.string().min(1),
  pathRelatifVault: z.string().min(1),
  tipeMime: z.string(),
  ukuranByte: z.number().min(0),
  checksumSha256: z.string(),
  kedaluwarsaPada: z.string().nullable(),
  dihapusPada: z.string().nullable(),
  dibuatPada: z.string(),
  diperbaruiPada: z.string(),
  pratinjauTeks: z.string().nullable().optional(),
  pratinjauDataUrl: z.string().nullable().optional(),
});

export const SkemaNamaBerkasBaru = z
  .string()
  .trim()
  .min(1, "Nama file nggak boleh kosong.")
  .max(180, "Nama file maksimal 180 karakter.");
