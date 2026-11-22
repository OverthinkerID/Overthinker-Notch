import { create } from "zustand";
import {
  ambilStatusIntegrasiOsLayanan,
  aturAutoStartOsLayanan,
  bukaPengaturanIzinOsLayanan,
} from "@/integrasi/layanan/layananIntegrasiOs";
import type { StatusIntegrasiOs } from "@/integrasi/tipe/tipeIntegrasiOs";

interface KondisiTokoIntegrasiOs {
  status: StatusIntegrasiOs | null;
  sedangMemuat: boolean;
  pesanStatus: string | null;
  pesanGalat: string | null;

  muatStatus: () => Promise<void>;
  ubahAutoStart: (aktif: boolean) => Promise<void>;
  bukaPengaturanIzin: (
    bagian: "accessibility" | "screen_recording" | "microphone" | "notifications"
  ) => Promise<void>;
}

export const gunakanTokoIntegrasiOs = create<KondisiTokoIntegrasiOs>(
  (set) => ({
    status: null,
    sedangMemuat: false,
    pesanStatus: null,
    pesanGalat: null,

    muatStatus: async () => {
      set({ sedangMemuat: true, pesanGalat: null });
      try {
        const status = await ambilStatusIntegrasiOsLayanan();
        set({ status, sedangMemuat: false });
      } catch (galat) {
        set({
          sedangMemuat: false,
          pesanGalat:
            galat instanceof Error
              ? galat.message
              : "Gagal membaca status integrasi OS.",
        });
      }
    },

    ubahAutoStart: async (aktif) => {
      set({ pesanGalat: null, pesanStatus: null });
      try {
        const status = await aturAutoStartOsLayanan(aktif);
        set({
          status,
          pesanStatus: aktif
            ? "Launch at Startup diaktifkan."
            : "Launch at Startup dinonaktifkan.",
        });
      } catch (galat) {
        set({
          pesanGalat:
            galat instanceof Error
              ? galat.message
              : "Gagal mengubah pengaturan Launch at Startup.",
        });
      }
    },

    bukaPengaturanIzin: async (bagian) => {
      set({ pesanGalat: null, pesanStatus: null });
      try {
        await bukaPengaturanIzinOsLayanan(bagian);
        set({ pesanStatus: `Membuka pengaturan izin OS (${bagian})...` });
      } catch (galat) {
        set({
          pesanGalat:
            galat instanceof Error
              ? galat.message
              : "Gagal membuka pengaturan izin OS.",
        });
      }
    },
  })
);
