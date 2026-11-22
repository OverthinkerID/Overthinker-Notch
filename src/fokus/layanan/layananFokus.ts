import { invoke } from "@tauri-apps/api/core";
import { z } from "zod";
import { apakahRuntimeTauriAktif } from "@/bersama/ipc/klienIpc";
import {
  SkemaPengaturanFokus,
  SkemaSesiFokusItem,
} from "@/fokus/skema/skemaFokus";
import type {
  PengaturanFokus,
  SesiFokusItem,
  TimerFokusAktif,
} from "@/fokus/tipe/tipeFokus";

const KUNCI_SESI_WEB = "overthinker_notch_focus_sessions";
const KUNCI_PENGATURAN_FOKUS = "overthinker_notch_focus_settings";
const KUNCI_TIMER_AKTIF = "overthinker_notch_focus_active_timer";

export const PENGATURAN_FOKUS_BAWAAN: PengaturanFokus = {
  menitPomodoro: 25,
  menitDeepWork: 50,
  menitKustom: 15,
  menitIstirahat: 5,
  targetMenitHarian: 120,
  notifikasiAktif: true,
  pengingatIstirahatAktif: true,
};

function bacaSesiWeb(): SesiFokusItem[] {
  if (typeof window === "undefined") return [];
  try {
    const mentah = window.localStorage.getItem(KUNCI_SESI_WEB);
    if (!mentah) return [];
    const parsed = z.array(SkemaSesiFokusItem).safeParse(JSON.parse(mentah));
    return parsed.success ? parsed.data : [];
  } catch {
    return [];
  }
}

export function ambilPengaturanFokus(): PengaturanFokus {
  if (typeof window === "undefined") return PENGATURAN_FOKUS_BAWAAN;
  try {
    const mentah = window.localStorage.getItem(KUNCI_PENGATURAN_FOKUS);
    if (!mentah) return PENGATURAN_FOKUS_BAWAAN;
    const parsed = SkemaPengaturanFokus.safeParse(JSON.parse(mentah));
    return parsed.success ? parsed.data : PENGATURAN_FOKUS_BAWAAN;
  } catch {
    return PENGATURAN_FOKUS_BAWAAN;
  }
}

export function simpanPengaturanFokus(
  pengaturan: PengaturanFokus
): PengaturanFokus {
  const valid = SkemaPengaturanFokus.parse(pengaturan);
  if (typeof window !== "undefined") {
    window.localStorage.setItem(KUNCI_PENGATURAN_FOKUS, JSON.stringify(valid));
  }
  return valid;
}

export function simpanTimerAktifLokal(timer: TimerFokusAktif): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KUNCI_TIMER_AKTIF, JSON.stringify(timer));
}

export function bacaTimerAktifLokal(): TimerFokusAktif | null {
  if (typeof window === "undefined") return null;
  try {
    const mentah = window.localStorage.getItem(KUNCI_TIMER_AKTIF);
    if (!mentah) return null;
    return JSON.parse(mentah) as TimerFokusAktif;
  } catch {
    return null;
  }
}

export async function ambilDaftarSesiFokus(): Promise<SesiFokusItem[]> {
  if (!apakahRuntimeTauriAktif()) {
    return bacaSesiWeb();
  }
  const hasil = await invoke<unknown>("daftar_sesi_fokus");
  return z.array(SkemaSesiFokusItem).parse(hasil);
}

export async function simpanSesiFokusLayanan(
  sesi: Omit<SesiFokusItem, "id"> & { id?: string }
): Promise<SesiFokusItem> {
  if (!apakahRuntimeTauriAktif()) {
    const id =
      sesi.id ??
      (typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `focus-${Date.now()}`);
    const baru: SesiFokusItem = { ...sesi, id };
    const gabungan = [baru, ...bacaSesiWeb().filter((s) => s.id !== id)].slice(
      0,
      200
    );
    if (typeof window !== "undefined") {
      window.localStorage.setItem(KUNCI_SESI_WEB, JSON.stringify(gabungan));
    }
    return baru;
  }

  const hasil = await invoke<unknown>("simpan_sesi_fokus", {
    permintaan: sesi,
  });
  return SkemaSesiFokusItem.parse(hasil);
}

export function kirimNotifikasiFokus(judul: string, isi: string): void {
  if (typeof window === "undefined" || !("Notification" in window)) return;
  if (Notification.permission === "granted") {
    new Notification(judul, { body: isi });
  }
}
