import { z } from "zod";

export const skemaTelemetriSistem = z.object({
  sumberData: z.enum(["tauri_os_nyata", "browser_terbatas"]),
  sistemOperasi: z.string(),
  arsitektur: z.string(),
  namaHost: z.string(),
  modelCpu: z.string().nullable(),
  jumlahCoreCpu: z.number().nullable(),
  penggunaanCpuPersen: z.number().nullable(),
  ramTerpakaiMb: z.number().nullable(),
  ramTotalMb: z.number().nullable(),
  diskTerpakaiGb: z.number().nullable(),
  diskTotalGb: z.number().nullable(),
  persenBaterai: z.number().nullable(),
  sedangMengisiDaya: z.boolean().nullable(),
  uptimeDetik: z.number().nullable(),
  catatanKejujuran: z.string(),
  diambilPada: z.string(),
});
