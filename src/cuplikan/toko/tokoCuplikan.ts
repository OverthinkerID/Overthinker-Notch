import { create } from "zustand";
import {
  ambilDaftarCuplikan,
  hapusCuplikanLayanan,
  imporJsonCuplikanLayanan,
  simpanCuplikanLayanan,
} from "@/cuplikan/layanan/layananCuplikan";
import type {
  CuplikanKodeItem,
  MasukanSimpanCuplikan,
} from "@/cuplikan/tipe/tipeCuplikan";

interface KondisiTokoCuplikan {
  daftarCuplikan: CuplikanKodeItem[];
  idTerpilih: string | null;
  kataCari: string;
  kategoriTerpilih: string | null;
  hanyaFavorit: boolean;
  sedangMemuat: boolean;
  pesanStatus: string | null;
  pesanGalat: string | null;

  muatCuplikan: () => Promise<void>;
  pilihCuplikan: (id: string | null) => void;
  aturKataCari: (kata: string) => void;
  aturKategoriTerpilih: (kategori: string | null) => void;
  aturHanyaFavorit: (aktif: boolean) => void;
  simpanCuplikan: (
    masukan: MasukanSimpanCuplikan
  ) => Promise<CuplikanKodeItem | null>;
  ubahFavoritCuplikan: (id: string) => Promise<void>;
  hapusCuplikan: (id: string) => Promise<void>;
  imporDariJson: (teksJson: string) => Promise<void>;
}

export const gunakanTokoCuplikan = create<KondisiTokoCuplikan>((set, get) => ({
  daftarCuplikan: [],
  idTerpilih: null,
  kataCari: "",
  kategoriTerpilih: null,
  hanyaFavorit: false,
  sedangMemuat: false,
  pesanStatus: null,
  pesanGalat: null,

  muatCuplikan: async () => {
    set({ sedangMemuat: true, pesanGalat: null });
    try {
      const daftar = await ambilDaftarCuplikan();
      const idSekarang = get().idTerpilih;
      const masihAda = daftar.some((item) => item.id === idSekarang);
      set({
        daftarCuplikan: daftar,
        idTerpilih: masihAda ? idSekarang : (daftar[0]?.id ?? null),
        sedangMemuat: false,
      });
    } catch (galat) {
      set({
        sedangMemuat: false,
        pesanGalat:
          galat instanceof Error ? galat.message : "Gagal memuat snippet.",
      });
    }
  },

  pilihCuplikan: (id) => set({ idTerpilih: id }),
  aturKataCari: (kata) => set({ kataCari: kata }),
  aturKategoriTerpilih: (kategori) => set({ kategoriTerpilih: kategori }),
  aturHanyaFavorit: (aktif) => set({ hanyaFavorit: aktif }),

  simpanCuplikan: async (masukan) => {
    set({ pesanGalat: null });
    try {
      const tersimpan = await simpanCuplikanLayanan(masukan);
      const daftar = await ambilDaftarCuplikan();
      set({
        daftarCuplikan: daftar,
        idTerpilih: tersimpan.id,
        pesanStatus: `Snippet "${tersimpan.judul}" tersimpan (v${tersimpan.riwayatVersi[0]?.nomorVersi ?? 1}).`,
      });
      return tersimpan;
    } catch (galat) {
      set({
        pesanGalat:
          galat instanceof Error ? galat.message : "Gagal menyimpan snippet.",
      });
      return null;
    }
  },

  ubahFavoritCuplikan: async (id) => {
    const target = get().daftarCuplikan.find((item) => item.id === id);
    if (!target) return;
    await get().simpanCuplikan({
      id: target.id,
      projectId: target.projectId,
      judul: target.judul,
      bahasa: target.bahasa,
      kategori: target.kategori,
      kode: target.kode,
      deskripsi: target.deskripsi,
      daftarTag: target.daftarTag,
      favorit: !target.favorit,
    });
  },

  hapusCuplikan: async (id) => {
    await hapusCuplikanLayanan(id);
    const daftar = await ambilDaftarCuplikan();
    const idSekarang = get().idTerpilih;
    set({
      daftarCuplikan: daftar,
      idTerpilih: idSekarang === id ? (daftar[0]?.id ?? null) : idSekarang,
      pesanStatus: "Snippet berhasil dihapus.",
    });
  },

  imporDariJson: async (teksJson) => {
    set({ pesanGalat: null });
    try {
      const jumlah = await imporJsonCuplikanLayanan(teksJson);
      await get().muatCuplikan();
      set({ pesanStatus: `${jumlah} snippet berhasil diimpor dari JSON.` });
    } catch (galat) {
      set({
        pesanGalat:
          galat instanceof Error
            ? `Format JSON nggak valid: ${galat.message}`
            : "Gagal impor JSON snippet.",
      });
    }
  },
}));
