import { create } from "zustand";
import {
  ambilDaftarBackup,
  ambilKebijakanRetensi,
  ambilRingkasanDatabase,
  buatBackupManual,
  jalankanIntegrityCheck,
  jalankanPembersihanRetensi,
  KEBIJAKAN_RETENSI_BAWAAN,
  simpanKebijakanRetensi,
} from "@/database/layanan/layananDatabase";
import type {
  CatatanBackup,
  HasilIntegrityCheck,
  HasilPembersihanRetensi,
  KebijakanRetensi,
  RingkasanDatabase,
} from "@/database/tipe/tipeDatabase";

interface KondisiTokoDatabase {
  ringkasan: RingkasanDatabase | null;
  hasilIntegrity: HasilIntegrityCheck | null;
  daftarBackup: CatatanBackup[];
  kebijakanRetensi: KebijakanRetensi;
  hasilPembersihan: HasilPembersihanRetensi | null;
  sedangMemuat: boolean;
  pesanStatus: string | null;
  pesanGalat: string | null;

  muatSemuaDataDatabase: () => Promise<void>;
  cekIntegritas: () => Promise<void>;
  tambahBackupManual: (catatan: string) => Promise<void>;
  perbaruiKebijakanRetensi: (kebijakanBaru: KebijakanRetensi) => Promise<void>;
  bersihkanDataKedaluwarsa: () => Promise<void>;
}

export const gunakanTokoDatabase = create<KondisiTokoDatabase>((set, get) => ({
  ringkasan: null,
  hasilIntegrity: null,
  daftarBackup: [],
  kebijakanRetensi: KEBIJAKAN_RETENSI_BAWAAN,
  hasilPembersihan: null,
  sedangMemuat: false,
  pesanStatus: null,
  pesanGalat: null,

  muatSemuaDataDatabase: async () => {
    set({ sedangMemuat: true, pesanGalat: null });
    try {
      const [ringkasan, daftarBackup, kebijakanRetensi] = await Promise.all([
        ambilRingkasanDatabase(),
        ambilDaftarBackup(),
        ambilKebijakanRetensi(),
      ]);
      set({
        ringkasan,
        daftarBackup,
        kebijakanRetensi,
        sedangMemuat: false,
      });
    } catch (galat) {
      set({
        sedangMemuat: false,
        pesanGalat:
          galat instanceof Error ? galat.message : "Gagal memuat data database.",
      });
    }
  },

  cekIntegritas: async () => {
    set({ sedangMemuat: true, pesanGalat: null });
    try {
      const hasil = await jalankanIntegrityCheck();
      set({
        hasilIntegrity: hasil,
        sedangMemuat: false,
        pesanStatus: hasil.sehat
          ? "Integrity Check beres: database aman."
          : "Integrity Check nemu masalah di database.",
      });
    } catch (galat) {
      set({
        sedangMemuat: false,
        pesanGalat:
          galat instanceof Error ? galat.message : "Integrity Check gagal jalan.",
      });
    }
  },

  tambahBackupManual: async (catatan) => {
    set({ sedangMemuat: true, pesanGalat: null });
    try {
      await buatBackupManual(catatan);
      await get().muatSemuaDataDatabase();
      set({
        pesanStatus: "Backup manual berhasil disimpan.",
      });
    } catch (galat) {
      set({
        sedangMemuat: false,
        pesanGalat:
          galat instanceof Error ? galat.message : "Gagal bikin backup manual.",
      });
    }
  },

  perbaruiKebijakanRetensi: async (kebijakanBaru) => {
    set({ sedangMemuat: true, pesanGalat: null });
    try {
      const tersimpan = await simpanKebijakanRetensi(kebijakanBaru);
      set({
        kebijakanRetensi: tersimpan,
        sedangMemuat: false,
        pesanStatus: "Pengaturan retensi berhasil disimpan.",
      });
    } catch (galat) {
      set({
        sedangMemuat: false,
        pesanGalat:
          galat instanceof Error
            ? galat.message
            : "Gagal simpan pengaturan retensi.",
      });
    }
  },

  bersihkanDataKedaluwarsa: async () => {
    set({ sedangMemuat: true, pesanGalat: null });
    try {
      const hasil = await jalankanPembersihanRetensi();
      await get().muatSemuaDataDatabase();
      set({
        hasilPembersihan: hasil,
        pesanStatus: `Cleanup selesai (${hasil.clipboardDihapus} clipboard, ${hasil.backupLamaDihapus} backup lama).`,
      });
    } catch (galat) {
      set({
        sedangMemuat: false,
        pesanGalat:
          galat instanceof Error ? galat.message : "Cleanup data gagal.",
      });
    }
  },
}));
