import { useEffect } from "react";
import {
  Activity,
  BatteryCharging,
  Cpu,
  HardDrive,
  MemoryStick,
  RefreshCw,
} from "lucide-react";
import {
  DeskripsiKartu,
  IsiKartu,
  JudulKartu,
  Kartu,
  KepalaKartu,
  Lencana,
  PanelKaca,
  Sakelar,
  Tombol,
} from "@/sistem-desain";
import { gunakanTokoMonitor } from "@/monitor/toko/tokoMonitor";

function formatUptime(detik: number | null): string {
  if (detik === null) return "Nggak tersedia di browser";
  const jam = Math.floor(detik / 3600);
  const menit = Math.floor((detik % 3600) / 60);
  return `${jam}j ${menit}m`;
}

export function PanelMonitor() {
  const telemetri = gunakanTokoMonitor((s) => s.telemetri);
  const sedangMemuat = gunakanTokoMonitor((s) => s.sedangMemuat);
  const autoRefresh = gunakanTokoMonitor((s) => s.autoRefresh);
  const pesanGalat = gunakanTokoMonitor((s) => s.pesanGalat);

  const muatTelemetri = gunakanTokoMonitor((s) => s.muatTelemetri);
  const aturAutoRefresh = gunakanTokoMonitor((s) => s.aturAutoRefresh);

  useEffect(() => {
    void muatTelemetri();
  }, [muatTelemetri]);

  useEffect(() => {
    if (!autoRefresh) return;
    const id = window.setInterval(() => {
      void muatTelemetri();
    }, 5000);
    return () => window.clearInterval(id);
  }, [autoRefresh, muatTelemetri]);

  return (
    <div className="space-y-5">
      {pesanGalat && (
        <PanelKaca className="p-3 border-[var(--aksen-bahaya)]/40 text-xs text-[var(--aksen-bahaya)]">
          {pesanGalat}
        </PanelKaca>
      )}

      <Kartu elevasi="angkat" kilau="biru">
        <KepalaKartu>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-[var(--aksen-biru-elektrik)]" />
              <JudulKartu>System Monitor (Data OS Nyata)</JudulKartu>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Lencana
                varian={
                  telemetri?.sumberData === "tauri_os_nyata"
                    ? "teal"
                    : "peringatan"
                }
              >
                {telemetri?.sumberData === "tauri_os_nyata"
                  ? "Sumber: OS Native Tauri"
                  : "Sumber: Browser Terbatas"}
              </Lencana>
              <Tombol
                ukuran="kecil"
                varian="utama"
                disabled={sedangMemuat}
                ikonKiri={<RefreshCw className="h-3.5 w-3.5" />}
                onClick={() => void muatTelemetri()}
              >
                {sedangMemuat ? "Memuat..." : "Muat Ulang"}
              </Tombol>
            </div>
          </div>
          <DeskripsiKartu>
            {telemetri?.catatanKejujuran ??
              "Memeriksa telemetri sistem nyata tanpa angka simulasi."}
          </DeskripsiKartu>
        </KepalaKartu>

        <IsiKartu className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[var(--warna-batas)]">
          <div className="text-xs text-[var(--warna-teks-sekunder)]">
            Host:{" "}
            <span className="font-kode font-semibold text-[var(--warna-teks-utama)]">
              {telemetri?.namaHost ?? "-"}
            </span>{" "}
            • OS:{" "}
            <span className="font-kode font-semibold text-[var(--warna-teks-utama)]">
              {telemetri?.sistemOperasi ?? "-"} ({telemetri?.arsitektur ?? "-"})
            </span>{" "}
            • Uptime:{" "}
            <span
              data-testid="nilai-uptime"
              className="font-kode font-semibold text-[var(--warna-teks-utama)]"
            >
              {formatUptime(telemetri?.uptimeDetik ?? null)}
            </span>
          </div>

          <Sakelar
            aktif={autoRefresh}
            saatBerubah={aturAutoRefresh}
            label="Auto-refresh (5 detik)"
          />
        </IsiKartu>
      </Kartu>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Kartu>
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[var(--warna-teks-sekunder)]">
              CPU
            </span>
            <Cpu className="h-4 w-4 text-[var(--aksen-biru-elektrik)]" />
          </div>
          <p data-testid="nilai-cpu" className="mt-2 font-kode text-xl font-semibold">
            {telemetri?.penggunaanCpuPersen !== null &&
            telemetri?.penggunaanCpuPersen !== undefined
              ? `${telemetri.penggunaanCpuPersen}%`
              : "Nggak tersedia di browser"}
          </p>
          <p className="mt-1 text-[11px] text-[var(--warna-teks-redup)]">
            {telemetri?.jumlahCoreCpu
              ? `${telemetri.jumlahCoreCpu} logical cores`
              : "Core nggak terdeteksi"}
            {telemetri?.modelCpu ? ` • ${telemetri.modelCpu}` : ""}
          </p>
        </Kartu>

        <Kartu>
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[var(--warna-teks-sekunder)]">
              Memori (RAM)
            </span>
            <MemoryStick className="h-4 w-4 text-[var(--aksen-ungu-neon)]" />
          </div>
          <p data-testid="nilai-ram" className="mt-2 font-kode text-xl font-semibold">
            {telemetri?.ramTerpakaiMb !== null &&
            telemetri?.ramTerpakaiMb !== undefined &&
            telemetri?.ramTotalMb
              ? `${(telemetri.ramTerpakaiMb / 1024).toFixed(1)} / ${(telemetri.ramTotalMb / 1024).toFixed(1)} GB`
              : telemetri?.ramTotalMb
                ? `~${(telemetri.ramTotalMb / 1024).toFixed(0)} GB (estimasi browser)`
                : "Nggak tersedia di browser"}
          </p>
          <p className="mt-1 text-[11px] text-[var(--warna-teks-redup)]">
            {telemetri?.ramTerpakaiMb !== null &&
            telemetri?.ramTerpakaiMb !== undefined
              ? `${telemetri.ramTerpakaiMb} MB terpakai`
              : "Pemakaian RAM per-OS hanya di Tauri native"}
          </p>
        </Kartu>

        <Kartu>
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[var(--warna-teks-sekunder)]">
              Penyimpanan (Disk)
            </span>
            <HardDrive className="h-4 w-4 text-[var(--aksen-teal-siber)]" />
          </div>
          <p data-testid="nilai-disk" className="mt-2 font-kode text-xl font-semibold">
            {telemetri?.diskTerpakaiGb !== null &&
            telemetri?.diskTerpakaiGb !== undefined &&
            telemetri?.diskTotalGb !== null &&
            telemetri?.diskTotalGb !== undefined
              ? `${telemetri.diskTerpakaiGb} / ${telemetri.diskTotalGb} GB`
              : "Nggak tersedia di browser"}
          </p>
          <p className="mt-1 text-[11px] text-[var(--warna-teks-redup)]">
            Volume sistem utama (`/` atau `C:`)
          </p>
        </Kartu>

        <Kartu>
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[var(--warna-teks-sekunder)]">
              Baterai
            </span>
            <BatteryCharging className="h-4 w-4 text-emerald-400" />
          </div>
          <p
            data-testid="nilai-baterai"
            className="mt-2 font-kode text-xl font-semibold"
          >
            {telemetri?.persenBaterai !== null &&
            telemetri?.persenBaterai !== undefined
              ? `${telemetri.persenBaterai}%`
              : "Nggak tersedia"}
          </p>
          <p className="mt-1 text-[11px] text-[var(--warna-teks-redup)]">
            {telemetri?.sedangMengisiDaya === true
              ? "Sedang mengisi daya (AC)"
              : telemetri?.sedangMengisiDaya === false
                ? "Menggunakan baterai"
                : "Status daya nggak terdeteksi"}
          </p>
        </Kartu>
      </div>
    </div>
  );
}
