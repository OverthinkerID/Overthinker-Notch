export type ModeFokus = "pomodoro" | "deep_work" | "kustom" | "stopwatch";

export type StatusSesiFokus = "siaga" | "berjalan" | "dijeda" | "istirahat";

export interface SesiFokusItem {
  id: string;
  projectId: string | null;
  modeFokus: ModeFokus;
  label: string;
  targetDetik: number;
  durasiAktualDetik: number;
  status: "berjalan" | "dijeda" | "selesai" | "dibatalkan";
  mulaiPada: string;
  selesaiPada: string | null;
}

export interface PengaturanFokus {
  menitPomodoro: number;
  menitDeepWork: number;
  menitKustom: number;
  menitIstirahat: number;
  targetMenitHarian: number;
  notifikasiAktif: boolean;
  pengingatIstirahatAktif: boolean;
}

export interface TimerFokusAktif {
  mode: ModeFokus;
  label: string;
  targetDetik: number;
  status: StatusSesiFokus;
  waktuMulaiMs: number | null;
  akumulasiDetikSebelumJeda: number;
  mulaiPadaIso: string | null;
}
