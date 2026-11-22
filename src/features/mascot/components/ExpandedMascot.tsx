import { useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  Mic,
  Music,
  NotebookPen,
  Settings2,
  Sparkles,
  Timer,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import {
  Kartu,
  KolomMasukan,
  Lencana,
  PRESET_PEGAS,
  Sakelar,
  Tombol,
} from "@/sistem-desain";
import { gunakanTokoCatatan } from "@/catatan";
import { formatDurasiTimer, gunakanTokoFokus, hitungDetikTersisa } from "@/fokus";
import { gunakanTokoMusik } from "@/musik";
import { gunakanTokoProyek } from "@/proyek";
import { gunakanTokoNotch } from "@/notch/toko/tokoNotch";
import { LABEL_STATUS_MASCOT } from "@/features/mascot/animations/MascotStateMachine";
import { RiveMascotCanvas } from "@/features/mascot/animations/RiveMascotCanvas";
import { MascotController } from "@/features/mascot/controllers/MascotController";
import { useMascotTracking } from "@/features/mascot/hooks/useMascotTracking";
import { MascotEventBus } from "@/features/mascot/services/MascotEventBus";
import { useMascotStore } from "@/features/mascot/stores/useMascotStore";
import {
  MASCOT_PERSONALITY_PRESETS,
  type MascotCharacterSize,
  type MascotPersonalityPreset,
} from "@/features/mascot/types/mascotTypes";

export function ExpandedMascot() {
  const refWadah = useRef<HTMLDivElement | null>(null);
  const [perintahCepat, aturPerintahCepat] = useState("");
  const [tampilPengaturan, aturTampilPengaturan] = useState(false);

  const stateAktif = useMascotStore((s) => s.stateAktif);
  const pesanSapaan = useMascotStore((s) => s.pesanSapaan);
  const statusSingkat = useMascotStore((s) => s.statusSingkat);
  const audioTelemetri = useMascotStore((s) => s.audioTelemetri);
  const daftarSuara = useMascotStore((s) => s.daftarSuara);
  const pengaturan = useMascotStore((s) => s.pengaturan);
  const aturPanelTerbuka = useMascotStore((s) => s.aturPanelTerbuka);
  const perbaruiPengaturan = useMascotStore((s) => s.perbaruiPengaturan);
  const terapkanPreset = useMascotStore((s) => s.terapkanPreset);

  const jumlahProyek = gunakanTokoProyek((s) => s.daftarProyek.length);
  const jumlahCatatan = gunakanTokoCatatan((s) => s.daftarCatatan.length);
  const timerFokus = gunakanTokoFokus((s) => s.timer);
  const trekAktif = gunakanTokoMusik((s) => s.trekAktif);
  const ubahStatusNotch = gunakanTokoNotch((s) => s.ubahStatusNotch);

  useMascotTracking(refWadah);

  function jalankanPerintahCepat(): void {
    const q = perintahCepat.trim().toLowerCase();
    if (!q) return;
    if (q.includes("fokus") || q.includes("focus")) {
      ubahStatusNotch("fokus");
      MascotController.ucapkanSapaan("Oke, membuka kontrol Focus Mode.");
    } else if (q.includes("musik") || q.includes("music")) {
      ubahStatusNotch("musik");
      MascotController.ucapkanSapaan("Membuka kontrol Music di Notch.");
    } else if (q.includes("catatan") || q.includes("note")) {
      ubahStatusNotch("catatan");
      MascotController.ucapkanSapaan("Silakan tulis catatan cepat kamu.");
    } else if (q.includes("kode") || q.includes("snippet")) {
      ubahStatusNotch("kode");
      MascotController.ucapkanSapaan("Membuka Code Snippets.");
    } else {
      MascotController.ucapkanSapaan(
        `Perintah "${perintahCepat}" dicatat. Gunakan kata kunci fokus, musik, catatan, atau kode.`
      );
    }
    aturPerintahCepat("");
  }

  return (
    <motion.div
      ref={refWadah}
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={PRESET_PEGAS.halus}
      data-testid="expanded-mascot-panel"
    >
      <Kartu elevasi="angkat" kilau="ungu" className="space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-center gap-4">
            <RiveMascotCanvas ukuranPx={92} />
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <Lencana varian="biru" titikAktif>
                  Overthinker Living Mascot
                </Lencana>
                <Lencana varian="teal">{LABEL_STATUS_MASCOT[stateAktif]}</Lencana>
                {audioTelemetri.aktif && (
                  <Lencana varian="ungu">
                    Audio: {Math.round(audioTelemetri.intensitas * 100)}%
                  </Lencana>
                )}
              </div>
              <p className="text-sm font-medium text-[var(--warna-teks-utama)]">
                {pesanSapaan}
              </p>
              <p className="text-xs text-[var(--warna-teks-sekunder)]">
                Status: {statusSingkat} • Preset: {pengaturan.personalityPreset}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <Tombol
              ukuran="kecil"
              varian="kaca"
              ikonKiri={
                pengaturan.soundEnabled ? (
                  <Volume2 className="h-3.5 w-3.5" />
                ) : (
                  <VolumeX className="h-3.5 w-3.5" />
                )
              }
              onClick={() =>
                perbaruiPengaturan({ soundEnabled: !pengaturan.soundEnabled })
              }
            >
              {pengaturan.soundEnabled ? "Suara Aktif" : "Mute"}
            </Tombol>
            <Tombol
              ukuran="kecil"
              varian={tampilPengaturan ? "sekunder" : "kaca"}
              ikonKiri={<Settings2 className="h-3.5 w-3.5" />}
              onClick={() => aturTampilPengaturan((v) => !v)}
            >
              Pengaturan
            </Tombol>
            <Tombol
              ukuran="kecil"
              varian="hantu"
              aria-label="Tutup Expanded Mascot"
              onClick={() => aturPanelTerbuka(false)}
              ikonKiri={<X className="h-3.5 w-3.5" />}
            >
              Tutup
            </Tombol>
          </div>
        </div>

        {/* Ringkasan Aktivitas */}
        <div className="grid gap-2 sm:grid-cols-4 text-xs">
          <div className="rounded-xl border border-[var(--warna-batas)] p-2.5">
            <span className="text-[11px] text-[var(--warna-teks-sekunder)]">
              Proyek Aktif
            </span>
            <p className="mt-0.5 font-kode font-semibold">{jumlahProyek} project</p>
          </div>
          <div className="rounded-xl border border-[var(--warna-batas)] p-2.5">
            <span className="text-[11px] text-[var(--warna-teks-sekunder)]">
              Focus Mode
            </span>
            <p className="mt-0.5 font-kode font-semibold">
              {timerFokus.status} ({formatDurasiTimer(hitungDetikTersisa(timerFokus))})
            </p>
          </div>
          <div className="rounded-xl border border-[var(--warna-batas)] p-2.5">
            <span className="text-[11px] text-[var(--warna-teks-sekunder)]">
              Music Status
            </span>
            <p className="mt-0.5 truncate font-semibold">
              {trekAktif.judulLagu ?? "Belum ada musik"}
            </p>
          </div>
          <div className="rounded-xl border border-[var(--warna-batas)] p-2.5">
            <span className="text-[11px] text-[var(--warna-teks-sekunder)]">
              Quick Notes
            </span>
            <p className="mt-0.5 font-kode font-semibold">{jumlahCatatan} catatan</p>
          </div>
        </div>

        {/* Quick Actions & Talking / Quick Command */}
        <div className="flex flex-wrap gap-2">
          <Tombol
            ukuran="kecil"
            varian="utama"
            ikonKiri={<Sparkles className="h-3.5 w-3.5" />}
            onClick={() =>
              MascotController.ucapkanSapaan(
                "Semangat! Semua modul lokal siap dipakai."
              )
            }
          >
            Sapa & Bicara
          </Tombol>
          <Tombol
            ukuran="kecil"
            varian="kaca"
            ikonKiri={<Mic className="h-3.5 w-3.5" />}
            onClick={() =>
              MascotEventBus.pancarkan("mascot:listening", {
                aktif: stateAktif !== "listening",
              })
            }
          >
            {stateAktif === "listening" ? "Stop Listening" : "Mode Listening"}
          </Tombol>
          <Tombol
            ukuran="kecil"
            varian="kaca"
            ikonKiri={<Timer className="h-3.5 w-3.5" />}
            onClick={() => ubahStatusNotch("fokus")}
          >
            Buka Focus
          </Tombol>
          <Tombol
            ukuran="kecil"
            varian="kaca"
            ikonKiri={<Music className="h-3.5 w-3.5" />}
            onClick={() => ubahStatusNotch("musik")}
          >
            Buka Music
          </Tombol>
          <Tombol
            ukuran="kecil"
            varian="kaca"
            ikonKiri={<NotebookPen className="h-3.5 w-3.5" />}
            onClick={() => ubahStatusNotch("catatan")}
          >
            Buka Quick Notes
          </Tombol>
        </div>

        <div className="flex gap-2">
          <div className="flex-1">
            <KolomMasukan
              aria-label="Quick command maskot"
              placeholder="Quick command (ketik: fokus, musik, catatan, atau kode)..."
              value={perintahCepat}
              onChange={(e) => aturPerintahCepat(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  jalankanPerintahCepat();
                }
              }}
            />
          </div>
          <Tombol varian="utama" onClick={jalankanPerintahCepat}>
            Jalankan
          </Tombol>
        </div>

        {/* Personality & Behavior Settings */}
        {tampilPengaturan && (
          <div className="rounded-xl border border-[var(--warna-batas)] p-3.5 space-y-3">
            <h4 className="text-xs font-semibold">
              Personality & Animation Settings
            </h4>

            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-[var(--warna-teks-sekunder)]">
                Personality Preset:
              </span>
              {MASCOT_PERSONALITY_PRESETS.map((preset: MascotPersonalityPreset) => (
                <Tombol
                  key={preset}
                  ukuran="kecil"
                  varian={
                    pengaturan.personalityPreset === preset ? "utama" : "kaca"
                  }
                  onClick={() => terapkanPreset(preset)}
                >
                  {preset}
                </Tombol>
              ))}
            </div>

            <div className="grid gap-3 sm:grid-cols-3 text-xs">
              <div className="space-y-1">
                <label htmlFor="ukuran-maskot">Ukuran Karakter</label>
                <select
                  id="ukuran-maskot"
                  value={pengaturan.characterSize}
                  onChange={(e) =>
                    perbaruiPengaturan({
                      characterSize: e.target.value as MascotCharacterSize,
                    })
                  }
                  className="h-8 w-full rounded-lg border border-[var(--warna-batas-kuat)] bg-white/80 dark:bg-[#101521] px-2"
                >
                  <option value="kecil">Kecil</option>
                  <option value="sedang">Sedang</option>
                  <option value="besar">Besar</option>
                </select>
              </div>

              <div className="space-y-1">
                <label htmlFor="intensitas-animasi">
                  Intensitas ({pengaturan.animationIntensity.toFixed(1)}x)
                </label>
                <input
                  id="intensitas-animasi"
                  type="range"
                  min={0.2}
                  max={1.5}
                  step={0.1}
                  value={pengaturan.animationIntensity}
                  onChange={(e) =>
                    perbaruiPengaturan({
                      animationIntensity: Number(e.target.value),
                    })
                  }
                  className="w-full accent-[#55A7FF]"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="kecepatan-animasi">
                  Kecepatan ({pengaturan.animationSpeed.toFixed(1)}x)
                </label>
                <input
                  id="kecepatan-animasi"
                  type="range"
                  min={0.5}
                  max={2}
                  step={0.1}
                  value={pengaturan.animationSpeed}
                  onChange={(e) =>
                    perbaruiPengaturan({
                      animationSpeed: Number(e.target.value),
                    })
                  }
                  className="w-full accent-[#A879FF]"
                />
              </div>
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              <Sakelar
                aktif={pengaturan.idleBehavior}
                saatBerubah={(v) => perbaruiPengaturan({ idleBehavior: v })}
                label="Idle Behavior Variatif"
              />
              <Sakelar
                aktif={pengaturan.cursorTrackingEnabled}
                saatBerubah={(v) =>
                  perbaruiPengaturan({ cursorTrackingEnabled: v })
                }
                label="Cursor & Eye Tracking"
              />
              <Sakelar
                aktif={pengaturan.musicReactionEnabled}
                saatBerubah={(v) =>
                  perbaruiPengaturan({ musicReactionEnabled: v })
                }
                label="Music Reaction"
              />
              <Sakelar
                aktif={pengaturan.voiceEnabled}
                saatBerubah={(v) => perbaruiPengaturan({ voiceEnabled: v })}
                label="Text-to-Speech (Voice)"
              />
              <Sakelar
                aktif={pengaturan.reducedMotion}
                saatBerubah={(v) => perbaruiPengaturan({ reducedMotion: v })}
                label="Reduced Motion (Hemat GPU)"
              />
            </div>

            {daftarSuara.length > 0 && (
              <div className="space-y-1 text-xs">
                <label htmlFor="pilih-suara-tts">Pilih Suara TTS</label>
                <select
                  id="pilih-suara-tts"
                  value={pengaturan.voiceName ?? ""}
                  onChange={(e) =>
                    perbaruiPengaturan({
                      voiceName: e.target.value ? e.target.value : null,
                    })
                  }
                  className="h-8 w-full rounded-lg border border-[var(--warna-batas-kuat)] bg-white/80 dark:bg-[#101521] px-2"
                >
                  <option value="">Default Sistem</option>
                  {daftarSuara.map((suara) => (
                    <option key={suara} value={suara}>
                      {suara}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        )}
      </Kartu>
    </motion.div>
  );
}
