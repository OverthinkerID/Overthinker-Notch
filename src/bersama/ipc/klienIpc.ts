import { invoke } from "@tauri-apps/api/core";
import { z } from "zod";

export const SkemaStatusKapabilitas = z.enum([
  "didukung",
  "perlu_izin",
  "penyedia_belum_dikonfigurasi",
  "tidak_didukung_os",
]);

export const SkemaLaporanKapabilitas = z.object({
  namaFitur: z.string(),
  status: SkemaStatusKapabilitas,
  keterangan: z.string(),
});

export const SkemaInfoRuntimeSistem = z.object({
  namaAplikasi: z.string(),
  versiAplikasi: z.string(),
  sistemOperasi: z.string(),
  arsitekturCpu: z.string(),
  waktuServerUtc: z.string(),
  modeRuntime: z.string(),
  kapabilitas: z.array(SkemaLaporanKapabilitas),
});

export const SkemaStatusKesehatan = z.object({
  sehat: z.boolean(),
  pesan: z.string(),
  waktuPeriksaUtc: z.string(),
});

export type StatusKapabilitas = z.infer<typeof SkemaStatusKapabilitas>;
export type LaporanKapabilitas = z.infer<typeof SkemaLaporanKapabilitas>;
export type InfoRuntimeSistem = z.infer<typeof SkemaInfoRuntimeSistem>;
export type StatusKesehatan = z.infer<typeof SkemaStatusKesehatan>;

export function apakahRuntimeTauriAktif(): boolean {
  if (typeof window === "undefined") {
    return false;
  }
  return "__TAURI_INTERNALS__" in window;
}

export async function ambilInfoRuntime(): Promise<InfoRuntimeSistem> {
  if (!apakahRuntimeTauriAktif()) {
    return {
      namaAplikasi: "Overthinker Notch",
      versiAplikasi: "0.4.0",
      sistemOperasi: "Web Preview (Non-Native)",
      arsitekturCpu: "Nggak tersedia di mode browser",
      waktuServerUtc: new Date().toISOString(),
      modeRuntime: "Web Preview Vite (Rust Tauri belum aktif)",
      kapabilitas: [
        {
          namaFitur: "Tauri 2 Rust IPC",
          status: "tidak_didukung_os",
          keterangan:
            "Jalankan pakai `npm run tauri dev` setelah Rust/Cargo terpasang buat akses API native OS.",
        },
      ],
    };
  }

  const hasilMentah = await invoke<unknown>("ambil_info_runtime");
  return SkemaInfoRuntimeSistem.parse(hasilMentah);
}

export async function periksaKesehatanAplikasi(): Promise<StatusKesehatan> {
  if (!apakahRuntimeTauriAktif()) {
    return {
      sehat: true,
      pesan:
        "UI jalan di mode Web Preview lokal; runtime native Rust belum tersambung.",
      waktuPeriksaUtc: new Date().toISOString(),
    };
  }

  const hasilMentah = await invoke<unknown>("periksa_kesehatan_aplikasi");
  return SkemaStatusKesehatan.parse(hasilMentah);
}
