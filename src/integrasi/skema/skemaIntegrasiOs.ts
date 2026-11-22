import { z } from "zod";

export const skemaItemKapabilitasOs = z.object({
  namaFitur: z.string(),
  status: z.enum([
    "didukung",
    "perlu_izin",
    "penyedia_belum_dikonfigurasi",
    "tidak_didukung_os",
  ]),
  keterangan: z.string(),
});

export const skemaStatusIntegrasiOs = z.object({
  sumberData: z.enum(["tauri_os_nyata", "browser_terbatas"]),
  sistemOperasi: z.string(),
  autoStartAktif: z.boolean(),
  jalurAutoStart: z.string(),
  mendukungTrayMenu: z.boolean(),
  mendukungPintasanGlobal: z.boolean(),
  kapabilitas: z.array(skemaItemKapabilitasOs),
  catatan: z.string(),
});
