import { useEffect, useState } from "react";
import {
  Database,
  Keyboard,
  Layers,
  Monitor,
  Move,
  Palette,
  SlidersHorizontal,
} from "lucide-react";
import {
  DeskripsiKartu,
  IsiKartu,
  JudulKartu,
  Kartu,
  KepalaKartu,
  Lencana,
  PanelKaca,
  PeralihanTema,
  Sakelar,
  TabNavigasi,
  Tombol,
  type ItemTab,
} from "@/sistem-desain";
import { EtalaseSistemDesain } from "@/sistem-desain/komponen/EtalaseSistemDesain";
import { PanelDatabase } from "@/database";
import { pantauPerubahanLayar } from "@/notch/layanan/layananJendela";
import {
  METADATA_STATUS_NOTCH,
  tentukanModeEfektif,
  URUTAN_STATUS_NOTCH,
} from "@/notch/mesin/mesinStatusNotch";
import {
  DAFTAR_PINTASAN_BAWAAN,
  gunakanPintasanNotch,
} from "@/notch/pintasan/pintasanGlobal";
import { ambilMonitorAktif, gunakanTokoNotch } from "@/notch/toko/tokoNotch";
import { KapsulNotch } from "./KapsulNotch";

type TampilanUtama = "mesin_notch" | "database" | "sistem_desain";

const TAB_TAMPILAN_UTAMA: readonly ItemTab<TampilanUtama>[] = [
  {
    id: "mesin_notch",
    label: "Mesin Notch",
    ikon: <SlidersHorizontal className="h-3.5 w-3.5" />,
  },
  {
    id: "database",
    label: "Database & Backup",
    ikon: <Database className="h-3.5 w-3.5" />,
  },
  {
    id: "sistem_desain",
    label: "Design System",
    ikon: <Palette className="h-3.5 w-3.5" />,
  },
];

export function RuangKerjaNotch() {
  const [tampilanAktif, aturTampilanAktif] =
    useState<TampilanUtama>("mesin_notch");

  const modeDiminta = gunakanTokoNotch((s) => s.modeDiminta);
  const statusAktif = gunakanTokoNotch((s) => s.statusAktif);
  const selaluDiAtas = gunakanTokoNotch((s) => s.selaluDiAtas);
  const daftarMonitor = gunakanTokoNotch((s) => s.daftarMonitor);
  const idMonitorAktif = gunakanTokoNotch((s) => s.idMonitorAktif);
  const geometriPulau = gunakanTokoNotch((s) => s.geometriPulau);

  const muatMonitor = gunakanTokoNotch((s) => s.muatMonitor);
  const pilihMonitor = gunakanTokoNotch((s) => s.pilihMonitor);
  const aturModeTampilan = gunakanTokoNotch((s) => s.aturModeTampilan);
  const ubahStatusNotch = gunakanTokoNotch((s) => s.ubahStatusNotch);
  const aturSelaluDiAtas = gunakanTokoNotch((s) => s.aturSelaluDiAtas);
  const perbaruiPosisiPulau = gunakanTokoNotch((s) => s.perbaruiPosisiPulau);
  const perbaruiUkuranPulau = gunakanTokoNotch((s) => s.perbaruiUkuranPulau);

  gunakanPintasanNotch();

  useEffect(() => {
    void muatMonitor();
    return pantauPerubahanLayar(() => {
      void muatMonitor();
    });
  }, [muatMonitor]);

  const monitorAktif = ambilMonitorAktif(daftarMonitor, idMonitorAktif);
  const { modeEfektif, fallbackAktif, alasanFallback } = tentukanModeEfektif(
    modeDiminta,
    monitorAktif
  );

  if (tampilanAktif === "sistem_desain") {
    return (
      <div className="min-h-screen latar-futuristik">
        <div className="mx-auto max-w-6xl px-5 pt-5 md:px-8 flex flex-wrap items-center justify-between gap-3">
          <TabNavigasi
            daftarTab={TAB_TAMPILAN_UTAMA}
            tabAktif={tampilanAktif}
            saatPilihTab={aturTampilanAktif}
            idGrup="navigasi-ruang-utama"
          />
          <PeralihanTema />
        </div>
        <EtalaseSistemDesain />
      </div>
    );
  }

  return (
    <div className="min-h-screen latar-futuristik px-5 py-5 md:px-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <section aria-label="Area Interaksi Kapsul Notch" className="pt-1">
          <KapsulNotch />
        </section>

        <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <Lencana varian="biru" titikAktif>
                Fase 4 • Database & Persistensi
              </Lencana>
              <Lencana varian={modeEfektif === "notch_adaptif" ? "teal" : "ungu"}>
                {modeEfektif === "notch_adaptif"
                  ? "Mode: Notch Adaptif"
                  : "Mode: Floating Island"}
              </Lencana>
            </div>
            <h1 className="text-2xl font-semibold tracking-tight text-[var(--warna-teks-utama)]">
              Overthinker Notch
            </h1>
            <p className="text-sm text-[var(--warna-teks-sekunder)]">
              Workspace desktop lokal-pertama dengan Notch Engine, SQLite 18 tabel, dan backup otomatis.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <TabNavigasi
              daftarTab={TAB_TAMPILAN_UTAMA}
              tabAktif={tampilanAktif}
              saatPilihTab={aturTampilanAktif}
              idGrup="navigasi-ruang-utama"
            />
            <PeralihanTema />
          </div>
        </header>

        {tampilanAktif === "database" ? (
          <main>
            <PanelDatabase />
          </main>
        ) : (
          <>
            {fallbackAktif && alasanFallback && (
              <PanelKaca className="px-4 py-3 border-amber-500/35 flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs text-amber-700 dark:text-amber-300">
                  {alasanFallback}
                </span>
                <Lencana varian="peringatan">Fallback Otomatis Aktif</Lencana>
              </PanelKaca>
            )}

            <main className="grid gap-5 lg:grid-cols-12">
              <Kartu elevasi="angkat" kilau="biru" className="lg:col-span-7">
                <KepalaKartu>
                  <div className="flex items-center gap-2">
                    <Monitor className="h-4 w-4 text-[var(--aksen-biru-elektrik)]" />
                    <JudulKartu>Mode Tampilan & Multi-Monitor</JudulKartu>
                  </div>
                  <DeskripsiKartu>
                    Pilih Notch Adaptif atau Floating Island. Posisi dan ukuran tersimpan otomatis.
                  </DeskripsiKartu>
                </KepalaKartu>

                <IsiKartu className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    <Tombol
                      varian={modeDiminta === "notch_adaptif" ? "utama" : "kaca"}
                      onClick={() => aturModeTampilan("notch_adaptif")}
                    >
                      Notch Adaptif
                    </Tombol>
                    <Tombol
                      varian={
                        modeDiminta === "pulau_melayang" ? "sekunder" : "kaca"
                      }
                      onClick={() => aturModeTampilan("pulau_melayang")}
                    >
                      Floating Island
                    </Tombol>
                  </div>

                  <Sakelar
                    aktif={selaluDiAtas}
                    saatBerubah={aturSelaluDiAtas}
                    label="Always on Top"
                    deskripsi="Menjaga kapsul tetap tampil di atas jendela aplikasi lain."
                  />

                  <div className="space-y-2 pt-2 border-t border-[var(--warna-batas)]">
                    <span className="block text-xs font-medium text-[var(--warna-teks-sekunder)]">
                      Monitor Terdeteksi ({daftarMonitor.length})
                    </span>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {daftarMonitor.map((monitor) => {
                        const terpilih =
                          monitor.idMonitor === monitorAktif?.idMonitor;
                        return (
                          <button
                            key={monitor.idMonitor}
                            type="button"
                            onClick={() => pilihMonitor(monitor.idMonitor)}
                            className={`rounded-xl border p-3 text-left transition cursor-pointer ${
                              terpilih
                                ? "border-[var(--aksen-biru-elektrik)] bg-[#55A7FF]/10"
                                : "border-[var(--warna-batas)] hover:border-[var(--warna-batas-kuat)]"
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-xs font-semibold">
                                {monitor.nama}
                              </span>
                              <Lencana
                                varian={monitor.dukunganNotch ? "teal" : "netral"}
                              >
                                {monitor.dukunganNotch ? "Notch" : "Standar"}
                              </Lencana>
                            </div>
                            <p className="mt-1 font-kode text-[11px] text-[var(--warna-teks-sekunder)]">
                              {Math.round(monitor.lebarLogis)}×
                              {Math.round(monitor.tinggiLogis)} • Skala{" "}
                              {monitor.faktorSkala}x
                            </p>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </IsiKartu>
              </Kartu>

              <Kartu className="lg:col-span-5">
                <KepalaKartu>
                  <div className="flex items-center gap-2">
                    <Move className="h-4 w-4 text-[var(--aksen-ungu-neon)]" />
                    <JudulKartu>Posisi & Ukuran Floating Island</JudulKartu>
                  </div>
                  <DeskripsiKartu>
                    Seret bagian atas kapsul atau atur ukuran jendela secara presisi.
                  </DeskripsiKartu>
                </KepalaKartu>

                <IsiKartu className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-xl border border-[var(--warna-batas)] p-3">
                      <span className="text-[11px] text-[var(--warna-teks-redup)]">
                        Koordinat Tersimpan
                      </span>
                      <p className="mt-1 font-kode text-xs font-semibold">
                        X: {Math.round(geometriPulau.posisiX)}px • Y:{" "}
                        {Math.round(geometriPulau.posisiY)}px
                      </p>
                    </div>
                    <div className="rounded-xl border border-[var(--warna-batas)] p-3">
                      <span className="text-[11px] text-[var(--warna-teks-redup)]">
                        Ukuran Diperluas
                      </span>
                      <p className="mt-1 font-kode text-xs font-semibold">
                        {geometriPulau.lebarDiperluas}×
                        {geometriPulau.tinggiDiperluas}px
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="slider-lebar-pulau"
                      className="flex justify-between text-xs text-[var(--warna-teks-sekunder)]"
                    >
                      <span>Lebar Panel Diperluas</span>
                      <span className="font-kode">
                        {geometriPulau.lebarDiperluas}px
                      </span>
                    </label>
                    <input
                      id="slider-lebar-pulau"
                      type="range"
                      min={420}
                      max={960}
                      step={10}
                      value={geometriPulau.lebarDiperluas}
                      onChange={(e) =>
                        perbaruiUkuranPulau(
                          Number(e.target.value),
                          geometriPulau.tinggiDiperluas
                        )
                      }
                      className="w-full accent-[#55A7FF]"
                    />
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Tombol
                      varian="kaca"
                      ukuran="kecil"
                      onClick={() => perbaruiPosisiPulau(48, 28)}
                    >
                      Reset Posisi
                    </Tombol>
                    <Tombol
                      varian="kaca"
                      ukuran="kecil"
                      onClick={() => perbaruiUkuranPulau(680, 400)}
                    >
                      Ukuran Default
                    </Tombol>
                  </div>
                </IsiKartu>
              </Kartu>

              <Kartu className="lg:col-span-7">
                <KepalaKartu>
                  <div className="flex items-center gap-2">
                    <Layers className="h-4 w-4 text-[var(--aksen-teal-siber)]" />
                    <JudulKartu>State Machine (9 Status)</JudulKartu>
                  </div>
                  <DeskripsiKartu>
                    Transisi deterministik yang menjaga teks masukan tetap utuh.
                  </DeskripsiKartu>
                </KepalaKartu>

                <IsiKartu>
                  <div className="flex flex-wrap gap-2">
                    {URUTAN_STATUS_NOTCH.map((status) => {
                      const meta = METADATA_STATUS_NOTCH[status];
                      return (
                        <Tombol
                          key={status}
                          ukuran="kecil"
                          varian={statusAktif === status ? "utama" : "kaca"}
                          onClick={() => ubahStatusNotch(status)}
                        >
                          {meta.label}
                        </Tombol>
                      );
                    })}
                  </div>
                </IsiKartu>
              </Kartu>

              <Kartu className="lg:col-span-5">
                <KepalaKartu>
                  <div className="flex items-center gap-2">
                    <Keyboard className="h-4 w-4 text-[var(--aksen-biru-elektrik)]" />
                    <JudulKartu>Keyboard Shortcuts</JudulKartu>
                  </div>
                  <DeskripsiKartu>
                    Aktif langsung di jendela aplikasi dan siap disambungkan ke OS global shortcut di Tauri native.
                  </DeskripsiKartu>
                </KepalaKartu>

                <IsiKartu className="space-y-1.5">
                  {DAFTAR_PINTASAN_BAWAAN.map((pintasan) => (
                    <div
                      key={pintasan.id}
                      className="flex items-center justify-between gap-2 rounded-lg border border-[var(--warna-batas)] px-3 py-1.5"
                    >
                      <span className="text-xs text-[var(--warna-teks-utama)]">
                        {pintasan.label}
                      </span>
                      <kbd className="rounded-md border border-[var(--warna-batas-kuat)] bg-black/5 dark:bg-white/8 px-2 py-0.5 font-kode text-[11px]">
                        {pintasan.kombinasi}
                      </kbd>
                    </div>
                  ))}
                </IsiKartu>
              </Kartu>
            </main>
          </>
        )}
      </div>
    </div>
  );
}
