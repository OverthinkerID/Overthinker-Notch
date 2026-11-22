import { create } from "zustand";
import {
  ambilDaftarProyek,
  ambilDaftarTugas,
  ambilDaftarWorkspace,
  ambilRingkasanAsetProyekLayanan,
  hapusProyekLayanan,
  hapusTugasLayanan,
  hapusWorkspaceLayanan,
  simpanProyekLayanan,
  simpanTugasLayanan,
  simpanWorkspaceLayanan,
} from "@/proyek/layanan/layananProyek";
import type {
  MasukanSimpanProyek,
  MasukanSimpanTugas,
  MasukanSimpanWorkspace,
  ProjectItem,
  RingkasanAsetProyek,
  StatusProyek,
  TaskItem,
  WorkspaceItem,
} from "@/proyek/tipe/tipeProyek";

interface KondisiTokoProyek {
  daftarWorkspace: WorkspaceItem[];
  daftarProyek: ProjectItem[];
  daftarTugas: TaskItem[];
  idWorkspaceTerpilih: string | null;
  idProyekTerpilih: string | null;
  ringkasanAset: RingkasanAsetProyek | null;
  kataCari: string;
  filterStatusProyek: StatusProyek | "semua";
  pesanStatus: string | null;
  pesanGalat: string | null;

  muatSemua: () => Promise<void>;
  pilihWorkspace: (id: string | null) => void;
  pilihProyek: (id: string | null) => Promise<void>;
  aturKataCari: (kata: string) => void;
  aturFilterStatusProyek: (status: StatusProyek | "semua") => void;

  simpanWorkspace: (
    masukan: MasukanSimpanWorkspace
  ) => Promise<WorkspaceItem | null>;
  hapusWorkspace: (id: string) => Promise<void>;

  simpanProyek: (masukan: MasukanSimpanProyek) => Promise<ProjectItem | null>;
  hapusProyek: (id: string) => Promise<void>;

  simpanTugas: (masukan: MasukanSimpanTugas) => Promise<TaskItem | null>;
  hapusTugas: (id: string) => Promise<void>;
}

export const gunakanTokoProyek = create<KondisiTokoProyek>((set, get) => ({
  daftarWorkspace: [],
  daftarProyek: [],
  daftarTugas: [],
  idWorkspaceTerpilih: null,
  idProyekTerpilih: null,
  ringkasanAset: null,
  kataCari: "",
  filterStatusProyek: "semua",
  pesanStatus: null,
  pesanGalat: null,

  muatSemua: async () => {
    const [daftarWorkspace, daftarProyek, daftarTugas] = await Promise.all([
      ambilDaftarWorkspace(),
      ambilDaftarProyek(),
      ambilDaftarTugas(),
    ]);

    const wsSekarang = get().idWorkspaceTerpilih;
    const wsAktif = daftarWorkspace.some((w) => w.id === wsSekarang)
      ? wsSekarang
      : (daftarWorkspace[0]?.id ?? null);

    const prjSekarang = get().idProyekTerpilih;
    const prjAktif = daftarProyek.some((p) => p.id === prjSekarang)
      ? prjSekarang
      : (daftarProyek.find((p) => !wsAktif || p.workspaceId === wsAktif)?.id ??
        daftarProyek[0]?.id ??
        null);

    const ringkasanAset = prjAktif
      ? await ambilRingkasanAsetProyekLayanan(prjAktif)
      : null;

    set({
      daftarWorkspace,
      daftarProyek,
      daftarTugas,
      idWorkspaceTerpilih: wsAktif,
      idProyekTerpilih: prjAktif,
      ringkasanAset,
    });
  },

  pilihWorkspace: (id) => {
    const daftarProyek = get().daftarProyek;
    const proyekPertama =
      daftarProyek.find((p) => !id || p.workspaceId === id)?.id ?? null;
    set({
      idWorkspaceTerpilih: id,
      idProyekTerpilih: proyekPertama,
    });
    if (proyekPertama) {
      void ambilRingkasanAsetProyekLayanan(proyekPertama).then((ringkasan) =>
        set({ ringkasanAset: ringkasan })
      );
    } else {
      set({ ringkasanAset: null });
    }
  },

  pilihProyek: async (id) => {
    const ringkasanAset = id
      ? await ambilRingkasanAsetProyekLayanan(id)
      : null;
    set({ idProyekTerpilih: id, ringkasanAset });
  },

  aturKataCari: (kata) => set({ kataCari: kata }),
  aturFilterStatusProyek: (status) => set({ filterStatusProyek: status }),

  simpanWorkspace: async (masukan) => {
    set({ pesanGalat: null, pesanStatus: null });
    try {
      const ws = await simpanWorkspaceLayanan(masukan);
      const daftarWorkspace = await ambilDaftarWorkspace();
      set({
        daftarWorkspace,
        idWorkspaceTerpilih: ws.id,
        pesanStatus: `Workspace "${ws.nama}" tersimpan.`,
      });
      return ws;
    } catch (galat) {
      set({
        pesanGalat:
          galat instanceof Error ? galat.message : "Gagal menyimpan workspace.",
      });
      return null;
    }
  },

  hapusWorkspace: async (id) => {
    await hapusWorkspaceLayanan(id);
    await get().muatSemua();
    set({ pesanStatus: "Workspace dihapus." });
  },

  simpanProyek: async (masukan) => {
    set({ pesanGalat: null, pesanStatus: null });
    try {
      const prj = await simpanProyekLayanan(masukan);
      const daftarProyek = await ambilDaftarProyek();
      const ringkasanAset = await ambilRingkasanAsetProyekLayanan(prj.id);
      set({
        daftarProyek,
        idProyekTerpilih: prj.id,
        ringkasanAset,
        pesanStatus: `Project "${prj.nama}" tersimpan.`,
      });
      return prj;
    } catch (galat) {
      set({
        pesanGalat:
          galat instanceof Error ? galat.message : "Gagal menyimpan project.",
      });
      return null;
    }
  },

  hapusProyek: async (id) => {
    await hapusProyekLayanan(id);
    await get().muatSemua();
    set({ pesanStatus: "Project dihapus." });
  },

  simpanTugas: async (masukan) => {
    set({ pesanGalat: null, pesanStatus: null });
    try {
      const tugas = await simpanTugasLayanan(masukan);
      const [daftarProyek, daftarTugas] = await Promise.all([
        ambilDaftarProyek(),
        ambilDaftarTugas(),
      ]);
      set({
        daftarProyek,
        daftarTugas,
        pesanStatus: `Task "${tugas.judul}" tersimpan.`,
      });
      return tugas;
    } catch (galat) {
      set({
        pesanGalat:
          galat instanceof Error ? galat.message : "Gagal menyimpan task.",
      });
      return null;
    }
  },

  hapusTugas: async (id) => {
    await hapusTugasLayanan(id);
    const [daftarProyek, daftarTugas] = await Promise.all([
      ambilDaftarProyek(),
      ambilDaftarTugas(),
    ]);
    set({
      daftarProyek,
      daftarTugas,
      pesanStatus: "Task dihapus.",
    });
  },
}));
