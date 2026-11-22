import type {
  DimensiNotch,
  InfoMonitor,
  ModeTampilanNotch,
  StatusInteraksiNotch,
} from "@/notch/tipe/tipeNotch";

export interface MetadataStatusNotch {
  id: StatusInteraksiNotch;
  label: string;
  deskripsi: string;
  pintasan: string;
  dimensiBawaan: DimensiNotch;
}

export const METADATA_STATUS_NOTCH: Record<
  StatusInteraksiNotch,
  MetadataStatusNotch
> = {
  siaga: {
    id: "siaga",
    label: "Siaga",
    deskripsi: "Kapsul kecil, standby nunggu interaksi.",
    pintasan: "Esc",
    dimensiBawaan: { lebar: 240, tinggi: 44 },
  },
  ringkas: {
    id: "ringkas",
    label: "Ringkas",
    deskripsi: "Bar ringkas buat indikator & akses cepat.",
    pintasan: "Alt+Space",
    dimensiBawaan: { lebar: 400, tinggi: 56 },
  },
  diperluas: {
    id: "diperluas",
    label: "Diperluas",
    deskripsi: "Panel melayang buat pindah modul dengan cepat.",
    pintasan: "Alt+Space",
    dimensiBawaan: { lebar: 640, tinggi: 360 },
  },
  musik: {
    id: "musik",
    label: "Musik",
    deskripsi: "Kontrol audio, metadata lagu, dan lirik.",
    pintasan: "Alt+1",
    dimensiBawaan: { lebar: 640, tinggi: 380 },
  },
  catatan: {
    id: "catatan",
    label: "Catatan",
    deskripsi: "Catat cepat tanpa takut teks hilang saat pindah tab.",
    pintasan: "Alt+2",
    dimensiBawaan: { lebar: 660, tinggi: 400 },
  },
  kode: {
    id: "kode",
    label: "Kode",
    deskripsi: "Code snippet cepat tanpa kehilangan posisi kursor.",
    pintasan: "Alt+3",
    dimensiBawaan: { lebar: 720, tinggi: 430 },
  },
  berkas: {
    id: "berkas",
    label: "Berkas",
    deskripsi: "Simpan file sementara secara lokal dengan aman.",
    pintasan: "Alt+4",
    dimensiBawaan: { lebar: 660, tinggi: 390 },
  },
  fokus: {
    id: "fokus",
    label: "Fokus",
    deskripsi: "Timer Pomodoro, Deep Work, dan pengingat break.",
    pintasan: "Alt+5",
    dimensiBawaan: { lebar: 620, tinggi: 360 },
  },
  dasbor: {
    id: "dasbor",
    label: "Dasbor",
    deskripsi: "Workspace lengkap buat akses semua modul & pengaturan.",
    pintasan: "Alt+6",
    dimensiBawaan: { lebar: 960, tinggi: 640 },
  },
};

export const URUTAN_STATUS_NOTCH: readonly StatusInteraksiNotch[] = [
  "siaga",
  "ringkas",
  "diperluas",
  "musik",
  "catatan",
  "kode",
  "berkas",
  "fokus",
  "dasbor",
] as const;

export function apakahStatusDiperluas(status: StatusInteraksiNotch): boolean {
  return status !== "siaga" && status !== "ringkas";
}

export function hitungStatusToggle(
  statusSaatIni: StatusInteraksiNotch,
  statusTerakhirDiperluas: StatusInteraksiNotch
): StatusInteraksiNotch {
  if (apakahStatusDiperluas(statusSaatIni)) {
    return "ringkas";
  }
  return apakahStatusDiperluas(statusTerakhirDiperluas)
    ? statusTerakhirDiperluas
    : "diperluas";
}

export function tentukanModeEfektif(
  modeDiminta: ModeTampilanNotch,
  monitor: InfoMonitor | null
): {
  modeEfektif: ModeTampilanNotch;
  fallbackAktif: boolean;
  alasanFallback: string | null;
} {
  if (modeDiminta === "pulau_melayang") {
    return {
      modeEfektif: "pulau_melayang",
      fallbackAktif: false,
      alasanFallback: null,
    };
  }

  if (!monitor) {
    return {
      modeEfektif: "pulau_melayang",
      fallbackAktif: true,
      alasanFallback: "Monitor aktif belum terdeteksi; otomatis pakai Floating Island.",
    };
  }

  if (!monitor.dukunganNotch) {
    return {
      modeEfektif: "pulau_melayang",
      fallbackAktif: true,
      alasanFallback: `Layar "${monitor.nama}" nggak punya notch bawaan; otomatis pakai Floating Island.`,
    };
  }

  return {
    modeEfektif: "notch_adaptif",
    fallbackAktif: false,
    alasanFallback: null,
  };
}

export function hitungPosisiAman(
  posisiX: number,
  posisiY: number,
  lebarPanel: number,
  tinggiPanel: number,
  monitor: InfoMonitor
): { posisiX: number; posisiY: number } {
  const margin = 12;
  const batasKiri = monitor.posisiX + margin;
  const batasKanan = Math.max(
    batasKiri,
    monitor.posisiX + monitor.lebarLogis - lebarPanel - margin
  );
  const batasAtas = monitor.posisiY + Math.max(margin, monitor.tinggiAreaAmanAtas);
  const batasBawah = Math.max(
    batasAtas,
    monitor.posisiY + monitor.tinggiLogis - tinggiPanel - margin
  );

  return {
    posisiX: Math.min(Math.max(posisiX, batasKiri), batasKanan),
    posisiY: Math.min(Math.max(posisiY, batasAtas), batasBawah),
  };
}

export function hitungPosisiNotchAdaptif(
  lebarPanel: number,
  monitor: InfoMonitor
): { posisiX: number; posisiY: number } {
  const posisiX = monitor.posisiX + Math.round((monitor.lebarLogis - lebarPanel) / 2);
  const posisiY = monitor.posisiY + Math.max(6, Math.round(monitor.tinggiAreaAmanAtas * 0.25));
  return { posisiX, posisiY };
}
