import { invoke } from "@tauri-apps/api/core";
import { z } from "zod";
import { apakahRuntimeTauriAktif } from "@/bersama/ipc/klienIpc";
import {
  SkemaCatatanItem,
  SkemaMasukanSimpanCatatan,
} from "@/catatan/skema/skemaCatatan";
import type {
  CatatanItem,
  MasukanSimpanCatatan,
} from "@/catatan/tipe/tipeCatatan";
import { normalisasiTag } from "@/catatan/utilitas/formatCatatan";

const KUNCI_CATATAN_WEB = "overthinker_notch_quick_notes";

function bacaCatatanWeb(): CatatanItem[] {
  if (typeof window === "undefined") {
    return [];
  }
  try {
    const mentah = window.localStorage.getItem(KUNCI_CATATAN_WEB);
    if (!mentah) {
      return [];
    }
    const parsed = z.array(SkemaCatatanItem).safeParse(JSON.parse(mentah));
    return parsed.success ? parsed.data : [];
  } catch {
    return [];
  }
}

function tulisCatatanWeb(daftar: CatatanItem[]): void {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem(KUNCI_CATATAN_WEB, JSON.stringify(daftar));
}

function urutkanCatatan(daftar: CatatanItem[]): CatatanItem[] {
  return [...daftar].sort((a, b) => {
    if (a.disematkan !== b.disematkan) {
      return a.disematkan ? -1 : 1;
    }
    return b.diperbaruiPada.localeCompare(a.diperbaruiPada);
  });
}

export async function ambilDaftarCatatan(): Promise<CatatanItem[]> {
  if (!apakahRuntimeTauriAktif()) {
    return urutkanCatatan(bacaCatatanWeb());
  }

  const hasil = await invoke<unknown>("daftar_catatan");
  return urutkanCatatan(z.array(SkemaCatatanItem).parse(hasil));
}

export async function simpanCatatanKePenyimpanan(
  masukan: MasukanSimpanCatatan
): Promise<CatatanItem> {
  const valid = SkemaMasukanSimpanCatatan.parse(masukan);
  const tagBersih = Array.from(
    new Set(valid.daftarTag.map(normalisasiTag).filter(Boolean))
  );
  const judulFinal = valid.judul.trim() || "Catatan Tanpa Judul";

  if (!apakahRuntimeTauriAktif()) {
    const sekarang = new Date().toISOString();
    const daftar = bacaCatatanWeb();
    const indeksLama = valid.id
      ? daftar.findIndex((item) => item.id === valid.id)
      : -1;
    const lama = indeksLama >= 0 ? daftar[indeksLama] : undefined;

    const id =
      lama?.id ??
      valid.id ??
      (typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `catatan-${Date.now()}`);

    const itemBaru: CatatanItem = {
      id,
      projectId: valid.projectId ?? null,
      judul: judulFinal,
      kontenMarkdown: valid.kontenMarkdown,
      formatKonten: valid.formatKonten,
      disematkan: valid.disematkan,
      diarsipkan: valid.diarsipkan,
      daftarTag: tagBersih,
      dibuatPada: lama?.dibuatPada ?? sekarang,
      diperbaruiPada: sekarang,
    };

    const daftarBaru =
      indeksLama >= 0
        ? daftar.map((item, i) => (i === indeksLama ? itemBaru : item))
        : [itemBaru, ...daftar];

    tulisCatatanWeb(urutkanCatatan(daftarBaru));
    return itemBaru;
  }

  const hasil = await invoke<unknown>("simpan_catatan", {
    permintaan: {
      id: valid.id ?? null,
      projectId: valid.projectId ?? null,
      judul: judulFinal,
      kontenMarkdown: valid.kontenMarkdown,
      formatKonten: valid.formatKonten,
      disematkan: valid.disematkan,
      diarsipkan: valid.diarsipkan,
      daftarTag: tagBersih,
    },
  });

  return SkemaCatatanItem.parse(hasil);
}

export async function hapusCatatanDariPenyimpanan(id: string): Promise<void> {
  if (!apakahRuntimeTauriAktif()) {
    const daftar = bacaCatatanWeb().filter((item) => item.id !== id);
    tulisCatatanWeb(daftar);
    return;
  }

  await invoke("hapus_catatan", { id });
}
