import { invoke } from "@tauri-apps/api/core";
import { z } from "zod";
import { apakahRuntimeTauriAktif } from "@/bersama/ipc/klienIpc";
import { normalisasiTag } from "@/catatan/utilitas/formatCatatan";
import {
  SkemaEksporPrompt,
  SkemaMasukanSimpanPrompt,
  SkemaPromptItem,
} from "@/prompt/skema/skemaPrompt";
import type {
  MasukanSimpanPrompt,
  PromptItem,
} from "@/prompt/tipe/tipePrompt";
import { ekstrakVariabelPrompt } from "@/prompt/utilitas/variabelPrompt";

const KUNCI_PROMPT_WEB = "overthinker_notch_ai_prompts";

function bacaPromptWeb(): PromptItem[] {
  if (typeof window === "undefined") return [];
  try {
    const mentah = window.localStorage.getItem(KUNCI_PROMPT_WEB);
    if (!mentah) return [];
    const parsed = z.array(SkemaPromptItem).safeParse(JSON.parse(mentah));
    return parsed.success ? parsed.data : [];
  } catch {
    return [];
  }
}

function tulisPromptWeb(daftar: PromptItem[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KUNCI_PROMPT_WEB, JSON.stringify(daftar));
}

function urutkanPrompt(daftar: PromptItem[]): PromptItem[] {
  return [...daftar].sort((a, b) => {
    if (a.favorit !== b.favorit) return a.favorit ? -1 : 1;
    return b.diperbaruiPada.localeCompare(a.diperbaruiPada);
  });
}

export async function ambilDaftarPrompt(): Promise<PromptItem[]> {
  if (!apakahRuntimeTauriAktif()) {
    return urutkanPrompt(bacaPromptWeb());
  }
  const hasil = await invoke<unknown>("daftar_prompt");
  return urutkanPrompt(z.array(SkemaPromptItem).parse(hasil));
}

export async function simpanPromptLayanan(
  masukan: MasukanSimpanPrompt
): Promise<PromptItem> {
  const valid = SkemaMasukanSimpanPrompt.parse(masukan);
  const daftarVariabel = ekstrakVariabelPrompt(valid.templatePrompt);
  const tagBersih = Array.from(
    new Set(valid.daftarTag.map(normalisasiTag).filter(Boolean))
  );

  if (!apakahRuntimeTauriAktif()) {
    const sekarang = new Date().toISOString();
    const daftar = bacaPromptWeb();
    const indeksLama = valid.id
      ? daftar.findIndex((i) => i.id === valid.id)
      : -1;
    const lama = indeksLama >= 0 ? daftar[indeksLama] : undefined;

    const id =
      lama?.id ??
      valid.id ??
      (typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `prompt-${Date.now()}`);

    const riwayatLama = lama?.riwayatVersi ?? [];
    const versiTerakhir = riwayatLama[0];
    const perluVersiBaru =
      !versiTerakhir ||
      versiTerakhir.templatePrompt !== valid.templatePrompt;

    const riwayatBaru = perluVersiBaru
      ? [
          {
            id:
              typeof crypto !== "undefined" && "randomUUID" in crypto
                ? crypto.randomUUID()
                : `pver-${Date.now()}`,
            promptId: id,
            nomorVersi: (versiTerakhir?.nomorVersi ?? 0) + 1,
            templatePrompt: valid.templatePrompt,
            catatanPerubahan:
              valid.catatanPerubahan?.trim() ||
              `Versi ${(versiTerakhir?.nomorVersi ?? 0) + 1}`,
            dibuatPada: sekarang,
          },
          ...riwayatLama,
        ]
      : riwayatLama;

    const itemBaru: PromptItem = {
      id,
      projectId: valid.projectId ?? null,
      judul: valid.judul,
      kategori: valid.kategori,
      templatePrompt: valid.templatePrompt,
      daftarVariabel,
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

    tulisPromptWeb(urutkanPrompt(daftarBaru));
    return itemBaru;
  }

  const hasil = await invoke<unknown>("simpan_prompt", {
    permintaan: {
      id: valid.id ?? null,
      projectId: valid.projectId ?? null,
      judul: valid.judul,
      kategori: valid.kategori,
      templatePrompt: valid.templatePrompt,
      daftarVariabel,
      daftarTag: tagBersih,
      favorit: valid.favorit,
      catatanPerubahan: valid.catatanPerubahan ?? null,
    },
  });
  return SkemaPromptItem.parse(hasil);
}

export async function hapusPromptLayanan(id: string): Promise<void> {
  if (!apakahRuntimeTauriAktif()) {
    tulisPromptWeb(bacaPromptWeb().filter((item) => item.id !== id));
    return;
  }
  await invoke("hapus_prompt", { id });
}

export async function imporJsonPromptLayanan(teksJson: string): Promise<number> {
  const parsed = SkemaEksporPrompt.parse(JSON.parse(teksJson));
  for (const item of parsed.prompts) {
    await simpanPromptLayanan({
      id: item.id,
      projectId: item.projectId,
      judul: item.judul,
      kategori: item.kategori,
      templatePrompt: item.templatePrompt,
      daftarTag: item.daftarTag,
      favorit: item.favorit,
      catatanPerubahan: "Diimpor dari JSON",
    });
  }
  return parsed.prompts.length;
}
