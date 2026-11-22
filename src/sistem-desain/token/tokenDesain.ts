export type ModeTema = "gelap" | "terang";

export interface DefinisiWarna {
  nama: string;
  peran: string;
  nilaiHex: string;
  tokenCss: string;
}

export const TOKEN_WARNA_IDENTITAS: readonly DefinisiWarna[] = [
  {
    nama: "Biru Elektrik",
    peran: "Aksen utama, fokus aktif, tombol primer",
    nilaiHex: "#55A7FF",
    tokenCss: "--aksen-biru-elektrik",
  },
  {
    nama: "Ungu Neon",
    peran: "Aksen sekunder, modul AI & kreativitas",
    nilaiHex: "#A879FF",
    tokenCss: "--aksen-ungu-neon",
  },
  {
    nama: "Teal Siber",
    peran: "Indikator aktif, penyelesaian fokus, telemetri",
    nilaiHex: "#66E5D2",
    tokenCss: "--aksen-teal-siber",
  },
  {
    nama: "Latar Gelap",
    peran: "Latar belakang utama mode gelap",
    nilaiHex: "#101521",
    tokenCss: "--warna-latar",
  },
  {
    nama: "Permukaan Gelap",
    peran: "Kartu, panel kaca, dan laci melayang",
    nilaiHex: "#171C29",
    tokenCss: "--warna-permukaan",
  },
] as const;

export const SKALA_TIPOGRAFI = [
  {
    label: "Judul Utama",
    ukuran: "24px / 600",
    kelas: "text-2xl font-semibold tracking-tight",
    contoh: "Overthinker Notch — Pusat Produktivitas",
  },
  {
    label: "Judul Bagian",
    ukuran: "18px / 600",
    kelas: "text-lg font-semibold tracking-tight",
    contoh: "Sistem Desain & Komponen Inti",
  },
  {
    label: "Judul Kartu",
    ukuran: "15px / 600",
    kelas: "text-[15px] font-semibold",
    contoh: "Panel Kaca Melayang",
  },
  {
    label: "Teks Isi",
    ukuran: "14px / 400",
    kelas: "text-sm leading-relaxed",
    contoh: "Antarmuka desktop lokal yang cepat, rapi, dan menjaga privasi data.",
  },
  {
    label: "Teks Keterangan",
    ukuran: "12px / 500",
    kelas: "text-xs text-[var(--warna-teks-sekunder)]",
    contoh: "Tersimpan otomatis secara lokal • Tanpa koneksi wajib",
  },
  {
    label: "Kode Monospace",
    ukuran: "13px / 500",
    kelas: "font-kode text-[13px]",
    contoh: "ambil_info_runtime() -> Result<InfoRuntimeSistem, GalatAplikasi>",
  },
] as const;

export const PRESET_PEGAS = {
  halus: { type: "spring" as const, stiffness: 320, damping: 28, mass: 0.9 },
  responsif: { type: "spring" as const, stiffness: 440, damping: 32, mass: 0.75 },
  notch: { type: "spring" as const, stiffness: 380, damping: 30, mass: 0.85 },
} as const;

export const DAFTAR_STATUS_NOTCH = [
  { id: "siaga", label: "Siaga", deskripsi: "Kapsul ringkas menunggu interaksi" },
  { id: "ringkas", label: "Ringkas", deskripsi: "Menampilkan indikator status penting" },
  { id: "diperluas", label: "Diperluas", deskripsi: "Panel kontrol cepat melayang" },
  { id: "musik", label: "Musik", deskripsi: "Kontrol media & metadata lagu" },
  { id: "catatan", label: "Catatan", deskripsi: "Tangkap cepat catatan & daftar periksa" },
  { id: "kode", label: "Kode", deskripsi: "Brankas cuplikan kode Monaco" },
  { id: "berkas", label: "Berkas", deskripsi: "Penyimpanan berkas sementara lokal" },
  { id: "fokus", label: "Fokus", deskripsi: "Pengatur waktu Pomodoro & Kerja Mendalam" },
  { id: "dasbor", label: "Dasbor", deskripsi: "Ruang kerja terpadu semua modul" },
] as const;

export function ambilDeskripsiTema(mode: ModeTema): string {
  return mode === "gelap"
    ? "Mode Gelap Futuristik (#101521 / #171C29)"
    : "Mode Terang Bersih (#F4F7FC / #FFFFFF)";
}
