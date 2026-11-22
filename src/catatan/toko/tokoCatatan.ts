import { create } from "zustand";
import {
  ambilDaftarCatatan,
  hapusCatatanDariPenyimpanan,
  simpanCatatanKePenyimpanan,
} from "@/catatan/layanan/layananCatatan";
import type {
  CatatanItem,
  FilterArsipCatatan,
  FormatCatatan,
  MasukanSimpanCatatan,
} from "@/catatan/tipe/tipeCatatan";

interface KondisiTokoCatatan {
  daftarCatatan: CatatanItem[];
  idTerpilih: string | null;
  kataCari: string;
  tagTerpilih: string | null;
  filterArsip: FilterArsipCatatan;
  sedangMemuat: boolean;
  statusSimpan: "siaga" | "menyimpan" | "tersimpan" | "galat";
  pesanGalat: string | null;

  muatCatatan: () => Promise<void>;
  pilihCatatan: (id: string | null) => void;
  aturKataCari: (kata: string) => void;
  aturTagTerpilih: (tag: string | null) => void;
  aturFilterArsip: (filter: FilterArsipCatatan) => void;
  tangkapCepat: (
    judul: string,
    kontenMarkdown: string,
    formatKonten?: FormatCatatan,
    daftarTag?: string[]
  ) => Promise<CatatanItem | null>;
  simpanPerubahanCatatan: (
    masukan: MasukanSimpanCatatan
  ) => Promise<CatatanItem | null>;
  ubahPinCatatan: (id: string) => Promise<void>;
  ubahArsipCatatan: (id: string) => Promise<void>;
  hapusCatatan: (id: string) => Promise<void>;
}

export const gunakanTokoCatatan = create<KondisiTokoCatatan>((set, get) => ({
  daftarCatatan: [],
  idTerpilih: null,
  kataCari: "",
  tagTerpilih: null,
  filterArsip: "aktif",
  sedangMemuat: false,
  statusSimpan: "siaga",
  pesanGalat: null,

  muatCatatan: async () => {
    set({ sedangMemuat: true, pesanGalat: null });
    try {
      const daftar = await ambilDaftarCatatan();
      const idSekarang = get().idTerpilih;
      const masihAda = daftar.some((item) => item.id === idSekarang);
      set({
        daftarCatatan: daftar,
        idTerpilih: masihAda ? idSekarang : (daftar[0]?.id ?? null),
        sedangMemuat: false,
      });
    } catch (galat) {
      set({
        sedangMemuat: false,
        pesanGalat:
          galat instanceof Error ? galat.message : "Gagal memuat catatan.",
      });
    }
  },

  pilihCatatan: (id) => set({ idTerpilih: id }),
  aturKataCari: (kata) => set({ kataCari: kata }),
  aturTagTerpilih: (tag) => set({ tagTerpilih: tag }),
  aturFilterArsip: (filter) => set({ filterArsip: filter }),

  tangkapCepat: async (
    judul,
    kontenMarkdown,
    formatKonten = "markdown",
    daftarTag = []
  ) => {
    set({ statusSimpan: "menyimpan", pesanGalat: null });
    try {
      const baru = await simpanCatatanKePenyimpanan({
        judul: judul.trim() || kontenMarkdown.trim().split("\n")[0]?.slice(0, 60) || "Catatan Cepat",
        kontenMarkdown,
        formatKonten,
        disematkan: false,
        diarsipkan: false,
        daftarTag,
      });
      const daftar = await ambilDaftarCatatan();
      set({
        daftarCatatan: daftar,
        idTerpilih: baru.id,
        filterArsip: "aktif",
        statusSimpan: "tersimpan",
      });
      return baru;
    } catch (galat) {
      set({
        statusSimpan: "galat",
        pesanGalat:
          galat instanceof Error ? galat.message : "Gagal menyimpan catatan.",
      });
      return null;
    }
  },

  simpanPerubahanCatatan: async (masukan) => {
    set({ statusSimpan: "menyimpan", pesanGalat: null });
    try {
      const tersimpan = await simpanCatatanKePenyimpanan(masukan);
      const daftar = await ambilDaftarCatatan();
      set({
        daftarCatatan: daftar,
        idTerpilih: tersimpan.id,
        statusSimpan: "tersimpan",
      });
      return tersimpan;
    } catch (galat) {
      set({
        statusSimpan: "galat",
        pesanGalat:
          galat instanceof Error ? galat.message : "Gagal menyimpan perubahan.",
      });
      return null;
    }
  },

  ubahPinCatatan: async (id) => {
    const target = get().daftarCatatan.find((item) => item.id === id);
    if (!target) return;
    await get().simpanPerubahanCatatan({
      id: target.id,
      projectId: target.projectId,
      judul: target.judul,
      kontenMarkdown: target.kontenMarkdown,
      formatKonten: target.formatKonten,
      disematkan: !target.disematkan,
      diarsipkan: target.diarsipkan,
      daftarTag: target.daftarTag,
    });
  },

  ubahArsipCatatan: async (id) => {
    const target = get().daftarCatatan.find((item) => item.id === id);
    if (!target) return;
    await get().simpanPerubahanCatatan({
      id: target.id,
      projectId: target.projectId,
      judul: target.judul,
      kontenMarkdown: target.kontenMarkdown,
      formatKonten: target.formatKonten,
      disematkan: target.disematkan,
      diarsipkan: !target.diarsipkan,
      daftarTag: target.daftarTag,
    });
  },

  hapusCatatan: async (id) => {
    set({ pesanGalat: null });
    try {
      await hapusCatatanDariPenyimpanan(id);
      const daftar = await ambilDaftarCatatan();
      const idSekarang = get().idTerpilih;
      set({
        daftarCatatan: daftar,
        idTerpilih: idSekarang === id ? (daftar[0]?.id ?? null) : idSekarang,
        statusSimpan: "tersimpan",
      });
    } catch (galat) {
      set({
        pesanGalat:
          galat instanceof Error ? galat.message : "Gagal menghapus catatan.",
      });
    }
  },
}));
