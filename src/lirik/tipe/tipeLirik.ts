export type JenisPenyediaLirik =
  | "belum_diatur"
  | "musixmatch_authorized"
  | "lrclib_authorized"
  | "kustom";

export interface BarisLirikTerjadwal {
  waktuDetik: number;
  teks: string;
}

export interface JendelaLirikAktif {
  indeksAktif: number;
  barisSebelumnya: BarisLirikTerjadwal | null;
  barisAktif: BarisLirikTerjadwal | null;
  barisBerikutnya: BarisLirikTerjadwal | null;
}

export interface LirikTersimpanItem {
  id: string;
  judulLagu: string;
  artis: string;
  penyedia: string;
  bahasa: string;
  teksLirik: string;
  tersinkronisasi: boolean;
  terjemahan: string | null;
  diperbaruiPada: string;
}

export interface KonfigurasiPenyediaLirik {
  jenisPenyedia: JenisPenyediaLirik;
  endpointUrl: string;
  kredensialTersimpan: boolean;
}
