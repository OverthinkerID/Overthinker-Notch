import { create } from "zustand";
import {
  ambilDaftarSesiFokus,
  ambilPengaturanFokus,
  bacaTimerAktifLokal,
  kirimNotifikasiFokus,
  simpanPengaturanFokus,
  simpanSesiFokusLayanan,
  simpanTimerAktifLokal,
} from "@/fokus/layanan/layananFokus";
import type {
  ModeFokus,
  PengaturanFokus,
  SesiFokusItem,
  TimerFokusAktif,
} from "@/fokus/tipe/tipeFokus";
import { hitungDetikBerjalan } from "@/fokus/utilitas/waktuFokus";

function targetDetikUntukMode(
  mode: ModeFokus,
  pengaturan: PengaturanFokus
): number {
  switch (mode) {
    case "pomodoro":
      return pengaturan.menitPomodoro * 60;
    case "deep_work":
      return pengaturan.menitDeepWork * 60;
    case "kustom":
      return pengaturan.menitKustom * 60;
    case "stopwatch":
      return 0;
  }
}

interface KondisiTokoFokus {
  pengaturan: PengaturanFokus;
  timer: TimerFokusAktif;
  riwayatSesi: SesiFokusItem[];
  pesanStatus: string | null;

  muatFokus: () => Promise<void>;
  pilihMode: (mode: ModeFokus) => void;
  aturLabel: (label: string) => void;
  mulaiAtauLanjutkan: () => void;
  jedaTimer: () => void;
  resetTimer: () => void;
  selesaikanSesiSekarang: (
    status?: "selesai" | "dibatalkan",
    sekarangMs?: number
  ) => Promise<void>;
  mulaiIstirahat: () => void;
  perbaruiPengaturan: (baru: PengaturanFokus) => void;
  periksaPenyelesaianOtomatis: (sekarangMs?: number) => Promise<void>;
}

export const gunakanTokoFokus = create<KondisiTokoFokus>((set, get) => {
  const pengaturanAwal = ambilPengaturanFokus();
  const timerTersimpan = bacaTimerAktifLokal();
  const timerAwal: TimerFokusAktif = timerTersimpan ?? {
    mode: "pomodoro",
    label: "",
    targetDetik: pengaturanAwal.menitPomodoro * 60,
    status: "siaga",
    waktuMulaiMs: null,
    akumulasiDetikSebelumJeda: 0,
    mulaiPadaIso: null,
  };

  return {
    pengaturan: pengaturanAwal,
    timer: timerAwal,
    riwayatSesi: [],
    pesanStatus: null,

    muatFokus: async () => {
      const riwayatSesi = await ambilDaftarSesiFokus();
      set({
        riwayatSesi,
        pengaturan: ambilPengaturanFokus(),
      });
    },

    pilihMode: (mode) => {
      const { pengaturan, timer } = get();
      if (timer.status === "berjalan" || timer.status === "istirahat") return;
      const baru: TimerFokusAktif = {
        mode,
        label: timer.label,
        targetDetik: targetDetikUntukMode(mode, pengaturan),
        status: "siaga",
        waktuMulaiMs: null,
        akumulasiDetikSebelumJeda: 0,
        mulaiPadaIso: null,
      };
      simpanTimerAktifLokal(baru);
      set({ timer: baru, pesanStatus: null });
    },

    aturLabel: (label) => {
      const baru = { ...get().timer, label };
      simpanTimerAktifLokal(baru);
      set({ timer: baru });
    },

    mulaiAtauLanjutkan: () => {
      const sekarang = Date.now();
      const { timer } = get();
      const baru: TimerFokusAktif = {
        ...timer,
        status: timer.status === "istirahat" ? "istirahat" : "berjalan",
        waktuMulaiMs: sekarang,
        mulaiPadaIso: timer.mulaiPadaIso ?? new Date(sekarang).toISOString(),
      };
      simpanTimerAktifLokal(baru);
      set({ timer: baru, pesanStatus: "Sesi fokus berjalan." });
    },

    jedaTimer: () => {
      const { timer } = get();
      if (timer.status !== "berjalan" && timer.status !== "istirahat") return;
      const akumulasi = hitungDetikBerjalan(timer, Date.now());
      const baru: TimerFokusAktif = {
        ...timer,
        status: "dijeda",
        waktuMulaiMs: null,
        akumulasiDetikSebelumJeda: akumulasi,
      };
      simpanTimerAktifLokal(baru);
      set({ timer: baru, pesanStatus: "Timer dijeda." });
    },

    resetTimer: () => {
      const { pengaturan, timer } = get();
      const baru: TimerFokusAktif = {
        mode: timer.mode,
        label: timer.label,
        targetDetik: targetDetikUntukMode(timer.mode, pengaturan),
        status: "siaga",
        waktuMulaiMs: null,
        akumulasiDetikSebelumJeda: 0,
        mulaiPadaIso: null,
      };
      simpanTimerAktifLokal(baru);
      set({ timer: baru, pesanStatus: null });
    },

    selesaikanSesiSekarang: async (
      status = "selesai",
      sekarangMs = Date.now()
    ) => {
      const { timer, pengaturan } = get();
      const durasi = hitungDetikBerjalan(timer, sekarangMs);

      if (timer.status !== "istirahat" && durasi > 0) {
        await simpanSesiFokusLayanan({
          projectId: null,
          modeFokus: timer.mode,
          label: timer.label.trim() || `Sesi ${timer.mode}`,
          targetDetik: timer.targetDetik,
          durasiAktualDetik: durasi,
          status,
          mulaiPada: timer.mulaiPadaIso ?? new Date(sekarangMs).toISOString(),
          selesaiPada: new Date(sekarangMs).toISOString(),
        });
      }

      if (status === "selesai" && pengaturan.notifikasiAktif) {
        kirimNotifikasiFokus(
          "Overthinker Notch — Sesi Fokus Selesai",
          pengaturan.pengingatIstirahatAktif
            ? `Mantap! Waktunya istirahat ${pengaturan.menitIstirahat} menit.`
            : "Sesi fokus kamu sudah tercatat."
        );
      }

      const riwayatSesi = await ambilDaftarSesiFokus();
      const timerSiaga: TimerFokusAktif = {
        mode: timer.mode,
        label: timer.label,
        targetDetik: targetDetikUntukMode(timer.mode, pengaturan),
        status: "siaga",
        waktuMulaiMs: null,
        akumulasiDetikSebelumJeda: 0,
        mulaiPadaIso: null,
      };
      simpanTimerAktifLokal(timerSiaga);
      set({
        timer: timerSiaga,
        riwayatSesi,
        pesanStatus:
          status === "selesai"
            ? "Sesi fokus selesai dan tersimpan! Jangan lupa istirahat sebentar."
            : "Sesi dibatalkan.",
      });
    },

    mulaiIstirahat: () => {
      const { pengaturan, timer } = get();
      const sekarang = Date.now();
      const baru: TimerFokusAktif = {
        mode: timer.mode,
        label: "Istirahat",
        targetDetik: pengaturan.menitIstirahat * 60,
        status: "istirahat",
        waktuMulaiMs: sekarang,
        akumulasiDetikSebelumJeda: 0,
        mulaiPadaIso: new Date(sekarang).toISOString(),
      };
      simpanTimerAktifLokal(baru);
      set({
        timer: baru,
        pesanStatus: `Mode istirahat ${pengaturan.menitIstirahat} menit dimulai.`,
      });
    },

    perbaruiPengaturan: (baru) => {
      const tersimpan = simpanPengaturanFokus(baru);
      const { timer } = get();
      const timerBaru =
        timer.status === "siaga"
          ? {
              ...timer,
              targetDetik: targetDetikUntukMode(timer.mode, tersimpan),
            }
          : timer;
      simpanTimerAktifLokal(timerBaru);
      set({
        pengaturan: tersimpan,
        timer: timerBaru,
        pesanStatus: "Pengaturan Focus Mode tersimpan.",
      });
    },

    periksaPenyelesaianOtomatis: async (sekarangMs = Date.now()) => {
      const { timer } = get();
      if (timer.status !== "berjalan" && timer.status !== "istirahat") return;
      if (timer.mode === "stopwatch" && timer.status !== "istirahat") return;

      const berjalan = hitungDetikBerjalan(timer, sekarangMs);
      if (timer.targetDetik > 0 && berjalan >= timer.targetDetik) {
        await get().selesaikanSesiSekarang("selesai", sekarangMs);
      }
    },
  };
});
