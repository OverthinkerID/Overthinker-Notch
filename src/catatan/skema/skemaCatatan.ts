import { z } from "zod";

export const SkemaFormatCatatan = z.enum([
  "markdown",
  "rich_text",
  "checklist",
]);

export const SkemaCatatanItem = z.object({
  id: z.string().min(1),
  projectId: z.string().nullable(),
  judul: z.string(),
  kontenMarkdown: z.string(),
  formatKonten: SkemaFormatCatatan,
  disematkan: z.boolean(),
  diarsipkan: z.boolean(),
  daftarTag: z.array(z.string()),
  dibuatPada: z.string(),
  diperbaruiPada: z.string(),
});

export const SkemaMasukanSimpanCatatan = z
  .object({
    id: z.string().optional(),
    projectId: z.string().nullable().optional(),
    judul: z.string().max(240),
    kontenMarkdown: z.string().max(200_000),
    formatKonten: SkemaFormatCatatan,
    disematkan: z.boolean(),
    diarsipkan: z.boolean(),
    daftarTag: z.array(z.string().max(40)).max(30),
  })
  .refine(
    (data) =>
      data.judul.trim().length > 0 || data.kontenMarkdown.trim().length > 0,
    {
      message: "Judul atau isi catatan nggak boleh kosong semua.",
    }
  );
