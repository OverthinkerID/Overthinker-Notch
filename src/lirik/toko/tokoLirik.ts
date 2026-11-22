import { create } from "zustand";
import {
  ambilDaftarCacheLirik,
  ambilKonfigPenyediaLirik,
  cariLirikDariPenyedia,
  hapusCacheLirikLayanan,
  simpanCacheLirikLayanan,
  simpanKonfigPenyediaLirik,
} from "@/lirik/layanan/layananLirik";
import type {
  KonfigurasiPenyediaLirik,
  LirikTersimpanItem,
} from "@/lirik/tipe/tipeLirik";

interface KondisiTokoLirik {
  riwayatLirik: LirikTersimpanItem[];
  idTerpilih: string | null;
  konfigPenyedia: KonfigurasiPenyediaLirik;
  posisiDetik: number;
  tampilkanTerjemahan: boolean;
  pesanStatus: string | null;
  pesanGalat: string | null;

  muatLirik: () => Promise<void>;
  pilihLirik: (id: string | null) => void;
  aturPosisiDetik: (detik: number) => void;
  aturTampilkanTerjemahan: (tampil: boolean) => void;
  cariLirikManual: (judulLagu: string, artis: string) => Promise<void>;
  simpanLirik: (masukan: {
    id?: string;
    judulLagu: string;
    artis: string;
    penyedia: string;
    bahasa: string;
    teksLirik: string;
    terjemahan?: string | null;
  }) => Promise<LirikTersimpanItem | null>;
  hapusLirik: (id: string) => Promise<void>;
  perbaruiKonfigPenyedia: (konfig: KonfigurasiPenyediaLirik) => void;
}

export const gunakanTokoLirik = create<KondisiTokoLirik>((set, get) => ({
  riwayatLirik: [],
  idTerpilih: null,
  konfigPenyedia: ambilKonfigPenyediaLirik(),
  posisiDetik: 0,
  tampilkanTerjemahan: true,
  pesanStatus: null,
  pesanGalat: null,

  muatLirik: async () => {
    const riwayatLirik = await ambilDaftarCacheLirik();
    const idSekarang = get().idTerpilih;
    const masihAda = riwayatLirik.some((i) => i.id === idSekarang);
    set({
      riwayatLirik,
      idTerpilih: masihAda ? idSekarang : (riwayatLirik[0]?.id ?? null),
      konfigPenyedia: ambilKonfigPenyediaLirik(),
    });
  },

  pilihLirik: (id) => set({ idTerpilih: id }),
  aturPosisiDetik: (detik) => set({ posisiDetik: Math.max(0, detik) }),
  aturTampilkanTerjemahan: (tampil) => set({ tampilkanTerjemahan: tampil }),

  cariLirikManual: async (judulLagu, artis) => {
    set({ pesanStatus: null, pesanGalat: null });
    if (!judulLagu.trim()) {
      set({ pesanGalat: "Masukkan judul lagu buat mencari lirik." });
      return;
    }

    const hasil = await cariLirikDariPenyedia({
      judulLagu,
      artis,
      konfig: get().konfigPenyedia,
    });

    if (hasil.ditemukan) {
      set({
        idTerpilih: hasil.ditemukan.id,
        pesanStatus: hasil.pesan,
      });
    } else {
      set({ pesanGalat: hasil.pesan });
    }
  },

  simpanLirik: async (masukan) => {
    set({ pesanStatus: null, pesanGalat: null });
    try {
      const tersimpan = await simpanCacheLirikLayanan(masukan);
      const riwayatLirik = await ambilDaftarCacheLirik();
      set({
        riwayatLirik,
        idTerpilih: tersimpan.id,
        pesanStatus: tersimpan.tersinkronisasi
          ? `Lirik "${tersimpan.judulLagu}" disimpan sebagai Timed LRC.`
          : `Lirik "${tersimpan.judulLagu}" disimpan sebagai Lirik Polos (tidak tersinkronisasi).`,
      });
      return tersimpan;
    } catch (galat) {
      set({
        pesanGalat:
          galat instanceof Error ? galat.message : "Gagal menyimpan lirik.",
      });
      return null;
    }
  },

  hapusLirik: async (id) => {
    await hapusCacheLirikLayanan(id);
    const riwayatLirik = await ambilDaftarCacheLirik();
    const idSekarang = get().idTerpilih;
    set({
      riwayatLirik,
      idTerpilih: idSekarang === id ? (riwayatLirik[0]?.id ?? null) : idSekarang,
      pesanStatus: "Lirik dihapus dari cache.",
    });
  },

  perbaruiKonfigPenyedia: (konfig) => {
    const tersimpan = simpanKonfigPenyediaLirik(konfig);
    set({
      konfigPenyedia: tersimpan,
      pesanStatus: "Pengaturan penyedia lirik resmi tersimpan.",
    });
  },
}));
