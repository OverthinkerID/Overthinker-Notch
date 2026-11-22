import { invoke } from "@tauri-apps/api/core";
import { apakahRuntimeTauriAktif } from "@/bersama/ipc/klienIpc";
import { skemaStatusIntegrasiOs } from "@/integrasi/skema/skemaIntegrasiOs";
import type { StatusIntegrasiOs } from "@/integrasi/tipe/tipeIntegrasiOs";

export async function ambilStatusIntegrasiOsLayanan(): Promise<StatusIntegrasiOs> {
  if (apakahRuntimeTauriAktif()) {
    const hasil = await invoke<unknown>("ambil_status_integrasi_os");
    return skemaStatusIntegrasiOs.parse(hasil);
  }

  const platform =
    typeof navigator !== "undefined" ? navigator.platform || "Browser" : "Browser";

  return {
    sumberData: "browser_terbatas",
    sistemOperasi: platform,
    autoStartAktif: false,
    jalurAutoStart: "Hanya tersedia di aplikasi desktop Tauri native",
    mendukungTrayMenu: false,
    mendukungPintasanGlobal: false,
    kapabilitas: [
      {
        namaFitur: "Launch at Startup (LaunchAgent / Registry)",
        status: "tidak_didukung_os",
        keterangan:
          "Browser nggak bisa menulis LaunchAgent macOS atau Registry Windows. Gunakan build desktop Tauri native.",
      },
      {
        namaFitur: "Global OS Shortcuts & Menu Bar / System Tray",
        status: "tidak_didukung_os",
        keterangan:
          "Shortcut dalam-jendela tetap aktif; shortcut OS global berjalan di runtime desktop Tauri native.",
      },
      {
        namaFitur: "Notifikasi Desktop Web",
        status:
          typeof Notification !== "undefined" ? "didukung" : "tidak_didukung_os",
        keterangan:
          "Menggunakan Web Notification API jika izin diberikan pengguna.",
      },
    ],
    catatan:
      "Mode browser menampilkan batas integrasi OS secara jujur. Jalankan via Tauri native untuk Launch at Startup, Menu Bar/Tray, dan deep-link izin OS.",
  };
}

export async function aturAutoStartOsLayanan(
  aktif: boolean
): Promise<StatusIntegrasiOs> {
  if (!apakahRuntimeTauriAktif()) {
    throw new Error(
      "Launch at Startup hanya bisa diubah saat aplikasi berjalan di runtime desktop Tauri native."
    );
  }
  const hasil = await invoke<unknown>("atur_auto_start_os", { aktif });
  return skemaStatusIntegrasiOs.parse(hasil);
}

export async function bukaPengaturanIzinOsLayanan(
  bagian: "accessibility" | "screen_recording" | "microphone" | "notifications"
): Promise<void> {
  if (!apakahRuntimeTauriAktif()) {
    throw new Error(
      "Pengaturan izin OS hanya bisa dibuka langsung dari aplikasi desktop Tauri native."
    );
  }
  await invoke("buka_pengaturan_izin_os", { bagian });
}
