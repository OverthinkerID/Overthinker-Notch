export type StatusKapabilitasOs =
  | "didukung"
  | "perlu_izin"
  | "penyedia_belum_dikonfigurasi"
  | "tidak_didukung_os";

export interface ItemKapabilitasOs {
  namaFitur: string;
  status: StatusKapabilitasOs;
  keterangan: string;
}

export interface StatusIntegrasiOs {
  sumberData: "tauri_os_nyata" | "browser_terbatas";
  sistemOperasi: string;
  autoStartAktif: boolean;
  jalurAutoStart: string;
  mendukungTrayMenu: boolean;
  mendukungPintasanGlobal: boolean;
  kapabilitas: ItemKapabilitasOs[];
  catatan: string;
}
