import { z } from "zod";

export const SkemaModeTampilanNotch = z.enum([
  "notch_adaptif",
  "pulau_melayang",
]);

export const SkemaStatusInteraksiNotch = z.enum([
  "siaga",
  "ringkas",
  "diperluas",
  "musik",
  "catatan",
  "kode",
  "berkas",
  "fokus",
  "dasbor",
]);

export const SkemaInfoMonitor = z.object({
  idMonitor: z.string(),
  nama: z.string(),
  lebarLogis: z.number().positive(),
  tinggiLogis: z.number().positive(),
  posisiX: z.number(),
  posisiY: z.number(),
  faktorSkala: z.number().positive(),
  utama: z.boolean(),
  dukunganNotch: z.boolean(),
  tinggiAreaAmanAtas: z.number().min(0),
});

export const SkemaGeometriPulau = z.object({
  posisiX: z.number().finite(),
  posisiY: z.number().finite(),
  lebarDiperluas: z.number().min(420).max(1280),
  tinggiDiperluas: z.number().min(260).max(860),
});

export const SkemaPreferensiNotch = z.object({
  modeDiminta: SkemaModeTampilanNotch,
  selaluDiAtas: z.boolean(),
  idMonitorAktif: z.string().nullable(),
  geometriPulau: SkemaGeometriPulau,
});

export type PreferensiNotchTersimpan = z.infer<typeof SkemaPreferensiNotch>;
