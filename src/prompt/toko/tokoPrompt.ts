import { create } from "zustand";
import {
  ambilDaftarPrompt,
  hapusPromptLayanan,
  imporJsonPromptLayanan,
  simpanPromptLayanan,
} from "@/prompt/layanan/layananPrompt";
import type {
  MasukanSimpanPrompt,
  PromptItem,
} from "@/prompt/tipe/tipePrompt";

interface KondisiTokoPrompt {
  daftarPrompt: PromptItem[];
  idTerpilih: string | null;
  kataCari: string;
  kategoriTerpilih: string | null;
  hanyaFavorit: boolean;
  pesanStatus: string | null;
  pesanGalat: string | null;

  muatPrompt: () => Promise<void>;
  pilihPrompt: (id: string | null) => void;
  aturKataCari: (kata: string) => void;
  aturKategoriTerpilih: (kategori: string | null) => void;
  aturHanyaFavorit: (aktif: boolean) => void;
  simpanPrompt: (masukan: MasukanSimpanPrompt) => Promise<PromptItem | null>;
  ubahFavoritPrompt: (id: string) => Promise<void>;
  hapusPrompt: (id: string) => Promise<void>;
  imporDariJson: (teksJson: string) => Promise<void>;
}

export const gunakanTokoPrompt = create<KondisiTokoPrompt>((set, get) => ({
  daftarPrompt: [],
  idTerpilih: null,
  kataCari: "",
  kategoriTerpilih: null,
  hanyaFavorit: false,
  pesanStatus: null,
  pesanGalat: null,

  muatPrompt: async () => {
    const daftar = await ambilDaftarPrompt();
    const idSekarang = get().idTerpilih;
    const masihAda = daftar.some((i) => i.id === idSekarang);
    set({
      daftarPrompt: daftar,
      idTerpilih: masihAda ? idSekarang : (daftar[0]?.id ?? null),
    });
  },

  pilihPrompt: (id) => set({ idTerpilih: id }),
  aturKataCari: (kata) => set({ kataCari: kata }),
  aturKategoriTerpilih: (kategori) => set({ kategoriTerpilih: kategori }),
  aturHanyaFavorit: (aktif) => set({ hanyaFavorit: aktif }),

  simpanPrompt: async (masukan) => {
    set({ pesanGalat: null, pesanStatus: null });
    try {
      const tersimpan = await simpanPromptLayanan(masukan);
      const daftar = await ambilDaftarPrompt();
      set({
        daftarPrompt: daftar,
        idTerpilih: tersimpan.id,
        pesanStatus: `Prompt "${tersimpan.judul}" tersimpan (v${tersimpan.riwayatVersi[0]?.nomorVersi ?? 1}).`,
      });
      return tersimpan;
    } catch (galat) {
      set({
        pesanGalat:
          galat instanceof Error ? galat.message : "Gagal menyimpan prompt.",
      });
      return null;
    }
  },

  ubahFavoritPrompt: async (id) => {
    const target = get().daftarPrompt.find((i) => i.id === id);
    if (!target) return;
    await get().simpanPrompt({
      id: target.id,
      projectId: target.projectId,
      judul: target.judul,
      kategori: target.kategori,
      templatePrompt: target.templatePrompt,
      daftarTag: target.daftarTag,
      favorit: !target.favorit,
    });
  },

  hapusPrompt: async (id) => {
    await hapusPromptLayanan(id);
    const daftar = await ambilDaftarPrompt();
    const idSekarang = get().idTerpilih;
    set({
      daftarPrompt: daftar,
      idTerpilih: idSekarang === id ? (daftar[0]?.id ?? null) : idSekarang,
      pesanStatus: "Prompt dihapus.",
    });
  },

  imporDariJson: async (teksJson) => {
    set({ pesanGalat: null, pesanStatus: null });
    try {
      const jumlah = await imporJsonPromptLayanan(teksJson);
      await get().muatPrompt();
      set({ pesanStatus: `${jumlah} prompt berhasil diimpor dari JSON.` });
    } catch (galat) {
      set({
        pesanGalat:
          galat instanceof Error
            ? `Format JSON nggak valid: ${galat.message}`
            : "Gagal impor JSON prompt.",
      });
    }
  },
}));
