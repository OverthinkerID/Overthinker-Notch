import { invoke } from "@tauri-apps/api/core";
import { z } from "zod";
import { apakahRuntimeTauriAktif } from "@/bersama/ipc/klienIpc";
import {
  skemaSimpanProyek,
  skemaSimpanTugas,
  skemaSimpanWorkspace,
} from "@/proyek/skema/skemaProyek";
import type {
  MasukanSimpanProyek,
  MasukanSimpanTugas,
  MasukanSimpanWorkspace,
  ProjectItem,
  RingkasanAsetProyek,
  TaskItem,
  WorkspaceItem,
} from "@/proyek/tipe/tipeProyek";

const KUNCI_WORKSPACE_WEB = "overthinker_notch_workspaces";
const KUNCI_PROYEK_WEB = "overthinker_notch_projects";
const KUNCI_TUGAS_WEB = "overthinker_notch_tasks";

const skemaWorkspaceItem = z.object({
  id: z.string(),
  nama: z.string(),
  deskripsi: z.string(),
  ikon: z.string(),
  warna: z.string(),
  dibuatPada: z.string(),
  diperbaruiPada: z.string(),
});

const skemaProjectItem = z.object({
  id: z.string(),
  workspaceId: z.string(),
  nama: z.string(),
  deskripsi: z.string(),
  status: z.enum(["aktif", "dijeda", "selesai", "arsip"]),
  warna: z.string(),
  progresPersen: z.number(),
  diarsipkan: z.boolean(),
  dibuatPada: z.string(),
  diperbaruiPada: z.string(),
});

const skemaTaskItem = z.object({
  id: z.string(),
  projectId: z.string(),
  judul: z.string(),
  deskripsi: z.string(),
  status: z.enum(["todo", "proses", "selesai"]),
  prioritas: z.enum(["rendah", "sedang", "tinggi", "kritis"]),
  tenggatPada: z.string().nullable(),
  selesaiPada: z.string().nullable(),
  urutan: z.number(),
  dibuatPada: z.string(),
  diperbaruiPada: z.string(),
});

const skemaRingkasanAset = z.object({
  projectId: z.string(),
  jumlahCatatan: z.number(),
  jumlahBerkas: z.number(),
  jumlahCuplikan: z.number(),
  jumlahPrompt: z.number(),
  jumlahSesiFokus: z.number(),
});

function bacaWeb<T>(kunci: string, skema: z.ZodType<T[]>): T[] {
  if (typeof window === "undefined") return [];
  try {
    const mentah = window.localStorage.getItem(kunci);
    if (!mentah) return [];
    const parsed = skema.safeParse(JSON.parse(mentah));
    return parsed.success ? parsed.data : [];
  } catch {
    return [];
  }
}

function tulisWeb<T>(kunci: string, daftar: T[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(kunci, JSON.stringify(daftar));
}

function buatId(awalan: string): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${awalan}-${Date.now()}-${Math.random().toString(16).slice(2, 6)}`;
}

export function hitungProgresDariTugas(
  daftarTugas: TaskItem[],
  projectId: string
): number | null {
  const milikProyek = daftarTugas.filter((t) => t.projectId === projectId);
  if (milikProyek.length === 0) return null;
  const selesai = milikProyek.filter((t) => t.status === "selesai").length;
  return Math.round((selesai / milikProyek.length) * 100);
}

function hitungAsetDariStorageWeb(
  kunci: string,
  projectId: string,
  filterTambahan?: (item: Record<string, unknown>) => boolean
): number {
  if (typeof window === "undefined") return 0;
  try {
    const mentah = window.localStorage.getItem(kunci);
    if (!mentah) return 0;
    const arr = JSON.parse(mentah);
    if (!Array.isArray(arr)) return 0;
    return arr.filter((item) => {
      if (!item || typeof item !== "object") return false;
      const rec = item as Record<string, unknown>;
      if (rec.projectId !== projectId) return false;
      return filterTambahan ? filterTambahan(rec) : true;
    }).length;
  } catch {
    return 0;
  }
}

export async function ambilDaftarWorkspace(): Promise<WorkspaceItem[]> {
  if (!apakahRuntimeTauriAktif()) {
    return bacaWeb(KUNCI_WORKSPACE_WEB, z.array(skemaWorkspaceItem));
  }
  const hasil = await invoke<unknown>("daftar_workspace");
  return z.array(skemaWorkspaceItem).parse(hasil);
}

export async function simpanWorkspaceLayanan(
  masukan: MasukanSimpanWorkspace
): Promise<WorkspaceItem> {
  const valid = skemaSimpanWorkspace.parse(masukan);
  if (!apakahRuntimeTauriAktif()) {
    const sekarang = new Date().toISOString();
    const daftar = bacaWeb(KUNCI_WORKSPACE_WEB, z.array(skemaWorkspaceItem));
    const idx = valid.id ? daftar.findIndex((i) => i.id === valid.id) : -1;
    const lama = idx >= 0 ? daftar[idx] : undefined;
    const itemBaru: WorkspaceItem = {
      id: lama?.id ?? valid.id ?? buatId("ws"),
      nama: valid.nama,
      deskripsi: valid.deskripsi,
      ikon: valid.ikon,
      warna: valid.warna,
      dibuatPada: lama?.dibuatPada ?? sekarang,
      diperbaruiPada: sekarang,
    };
    const baru =
      idx >= 0
        ? daftar.map((x, i) => (i === idx ? itemBaru : x))
        : [...daftar, itemBaru];
    tulisWeb(KUNCI_WORKSPACE_WEB, baru);
    return itemBaru;
  }

  const hasil = await invoke<unknown>("simpan_workspace", {
    permintaan: {
      id: valid.id ?? null,
      nama: valid.nama,
      deskripsi: valid.deskripsi,
      ikon: valid.ikon,
      warna: valid.warna,
    },
  });
  return skemaWorkspaceItem.parse(hasil);
}

export async function hapusWorkspaceLayanan(id: string): Promise<void> {
  if (!apakahRuntimeTauriAktif()) {
    const proyekTerkait = bacaWeb(KUNCI_PROYEK_WEB, z.array(skemaProjectItem))
      .filter((p) => p.workspaceId === id)
      .map((p) => p.id);
    tulisWeb(
      KUNCI_WORKSPACE_WEB,
      bacaWeb(KUNCI_WORKSPACE_WEB, z.array(skemaWorkspaceItem)).filter(
        (w) => w.id !== id
      )
    );
    tulisWeb(
      KUNCI_PROYEK_WEB,
      bacaWeb(KUNCI_PROYEK_WEB, z.array(skemaProjectItem)).filter(
        (p) => p.workspaceId !== id
      )
    );
    tulisWeb(
      KUNCI_TUGAS_WEB,
      bacaWeb(KUNCI_TUGAS_WEB, z.array(skemaTaskItem)).filter(
        (t) => !proyekTerkait.includes(t.projectId)
      )
    );
    return;
  }
  await invoke("hapus_workspace", { id });
}

export async function ambilDaftarProyek(): Promise<ProjectItem[]> {
  if (!apakahRuntimeTauriAktif()) {
    return bacaWeb(KUNCI_PROYEK_WEB, z.array(skemaProjectItem));
  }
  const hasil = await invoke<unknown>("daftar_proyek");
  return z.array(skemaProjectItem).parse(hasil);
}

export async function simpanProyekLayanan(
  masukan: MasukanSimpanProyek
): Promise<ProjectItem> {
  const valid = skemaSimpanProyek.parse(masukan);
  if (!apakahRuntimeTauriAktif()) {
    const sekarang = new Date().toISOString();
    const daftar = bacaWeb(KUNCI_PROYEK_WEB, z.array(skemaProjectItem));
    const idx = valid.id ? daftar.findIndex((i) => i.id === valid.id) : -1;
    const lama = idx >= 0 ? daftar[idx] : undefined;
    const itemBaru: ProjectItem = {
      id: lama?.id ?? valid.id ?? buatId("prj"),
      workspaceId: valid.workspaceId,
      nama: valid.nama,
      deskripsi: valid.deskripsi,
      status: valid.status,
      warna: valid.warna,
      progresPersen: valid.progresPersen ?? lama?.progresPersen ?? 0,
      diarsipkan: valid.diarsipkan,
      dibuatPada: lama?.dibuatPada ?? sekarang,
      diperbaruiPada: sekarang,
    };
    const baru =
      idx >= 0
        ? daftar.map((x, i) => (i === idx ? itemBaru : x))
        : [itemBaru, ...daftar];
    tulisWeb(KUNCI_PROYEK_WEB, baru);
    return itemBaru;
  }

  const hasil = await invoke<unknown>("simpan_proyek", {
    permintaan: {
      id: valid.id ?? null,
      workspaceId: valid.workspaceId,
      nama: valid.nama,
      deskripsi: valid.deskripsi,
      status: valid.status,
      warna: valid.warna,
      progresPersen: valid.progresPersen ?? null,
      diarsipkan: valid.diarsipkan,
    },
  });
  return skemaProjectItem.parse(hasil);
}

export async function hapusProyekLayanan(id: string): Promise<void> {
  if (!apakahRuntimeTauriAktif()) {
    tulisWeb(
      KUNCI_PROYEK_WEB,
      bacaWeb(KUNCI_PROYEK_WEB, z.array(skemaProjectItem)).filter(
        (p) => p.id !== id
      )
    );
    tulisWeb(
      KUNCI_TUGAS_WEB,
      bacaWeb(KUNCI_TUGAS_WEB, z.array(skemaTaskItem)).filter(
        (t) => t.projectId !== id
      )
    );
    return;
  }
  await invoke("hapus_proyek", { id });
}

export async function ambilDaftarTugas(
  projectId?: string
): Promise<TaskItem[]> {
  if (!apakahRuntimeTauriAktif()) {
    const semua = bacaWeb(KUNCI_TUGAS_WEB, z.array(skemaTaskItem));
    return projectId ? semua.filter((t) => t.projectId === projectId) : semua;
  }
  const hasil = await invoke<unknown>("daftar_tugas", {
    projectId: projectId ?? null,
  });
  return z.array(skemaTaskItem).parse(hasil);
}

export async function simpanTugasLayanan(
  masukan: MasukanSimpanTugas
): Promise<TaskItem> {
  const valid = skemaSimpanTugas.parse(masukan);
  if (!apakahRuntimeTauriAktif()) {
    const sekarang = new Date().toISOString();
    const daftar = bacaWeb(KUNCI_TUGAS_WEB, z.array(skemaTaskItem));
    const idx = valid.id ? daftar.findIndex((i) => i.id === valid.id) : -1;
    const lama = idx >= 0 ? daftar[idx] : undefined;
    const itemBaru: TaskItem = {
      id: lama?.id ?? valid.id ?? buatId("tsk"),
      projectId: valid.projectId,
      judul: valid.judul,
      deskripsi: valid.deskripsi,
      status: valid.status,
      prioritas: valid.prioritas,
      tenggatPada: valid.tenggatPada ?? null,
      selesaiPada: valid.status === "selesai" ? sekarang : null,
      urutan: valid.urutan ?? lama?.urutan ?? 0,
      dibuatPada: lama?.dibuatPada ?? sekarang,
      diperbaruiPada: sekarang,
    };
    const baru =
      idx >= 0
        ? daftar.map((x, i) => (i === idx ? itemBaru : x))
        : [itemBaru, ...daftar];
    tulisWeb(KUNCI_TUGAS_WEB, baru);

    // Hitung ulang progres proyek otomatis
    const progresBaru = hitungProgresDariTugas(baru, valid.projectId);
    if (progresBaru !== null) {
      const daftarProyek = bacaWeb(KUNCI_PROYEK_WEB, z.array(skemaProjectItem));
      tulisWeb(
        KUNCI_PROYEK_WEB,
        daftarProyek.map((p) =>
          p.id === valid.projectId
            ? { ...p, progresPersen: progresBaru, diperbaruiPada: sekarang }
            : p
        )
      );
    }

    return itemBaru;
  }

  const hasil = await invoke<unknown>("simpan_tugas", {
    permintaan: {
      id: valid.id ?? null,
      projectId: valid.projectId,
      judul: valid.judul,
      deskripsi: valid.deskripsi,
      status: valid.status,
      prioritas: valid.prioritas,
      tenggatPada: valid.tenggatPada ?? null,
      urutan: valid.urutan ?? null,
    },
  });
  return skemaTaskItem.parse(hasil);
}

export async function hapusTugasLayanan(id: string): Promise<void> {
  if (!apakahRuntimeTauriAktif()) {
    const daftar = bacaWeb(KUNCI_TUGAS_WEB, z.array(skemaTaskItem));
    const target = daftar.find((t) => t.id === id);
    const baru = daftar.filter((t) => t.id !== id);
    tulisWeb(KUNCI_TUGAS_WEB, baru);

    if (target) {
      const progresBaru = hitungProgresDariTugas(baru, target.projectId);
      if (progresBaru !== null) {
        const sekarang = new Date().toISOString();
        const daftarProyek = bacaWeb(
          KUNCI_PROYEK_WEB,
          z.array(skemaProjectItem)
        );
        tulisWeb(
          KUNCI_PROYEK_WEB,
          daftarProyek.map((p) =>
            p.id === target.projectId
              ? { ...p, progresPersen: progresBaru, diperbaruiPada: sekarang }
              : p
          )
        );
      }
    }
    return;
  }
  await invoke("hapus_tugas", { id });
}

export async function ambilRingkasanAsetProyekLayanan(
  projectId: string
): Promise<RingkasanAsetProyek> {
  if (!apakahRuntimeTauriAktif()) {
    return {
      projectId,
      jumlahCatatan: hitungAsetDariStorageWeb(
        "overthinker_notch_quick_notes",
        projectId,
        (r) => r.diarsipkan !== true
      ),
      jumlahBerkas: hitungAsetDariStorageWeb(
        "overthinker_notch_temp_files",
        projectId,
        (r) => !r.dihapusPada
      ),
      jumlahCuplikan: hitungAsetDariStorageWeb(
        "overthinker_notch_code_snippets",
        projectId
      ),
      jumlahPrompt: hitungAsetDariStorageWeb(
        "overthinker_notch_ai_prompts",
        projectId
      ),
      jumlahSesiFokus: hitungAsetDariStorageWeb(
        "overthinker_notch_focus_sessions",
        projectId
      ),
    };
  }
  const hasil = await invoke<unknown>("ambil_ringkasan_aset_proyek", {
    projectId,
  });
  return skemaRingkasanAset.parse(hasil);
}
