import { invoke } from "@tauri-apps/api/core";
import { z } from "zod";
import { apakahRuntimeTauriAktif } from "@/bersama/ipc/klienIpc";
import {
  SkemaKonfigurasiPenyediaLirik,
  SkemaLirikTersimpanItem,
  SkemaMasukanSimpanLirik,
} from "@/lirik/skema/skemaLirik";
import type {
  KonfigurasiPenyediaLirik,
  LirikTersimpanItem,
} from "@/lirik/tipe/tipeLirik";
import { uraiLirikLrc } from "@/lirik/utilitas/penguraiLrc";

const KUNCI_CACHE_LIRIK_WEB = "overthinker_notch_lyrics_cache";
const KUNCI_PENYEDIA_LIRIK = "overthinker_notch_lyrics_provider";

export const KONFIG_PENYEDIA_LIRIK_BAWAAN: KonfigurasiPenyediaLirik = {
  jenisPenyedia: "belum_diatur",
  endpointUrl: "",
  kredensialTersimpan: false,
};

export function ambilKonfigPenyediaLirik(): KonfigurasiPenyediaLirik {
  if (typeof window === "undefined") return KONFIG_PENYEDIA_LIRIK_BAWAAN;
  try {
    const mentah = window.localStorage.getItem(KUNCI_PENYEDIA_LIRIK);
    if (!mentah) return KONFIG_PENYEDIA_LIRIK_BAWAAN;
    const parsed = SkemaKonfigurasiPenyediaLirik.safeParse(JSON.parse(mentah));
    return parsed.success ? parsed.data : KONFIG_PENYEDIA_LIRIK_BAWAAN;
  } catch {
    return KONFIG_PENYEDIA_LIRIK_BAWAAN;
  }
}

export function simpanKonfigPenyediaLirik(
  konfig: KonfigurasiPenyediaLirik
): KonfigurasiPenyediaLirik {
  const valid = SkemaKonfigurasiPenyediaLirik.parse(konfig);
  if (typeof window !== "undefined") {
    window.localStorage.setItem(KUNCI_PENYEDIA_LIRIK, JSON.stringify(valid));
  }
  return valid;
}

export async function ambilDaftarCacheLirik(): Promise<LirikTersimpanItem[]> {
  if (!apakahRuntimeTauriAktif()) {
    if (typeof window === "undefined") return [];
    try {
      const mentah = window.localStorage.getItem(KUNCI_CACHE_LIRIK_WEB);
      if (!mentah) return [];
      const parsed = z
        .array(SkemaLirikTersimpanItem)
        .safeParse(JSON.parse(mentah));
      return parsed.success ? parsed.data : [];
    } catch {
      return [];
    }
  }

  const hasil = await invoke<unknown>("daftar_cache_lirik");
  return z.array(SkemaLirikTersimpanItem).parse(hasil);
}

export async function simpanCacheLirikLayanan(masukan: {
  id?: string;
  judulLagu: string;
  artis: string;
  penyedia: string;
  bahasa: string;
  teksLirik: string;
  terjemahan?: string | null;
}): Promise<LirikTersimpanItem> {
  const valid = SkemaMasukanSimpanLirik.parse(masukan);
  const hasilUrai = uraiLirikLrc(valid.teksLirik);

  if (!apakahRuntimeTauriAktif()) {
    const sekarang = new Date().toISOString();
    const id =
      valid.id ??
      (typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `lyrics-${Date.now()}`);

    const baru: LirikTersimpanItem = {
      id,
      judulLagu: valid.judulLagu,
      artis: valid.artis,
      penyedia: valid.penyedia,
      bahasa: valid.bahasa,
      teksLirik: valid.teksLirik,
      tersinkronisasi: hasilUrai.tersinkronisasi,
      terjemahan: valid.terjemahan?.trim() || null,
      diperbaruiPada: sekarang,
    };

    const lama = await ambilDaftarCacheLirik();
    const gabungan = [baru, ...lama.filter((i) => i.id !== id)].slice(0, 100);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(
        KUNCI_CACHE_LIRIK_WEB,
        JSON.stringify(gabungan)
      );
    }
    return baru;
  }

  const hasil = await invoke<unknown>("simpan_cache_lirik", {
    permintaan: {
      id: valid.id ?? null,
      judulLagu: valid.judulLagu,
      artis: valid.artis,
      penyedia: valid.penyedia,
      bahasa: valid.bahasa,
      teksLirik: valid.teksLirik,
      tersinkronisasi: hasilUrai.tersinkronisasi,
      terjemahan: valid.terjemahan ?? null,
    },
  });
  return SkemaLirikTersimpanItem.parse(hasil);
}

export async function hapusCacheLirikLayanan(id: string): Promise<void> {
  if (!apakahRuntimeTauriAktif()) {
    const lama = await ambilDaftarCacheLirik();
    if (typeof window !== "undefined") {
      window.localStorage.setItem(
        KUNCI_CACHE_LIRIK_WEB,
        JSON.stringify(lama.filter((i) => i.id !== id))
      );
    }
    return;
  }
  await invoke("hapus_cache_lirik", { id });
}

export async function cariLirikDariPenyedia(params: {
  judulLagu: string;
  artis: string;
  konfig: KonfigurasiPenyediaLirik;
}): Promise<{
  ditemukan: LirikTersimpanItem | null;
  pesan: string;
}> {
  const qJudul = params.judulLagu.trim().toLowerCase();
  const qArtis = params.artis.trim().toLowerCase();
  const semuaCache = await ambilDaftarCacheLirik();

  const cocokCache = semuaCache.find(
    (item) =>
      item.judulLagu.toLowerCase().includes(qJudul) &&
      (!qArtis || item.artis.toLowerCase().includes(qArtis))
  );

  if (cocokCache) {
    return {
      ditemukan: cocokCache,
      pesan: `Lirik ditemukan di cache lokal (${cocokCache.tersinkronisasi ? "Timed LRC" : "Lirik Polos"}).`,
    };
  }

  if (
    params.konfig.jenisPenyedia === "belum_diatur" ||
    !params.konfig.kredensialTersimpan
  ) {
    return {
      ditemukan: null,
      pesan:
        "Lirik belum ada di cache lokal dan penyedia lirik resmi belum dikonfigurasi.",
    };
  }

  return {
    ditemukan: null,
    pesan: `Penyedia ${params.konfig.jenisPenyedia} siap; sambungkan request HTTP terotorisasi atau simpan lirik manual ke cache lokal.`,
  };
}
