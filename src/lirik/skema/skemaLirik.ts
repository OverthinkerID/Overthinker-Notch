import { z } from "zod";

export const SkemaLirikTersimpanItem = z.object({
  id: z.string().min(1),
  judulLagu: z.string().min(1),
  artis: z.string().min(1),
  penyedia: z.string().min(1),
  bahasa: z.string().min(1),
  teksLirik: z.string().min(1),
  tersinkronisasi: z.boolean(),
  terjemahan: z.string().nullable(),
  diperbaruiPada: z.string(),
});

export const SkemaMasukanSimpanLirik = z.object({
  id: z.string().optional(),
  judulLagu: z.string().trim().min(1, "Judul lagu nggak boleh kosong.").max(180),
  artis: z.string().trim().min(1, "Nama artis nggak boleh kosong.").max(180),
  penyedia: z.string().trim().min(1).max(80),
  bahasa: z.string().trim().min(1).max(20),
  teksLirik: z.string().trim().min(1, "Teks lirik nggak boleh kosong.").max(100_000),
  terjemahan: z.string().nullable().optional(),
});

export const SkemaKonfigurasiPenyediaLirik = z.object({
  jenisPenyedia: z.enum([
    "belum_diatur",
    "musixmatch_authorized",
    "lrclib_authorized",
    "kustom",
  ]),
  endpointUrl: z.string().max(300),
  kredensialTersimpan: z.boolean(),
});
