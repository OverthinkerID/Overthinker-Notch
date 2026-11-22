export type ModeTampilanNotch = "notch_adaptif" | "pulau_melayang";

export type StatusInteraksiNotch =
  | "siaga"
  | "ringkas"
  | "diperluas"
  | "musik"
  | "catatan"
  | "kode"
  | "berkas"
  | "fokus"
  | "dasbor";

export interface InfoMonitor {
  idMonitor: string;
  nama: string;
  lebarLogis: number;
  tinggiLogis: number;
  posisiX: number;
  posisiY: number;
  faktorSkala: number;
  utama: boolean;
  dukunganNotch: boolean;
  tinggiAreaAmanAtas: number;
}

export interface GeometriPulau {
  posisiX: number;
  posisiY: number;
  lebarDiperluas: number;
  tinggiDiperluas: number;
}

export interface DimensiNotch {
  lebar: number;
  tinggi: number;
}

export interface DefinisiPintasan {
  id: string;
  kombinasi: string;
  label: string;
  keterangan: string;
}

export interface BufferMasukanNotch {
  catatanCepat: string;
  cuplikanKode: string;
  cariMusik: string;
  labelFokus: string;
}
