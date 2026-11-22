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
      versiAplikasi: "0.2.0",
      sistemOperasi: "Pratinjau Peramban Web (Non-Native)",
      arsitekturCpu: "Tidak tersedia di mode peramban",
      waktuServerUtc: new Date().toISOString(),
      modeRuntime: "Pratinjau Web Vite (Inti Rust Tauri Belum Aktif)",
      kapabilitas: [
        {
          namaFitur: "Perintah IPC Rust Tauri 2",
          status: "tidak_didukung_os",
          keterangan:
            "Jalankan melalui `npm run tauri dev` setelah Rust/Cargo terpasang untuk mengakses API native OS.",
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
        "Antarmuka web aktif dalam mode pratinjau lokal; runtime native Rust belum terhubung.",
      waktuPeriksaUtc: new Date().toISOString(),
    };
  }

  const hasilMentah = await invoke<unknown>("periksa_kesehatan_aplikasi");
  return SkemaStatusKesehatan.parse(hasilMentah);
}
