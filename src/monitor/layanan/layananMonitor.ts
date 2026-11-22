import { invoke } from "@tauri-apps/api/core";
import { apakahRuntimeTauriAktif } from "@/bersama/ipc/klienIpc";
import { skemaTelemetriSistem } from "@/monitor/skema/skemaMonitor";
import type { TelemetriSistem } from "@/monitor/tipe/tipeMonitor";

interface NavigatorExtended extends Navigator {
  deviceMemory?: number;
  getBattery?: () => Promise<{
    level: number;
    charging: boolean;
  }>;
}

export async function ambilTelemetriSistemLayanan(): Promise<TelemetriSistem> {
  if (apakahRuntimeTauriAktif()) {
    const hasil = await invoke<unknown>("ambil_telemetri_sistem");
    return skemaTelemetriSistem.parse(hasil);
  }

  const nav =
    typeof navigator !== "undefined" ? (navigator as NavigatorExtended) : null;

  let persenBaterai: number | null = null;
  let sedangMengisiDaya: boolean | null = null;
  if (nav && typeof nav.getBattery === "function") {
    try {
      const batt = await nav.getBattery();
      persenBaterai = Math.round(batt.level * 100);
      sedangMengisiDaya = batt.charging;
    } catch {
      // Browser memblokir akses Battery API
    }
  }

  const ramTotalMb =
    nav && typeof nav.deviceMemory === "number"
      ? Math.round(nav.deviceMemory * 1024)
      : null;

  return {
    sumberData: "browser_terbatas",
    sistemOperasi: nav?.platform || "Browser",
    arsitektur: "Web Runtime",
    namaHost:
      typeof window !== "undefined" ? window.location.hostname || "localhost" : "localhost",
    modelCpu: null,
    jumlahCoreCpu:
      nav && typeof nav.hardwareConcurrency === "number"
        ? nav.hardwareConcurrency
        : null,
    penggunaanCpuPersen: null,
    ramTerpakaiMb: null,
    ramTotalMb,
    diskTerpakaiGb: null,
    diskTotalGb: null,
    persenBaterai,
    sedangMengisiDaya,
    uptimeDetik: null,
    catatanKejujuran:
      "Mode browser hanya menampilkan API web nyata (CPU cores, RAM estimasi browser, & Battery API jika didukung). Untuk CPU %, RAM terpakai, Disk, dan Uptime OS penuh, jalankan lewat aplikasi desktop Tauri native.",
    diambilPada: new Date().toISOString(),
  };
}
