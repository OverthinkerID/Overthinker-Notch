export type TipeKontenPapanklip = "teks" | "kode" | "url" | "gambar";

export type FilterPapanklip = "semua" | TipeKontenPapanklip | "disematkan";

export interface ItemPapanklip {
  id: string;
  tipeKonten: TipeKontenPapanklip;
  kontenTeks: string | null;
  pathAsetRelatif: string | null;
  pratinjauGambarDataUrl?: string | null;
  aplikasiSumber: string;
  disematkan: boolean;
  hashKonten: string;
  kedaluwarsaPada: string | null;
  dibuatPada: string;
}

export interface PengaturanPapanklip {
  filterSensitifAktif: boolean;
  aplikasiDikecualikan: string[];
  hariRetensi: number;
  maksimalItem: number;
}
