import { useEffect, useMemo, useState } from "react";
import {
  Bell,
  CheckCircle2,
  Coffee,
  Flame,
  Pause,
  Play,
  RotateCcw,
  Target,
  Timer,
} from "lucide-react";
import {
  DeskripsiKartu,
  IsiKartu,
  JudulKartu,
  Kartu,
  KepalaKartu,
  KolomMasukan,
  Lencana,
  PanelKaca,
  Sakelar,
  Tombol,
} from "@/sistem-desain";
import { gunakanTokoFokus } from "@/fokus/toko/tokoFokus";
import type { ModeFokus, PengaturanFokus } from "@/fokus/tipe/tipeFokus";
import {
  formatDurasiTimer,
  hitungDetikTersisa,
  hitungStatistikFokusHariIni,
} from "@/fokus/utilitas/waktuFokus";

const DAFTAR_MODE_FOKUS: readonly { id: ModeFokus; label: string }[] = [
  { id: "pomodoro", label: "Pomodoro" },
  { id: "deep_work", label: "Deep Work" },
  { id: "kustom", label: "Custom Timer" },
  { id: "stopwatch", label: "Stopwatch" },
];

export function PanelFokus() {
  const pengaturan = gunakanTokoFokus((s) => s.pengaturan);
  const timer = gunakanTokoFokus((s) => s.timer);
  const riwayatSesi = gunakanTokoFokus((s) => s.riwayatSesi);
  const pesanStatus = gunakanTokoFokus((s) => s.pesanStatus);

  const muatFokus = gunakanTokoFokus((s) => s.muatFokus);
  const pilihMode = gunakanTokoFokus((s) => s.pilihMode);
  const aturLabel = gunakanTokoFokus((s) => s.aturLabel);
  const mulaiAtauLanjutkan = gunakanTokoFokus((s) => s.mulaiAtauLanjutkan);
  const jedaTimer = gunakanTokoFokus((s) => s.jedaTimer);
  const resetTimer = gunakanTokoFokus((s) => s.resetTimer);
  const selesaikanSesiSekarang = gunakanTokoFokus(
    (s) => s.selesaikanSesiSekarang
  );
  const mulaiIstirahat = gunakanTokoFokus((s) => s.mulaiIstirahat);
  const perbaruiPengaturan = gunakanTokoFokus((s) => s.perbaruiPengaturan);
  const periksaPenyelesaianOtomatis = gunakanTokoFokus(
    (s) => s.periksaPenyelesaianOtomatis
  );

  const [sekarangMs, aturSekarangMs] = useState(() => Date.now());
  const [formAturan, aturFormAturan] = useState<PengaturanFokus>(pengaturan);

  useEffect(() => {
    void muatFokus();
  }, [muatFokus]);

  useEffect(() => {
    aturFormAturan(pengaturan);
  }, [pengaturan]);

  useEffect(() => {
    if (timer.status !== "berjalan" && timer.status !== "istirahat") return;

    const interval = window.setInterval(() => {
      const kini = Date.now();
      aturSekarangMs(kini);
      void periksaPenyelesaianOtomatis(kini);
    }, 500);

    const saatKembaliTerlihat = () => {
      const kini = Date.now();
      aturSekarangMs(kini);
      void periksaPenyelesaianOtomatis(kini);
    };
    document.addEventListener("visibilitychange", saatKembaliTerlihat);

    return () => {
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", saatKembaliTerlihat);
    };
  }, [timer.status, periksaPenyelesaianOtomatis]);

  const detikTampil = hitungDetikTersisa(timer, sekarangMs);
  const statistik = useMemo(
    () => hitungStatistikFokusHariIni(riwayatSesi),
    [riwayatSesi]
  );

  const persenTarget = Math.min(
    100,
    Math.round(
      (statistik.totalMenitHariIni / Math.max(1, pengaturan.targetMenitHarian)) *
        100
    )
  );

  async function mintaIzinNotifikasi(): Promise<void> {
    if (typeof window !== "undefined" && "Notification" in window) {
      await Notification.requestPermission();
    }
  }

  return (
    <div className="space-y-5">
      {pesanStatus && (
        <PanelKaca className="p-3 border-[#66E5D2]/40 text-xs text-[#0F766E] dark:text-[#66E5D2]">
          {pesanStatus}
        </PanelKaca>
      )}

      {/* Timer Utama */}
      <Kartu elevasi="angkat" kilau="teal">
        <KepalaKartu>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Timer className="h-4 w-4 text-[var(--aksen-teal-siber)]" />
              <JudulKartu>Focus Engine</JudulKartu>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Lencana
                varian={
                  timer.status === "berjalan"
                    ? "teal"
                    : timer.status === "istirahat"
                      ? "ungu"
                      : "netral"
                }
                titikAktif={timer.status === "berjalan"}
              >
                {timer.status === "berjalan"
                  ? "Sedang Fokus"
                  : timer.status === "istirahat"
                    ? "Waktunya Istirahat"
                    : timer.status === "dijeda"
                      ? "Dijeda"
                      : "Siaga"}
              </Lencana>
              <Tombol
                ukuran="kecil"
                varian="kaca"
                ikonKiri={<Bell className="h-3.5 w-3.5" />}
                onClick={() => void mintaIzinNotifikasi()}
              >
                Izin Notifikasi
              </Tombol>
            </div>
          </div>
          <DeskripsiKartu>
            Timer berbasis timestamp nyata — tetap akurat walaupun window diminimalkan atau berpindah aplikasi.
          </DeskripsiKartu>
        </KepalaKartu>

        <IsiKartu className="space-y-5">
          <div className="flex flex-wrap gap-1.5">
            {DAFTAR_MODE_FOKUS.map((m) => (
              <Tombol
                key={m.id}
                ukuran="kecil"
                varian={timer.mode === m.id ? "utama" : "kaca"}
                disabled={
                  timer.status === "berjalan" || timer.status === "istirahat"
                }
                onClick={() => pilihMode(m.id)}
              >
                {m.label}
              </Tombol>
            ))}
          </div>

          <div className="rounded-2xl border border-[var(--warna-batas)] bg-black/[0.03] dark:bg-white/[0.03] p-6 text-center space-y-4">
            <div
              data-testid="tampilan-timer-fokus"
              className="font-kode text-5xl font-semibold tracking-tight text-[var(--warna-teks-utama)]"
            >
              {formatDurasiTimer(detikTampil)}
            </div>

            <div className="max-w-md mx-auto">
              <KolomMasukan
                aria-label="Label tugas fokus"
                placeholder="Lagi ngerjain apa di sesi ini?"
                value={timer.label}
                onChange={(e) => aturLabel(e.target.value)}
              />
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2">
              {timer.status === "berjalan" || timer.status === "istirahat" ? (
                <Tombol
                  varian="sekunder"
                  ikonKiri={<Pause className="h-4 w-4" />}
                  onClick={jedaTimer}
                >
                  Jeda
                </Tombol>
              ) : (
                <Tombol
                  varian="utama"
                  ikonKiri={<Play className="h-4 w-4" />}
                  onClick={mulaiAtauLanjutkan}
                >
                  {timer.status === "dijeda" ? "Lanjutkan" : "Mulai Fokus"}
                </Tombol>
              )}

              <Tombol
                varian="kaca"
                ikonKiri={<CheckCircle2 className="h-4 w-4" />}
                disabled={timer.status === "siaga"}
                onClick={() => void selesaikanSesiSekarang("selesai")}
              >
                Selesai & Simpan
              </Tombol>

              <Tombol
                varian="kaca"
                ikonKiri={<Coffee className="h-4 w-4" />}
                onClick={mulaiIstirahat}
              >
                Istirahat ({pengaturan.menitIstirahat}m)
              </Tombol>

              <Tombol
                varian="hantu"
                ikonKiri={<RotateCcw className="h-4 w-4" />}
                onClick={resetTimer}
              >
                Reset
              </Tombol>
            </div>
          </div>
        </IsiKartu>
      </Kartu>

      {/* Statistik, Target Harian & Pengaturan */}
      <div className="grid gap-5 lg:grid-cols-12">
        <Kartu className="lg:col-span-6 space-y-4">
          <KepalaKartu>
            <div className="flex items-center gap-2">
              <Flame className="h-4 w-4 text-[var(--aksen-biru-elektrik)]" />
              <JudulKartu>Statistik & Focus Goals</JudulKartu>
            </div>
            <DeskripsiKartu>
              Progres target fokus harian kamu dari sesi yang sudah selesai.
            </DeskripsiKartu>
          </KepalaKartu>

          <IsiKartu className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-xl border border-[var(--warna-batas)] p-3">
                <span className="text-[11px] text-[var(--warna-teks-redup)]">
                  Fokus Hari Ini
                </span>
                <p className="mt-1 font-kode text-lg font-semibold">
                  {statistik.totalMenitHariIni}m
                </p>
              </div>
              <div className="rounded-xl border border-[var(--warna-batas)] p-3">
                <span className="text-[11px] text-[var(--warna-teks-redup)]">
                  Sesi Hari Ini
                </span>
                <p className="mt-1 font-kode text-lg font-semibold">
                  {statistik.jumlahSesiSelesaiHariIni}
                </p>
              </div>
              <div className="rounded-xl border border-[var(--warna-batas)] p-3">
                <span className="text-[11px] text-[var(--warna-teks-redup)]">
                  Target Harian
                </span>
                <p className="mt-1 font-kode text-lg font-semibold">
                  {pengaturan.targetMenitHarian}m
                </p>
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-[var(--warna-teks-sekunder)]">
                  Pencapaian Target
                </span>
                <span className="font-kode font-semibold">{persenTarget}%</span>
              </div>
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-black/10 dark:bg-white/10">
                <div
                  className="h-full rounded-full bg-[#66E5D2] transition-all"
                  style={{ width: `${persenTarget}%` }}
                />
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-[var(--warna-batas)]">
              <span className="block text-xs font-medium text-[var(--warna-teks-sekunder)]">
                Riwayat Sesi ({riwayatSesi.length})
              </span>
              {riwayatSesi.length === 0 ? (
                <p className="text-xs text-[var(--warna-teks-redup)]">
                  Belum ada sesi fokus tercatat hari ini.
                </p>
              ) : (
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {riwayatSesi.slice(0, 15).map((sesi) => (
                    <div
                      key={sesi.id}
                      className="flex items-center justify-between gap-2 rounded-xl border border-[var(--warna-batas)] px-3 py-2 text-xs"
                    >
                      <div className="min-w-0">
                        <p className="font-medium truncate">{sesi.label}</p>
                        <p className="text-[11px] text-[var(--warna-teks-redup)]">
                          {sesi.modeFokus}
                        </p>
                      </div>
                      <Lencana varian="teal">
                        {formatDurasiTimer(sesi.durasiAktualDetik)}
                      </Lencana>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </IsiKartu>
        </Kartu>

        <Kartu className="lg:col-span-6 space-y-4">
          <KepalaKartu>
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-[var(--aksen-ungu-neon)]" />
              <JudulKartu>Durasi & Pengingat Istirahat</JudulKartu>
            </div>
            <DeskripsiKartu>
              Atur durasi tiap mode fokus dan target menit harian.
            </DeskripsiKartu>
          </KepalaKartu>

          <IsiKartu className="space-y-3.5">
            <div className="grid grid-cols-2 gap-3">
              <KolomMasukan
                label="Pomodoro (Menit)"
                type="number"
                min={1}
                max={180}
                value={formAturan.menitPomodoro || ""}
                onChange={(e) =>
                  aturFormAturan((p) => ({
                    ...p,
                    menitPomodoro: Number(e.target.value) || 0,
                  }))
                }
              />
              <KolomMasukan
                label="Deep Work (Menit)"
                type="number"
                min={5}
                max={240}
                value={formAturan.menitDeepWork || ""}
                onChange={(e) =>
                  aturFormAturan((p) => ({
                    ...p,
                    menitDeepWork: Number(e.target.value) || 0,
                  }))
                }
              />
              <KolomMasukan
                label="Custom Timer (Menit)"
                type="number"
                min={1}
                max={240}
                value={formAturan.menitKustom || ""}
                onChange={(e) =>
                  aturFormAturan((p) => ({
                    ...p,
                    menitKustom: Number(e.target.value) || 0,
                  }))
                }
              />
              <KolomMasukan
                label="Istirahat (Menit)"
                type="number"
                min={1}
                max={60}
                value={formAturan.menitIstirahat || ""}
                onChange={(e) =>
                  aturFormAturan((p) => ({
                    ...p,
                    menitIstirahat: Number(e.target.value) || 0,
                  }))
                }
              />
            </div>

            <KolomMasukan
              label="Target Fokus Harian (Menit)"
              type="number"
              min={10}
              max={720}
              value={formAturan.targetMenitHarian || ""}
              onChange={(e) =>
                aturFormAturan((p) => ({
                  ...p,
                  targetMenitHarian: Number(e.target.value) || 0,
                }))
              }
            />

            <Sakelar
              aktif={formAturan.pengingatIstirahatAktif}
              saatBerubah={(v) =>
                aturFormAturan((p) => ({ ...p, pengingatIstirahatAktif: v }))
              }
              label="Pengingat Istirahat"
              deskripsi="Munculkan ajakan break otomatis saat sesi fokus selesai."
            />

            <Sakelar
              aktif={formAturan.notifikasiAktif}
              saatBerubah={(v) =>
                aturFormAturan((p) => ({ ...p, notifikasiAktif: v }))
              }
              label="Notifikasi Desktop"
              deskripsi="Kirim notifikasi OS saat timer selesai."
            />

            <Tombol
              varian="sekunder"
              onClick={() =>
                perbaruiPengaturan({
                  ...formAturan,
                  menitPomodoro: Math.max(1, formAturan.menitPomodoro),
                  menitDeepWork: Math.max(5, formAturan.menitDeepWork),
                  menitKustom: Math.max(1, formAturan.menitKustom),
                  menitIstirahat: Math.max(1, formAturan.menitIstirahat),
                  targetMenitHarian: Math.max(10, formAturan.targetMenitHarian),
                })
              }
            >
              Simpan Pengaturan Fokus
            </Tombol>
          </IsiKartu>
        </Kartu>
      </div>
    </div>
  );
}
