export type ModeTema = "gelap" | "terang";

export interface DefinisiWarna {
  nama: string;
  peran: string;
  nilaiHex: string;
  tokenCss: string;
}

export const TOKEN_WARNA_IDENTITAS: readonly DefinisiWarna[] = [
  {
    nama: "Electric Blue",
    peran: "Aksen utama, focus ring, dan tombol primary",
    nilaiHex: "#55A7FF",
    tokenCss: "--aksen-biru-elektrik",
  },
  {
    nama: "Neon Purple",
    peran: "Aksen sekunder, modul AI, dan highlight kreatif",
    nilaiHex: "#A879FF",
    tokenCss: "--aksen-ungu-neon",
  },
  {
    nama: "Cyber Teal",
    peran: "Status aktif, timer selesai, dan indikator sistem",
    nilaiHex: "#66E5D2",
    tokenCss: "--aksen-teal-siber",
  },
  {
    nama: "Dark Background",
    peran: "Background utama buat Dark Mode",
    nilaiHex: "#101521",
    tokenCss: "--warna-latar",
  },
  {
    nama: "Dark Surface",
    peran: "Card, glass panel, dan drawer melayang",
    nilaiHex: "#171C29",
    tokenCss: "--warna-permukaan",
  },
] as const;

export const SKALA_TIPOGRAFI = [
  {
    label: "Heading Utama",
    ukuran: "24px / 600",
    kelas: "text-2xl font-semibold tracking-tight",
    contoh: "Overthinker Notch — Desktop Productivity Hub",
  },
  {
    label: "Heading Section",
    ukuran: "18px / 600",
    kelas: "text-lg font-semibold tracking-tight",
    contoh: "Design System & Komponen Inti",
  },
  {
    label: "Judul Card",
    ukuran: "15px / 600",
    kelas: "text-[15px] font-semibold",
    contoh: "Floating Glass Panel",
  },
  {
    label: "Body Text",
    ukuran: "14px / 400",
    kelas: "text-sm leading-relaxed",
    contoh: "Workspace desktop local-first yang cepat, rapi, dan jaga privasi data kamu.",
  },
  {
    label: "Caption",
    ukuran: "12px / 500",
    kelas: "text-xs text-[var(--warna-teks-sekunder)]",
    contoh: "Auto-save lokal • Jalan lancar tanpa internet",
  },
  {
    label: "Code Monospace",
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
  { id: "siaga", label: "Siaga", deskripsi: "Kapsul kecil, standby nunggu interaksi" },
  { id: "ringkas", label: "Ringkas", deskripsi: "Bar ringkas buat indikator & tombol cepat" },
  { id: "diperluas", label: "Diperluas", deskripsi: "Panel cepat melayang buat pindah modul" },
  { id: "musik", label: "Musik", deskripsi: "Kontrol media, metadata lagu & lirik" },
  { id: "catatan", label: "Catatan", deskripsi: "Catat cepat, Markdown & checklist" },
  { id: "kode", label: "Kode", deskripsi: "Code snippet vault berbasis Monaco Editor" },
  { id: "berkas", label: "Berkas", deskripsi: "Temporary file storage lokal yang aman" },
  { id: "fokus", label: "Fokus", deskripsi: "Timer Pomodoro, Deep Work & pengingat break" },
  { id: "dasbor", label: "Dasbor", deskripsi: "Workspace lengkap buat semua modul" },
] as const;

export function ambilDeskripsiTema(mode: ModeTema): string {
  return mode === "gelap"
    ? "Dark Mode (#101521 / #171C29)"
    : "Light Mode (#F4F7FC / #FFFFFF)";
}
