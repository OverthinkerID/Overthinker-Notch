import { Settings2, Sliders } from "lucide-react";
import {
  DeskripsiKartu,
  IsiKartu,
  JudulKartu,
  Kartu,
  KepalaKartu,
  Lencana,
  Sakelar,
  Tombol,
} from "@/sistem-desain";
import { RiveMascotCanvas } from "@/features/mascot/animations/RiveMascotCanvas";
import { useMascotStore } from "@/features/mascot/stores/useMascotStore";
import {
  LABEL_KARAKTER_MASCOT,
  MASCOT_CHARACTERS,
  MASCOT_PERSONALITY_PRESETS,
  type MascotCharacterSize,
} from "@/features/mascot/types/mascotTypes";
import { gunakanTokoNotch } from "@/notch/toko/tokoNotch";
import type {
  KepadatanKontenNotch,
  ModeUkuranNotch,
  PosisiMaskotNotch,
} from "@/notch/tipe/tipeNotch";

const DAFTAR_MODE_UKURAN: readonly ModeUkuranNotch[] = [
  "mini",
  "compact",
  "expanded",
  "custom",
];

export function PanelPengaturanMaskotNotch() {
  const pengaturan = useMascotStore((s) => s.pengaturan);
  const daftarSuara = useMascotStore((s) => s.daftarSuara);
  const perbaruiPengaturan = useMascotStore((s) => s.perbaruiPengaturan);
  const terapkanPreset = useMascotStore((s) => s.terapkanPreset);

  const ukuranAdaptif = gunakanTokoNotch((s) => s.ukuranAdaptif);
  const selaluDiAtas = gunakanTokoNotch((s) => s.selaluDiAtas);
  const perbaruiUkuranAdaptif = gunakanTokoNotch(
    (s) => s.perbaruiUkuranAdaptif
  );
  const terapkanModeUkuranNotch = gunakanTokoNotch(
    (s) => s.terapkanModeUkuranNotch
  );
  const aturSelaluDiAtas = gunakanTokoNotch((s) => s.aturSelaluDiAtas);

  return (
    <div className="space-y-5">
      <Kartu elevasi="angkat" kilau="biru">
        <KepalaKartu>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Settings2 className="h-4 w-4 text-[var(--aksen-biru-elektrik)]" />
              <JudulKartu>Pengaturan Adaptive Mascot & Smart Notch</JudulKartu>
            </div>
            <Lencana varian="teal">
              Karakter: {LABEL_KARAKTER_MASCOT[pengaturan.selectedCharacter].nama}
            </Lencana>
          </div>
          <DeskripsiKartu>
            Pilih satu dari 3 karakter resmi (Panna Cotta, Ivy Lacquer, Marinara Red). Mengganti karakter tidak pernah menghapus riwayat musik, pengaturan lirik, atau data lain.
          </DeskripsiKartu>
        </KepalaKartu>

        <IsiKartu className="space-y-5">
          {/* Pilihan 3 Karakter + Pratinjau */}
          <div className="grid gap-3 md:grid-cols-3">
            {MASCOT_CHARACTERS.map((id) => {
              const info = LABEL_KARAKTER_MASCOT[id];
              const terpilih = pengaturan.selectedCharacter === id;
              return (
                <button
                  key={id}
                  type="button"
                  data-testid={`pilih-karakter-${id}`}
                  onClick={() => perbaruiPengaturan({ selectedCharacter: id })}
                  className={`flex items-center gap-3 rounded-2xl border p-3 text-left transition cursor-pointer ${
                    terpilih
                      ? "border-[#A83235] bg-[#F1E4D0]/10"
                      : "border-[var(--warna-batas)] hover:border-[var(--warna-batas-kuat)]"
                  }`}
                >
                  <RiveMascotCanvas ukuranPx={60} karakterOverride={id} />
                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-semibold">{info.nama}</span>
                      {terpilih && <Lencana varian="teal">Aktif</Lencana>}
                    </div>
                    <p className="text-[11px] text-[var(--warna-teks-sekunder)]">
                      {info.deskripsi}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Kontrol Maskot */}
          <div className="grid gap-3 sm:grid-cols-3 text-xs pt-2 border-t border-[var(--warna-batas)]">
            <div className="space-y-1">
              <label htmlFor="pengaturan-ukuran-karakter">
                Ukuran Karakter
              </label>
              <select
                id="pengaturan-ukuran-karakter"
                value={pengaturan.characterSize}
                onChange={(e) =>
                  perbaruiPengaturan({
                    characterSize: e.target.value as MascotCharacterSize,
                  })
                }
                className="h-9 w-full rounded-xl border border-[var(--warna-batas-kuat)] bg-white/80 dark:bg-[#101521] px-2.5"
              >
                <option value="kecil">Kecil</option>
                <option value="sedang">Sedang</option>
                <option value="besar">Besar</option>
              </select>
            </div>

            <div className="space-y-1">
              <label htmlFor="pengaturan-kecepatan-animasi">
                Kecepatan Animasi ({pengaturan.animationSpeed.toFixed(1)}x)
              </label>
              <input
                id="pengaturan-kecepatan-animasi"
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
                className="w-full accent-[#344C3D]"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="pengaturan-intensitas-animasi">
                Intensitas Animasi ({pengaturan.animationIntensity.toFixed(1)}x)
              </label>
              <input
                id="pengaturan-intensitas-animasi"
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
                className="w-full accent-[#A83235]"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-[var(--warna-teks-sekunder)]">
              Personality Preset:
            </span>
            {MASCOT_PERSONALITY_PRESETS.map((preset) => (
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

          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            <Sakelar
              aktif={pengaturan.enabled}
              saatBerubah={(v) => perbaruiPengaturan({ enabled: v })}
              label="Aktifkan Maskot"
            />
            <Sakelar
              aktif={pengaturan.idleBehavior}
              saatBerubah={(v) => perbaruiPengaturan({ idleBehavior: v })}
              label="Idle Behavior"
            />
            <Sakelar
              aktif={pengaturan.cursorTrackingEnabled}
              saatBerubah={(v) =>
                perbaruiPengaturan({ cursorTrackingEnabled: v })
              }
              label="Cursor Tracking"
            />
            <Sakelar
              aktif={pengaturan.musicReactionEnabled}
              saatBerubah={(v) =>
                perbaruiPengaturan({ musicReactionEnabled: v })
              }
              label="Music Reaction"
            />
            <Sakelar
              aktif={pengaturan.lyricsAutoDisplay}
              saatBerubah={(v) => perbaruiPengaturan({ lyricsAutoDisplay: v })}
              label="Lyrics Auto-Display"
            />
            <Sakelar
              aktif={pengaturan.soundEnabled}
              saatBerubah={(v) => perbaruiPengaturan({ soundEnabled: v })}
              label="Suara Aktif"
            />
            <Sakelar
              aktif={pengaturan.voiceEnabled}
              saatBerubah={(v) => perbaruiPengaturan({ voiceEnabled: v })}
              label="Voice (TTS)"
            />
            <Sakelar
              aktif={pengaturan.reducedMotion}
              saatBerubah={(v) => perbaruiPengaturan({ reducedMotion: v })}
              label="Reduced Motion"
            />
          </div>

          {daftarSuara.length > 0 && (
            <div className="space-y-1 text-xs">
              <label htmlFor="pengaturan-suara-tts">Voice Selection</label>
              <select
                id="pengaturan-suara-tts"
                value={pengaturan.voiceName ?? ""}
                onChange={(e) =>
                  perbaruiPengaturan({
                    voiceName: e.target.value ? e.target.value : null,
                  })
                }
                className="h-9 w-full rounded-xl border border-[var(--warna-batas-kuat)] bg-white/80 dark:bg-[#101521] px-2.5"
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
        </IsiKartu>
      </Kartu>

      {/* Adaptive Notch Sizing */}
      <Kartu elevasi="angkat">
        <KepalaKartu>
          <div className="flex items-center gap-2">
            <Sliders className="h-4 w-4 text-[var(--aksen-teal-siber)]" />
            <JudulKartu>Adaptive Notch Sizing & Profil OS</JudulKartu>
          </div>
          <DeskripsiKartu>
            Atur mode Mini, Compact, Expanded, atau Custom beserta lebar, tinggi, ukuran maskot proporsional, posisi, dan profil macOS/Windows.
          </DeskripsiKartu>
        </KepalaKartu>

        <IsiKartu className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {DAFTAR_MODE_UKURAN.map((mode) => (
              <Tombol
                key={mode}
                ukuran="kecil"
                varian={
                  ukuranAdaptif.modeUkuran === mode ? "utama" : "kaca"
                }
                onClick={() => terapkanModeUkuranNotch(mode)}
              >
                {mode}
              </Tombol>
            ))}
          </div>

          <div className="grid gap-3 sm:grid-cols-3 text-xs">
            <div className="space-y-1">
              <label htmlFor="lebar-kustom-notch">
                Lebar Kustom ({ukuranAdaptif.lebarKustom}px)
              </label>
              <input
                id="lebar-kustom-notch"
                type="range"
                min={280}
                max={1280}
                step={10}
                value={ukuranAdaptif.lebarKustom}
                onChange={(e) =>
                  perbaruiUkuranAdaptif({
                    modeUkuran: "custom",
                    lebarKustom: Number(e.target.value),
                  })
                }
                className="w-full accent-[#55A7FF]"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="tinggi-kustom-notch">
                Tinggi Kustom ({ukuranAdaptif.tinggiKustom}px)
              </label>
              <input
                id="tinggi-kustom-notch"
                type="range"
                min={48}
                max={860}
                step={10}
                value={ukuranAdaptif.tinggiKustom}
                onChange={(e) =>
                  perbaruiUkuranAdaptif({
                    modeUkuran: "custom",
                    tinggiKustom: Number(e.target.value),
                  })
                }
                className="w-full accent-[#A879FF]"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="ukuran-maskot-notch">
                Ukuran Maskot di Notch ({ukuranAdaptif.ukuranMaskotPx}px)
              </label>
              <input
                id="ukuran-maskot-notch"
                type="range"
                min={24}
                max={96}
                step={2}
                value={ukuranAdaptif.ukuranMaskotPx}
                onChange={(e) =>
                  perbaruiUkuranAdaptif({
                    ukuranMaskotPx: Number(e.target.value),
                  })
                }
                className="w-full accent-[#66E5D2]"
              />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 text-xs">
            <div className="space-y-1">
              <label htmlFor="posisi-maskot-notch">Posisi Maskot</label>
              <select
                id="posisi-maskot-notch"
                value={ukuranAdaptif.posisiMaskot}
                onChange={(e) =>
                  perbaruiUkuranAdaptif({
                    posisiMaskot: e.target.value as PosisiMaskotNotch,
                  })
                }
                className="h-9 w-full rounded-xl border border-[var(--warna-batas-kuat)] bg-white/80 dark:bg-[#101521] px-2.5"
              >
                <option value="kiri">Kiri</option>
                <option value="kanan">Kanan</option>
              </select>
            </div>

            <div className="space-y-1">
              <label htmlFor="kepadatan-konten-notch">Kepadatan Konten</label>
              <select
                id="kepadatan-konten-notch"
                value={ukuranAdaptif.kepadatanKonten}
                onChange={(e) =>
                  perbaruiUkuranAdaptif({
                    kepadatanKonten: e.target.value as KepadatanKontenNotch,
                  })
                }
                className="h-9 w-full rounded-xl border border-[var(--warna-batas-kuat)] bg-white/80 dark:bg-[#101521] px-2.5"
              >
                <option value="ringkas">Ringkas</option>
                <option value="standar">Standar</option>
                <option value="lega">Lega</option>
              </select>
            </div>

            <div className="space-y-1">
              <label htmlFor="profil-os-notch">Profil Ukuran OS</label>
              <select
                id="profil-os-notch"
                value={ukuranAdaptif.profilOs}
                onChange={(e) =>
                  perbaruiUkuranAdaptif({
                    profilOs: e.target.value as "macos" | "windows",
                  })
                }
                className="h-9 w-full rounded-xl border border-[var(--warna-batas-kuat)] bg-white/80 dark:bg-[#101521] px-2.5"
              >
                <option value="macos">macOS (Notch Safe Area + Fallback)</option>
                <option value="windows">Windows (Floating Island)</option>
              </select>
            </div>
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            <Sakelar
              aktif={selaluDiAtas}
              saatBerubah={aturSelaluDiAtas}
              label="Always on Top"
            />
            <Sakelar
              aktif={ukuranAdaptif.autoExpand}
              saatBerubah={(v) => perbaruiUkuranAdaptif({ autoExpand: v })}
              label="Auto-Expand saat Aktivitas"
            />
          </div>
        </IsiKartu>
      </Kartu>
    </div>
  );
}
