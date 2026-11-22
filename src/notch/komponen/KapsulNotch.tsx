import { useRef, type PointerEvent as ReactPointerEvent } from "react";
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
  const modeDiminta = gunakanTokoNotch((s) => s.modeDiminta);
  const statusAktif = gunakanTokoNotch((s) => s.statusAktif);
  const selaluDiAtas = gunakanTokoNotch((s) => s.selaluDiAtas);
  const daftarMonitor = gunakanTokoNotch((s) => s.daftarMonitor);
  const idMonitorAktif = gunakanTokoNotch((s) => s.idMonitorAktif);
  const geometriPulau = gunakanTokoNotch((s) => s.geometriPulau);
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

  const lebarTarget =
    statusAktif === "diperluas"
      ? geometriPulau.lebarDiperluas
      : infoStatus.dimensiBawaan.lebar;

  return (
    <motion.div
      layout
      transition={PRESET_PEGAS.notch}
      data-testid="kapsul-notch"
      data-status={statusAktif}
      data-mode={modeEfektif}
      className="permukaan-kaca-angkat kilau-biru mx-auto overflow-hidden transition-colors"
      style={{
        width: Math.min(lebarTarget, 920),
        maxWidth: "100%",
        borderRadius: statusAktif === "siaga" ? 999 : 26,
      }}
    >
      <div
        onPointerDown={mulaiSeret}
        onPointerMove={gerakSeret}
        onPointerUp={selesaiSeret}
        className={`flex items-center justify-between gap-2 px-4 ${
          statusAktif === "siaga" ? "py-2" : "py-3"
        } ${modeEfektif === "pulau_melayang" ? "cursor-grab active:cursor-grabbing" : ""}`}
      >
        <div className="flex items-center gap-2 min-w-0">
          <span
            className="h-2.5 w-2.5 shrink-0 rounded-full bg-[#66E5D2]"
            aria-hidden="true"
          />
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
            <AreaTeks
              label="Draft Catatan Cepat (Aman saat pindah status)"
              placeholder="Ketik catatan singkat lalu coba pindah ke Musik atau Siaga — teksnya nggak bakal hilang..."
              value={bufferMasukan.catatanCepat}
              onChange={(e) =>
                perbaruiBufferMasukan("catatanCepat", e.target.value)
              }
              bantuan="Modul Quick Notes lengkap dengan simpan SQLite hadir di Fase 5."
            />
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
            <KolomMasukan
              label="Cari Lagu / Lirik Manual"
              placeholder="Ketik judul lagu atau artis..."
              value={bufferMasukan.cariMusik}
              onChange={(e) =>
                perbaruiBufferMasukan("cariMusik", e.target.value)
              }
              bantuan="Integrasi Apple Music, Spotify, GSMTC & audio capture hadir di Fase 10."
            />
          )}

          {statusAktif === "fokus" && (
            <KolomMasukan
              label="Target Sesi Fokus"
              placeholder="Contoh: Beresin modul Quick Notes Fase 5..."
              value={bufferMasukan.labelFokus}
              onChange={(e) =>
                perbaruiBufferMasukan("labelFokus", e.target.value)
              }
              bantuan="Timer Pomodoro & Deep Work akurat di background hadir di Fase 9."
            />
          )}

          {statusAktif === "berkas" && (
            <div className="rounded-xl border border-dashed border-[var(--warna-batas-kuat)] p-4 text-center space-y-1">
              <p className="text-xs font-medium text-[var(--warna-teks-utama)]">
                Temporary File Storage (Fase 6)
              </p>
              <p className="text-[11px] text-[var(--warna-teks-sekunder)]">
                Drag & drop file ke folder vault lokal tanpa pernah menghapus file asli kamu.
              </p>
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
