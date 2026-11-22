export interface TelemetriSistem {
  sumberData: "tauri_os_nyata" | "browser_terbatas";
  sistemOperasi: string;
  arsitektur: string;
  namaHost: string;
  modelCpu: string | null;
  jumlahCoreCpu: number | null;
  penggunaanCpuPersen: number | null;
  ramTerpakaiMb: number | null;
  ramTotalMb: number | null;
  diskTerpakaiGb: number | null;
  diskTotalGb: number | null;
  persenBaterai: number | null;
  sedangMengisiDaya: boolean | null;
  uptimeDetik: number | null;
  catatanKejujuran: string;
  diambilPada: string;
}
