import { z } from "zod";

export const SkemaInfoTrekAktif = z.object({
  sedangMemutar: z.boolean(),
  judulLagu: z.string().nullable(),
  artis: z.string().nullable(),
  album: z.string().nullable(),
  sumberAudio: z.string(),
  durasiDetik: z.number().int().min(0),
  posisiDetik: z.number().int().min(0),
  urlArtwork: z.string().nullable(),
  kontrolDidukung: z.boolean(),
});

export const SkemaRiwayatMusikItem = z.object({
  id: z.string().min(1),
  judulLagu: z.string().min(1),
  artis: z.string().min(1),
  album: z.string(),
  sumberAudio: z.string(),
  durasiDetik: z.number().int().min(0),
  pathArtworkRelatif: z.string().nullable(),
  diputarPada: z.string(),
});

export const SkemaKonfigurasiPengenalLagu = z.object({
  jenisPenyedia: z.enum(["belum_diatur", "audd", "acrcloud", "kustom"]),
  endpointUrl: z.string().max(300),
  apiTokenTersimpan: z.boolean(),
});
