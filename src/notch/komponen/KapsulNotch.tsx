import { useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Code2,
  FolderOpen,
  GripHorizontal,
  LayoutDashboard,
  Maximize2,
  Minimize2,
  Music,
  NotebookPen,
  Pin,
  Timer,
} from "lucide-react";
import {
  AreaTeks,
  KolomMasukan,
  Lencana,
  PRESET_PEGAS,
  Tombol,
} from "@/sistem-desain";
import { gunakanTokoCatatan } from "@/catatan";
import { gunakanTokoBerkas } from "@/berkas";
import { gunakanTokoFokus, formatDurasiTimer, hitungDetikTersisa } from "@/fokus";
import { gunakanTokoMusik } from "@/musik";
import { CompactMascot } from "@/features/mascot";
import {
  apakahStatusDiperluas,
  METADATA_STATUS_NOTCH,
  tentukanModeEfektif,
} from "@/notch/mesin/mesinStatusNotch";
import { ambilMonitorAktif, gunakanTokoNotch } from "@/notch/toko/tokoNotch";
import type { StatusInteraksiNotch } from "@/notch/tipe/tipeNotch";

const TOMBOL_MODUL_CEPAT: readonly {
  status: StatusInteraksiNotch;
  label: string;
  ikon: typeof Music;
}[] = [
  { status: "musik", label: "Musik", ikon: Music },
  { status: "catatan", label: "Catatan", ikon: NotebookPen },
  { status: "kode", label: "Kode", ikon: Code2 },
  { status: "berkas", label: "Berkas", ikon: FolderOpen },
  { status: "fokus", label: "Fokus", ikon: Timer },
  { status: "dasbor", label: "Dasbor", ikon: LayoutDashboard },
];

export function KapsulNotch() {
  const [pesanSimpanCepat, aturPesanSimpanCepat] = useState<string | null>(null);
  const tangkapCepat = gunakanTokoCatatan((s) => s.tangkapCepat);
  const jumlahBerkasAktif = gunakanTokoBerkas(
    (s) => s.daftarBerkas.filter((b) => !b.dihapusPada).length
  );
  const imporBanyakFile = gunakanTokoBerkas((s) => s.imporBanyakFile);
  const inputBerkasNotchRef = useRef<HTMLInputElement | null>(null);
  const timerFokus = gunakanTokoFokus((s) => s.timer);
  const mulaiAtauLanjutkanFokus = gunakanTokoFokus((s) => s.mulaiAtauLanjutkan);
  const jedaTimerFokus = gunakanTokoFokus((s) => s.jedaTimer);
  const trekAktifMusik = gunakanTokoMusik((s) => s.trekAktif);
  const kontrolMediaMusik = gunakanTokoMusik((s) => s.kontrolMedia);
  const modeDiminta = gunakanTokoNotch((s) => s.modeDiminta);
  const statusAktif = gunakanTokoNotch((s) => s.statusAktif);
  const selaluDiAtas = gunakanTokoNotch((s) => s.selaluDiAtas);
  const daftarMonitor = gunakanTokoNotch((s) => s.daftarMonitor);
  const idMonitorAktif = gunakanTokoNotch((s) => s.idMonitorAktif);
  const geometriPulau = gunakanTokoNotch((s) => s.geometriPulau);
  const ukuranAdaptif = gunakanTokoNotch((s) => s.ukuranAdaptif);
  const bufferMasukan = gunakanTokoNotch((s) => s.bufferMasukan);

  const ubahStatusNotch = gunakanTokoNotch((s) => s.ubahStatusNotch);
  const kembaliKeStatusSebelumnya = gunakanTokoNotch(
    (s) => s.kembaliKeStatusSebelumnya
  );
  const bukaTutupNotch = gunakanTokoNotch((s) => s.bukaTutupNotch);
  const perbaruiPosisiPulau = gunakanTokoNotch((s) => s.perbaruiPosisiPulau);
  const perbaruiBufferMasukan = gunakanTokoNotch(
    (s) => s.perbaruiBufferMasukan
  );

  const monitorAktif = ambilMonitorAktif(daftarMonitor, idMonitorAktif);
  const { modeEfektif } = tentukanModeEfektif(modeDiminta, monitorAktif);
  const infoStatus = METADATA_STATUS_NOTCH[statusAktif];
  const diperluas = apakahStatusDiperluas(statusAktif);

  const titikAwalSeret = useRef<{
    klienX: number;
    klienY: number;
    awalX: number;
    awalY: number;
  } | null>(null);

  function mulaiSeret(peristiwa: ReactPointerEvent<HTMLDivElement>): void {
    if (modeEfektif !== "pulau_melayang") {
      return;
    }
    peristiwa.currentTarget.setPointerCapture?.(peristiwa.pointerId);
    titikAwalSeret.current = {
      klienX: peristiwa.clientX,
      klienY: peristiwa.clientY,
      awalX: geometriPulau.posisiX,
      awalY: geometriPulau.posisiY,
    };
  }

  function gerakSeret(peristiwa: ReactPointerEvent<HTMLDivElement>): void {
    if (!titikAwalSeret.current) {
      return;
    }
    const deltaX = peristiwa.clientX - titikAwalSeret.current.klienX;
    const deltaY = peristiwa.clientY - titikAwalSeret.current.klienY;
    perbaruiPosisiPulau(
      titikAwalSeret.current.awalX + deltaX,
      titikAwalSeret.current.awalY + deltaY
    );
  }

  function selesaiSeret(): void {
    titikAwalSeret.current = null;
  }

  async function tanganiSimpanCepatNotch(): Promise<void> {
    const teks = bufferMasukan.catatanCepat.trim();
    if (!teks) return;
    const judul = teks.split("\n")[0]?.slice(0, 60) || "Catatan Cepat";
    const tersimpan = await tangkapCepat(judul, teks, "markdown");
    if (tersimpan) {
      perbaruiBufferMasukan("catatanCepat", "");
      aturPesanSimpanCepat("Tersimpan ke Quick Notes!");
      window.setTimeout(() => aturPesanSimpanCepat(null), 2200);
    }
  }

  const lebarDasar =
    statusAktif === "ringkas"
      ? Math.max(infoStatus.dimensiBawaan.lebar, 480)
      : infoStatus.dimensiBawaan.lebar;

  const lebarTarget =
    ukuranAdaptif.modeUkuran === "custom"
      ? ukuranAdaptif.lebarKustom
      : statusAktif === "diperluas"
        ? geometriPulau.lebarDiperluas
        : lebarDasar;

  const kepadatanKelas =
    ukuranAdaptif.kepadatanKonten === "ringkas"
      ? "py-1.5"
      : ukuranAdaptif.kepadatanKonten === "lega"
        ? "py-4"
        : statusAktif === "siaga"
          ? "py-2"
          : "py-3";

  return (
    <motion.div
      layout
      transition={PRESET_PEGAS.notch}
      data-testid="kapsul-notch"
      data-status={statusAktif}
      data-mode={modeEfektif}
      data-ukuran={ukuranAdaptif.modeUkuran}
      className="permukaan-kaca-angkat kilau-biru mx-auto overflow-hidden transition-colors"
      style={{
        width: Math.min(lebarTarget, 1280),
        maxWidth: "100%",
        borderRadius: statusAktif === "siaga" ? 999 : 26,
      }}
    >
      <div
        onPointerDown={mulaiSeret}
        onPointerMove={gerakSeret}
        onPointerUp={selesaiSeret}
        className={`flex items-center justify-between gap-2 px-4 ${kepadatanKelas} ${
          modeEfektif === "pulau_melayang" ? "cursor-grab active:cursor-grabbing" : ""
        }`}
      >
        <div
          className={`flex items-center gap-2 min-w-0 ${
            ukuranAdaptif.posisiMaskot === "kanan" ? "flex-row-reverse" : ""
          }`}
        >
          <CompactMascot ukuranOverridePx={ukuranAdaptif.ukuranMaskotPx} />
          <span className="truncate text-xs font-semibold tracking-tight text-[var(--warna-teks-utama)]">
            {statusAktif === "siaga"
              ? "Overthinker Notch"
              : `Notch • ${infoStatus.label}`}
          </span>
          {modeEfektif === "pulau_melayang" && (
            <GripHorizontal
              className="h-3.5 w-3.5 shrink-0 text-[var(--warna-teks-redup)]"
              aria-hidden="true"
            />
          )}
          {selaluDiAtas && statusAktif !== "siaga" && (
            <Pin
              className="h-3 w-3 shrink-0 text-[var(--aksen-biru-elektrik)]"
              aria-label="Always on Top aktif"
            />
          )}
        </div>

        <div className="flex items-center gap-1.5">
          {diperluas && (
            <Tombol
              varian="hantu"
              ukuran="kecil"
              onClick={kembaliKeStatusSebelumnya}
              aria-label="Balik ke status sebelumnya"
              ikonKiri={<ArrowLeft className="h-3.5 w-3.5" />}
            >
              Balik
            </Tombol>
          )}
          <Tombol
            varian="kaca"
            ukuran="kecil"
            onClick={bukaTutupNotch}
            aria-label={diperluas ? "Ringkas Notch" : "Buka Notch"}
            ikonKiri={
              diperluas ? (
                <Minimize2 className="h-3.5 w-3.5" />
              ) : (
                <Maximize2 className="h-3.5 w-3.5" />
              )
            }
          >
            {diperluas ? "Ringkas" : "Buka"}
          </Tombol>
        </div>
      </div>

      {statusAktif === "ringkas" && (
        <div className="flex flex-wrap items-center justify-center gap-1.5 border-t border-[var(--warna-batas)] px-3 py-2">
          {TOMBOL_MODUL_CEPAT.map((item) => {
            const Ikon = item.ikon;
            return (
              <Tombol
                key={item.status}
                varian="hantu"
                ukuran="kecil"
                onClick={() => ubahStatusNotch(item.status)}
                ikonKiri={<Ikon className="h-3.5 w-3.5" />}
              >
                {item.label}
              </Tombol>
            );
          })}
        </div>
      )}

      {diperluas && (
        <div className="border-t border-[var(--warna-batas)] px-4 py-4 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs text-[var(--warna-teks-sekunder)]">
              {infoStatus.deskripsi}
            </p>
            <Lencana varian="biru">Shortcut: {infoStatus.pintasan}</Lencana>
          </div>

          {statusAktif === "diperluas" && (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {TOMBOL_MODUL_CEPAT.map((item) => {
                const Ikon = item.ikon;
                return (
                  <button
                    key={item.status}
                    type="button"
                    onClick={() => ubahStatusNotch(item.status)}
                    className="flex items-center gap-2.5 rounded-xl border border-[var(--warna-batas)] bg-black/[0.02] dark:bg-white/[0.03] px-3 py-2.5 text-left text-xs font-medium transition hover:border-[var(--aksen-biru-elektrik)]/40 cursor-pointer"
                  >
                    <Ikon className="h-4 w-4 text-[var(--aksen-biru-elektrik)]" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          )}

          {statusAktif === "catatan" && (
            <div className="space-y-2.5">
              <AreaTeks
                label="Draft Catatan Cepat (Aman saat pindah status)"
                placeholder="Ketik catatan singkat lalu klik Simpan ke Quick Notes, atau pindah ke Musik/Siaga — teksnya nggak bakal hilang..."
                value={bufferMasukan.catatanCepat}
                onChange={(e) =>
                  perbaruiBufferMasukan("catatanCepat", e.target.value)
                }
                bantuan="Terhubung langsung ke modul Quick Notes Fase 5."
              />
              <div className="flex items-center justify-between gap-2">
                {pesanSimpanCepat ? (
                  <span className="text-[11px] text-[#0F766E] dark:text-[#66E5D2]">
                    {pesanSimpanCepat}
                  </span>
                ) : (
                  <span className="text-[11px] text-[var(--warna-teks-redup)]">
                    Draft tetap terjaga sampai disimpan.
                  </span>
                )}
                <Tombol
                  varian="utama"
                  ukuran="kecil"
                  disabled={!bufferMasukan.catatanCepat.trim()}
                  onClick={() => void tanganiSimpanCepatNotch()}
                >
                  Simpan ke Quick Notes
                </Tombol>
              </div>
            </div>
          )}

          {statusAktif === "kode" && (
            <AreaTeks
              label="Draft Code Snippet"
              placeholder="// Paste potongan kode sementara di sini..."
              className="font-kode text-xs"
              value={bufferMasukan.cuplikanKode}
              onChange={(e) =>
                perbaruiBufferMasukan("cuplikanKode", e.target.value)
              }
              bantuan="Monaco Editor lokal 14 bahasa hadir di Fase 7."
            />
          )}

          {statusAktif === "musik" && (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between gap-2 rounded-xl border border-[var(--warna-batas)] px-3 py-2">
                <div className="min-w-0">
                  <p className="truncate text-xs font-semibold">
                    {trekAktifMusik.judulLagu ?? "Nggak ada musik aktif"}
                  </p>
                  <p className="truncate text-[11px] text-[var(--warna-teks-sekunder)]">
                    {trekAktifMusik.artis ?? trekAktifMusik.sumberAudio}
                  </p>
                </div>
                <Tombol
                  ukuran="kecil"
                  varian="utama"
                  disabled={!trekAktifMusik.kontrolDidukung}
                  onClick={() => void kontrolMediaMusik("play_pause")}
                >
                  {trekAktifMusik.sedangMemutar ? "Jeda" : "Putar"}
                </Tombol>
              </div>
              <KolomMasukan
                label="Cari Lagu / Lirik Manual"
                placeholder="Ketik judul lagu atau artis..."
                value={bufferMasukan.cariMusik}
                onChange={(e) =>
                  perbaruiBufferMasukan("cariMusik", e.target.value)
                }
              />
            </div>
          )}

          {statusAktif === "fokus" && (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between gap-2 rounded-xl border border-[var(--warna-batas)] px-3 py-2">
                <div>
                  <p className="text-[11px] text-[var(--warna-teks-sekunder)]">
                    Mode: {timerFokus.mode} • {timerFokus.status}
                  </p>
                  <p className="font-kode text-lg font-semibold">
                    {formatDurasiTimer(hitungDetikTersisa(timerFokus))}
                  </p>
                </div>
                {timerFokus.status === "berjalan" ? (
                  <Tombol ukuran="kecil" varian="sekunder" onClick={jedaTimerFokus}>
                    Jeda
                  </Tombol>
                ) : (
                  <Tombol
                    ukuran="kecil"
                    varian="utama"
                    onClick={mulaiAtauLanjutkanFokus}
                  >
                    Mulai Fokus
                  </Tombol>
                )}
              </div>
              <KolomMasukan
                label="Target Sesi Fokus"
                placeholder="Contoh: Beresin modul Music Engine..."
                value={bufferMasukan.labelFokus}
                onChange={(e) =>
                  perbaruiBufferMasukan("labelFokus", e.target.value)
                }
              />
            </div>
          )}

          {statusAktif === "berkas" && (
            <div className="rounded-xl border border-dashed border-[var(--warna-batas-kuat)] p-4 text-center space-y-2">
              <input
                ref={inputBerkasNotchRef}
                type="file"
                multiple
                className="hidden"
                onChange={(e) => {
                  const files = Array.from(e.target.files ?? []);
                  if (files.length > 0) {
                    void imporBanyakFile(files);
                    e.target.value = "";
                  }
                }}
              />
              <p className="text-xs font-medium text-[var(--warna-teks-utama)]">
                Temporary File Storage ({jumlahBerkasAktif} file aktif)
              </p>
              <p className="text-[11px] text-[var(--warna-teks-sekunder)]">
                Salin file ke vault lokal dengan aman — file asli kamu nggak pernah dihapus.
              </p>
              <Tombol
                varian="utama"
                ukuran="kecil"
                onClick={() => inputBerkasNotchRef.current?.click()}
              >
                Import File Sekarang
              </Tombol>
            </div>
          )}

          {statusAktif === "dasbor" && (
            <div className="rounded-xl border border-[var(--warna-batas)] bg-black/[0.02] dark:bg-white/[0.03] p-3 text-xs text-[var(--warna-teks-sekunder)]">
              Mode <strong>Dashboard</strong> aktif — atur monitor, ukuran Floating Island, Database & Backup, atau Design System di bawah.
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}
