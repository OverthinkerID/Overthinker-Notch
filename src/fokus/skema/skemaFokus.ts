import { z } from "zod";

export const SkemaModeFokus = z.enum([
  "pomodoro",
  "deep_work",
  "kustom",
  "stopwatch",
]);

export const SkemaSesiFokusItem = z.object({
  id: z.string().min(1),
  projectId: z.string().nullable(),
  modeFokus: SkemaModeFokus,
  label: z.string(),
  targetDetik: z.number().int().min(0),
  durasiAktualDetik: z.number().int().min(0),
  status: z.enum(["berjalan", "dijeda", "selesai", "dibatalkan"]),
  mulaiPada: z.string(),
  selesaiPada: z.string().nullable(),
});

export const SkemaPengaturanFokus = z.object({
  menitPomodoro: z.number().int().min(1).max(180),
  menitDeepWork: z.number().int().min(5).max(240),
  menitKustom: z.number().int().min(1).max(240),
  menitIstirahat: z.number().int().min(1).max(60),
  targetMenitHarian: z.number().int().min(10).max(720),
  notifikasiAktif: z.boolean(),
  pengingatIstirahatAktif: z.boolean(),
});
