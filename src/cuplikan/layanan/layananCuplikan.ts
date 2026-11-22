import { invoke } from "@tauri-apps/api/core";
import { z } from "zod";
import { apakahRuntimeTauriAktif } from "@/bersama/ipc/klienIpc";
import { normalisasiTag } from "@/catatan/utilitas/formatCatatan";
import {
  SkemaCuplikanKodeItem,
  SkemaEksporCuplikan,
  SkemaMasukanSimpanCuplikan,
} from "@/cuplikan/skema/skemaCuplikan";
import type {
  CuplikanKodeItem,
  MasukanSimpanCuplikan,
} from "@/cuplikan/tipe/tipeCuplikan";

const KUNCI_CUPLIKAN_WEB = "overthinker_notch_code_snippets";

function bacaCuplikanWeb(): CuplikanKodeItem[] {
  if (typeof window === "undefined") return [];
  try {
    const mentah = window.localStorage.getItem(KUNCI_CUPLIKAN_WEB);
    if (!mentah) return [];
    const parsed = z.array(SkemaCuplikanKodeItem).safeParse(JSON.parse(mentah));
    return parsed.success ? parsed.data : [];
  } catch {
    return [];
  }
}

function tulisCuplikanWeb(daftar: CuplikanKodeItem[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KUNCI_CUPLIKAN_WEB, JSON.stringify(daftar));
}

function urutkanCuplikan(daftar: CuplikanKodeItem[]): CuplikanKodeItem[] {
  return [...daftar].sort((a, b) => {
    if (a.favorit !== b.favorit) return a.favorit ? -1 : 1;
    return b.diperbaruiPada.localeCompare(a.diperbaruiPada);
  });
}

export async function ambilDaftarCuplikan(): Promise<CuplikanKodeItem[]> {
  if (!apakahRuntimeTauriAktif()) {
    return urutkanCuplikan(bacaCuplikanWeb());
  }
  const hasil = await invoke<unknown>("daftar_cuplikan");
  return urutkanCuplikan(z.array(SkemaCuplikanKodeItem).parse(hasil));
}

export async function simpanCuplikanLayanan(
  masukan: MasukanSimpanCuplikan
): Promise<CuplikanKodeItem> {
  const valid = SkemaMasukanSimpanCuplikan.parse(masukan);
  const tagBersih = Array.from(
    new Set(valid.daftarTag.map(normalisasiTag).filter(Boolean))
  );

  if (!apakahRuntimeTauriAktif()) {
    const sekarang = new Date().toISOString();
    const daftar = bacaCuplikanWeb();
    const indeksLama = valid.id
      ? daftar.findIndex((item) => item.id === valid.id)
      : -1;
    const lama = indeksLama >= 0 ? daftar[indeksLama] : undefined;

    const id =
      lama?.id ??
      valid.id ??
      (typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `snippet-${Date.now()}`);

    const riwayatLama = lama?.riwayatVersi ?? [];
    const versiTerakhir = riwayatLama[0];
    const perluVersiBaru = !versiTerakhir || versiTerakhir.kode !== valid.kode;

    const riwayatBaru = perluVersiBaru
      ? [
          {
            id:
              typeof crypto !== "undefined" && "randomUUID" in crypto
                ? crypto.randomUUID()
                : `ver-${Date.now()}`,
            snippetId: id,
            nomorVersi: (versiTerakhir?.nomorVersi ?? 0) + 1,
            kode: valid.kode,
            catatanPerubahan:
              valid.catatanPerubahan?.trim() ||
              `Versi ${(versiTerakhir?.nomorVersi ?? 0) + 1}`,
            dibuatPada: sekarang,
          },
          ...riwayatLama,
        ]
      : riwayatLama;

    const itemBaru: CuplikanKodeItem = {
      id,
      projectId: valid.projectId ?? null,
      judul: valid.judul,
      bahasa: valid.bahasa,
      kategori: valid.kategori,
      kode: valid.kode,
      deskripsi: valid.deskripsi,
      daftarTag: tagBersih,
      favorit: valid.favorit,
      riwayatVersi: riwayatBaru,
      dibuatPada: lama?.dibuatPada ?? sekarang,
      diperbaruiPada: sekarang,
    };

    const daftarBaru =
      indeksLama >= 0
        ? daftar.map((item, i) => (i === indeksLama ? itemBaru : item))
        : [itemBaru, ...daftar];

    tulisCuplikanWeb(urutkanCuplikan(daftarBaru));
    return itemBaru;
  }

  const hasil = await invoke<unknown>("simpan_cuplikan", {
    permintaan: {
      id: valid.id ?? null,
      projectId: valid.projectId ?? null,
      judul: valid.judul,
      bahasa: valid.bahasa,
      kategori: valid.kategori,
      kode: valid.kode,
      deskripsi: valid.deskripsi,
      daftarTag: tagBersih,
      favorit: valid.favorit,
      catatanPerubahan: valid.catatanPerubahan ?? null,
    },
  });
  return SkemaCuplikanKodeItem.parse(hasil);
}

export async function hapusCuplikanLayanan(id: string): Promise<void> {
  if (!apakahRuntimeTauriAktif()) {
    tulisCuplikanWeb(bacaCuplikanWeb().filter((item) => item.id !== id));
    return;
  }
  await invoke("hapus_cuplikan", { id });
}

export async function imporJsonCuplikanLayanan(
  teksJson: string
): Promise<number> {
  const parsed = SkemaEksporCuplikan.parse(JSON.parse(teksJson));
  for (const item of parsed.cuplikan) {
    await simpanCuplikanLayanan({
      id: item.id,
      projectId: item.projectId,
      judul: item.judul,
      bahasa: item.bahasa,
      kategori: item.kategori,
      kode: item.kode,
      deskripsi: item.deskripsi,
      daftarTag: item.daftarTag,
      favorit: item.favorit,
      catatanPerubahan: "Diimpor dari JSON",
    });
  }
  return parsed.cuplikan.length;
}
