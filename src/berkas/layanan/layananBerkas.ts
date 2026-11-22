import { invoke } from "@tauri-apps/api/core";
import { z } from "zod";
import { apakahRuntimeTauriAktif } from "@/bersama/ipc/klienIpc";
import { SkemaBerkasItem, SkemaNamaBerkasBaru } from "@/berkas/skema/skemaBerkas";
import type { BerkasItem, OpsiKedaluwarsa } from "@/berkas/tipe/tipeBerkas";
import {
  apakahBerkasKedaluwarsa,
  bacaFileSebagaiDataUrl,
  bacaFileSebagaiTeks,
  deteksiKategoriPreview,
  hitungTanggalKedaluwarsa,
} from "@/berkas/utilitas/formatBerkas";

const KUNCI_BERKAS_WEB = "overthinker_notch_temp_files";
const MAKS_PREVIEW_TEKS = 40_000;
const MAKS_PREVIEW_GAMBAR_BYTE = 1_500_000;

function bacaBerkasWeb(): BerkasItem[] {
  if (typeof window === "undefined") return [];
  try {
    const mentah = window.localStorage.getItem(KUNCI_BERKAS_WEB);
    if (!mentah) return [];
    const parsed = z.array(SkemaBerkasItem).safeParse(JSON.parse(mentah));
    return parsed.success ? parsed.data : [];
  } catch {
    return [];
  }
}

function tulisBerkasWeb(daftar: BerkasItem[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KUNCI_BERKAS_WEB, JSON.stringify(daftar));
}

export async function ambilDaftarBerkas(): Promise<BerkasItem[]> {
  if (!apakahRuntimeTauriAktif()) {
    return bacaBerkasWeb();
  }
  const hasil = await invoke<unknown>("daftar_berkas");
  return z.array(SkemaBerkasItem).parse(hasil);
}

export async function imporFileDariBrowser(
  daftarFile: File[],
  opsiKedaluwarsa: OpsiKedaluwarsa,
  projectId: string | null
): Promise<BerkasItem[]> {
  const sekarang = new Date();
  const isoSekarang = sekarang.toISOString();
  const kedaluwarsaPada = hitungTanggalKedaluwarsa(opsiKedaluwarsa, sekarang);
  const baruMasuk: BerkasItem[] = [];

  for (const file of daftarFile) {
    const id =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `file-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const tipeMime = file.type || "application/octet-stream";
    const kategori = deteksiKategoriPreview(file.name, tipeMime);

    let pratinjauTeks: string | null = null;
    let pratinjauDataUrl: string | null = null;

    try {
      if (kategori === "teks" && file.size <= 500_000) {
        const isi = await bacaFileSebagaiTeks(file);
        pratinjauTeks = isi.slice(0, MAKS_PREVIEW_TEKS);
      } else if (kategori === "gambar" && file.size <= MAKS_PREVIEW_GAMBAR_BYTE) {
        pratinjauDataUrl = await bacaFileSebagaiDataUrl(file);
      }
    } catch {
      // Abaikan kegagalan preview; metadata tetap tersimpan aman
    }

    baruMasuk.push({
      id,
      projectId,
      namaAsli: file.name,
      namaTampil: file.name,
      pathRelatifVault: `vault/${id.slice(0, 8)}_${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`,
      tipeMime,
      ukuranByte: file.size,
      checksumSha256: "salinan-lokal-web-preview",
      kedaluwarsaPada,
      dihapusPada: null,
      dibuatPada: isoSekarang,
      diperbaruiPada: isoSekarang,
      pratinjauTeks,
      pratinjauDataUrl,
    });
  }

  const gabungan = [...baruMasuk, ...bacaBerkasWeb()];
  tulisBerkasWeb(gabungan);
  return baruMasuk;
}

export async function ubahNamaBerkasLayanan(
  id: string,
  namaBaru: string
): Promise<void> {
  const valid = SkemaNamaBerkasBaru.parse(namaBaru);

  if (!apakahRuntimeTauriAktif()) {
    const sekarang = new Date().toISOString();
    const daftar = bacaBerkasWeb().map((item) =>
      item.id === id
        ? { ...item, namaTampil: valid, diperbaruiPada: sekarang }
        : item
    );
    tulisBerkasWeb(daftar);
    return;
  }

  await invoke("ubah_nama_berkas", { id, namaTampilBaru: valid });
}

export async function aturProyekBerkasLayanan(
  id: string,
  projectId: string | null
): Promise<void> {
  const bersih = projectId?.trim() || null;
  const sekarang = new Date().toISOString();
  const daftar = bacaBerkasWeb().map((item) =>
    item.id === id
      ? { ...item, projectId: bersih, diperbaruiPada: sekarang }
      : item
  );
  tulisBerkasWeb(daftar);
}

export async function aturKedaluwarsaBerkasLayanan(
  id: string,
  opsi: OpsiKedaluwarsa
): Promise<void> {
  const sekarang = new Date();
  const kedaluwarsaPada = hitungTanggalKedaluwarsa(opsi, sekarang);
  const daftar = bacaBerkasWeb().map((item) =>
    item.id === id
      ? {
          ...item,
          kedaluwarsaPada,
          diperbaruiPada: sekarang.toISOString(),
        }
      : item
  );
  tulisBerkasWeb(daftar);
}

export async function hapusSementaraBerkasLayanan(id: string): Promise<void> {
  if (!apakahRuntimeTauriAktif()) {
    const sekarang = new Date().toISOString();
    const daftar = bacaBerkasWeb().map((item) =>
      item.id === id
        ? { ...item, dihapusPada: sekarang, diperbaruiPada: sekarang }
        : item
    );
    tulisBerkasWeb(daftar);
    return;
  }

  await invoke("hapus_sementara_berkas", { id });
}

export async function pulihkanBerkasLayanan(id: string): Promise<void> {
  if (!apakahRuntimeTauriAktif()) {
    const sekarang = new Date().toISOString();
    const daftar = bacaBerkasWeb().map((item) =>
      item.id === id
        ? { ...item, dihapusPada: null, diperbaruiPada: sekarang }
        : item
    );
    tulisBerkasWeb(daftar);
    return;
  }

  await invoke("pulihkan_berkas", { id });
}

export async function hapusPermanenBerkasLayanan(id: string): Promise<void> {
  if (!apakahRuntimeTauriAktif()) {
    const daftar = bacaBerkasWeb().filter((item) => item.id !== id);
    tulisBerkasWeb(daftar);
    return;
  }

  await invoke("hapus_permanen_berkas", { id });
}

export async function bersihkanBerkasKedaluwarsaLayanan(): Promise<number> {
  const sekarang = new Date();
  const semua = await ambilDaftarBerkas();
  const target = semua.filter(
    (item) => !item.dihapusPada && apakahBerkasKedaluwarsa(item.kedaluwarsaPada, sekarang)
  );

  for (const item of target) {
    await hapusSementaraBerkasLayanan(item.id);
  }
  return target.length;
}

export async function tampilkanDiFolderLayanan(id: string): Promise<string> {
  if (!apakahRuntimeTauriAktif()) {
    return "Reveal in Finder/Explorer aktif saat dijalankan di aplikasi desktop Tauri 2.";
  }
  await invoke("tampilkan_berkas_di_folder", { id });
  return "Folder vault dibuka di OS.";
}
