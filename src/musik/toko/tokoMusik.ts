import { create } from "zustand";
import {
  ambilKapabilitasMusikLayanan,
  ambilKonfigPengenalLagu,
  ambilRiwayatMusikLayanan,
  ambilStatusMusikAktif,
  identifikasiLewatMikrofonLayanan,
  kirimKontrolMediaLayanan,
  simpanKonfigPengenalLagu,
  simpanRiwayatMusikLayanan,
} from "@/musik/layanan/layananMusik";
import type {
  AksiKontrolMedia,
  InfoTrekAktif,
  KapabilitasMusik,
  KonfigurasiPengenalLagu,
  RiwayatMusikItem,
} from "@/musik/tipe/tipeMusik";

interface KondisiTokoMusik {
  trekAktif: InfoTrekAktif;
  kapabilitas: KapabilitasMusik[];
  riwayatMusik: RiwayatMusikItem[];
  konfigPengenal: KonfigurasiPengenalLagu;
  sedangMemuat: boolean;
  pesanStatus: string | null;
  pesanGalat: string | null;

  muatSemuaMusik: () => Promise<void>;
  segarkanStatusMusik: () => Promise<void>;
  kontrolMedia: (aksi: AksiKontrolMedia) => Promise<void>;
  catatLaguKeRiwayat: (masukan: {
    judulLagu: string;
    artis: string;
    album: string;
    sumberAudio: string;
    durasiDetik: number;
  }) => Promise<void>;
  perbaruiKonfigPengenal: (konfig: KonfigurasiPengenalLagu) => void;
  ujiIdentifikasiMikrofon: () => Promise<void>;
}

const TREK_SIAGA_AWAL: InfoTrekAktif = {
  sedangMemutar: false,
  judulLagu: null,
  artis: null,
  album: null,
  sumberAudio: "Belum terhubung",
  durasiDetik: 0,
  posisiDetik: 0,
  urlArtwork: null,
  kontrolDidukung: false,
};

export const gunakanTokoMusik = create<KondisiTokoMusik>((set, get) => ({
  trekAktif: TREK_SIAGA_AWAL,
  kapabilitas: [],
  riwayatMusik: [],
  konfigPengenal: ambilKonfigPengenalLagu(),
  sedangMemuat: false,
  pesanStatus: null,
  pesanGalat: null,

  muatSemuaMusik: async () => {
    set({ sedangMemuat: true, pesanGalat: null });
    try {
      const [trekAktif, kapabilitas, riwayatMusik] = await Promise.all([
        ambilStatusMusikAktif(),
        ambilKapabilitasMusikLayanan(),
        ambilRiwayatMusikLayanan(),
      ]);
      set({
        trekAktif,
        kapabilitas,
        riwayatMusik,
        konfigPengenal: ambilKonfigPengenalLagu(),
        sedangMemuat: false,
      });
    } catch (galat) {
      set({
        sedangMemuat: false,
        pesanGalat:
          galat instanceof Error ? galat.message : "Gagal memuat modul musik.",
      });
    }
  },

  segarkanStatusMusik: async () => {
    try {
      const trekAktif = await ambilStatusMusikAktif();
      set({ trekAktif, pesanGalat: null });
    } catch (galat) {
      set({
        pesanGalat:
          galat instanceof Error ? galat.message : "Gagal membaca status musik.",
      });
    }
  },

  kontrolMedia: async (aksi) => {
    set({ pesanGalat: null });
    try {
      const trekAktif = await kirimKontrolMediaLayanan(aksi);
      set({ trekAktif });
    } catch (galat) {
      set({
        pesanGalat:
          galat instanceof Error
            ? galat.message
            : "Kontrol media nggak tersedia.",
      });
    }
  },

  catatLaguKeRiwayat: async (masukan) => {
    set({ pesanGalat: null });
    try {
      await simpanRiwayatMusikLayanan(masukan);
      const riwayatMusik = await ambilRiwayatMusikLayanan();
      set({
        riwayatMusik,
        pesanStatus: `Lagu "${masukan.judulLagu}" disimpan ke riwayat musik.`,
      });
    } catch (galat) {
      set({
        pesanGalat:
          galat instanceof Error
            ? galat.message
            : "Gagal menyimpan riwayat musik.",
      });
    }
  },

  perbaruiKonfigPengenal: (konfig) => {
    const tersimpan = simpanKonfigPengenalLagu(konfig);
    set({
      konfigPengenal: tersimpan,
      pesanStatus: "Konfigurasi penyedia pengenal lagu tersimpan.",
    });
  },

  ujiIdentifikasiMikrofon: async () => {
    set({ pesanStatus: null, pesanGalat: null });
    const hasil = await identifikasiLewatMikrofonLayanan(get().konfigPengenal);
    if (hasil.berhasil) {
      set({ pesanStatus: hasil.pesan });
    } else {
      set({ pesanGalat: hasil.pesan });
    }
  },
}));
