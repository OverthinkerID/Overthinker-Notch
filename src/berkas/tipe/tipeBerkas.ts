export type FilterTabBerkas = "aktif" | "kedaluwarsa" | "recovery";

export type OpsiKedaluwarsa = "24_jam" | "7_hari" | "14_hari" | "30_hari" | "tanpa_batas";

export type KategoriPreviewBerkas = "teks" | "gambar" | "biner";

export interface BerkasItem {
  id: string;
  projectId: string | null;
  namaAsli: string;
  namaTampil: string;
  pathRelatifVault: string;
  tipeMime: string;
  ukuranByte: number;
  checksumSha256: string;
  kedaluwarsaPada: string | null;
  dihapusPada: string | null;
  dibuatPada: string;
  diperbaruiPada: string;
  pratinjauTeks?: string | null;
  pratinjauDataUrl?: string | null;
}
