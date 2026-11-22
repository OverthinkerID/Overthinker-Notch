import { create } from "zustand";
import {
  ambilDaftarBerkas,
  aturKedaluwarsaBerkasLayanan,
  aturProyekBerkasLayanan,
  bersihkanBerkasKedaluwarsaLayanan,
  hapusPermanenBerkasLayanan,
  hapusSementaraBerkasLayanan,
  imporFileDariBrowser,
  pulihkanBerkasLayanan,
  tampilkanDiFolderLayanan,
  ubahNamaBerkasLayanan,
} from "@/berkas/layanan/layananBerkas";
import type {
  BerkasItem,
  FilterTabBerkas,
  OpsiKedaluwarsa,
} from "@/berkas/tipe/tipeBerkas";

interface KondisiTokoBerkas {
  daftarBerkas: BerkasItem[];
  idTerpilih: string | null;
  tabAktif: FilterTabBerkas;
  kataCari: string;
  opsiKedaluwarsaBawaan: OpsiKedaluwarsa;
  sedangMemuat: boolean;
  pesanStatus: string | null;
  pesanGalat: string | null;

  muatBerkas: () => Promise<void>;
  pilihBerkas: (id: string | null) => void;
  aturTabAktif: (tab: FilterTabBerkas) => void;
  aturKataCari: (kata: string) => void;
  aturOpsiKedaluwarsaBawaan: (opsi: OpsiKedaluwarsa) => void;
  imporBanyakFile: (
    daftarFile: File[],
    projectId?: string | null
  ) => Promise<void>;
  ubahNamaBerkas: (id: string, namaBaru: string) => Promise<void>;
  aturProyekBerkas: (id: string, projectId: string | null) => Promise<void>;
  aturKedaluwarsaBerkas: (id: string, opsi: OpsiKedaluwarsa) => Promise<void>;
  pindahKeRecovery: (id: string) => Promise<void>;
  pulihkanDariRecovery: (id: string) => Promise<void>;
  hapusPermanenVault: (id: string) => Promise<void>;
  bersihkanKedaluwarsa: () => Promise<void>;
  tampilkanDiFolder: (id: string) => Promise<void>;
}

export const gunakanTokoBerkas = create<KondisiTokoBerkas>((set, get) => ({
  daftarBerkas: [],
  idTerpilih: null,
  tabAktif: "aktif",
  kataCari: "",
  opsiKedaluwarsaBawaan: "14_hari",
  sedangMemuat: false,
  pesanStatus: null,
  pesanGalat: null,

  muatBerkas: async () => {
    set({ sedangMemuat: true, pesanGalat: null });
    try {
      const daftar = await ambilDaftarBerkas();
      const idSekarang = get().idTerpilih;
      const masihAda = daftar.some((item) => item.id === idSekarang);
      set({
        daftarBerkas: daftar,
        idTerpilih: masihAda ? idSekarang : (daftar[0]?.id ?? null),
        sedangMemuat: false,
      });
    } catch (galat) {
      set({
        sedangMemuat: false,
        pesanGalat:
          galat instanceof Error ? galat.message : "Gagal memuat daftar file.",
      });
    }
  },

  pilihBerkas: (id) => set({ idTerpilih: id }),
  aturTabAktif: (tab) => set({ tabAktif: tab }),
  aturKataCari: (kata) => set({ kataCari: kata }),
  aturOpsiKedaluwarsaBawaan: (opsi) => set({ opsiKedaluwarsaBawaan: opsi }),

  imporBanyakFile: async (daftarFile, projectId = null) => {
    if (daftarFile.length === 0) return;
    set({ sedangMemuat: true, pesanGalat: null });
    try {
      const baru = await imporFileDariBrowser(
        daftarFile,
        get().opsiKedaluwarsaBawaan,
        projectId
      );
      const daftar = await ambilDaftarBerkas();
      set({
        daftarBerkas: daftar,
        idTerpilih: baru[0]?.id ?? daftar[0]?.id ?? null,
        tabAktif: "aktif",
        sedangMemuat: false,
        pesanStatus: `${baru.length} file berhasil disalin ke vault lokal (file asli tetap aman).`,
      });
    } catch (galat) {
      set({
        sedangMemuat: false,
        pesanGalat:
          galat instanceof Error ? galat.message : "Gagal mengimpor file.",
      });
    }
  },

  ubahNamaBerkas: async (id, namaBaru) => {
    set({ pesanGalat: null });
    try {
      await ubahNamaBerkasLayanan(id, namaBaru);
      await get().muatBerkas();
      set({ pesanStatus: "Nama file berhasil diperbarui." });
    } catch (galat) {
      set({
        pesanGalat:
          galat instanceof Error ? galat.message : "Gagal mengganti nama file.",
      });
    }
  },

  aturProyekBerkas: async (id, projectId) => {
    await aturProyekBerkasLayanan(id, projectId);
    await get().muatBerkas();
    set({ pesanStatus: "Tautan project file diperbarui." });
  },

  aturKedaluwarsaBerkas: async (id, opsi) => {
    await aturKedaluwarsaBerkasLayanan(id, opsi);
    await get().muatBerkas();
    set({ pesanStatus: "Masa kedaluwarsa file diperbarui." });
  },

  pindahKeRecovery: async (id) => {
    await hapusSementaraBerkasLayanan(id);
    await get().muatBerkas();
    set({
      pesanStatus:
        "File dipindah ke Recovery (salinan vault saja; file asli kamu nggak disentuh).",
    });
  },

  pulihkanDariRecovery: async (id) => {
    await pulihkanBerkasLayanan(id);
    await get().muatBerkas();
    set({ pesanStatus: "File berhasil dipulihkan ke daftar aktif." });
  },

  hapusPermanenVault: async (id) => {
    await hapusPermanenBerkasLayanan(id);
    await get().muatBerkas();
    set({ pesanStatus: "Salinan vault dihapus permanen." });
  },

  bersihkanKedaluwarsa: async () => {
    const jumlah = await bersihkanBerkasKedaluwarsaLayanan();
    await get().muatBerkas();
    set({
      pesanStatus:
        jumlah > 0
          ? `${jumlah} file kedaluwarsa dipindahkan ke Recovery.`
          : "Nggak ada file kedaluwarsa yang perlu dibersihkan.",
    });
  },

  tampilkanDiFolder: async (id) => {
    try {
      const info = await tampilkanDiFolderLayanan(id);
      set({ pesanStatus: info });
    } catch (galat) {
      set({
        pesanGalat:
          galat instanceof Error ? galat.message : "Gagal membuka folder.",
      });
    }
  },
}));
