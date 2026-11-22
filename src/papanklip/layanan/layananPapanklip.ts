import { invoke } from "@tauri-apps/api/core";
import { z } from "zod";
import { apakahRuntimeTauriAktif } from "@/bersama/ipc/klienIpc";
import {
  SkemaItemPapanklip,
  SkemaPengaturanPapanklip,
} from "@/papanklip/skema/skemaPapanklip";
import type {
  ItemPapanklip,
  PengaturanPapanklip,
  TipeKontenPapanklip,
} from "@/papanklip/tipe/tipePapanklip";
import {
  apakahAplikasiDikecualikan,
  APLIKASI_DIKECUALIKAN_BAWAAN,
  deteksiTipeKontenPapanklip,
  hitungHashRingan,
  periksaDataSensitif,
} from "@/papanklip/utilitas/filterPapanklip";

const KUNCI_RIWAYAT_WEB = "overthinker_notch_clipboard_history";
const KUNCI_ATURAN_WEB = "overthinker_notch_clipboard_settings";

export const PENGATURAN_PAPANKLIP_BAWAAN: PengaturanPapanklip = {
  filterSensitifAktif: true,
  aplikasiDikecualikan: [...APLIKASI_DIKECUALIKAN_BAWAAN],
  hariRetensi: 30,
  maksimalItem: 150,
};

function bacaRiwayatWeb(): ItemPapanklip[] {
  if (typeof window === "undefined") return [];
  try {
    const mentah = window.localStorage.getItem(KUNCI_RIWAYAT_WEB);
    if (!mentah) return [];
    const parsed = z.array(SkemaItemPapanklip).safeParse(JSON.parse(mentah));
    return parsed.success ? parsed.data : [];
  } catch {
    return [];
  }
}

function tulisRiwayatWeb(daftar: ItemPapanklip[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KUNCI_RIWAYAT_WEB, JSON.stringify(daftar));
}

function urutkanRiwayat(daftar: ItemPapanklip[]): ItemPapanklip[] {
  return [...daftar].sort((a, b) => {
    if (a.disematkan !== b.disematkan) return a.disematkan ? -1 : 1;
    return b.dibuatPada.localeCompare(a.dibuatPada);
  });
}

export function ambilPengaturanPapanklip(): PengaturanPapanklip {
  if (typeof window === "undefined") return PENGATURAN_PAPANKLIP_BAWAAN;
  try {
    const mentah = window.localStorage.getItem(KUNCI_ATURAN_WEB);
    if (!mentah) return PENGATURAN_PAPANKLIP_BAWAAN;
    const parsed = SkemaPengaturanPapanklip.safeParse(JSON.parse(mentah));
    return parsed.success ? parsed.data : PENGATURAN_PAPANKLIP_BAWAAN;
  } catch {
    return PENGATURAN_PAPANKLIP_BAWAAN;
  }
}

export function simpanPengaturanPapanklip(
  pengaturan: PengaturanPapanklip
): PengaturanPapanklip {
  const valid = SkemaPengaturanPapanklip.parse(pengaturan);
  if (typeof window !== "undefined") {
    window.localStorage.setItem(KUNCI_ATURAN_WEB, JSON.stringify(valid));
  }
  return valid;
}

export async function ambilDaftarPapanklip(): Promise<ItemPapanklip[]> {
  if (!apakahRuntimeTauriAktif()) {
    return urutkanRiwayat(bacaRiwayatWeb());
  }
  const hasil = await invoke<unknown>("daftar_papanklip");
  return urutkanRiwayat(z.array(SkemaItemPapanklip).parse(hasil));
}

export async function simpanItemPapanklipLayanan(params: {
  kontenTeks?: string | null;
  pratinjauGambarDataUrl?: string | null;
  aplikasiSumber: string;
  pengaturan: PengaturanPapanklip;
}): Promise<{ item: ItemPapanklip | null; diblokirAlasan: string | null }> {
  const { kontenTeks = null, pratinjauGambarDataUrl = null, aplikasiSumber, pengaturan } =
    params;

  if (
    apakahAplikasiDikecualikan(aplikasiSumber, pengaturan.aplikasiDikecualikan)
  ) {
    return {
      item: null,
      diblokirAlasan: `Dilewati: "${aplikasiSumber}" ada di daftar aplikasi dikecualikan.`,
    };
  }

  if (kontenTeks && pengaturan.filterSensitifAktif) {
    const cek = periksaDataSensitif(kontenTeks);
    if (cek.sensitif) {
      return { item: null, diblokirAlasan: cek.alasan };
    }
  }

  const tipeKonten: TipeKontenPapanklip = pratinjauGambarDataUrl
    ? "gambar"
    : deteksiTipeKontenPapanklip(kontenTeks ?? "");

  if (!apakahRuntimeTauriAktif()) {
    const sekarang = new Date();
    const sumberHash = pratinjauGambarDataUrl ?? kontenTeks ?? "";
    if (!sumberHash.trim()) {
      return { item: null, diblokirAlasan: "Konten clipboard kosong." };
    }
    const hashKonten = hitungHashRingan(sumberHash);
    const lama = bacaRiwayatWeb();
    const duplikat = lama.find((i) => i.hashKonten === hashKonten);
    const id =
      duplikat?.id ??
      (typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `clip-${Date.now()}`);

    const kedaluwarsaPada = new Date(
      sekarang.getTime() + pengaturan.hariRetensi * 86_400_000
    ).toISOString();

    const itemBaru: ItemPapanklip = {
      id,
      tipeKonten,
      kontenTeks: pratinjauGambarDataUrl ? null : kontenTeks,
      pathAsetRelatif: pratinjauGambarDataUrl
        ? `vault/clipboard_${id.slice(0, 8)}.png`
        : null,
      pratinjauGambarDataUrl,
      aplikasiSumber: aplikasiSumber.trim() || "Overthinker Notch",
      disematkan: duplikat?.disematkan ?? false,
      hashKonten,
      kedaluwarsaPada,
      dibuatPada: sekarang.toISOString(),
    };

    const tanpaDuplikat = lama.filter((i) => i.id !== id);
    const gabungan = urutkanRiwayat([itemBaru, ...tanpaDuplikat]).slice(
      0,
      pengaturan.maksimalItem
    );
    tulisRiwayatWeb(gabungan);
    return { item: itemBaru, diblokirAlasan: null };
  }

  const hasil = await invoke<unknown>("simpan_item_papanklip", {
    permintaan: {
      tipeKonten,
      kontenTeks,
      pathAsetRelatif: null,
      aplikasiSumber,
      filterSensitifAktif: pengaturan.filterSensitifAktif,
      aplikasiDikecualikan: pengaturan.aplikasiDikecualikan,
      hariRetensi: pengaturan.hariRetensi,
    },
  });
  return { item: SkemaItemPapanklip.parse(hasil), diblokirAlasan: null };
}

export async function ubahPinPapanklipLayanan(
  id: string,
  disematkan: boolean
): Promise<void> {
  if (!apakahRuntimeTauriAktif()) {
    const daftar = bacaRiwayatWeb().map((item) =>
      item.id === id ? { ...item, disematkan } : item
    );
    tulisRiwayatWeb(urutkanRiwayat(daftar));
    return;
  }
  await invoke("ubah_pin_papanklip", { id, disematkan });
}

export async function hapusItemPapanklipLayanan(id: string): Promise<void> {
  if (!apakahRuntimeTauriAktif()) {
    tulisRiwayatWeb(bacaRiwayatWeb().filter((item) => item.id !== id));
    return;
  }
  await invoke("hapus_item_papanklip", { id });
}

export async function bersihkanNonPinPapanklipLayanan(): Promise<number> {
  if (!apakahRuntimeTauriAktif()) {
    const semua = bacaRiwayatWeb();
    const hanyaPin = semua.filter((item) => item.disematkan);
    tulisRiwayatWeb(hanyaPin);
    return semua.length - hanyaPin.length;
  }
  return invoke<number>("bersihkan_papanklip_non_pin");
}
