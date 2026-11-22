import type { SesiFokusItem, TimerFokusAktif } from "@/fokus/tipe/tipeFokus";

/**
 * Menghitung detik berjalan berdasarkan selisih timestamp nyata (Date.now())
 * sehingga timer tetap akurat meskipun jendela diminimalkan atau browser throttling aktif.
 */
export function hitungDetikBerjalan(
  timer: TimerFokusAktif,
  sekarangMs: number = Date.now()
): number {
  if (timer.status !== "berjalan" && timer.status !== "istirahat") {
    return timer.akumulasiDetikSebelumJeda;
  }
  if (timer.waktuMulaiMs === null) {
    return timer.akumulasiDetikSebelumJeda;
  }
  const selisihDetik = Math.max(
    0,
    Math.floor((sekarangMs - timer.waktuMulaiMs) / 1000)
  );
  return timer.akumulasiDetikSebelumJeda + selisihDetik;
}

export function hitungDetikTersisa(
  timer: TimerFokusAktif,
  sekarangMs: number = Date.now()
): number {
  const berjalan = hitungDetikBerjalan(timer, sekarangMs);
  if (timer.mode === "stopwatch" && timer.status !== "istirahat") {
    return berjalan;
  }
  return Math.max(0, timer.targetDetik - berjalan);
}

export function formatDurasiTimer(totalDetik: number): string {
  const aman = Math.max(0, Math.floor(totalDetik));
  const jam = Math.floor(aman / 3600);
  const menit = Math.floor((aman % 3600) / 60);
  const detik = aman % 60;

  if (jam > 0) {
    return `${String(jam).padStart(2, "0")}:${String(menit).padStart(
      2,
      "0"
    )}:${String(detik).padStart(2, "0")}`;
  }
  return `${String(menit).padStart(2, "0")}:${String(detik).padStart(2, "0")}`;
}

export function hitungStatistikFokusHariIni(
  riwayat: SesiFokusItem[],
  tanggalReferensi: Date = new Date()
): {
  totalMenitHariIni: number;
  jumlahSesiSelesaiHariIni: number;
  totalSesiSemua: number;
} {
  const prefixHari = tanggalReferensi.toISOString().slice(0, 10);
  let totalDetikHariIni = 0;
  let jumlahSesiSelesaiHariIni = 0;

  for (const sesi of riwayat) {
    if (sesi.status !== "selesai") continue;
    if (sesi.mulaiPada.startsWith(prefixHari)) {
      totalDetikHariIni += sesi.durasiAktualDetik;
      jumlahSesiSelesaiHariIni += 1;
    }
  }

  return {
    totalMenitHariIni: Math.round(totalDetikHariIni / 60),
    jumlahSesiSelesaiHariIni,
    totalSesiSemua: riwayat.filter((s) => s.status === "selesai").length,
  };
}
