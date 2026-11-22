import { create } from "zustand";
import {
  ambilDaftarPapanklip,
  ambilPengaturanPapanklip,
  bersihkanNonPinPapanklipLayanan,
  hapusItemPapanklipLayanan,
  simpanItemPapanklipLayanan,
  simpanPengaturanPapanklip,
  ubahPinPapanklipLayanan,
} from "@/papanklip/layanan/layananPapanklip";
import type {
  FilterPapanklip,
  ItemPapanklip,
  PengaturanPapanklip,
} from "@/papanklip/tipe/tipePapanklip";

interface KondisiTokoPapanklip {
  daftarItem: ItemPapanklip[];
  pengaturan: PengaturanPapanklip;
  filterAktif: FilterPapanklip;
  kataCari: string;
  pesanStatus: string | null;
  pesanPeringatan: string | null;

  muatPapanklip: () => Promise<void>;
  aturFilterAktif: (filter: FilterPapanklip) => void;
  aturKataCari: (kata: string) => void;
  tangkapTeks: (teks: string, aplikasiSumber?: string) => Promise<boolean>;
  tangkapGambar: (dataUrl: string, aplikasiSumber?: string) => Promise<boolean>;
  ubahPin: (id: string) => Promise<void>;
  hapusItem: (id: string) => Promise<void>;
  bersihkanNonPin: () => Promise<void>;
  perbaruiPengaturan: (pengaturanBaru: PengaturanPapanklip) => void;
}

export const gunakanTokoPapanklip = create<KondisiTokoPapanklip>(
  (set, get) => ({
    daftarItem: [],
    pengaturan: ambilPengaturanPapanklip(),
    filterAktif: "semua",
    kataCari: "",
    pesanStatus: null,
    pesanPeringatan: null,

    muatPapanklip: async () => {
      const daftar = await ambilDaftarPapanklip();
      set({
        daftarItem: daftar,
        pengaturan: ambilPengaturanPapanklip(),
      });
    },

    aturFilterAktif: (filter) => set({ filterAktif: filter }),
    aturKataCari: (kata) => set({ kataCari: kata }),

    tangkapTeks: async (teks, aplikasiSumber = "Overthinker Notch") => {
      set({ pesanStatus: null, pesanPeringatan: null });
      const { item, diblokirAlasan } = await simpanItemPapanklipLayanan({
        kontenTeks: teks,
        aplikasiSumber,
        pengaturan: get().pengaturan,
      });

      if (diblokirAlasan || !item) {
        set({ pesanPeringatan: diblokirAlasan ?? "Konten diblokir." });
        return false;
      }

      const daftar = await ambilDaftarPapanklip();
      set({
        daftarItem: daftar,
        pesanStatus: `Tersimpan ke riwayat clipboard (${item.tipeKonten}).`,
      });
      return true;
    },

    tangkapGambar: async (dataUrl, aplikasiSumber = "Overthinker Notch") => {
      set({ pesanStatus: null, pesanPeringatan: null });
      const { item, diblokirAlasan } = await simpanItemPapanklipLayanan({
        pratinjauGambarDataUrl: dataUrl,
        aplikasiSumber,
        pengaturan: get().pengaturan,
      });
      if (diblokirAlasan || !item) {
        set({ pesanPeringatan: diblokirAlasan ?? "Gambar dilewati." });
        return false;
      }
      const daftar = await ambilDaftarPapanklip();
      set({
        daftarItem: daftar,
        pesanStatus: "Gambar berhasil disimpan ke riwayat clipboard.",
      });
      return true;
    },

    ubahPin: async (id) => {
      const target = get().daftarItem.find((i) => i.id === id);
      if (!target) return;
      await ubahPinPapanklipLayanan(id, !target.disematkan);
      const daftar = await ambilDaftarPapanklip();
      set({ daftarItem: daftar });
    },

    hapusItem: async (id) => {
      await hapusItemPapanklipLayanan(id);
      const daftar = await ambilDaftarPapanklip();
      set({ daftarItem: daftar, pesanStatus: "Item clipboard dihapus." });
    },

    bersihkanNonPin: async () => {
      const jumlah = await bersihkanNonPinPapanklipLayanan();
      const daftar = await ambilDaftarPapanklip();
      set({
        daftarItem: daftar,
        pesanStatus:
          jumlah > 0
            ? `${jumlah} item non-pin dibersihkan (item di-pin tetap aman).`
            : "Nggak ada item non-pin buat dibersihkan.",
      });
    },

    perbaruiPengaturan: (pengaturanBaru) => {
      const tersimpan = simpanPengaturanPapanklip(pengaturanBaru);
      set({
        pengaturan: tersimpan,
        pesanStatus: "Pengaturan privasi & retensi clipboard tersimpan.",
      });
    },
  })
);
