import { useEffect } from "react";
import {
  Laptop,
  LockOpen,
  Power,
  RefreshCw,
  ShieldCheck,
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
import { gunakanTokoIntegrasiOs } from "@/integrasi/toko/tokoIntegrasiOs";
import type { StatusKapabilitasOs } from "@/integrasi/tipe/tipeIntegrasiOs";

const VARIAN_KAPABILITAS: Record<
  StatusKapabilitasOs,
  "teal" | "peringatan" | "ungu" | "netral"
> = {
  didukung: "teal",
  perlu_izin: "peringatan",
  penyedia_belum_dikonfigurasi: "ungu",
  tidak_didukung_os: "netral",
};

export function PanelIntegrasiOs() {
  const status = gunakanTokoIntegrasiOs((s) => s.status);
  const sedangMemuat = gunakanTokoIntegrasiOs((s) => s.sedangMemuat);
  const pesanStatus = gunakanTokoIntegrasiOs((s) => s.pesanStatus);
  const pesanGalat = gunakanTokoIntegrasiOs((s) => s.pesanGalat);

  const muatStatus = gunakanTokoIntegrasiOs((s) => s.muatStatus);
  const ubahAutoStart = gunakanTokoIntegrasiOs((s) => s.ubahAutoStart);
  const bukaPengaturanIzin = gunakanTokoIntegrasiOs(
    (s) => s.bukaPengaturanIzin
  );

  useEffect(() => {
    void muatStatus();
  }, [muatStatus]);

  const modeNative = status?.sumberData === "tauri_os_nyata";

  return (
    <div className="space-y-5">
      {pesanGalat && (
        <PanelKaca className="p-3 border-[var(--aksen-bahaya)]/40 text-xs text-[var(--aksen-bahaya)]">
          {pesanGalat}
        </PanelKaca>
      )}

      {pesanStatus && (
        <PanelKaca className="p-3 border-[#66E5D2]/40 text-xs text-[#0F766E] dark:text-[#66E5D2]">
          {pesanStatus}
        </PanelKaca>
      )}

      <Kartu elevasi="angkat" kilau="ungu">
        <KepalaKartu>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Laptop className="h-4 w-4 text-[var(--aksen-ungu-neon)]" />
              <JudulKartu>macOS & Windows Integration</JudulKartu>
            </div>
            <div className="flex items-center gap-2">
              <Lencana varian={modeNative ? "teal" : "peringatan"}>
                {modeNative
                  ? `Runtime: ${status?.sistemOperasi}`
                  : "Mode: Browser Terbatas"}
              </Lencana>
              <Tombol
                ukuran="kecil"
                varian="kaca"
                disabled={sedangMemuat}
                ikonKiri={<RefreshCw className="h-3.5 w-3.5" />}
                onClick={() => void muatStatus()}
              >
                Periksa Ulang
              </Tombol>
            </div>
          </div>
          <DeskripsiKartu>
            {status?.catatan ??
              "Memeriksa integrasi OS native untuk Launch at Startup, Menu Bar/Tray, dan izin sistem."}
          </DeskripsiKartu>
        </KepalaKartu>

        <IsiKartu className="space-y-4">
          <div className="rounded-xl border border-[var(--warna-batas)] p-3.5 space-y-2">
            <div className="flex items-center gap-2">
              <Power className="h-4 w-4 text-[var(--aksen-biru-elektrik)]" />
              <span className="text-xs font-semibold">Launch at Startup</span>
            </div>
            <Sakelar
              aktif={status?.autoStartAktif ?? false}
              saatBerubah={(aktif) => void ubahAutoStart(aktif)}
              label="Jalankan otomatis saat login OS"
              deskripsi={`Target sistem: ${status?.jalurAutoStart ?? "-"}`}
            />
          </div>

          <div className="rounded-xl border border-[var(--warna-batas)] p-3.5 space-y-2.5">
            <div className="flex items-center gap-2">
              <LockOpen className="h-4 w-4 text-[var(--aksen-teal-siber)]" />
              <span className="text-xs font-semibold">
                Pintasan Pengaturan Izin Sistem (macOS / Windows)
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              <Tombol
                ukuran="kecil"
                varian="kaca"
                onClick={() => void bukaPengaturanIzin("accessibility")}
              >
                Buka Izin Accessibility
              </Tombol>
              <Tombol
                ukuran="kecil"
                varian="kaca"
                onClick={() => void bukaPengaturanIzin("screen_recording")}
              >
                Buka Izin Screen & Audio
              </Tombol>
              <Tombol
                ukuran="kecil"
                varian="kaca"
                onClick={() => void bukaPengaturanIzin("microphone")}
              >
                Buka Izin Mikrofon
              </Tombol>
            </div>
          </div>
        </IsiKartu>
      </Kartu>

      <Kartu>
        <KepalaKartu>
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-[var(--aksen-teal-siber)]" />
            <JudulKartu>Matriks Kapabilitas OS</JudulKartu>
          </div>
          <DeskripsiKartu>
            Setiap fitur melaporkan status dukungan nyata sesuai OS yang sedang aktif.
          </DeskripsiKartu>
        </KepalaKartu>

        <IsiKartu className="space-y-2">
          {(status?.kapabilitas ?? []).map((item) => (
            <div
              key={item.namaFitur}
              className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[var(--warna-batas)] p-3 text-xs"
            >
              <div className="space-y-0.5">
                <p className="font-semibold">{item.namaFitur}</p>
                <p className="text-[11px] text-[var(--warna-teks-sekunder)]">
                  {item.keterangan}
                </p>
              </div>
              <Lencana varian={VARIAN_KAPABILITAS[item.status]}>
                {item.status}
              </Lencana>
            </div>
          ))}
        </IsiKartu>
      </Kartu>
    </div>
  );
}
