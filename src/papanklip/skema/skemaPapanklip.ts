import { z } from "zod";

export const SkemaTipeKontenPapanklip = z.enum([
  "teks",
  "kode",
  "url",
  "gambar",
]);

export const SkemaItemPapanklip = z.object({
  id: z.string().min(1),
  tipeKonten: SkemaTipeKontenPapanklip,
  kontenTeks: z.string().nullable(),
  pathAsetRelatif: z.string().nullable(),
  pratinjauGambarDataUrl: z.string().nullable().optional(),
  aplikasiSumber: z.string(),
  disematkan: z.boolean(),
  hashKonten: z.string(),
  kedaluwarsaPada: z.string().nullable(),
  dibuatPada: z.string(),
});

export const SkemaPengaturanPapanklip = z.object({
  filterSensitifAktif: z.boolean(),
  aplikasiDikecualikan: z.array(z.string().min(1)).max(50),
  hariRetensi: z.number().int().min(1).max(365),
  maksimalItem: z.number().int().min(10).max(1000),
});
