import type { LaporanKapabilitas } from "@/bersama/ipc/klienIpc";

export type AksiKontrolMedia = "play_pause" | "next" | "previous";

export type JenisPenyediaPengenal = "belum_diatur" | "audd" | "acrcloud" | "kustom";

export interface InfoTrekAktif {
  sedangMemutar: boolean;
  judulLagu: string | null;
  artis: string | null;
  album: string | null;
  sumberAudio: string;
  durasiDetik: number;
  posisiDetik: number;
  urlArtwork: string | null;
  kontrolDidukung: boolean;
}

export interface RiwayatMusikItem {
  id: string;
  judulLagu: string;
  artis: string;
  album: string;
  sumberAudio: string;
  durasiDetik: number;
  pathArtworkRelatif: string | null;
  diputarPada: string;
}

export interface KonfigurasiPengenalLagu {
  jenisPenyedia: JenisPenyediaPengenal;
  endpointUrl: string;
  apiTokenTersimpan: boolean;
}

export type KapabilitasMusik = LaporanKapabilitas;
