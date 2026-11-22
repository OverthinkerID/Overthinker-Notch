import { z } from "zod";

export const SkemaInfoMonitor = z.object({
  idMonitor: z.string(),
  nama: z.string(),
  lebarLogis: z.number().positive(),
  tinggiLogis: z.number().positive(),
  posisiX: z.number().finite(),
  posisiY: z.number().finite(),
  faktorSkala: z.number().positive(),
  utama: z.boolean(),
  dukunganNotch: z.boolean(),
  tinggiAreaAmanAtas: z.number().min(0),
});

export const SkemaGeometriPulau = z.object({
  posisiX: z.number().finite(),
  posisiY: z.number().finite(),
  lebarDiperluas: z.number().min(320).max(1280),
  tinggiDiperluas: z.number().min(120).max(860),
});

export const SkemaPengaturanUkuranAdaptif = z.object({
  modeUkuran: z.enum(["mini", "compact", "expanded", "custom"]).default("compact"),
  lebarKustom: z.number().min(280).max(1280).default(720),
  tinggiKustom: z.number().min(48).max(860).default(420),
  ukuranMaskotPx: z.number().min(24).max(96).default(40),
  posisiMaskot: z.enum(["kiri", "kanan"]).default("kiri"),
  kepadatanKonten: z.enum(["ringkas", "standar", "lega"]).default("standar"),
  skalaAnimasi: z.number().min(0.5).max(1.5).default(1),
  autoExpand: z.boolean().default(true),
  profilOs: z.enum(["macos", "windows"]).default("macos"),
});

export const SkemaPreferensiNotch = z.object({
  modeDiminta: z.enum(["notch_adaptif", "pulau_melayang"]),
  selaluDiAtas: z.boolean(),
  idMonitorAktif: z.string().nullable(),
  geometriPulau: SkemaGeometriPulau,
  ukuranAdaptif: SkemaPengaturanUkuranAdaptif.optional(),
});

export type PreferensiNotchTersimpan = z.infer<typeof SkemaPreferensiNotch>;
