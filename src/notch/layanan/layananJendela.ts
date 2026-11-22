import { invoke } from "@tauri-apps/api/core";
import { z } from "zod";
import { apakahRuntimeTauriAktif } from "@/bersama/ipc/klienIpc";
import { SkemaInfoMonitor } from "@/notch/skema/skemaNotch";
import type { InfoMonitor } from "@/notch/tipe/tipeNotch";

const SkemaDaftarMonitor = z.array(SkemaInfoMonitor);

export function buatMonitorDariViewport(): InfoMonitor {
  const lebar = typeof window !== "undefined" ? Math.max(window.innerWidth, 640) : 1440;
  const tinggi = typeof window !== "undefined" ? Math.max(window.innerHeight, 480) : 900;
  const skala = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;

  return {
    idMonitor: "layar-pratinjau-web",
    nama: "Layar Pratinjau Web",
    lebarLogis: lebar,
    tinggiLogis: tinggi,
    posisiX: 0,
    posisiY: 0,
    faktorSkala: skala,
    utama: true,
    dukunganNotch: false,
    tinggiAreaAmanAtas: 16,
  };
}

export async function ambilDaftarMonitorAktif(): Promise<InfoMonitor[]> {
  if (!apakahRuntimeTauriAktif()) {
    return [buatMonitorDariViewport()];
  }

  const hasilMentah = await invoke<unknown>("ambil_daftar_monitor");
  const tervalidasi = SkemaDaftarMonitor.parse(hasilMentah);
  return tervalidasi.length > 0 ? tervalidasi : [buatMonitorDariViewport()];
}

export async function terapkanGeometriKeOs(params: {
  lebar: number;
  tinggi: number;
  posisiX: number;
  posisiY: number;
  selaluDiAtas: boolean;
}): Promise<boolean> {
  if (!apakahRuntimeTauriAktif()) {
    return false;
  }

  await invoke("terapkan_geometri_jendela", {
    permintaan: {
      lebar: params.lebar,
      tinggi: params.tinggi,
      posisiX: params.posisiX,
      posisiY: params.posisiY,
      selaluDiAtas: params.selaluDiAtas,
    },
  });
  return true;
}

export function pantauPerubahanLayar(saatBerubah: () => void): () => void {
  if (typeof window === "undefined") {
    return () => {};
  }

  const penangan = () => saatBerubah();
  window.addEventListener("resize", penangan);
  return () => {
    window.removeEventListener("resize", penangan);
  };
}
