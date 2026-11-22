import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Check,
  Copy,
  Cpu,
  Layers,
  Palette,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Type,
} from "lucide-react";
import {
  ambilInfoRuntime,
  type InfoRuntimeSistem,
  type StatusKapabilitas,
} from "@/bersama/ipc/klienIpc";
import {
  ambilDeskripsiTema,
  DAFTAR_STATUS_NOTCH,
  PRESET_PEGAS,
  SKALA_TIPOGRAFI,
  TOKEN_WARNA_IDENTITAS,
  type ModeTema,
} from "@/sistem-desain/token/tokenDesain";
import { gunakanTokoTema } from "@/sistem-desain/tema/tokoTema";
import { PanelKaca } from "./PanelKaca";
import { Tombol } from "./Tombol";
import { Lencana, type VarianLencana } from "./Lencana";
import {
  DeskripsiKartu,
  IsiKartu,
  JudulKartu,
  KakiKartu,
  Kartu,
  KepalaKartu,
} from "./Kartu";
import { AreaTeks, KolomMasukan } from "./KolomMasukan";
import { Sakelar } from "./Sakelar";
import { TabNavigasi, type ItemTab } from "./TabNavigasi";
import { PeralihanTema } from "./PeralihanTema";

type BagianEtalase = "ringkasan" | "komponen" | "interaksi" | "runtime";

const DAFTAR_TAB_ETALASE: readonly ItemTab<BagianEtalase>[] = [
  { id: "ringkasan", label: "Warna & Tipografi", ikon: <Palette className="h-3.5 w-3.5" /> },
  { id: "komponen", label: "Komponen UI", ikon: <Layers className="h-3.5 w-3.5" /> },
  { id: "interaksi", label: "Animasi Notch", ikon: <Sparkles className="h-3.5 w-3.5" /> },
  { id: "runtime", label: "Info Runtime", ikon: <Cpu className="h-3.5 w-3.5" /> },
];

function petakanVarianKapabilitas(status: StatusKapabilitas): VarianLencana {
  switch (status) {
    case "didukung":
      return "teal";
    case "perlu_izin":
      return "peringatan";
    case "penyedia_belum_dikonfigurasi":
      return "ungu";
    case "tidak_didukung_os":
      return "netral";
  }
}

function terjemahkanStatusKapabilitas(status: StatusKapabilitas): string {
  switch (status) {
    case "didukung":
      return "Didukung";
    case "perlu_izin":
      return "Butuh Izin OS";
    case "penyedia_belum_dikonfigurasi":
      return "Provider Belum Diatur";
    case "tidak_didukung_os":
      return "Belum Aktif di Mode Ini";
  }
}

export function EtalaseSistemDesain() {
  const modeTema: ModeTema = gunakanTokoTema((state) => state.mode);
  const [bagianAktif, aturBagianAktif] = useState<BagianEtalase>("ringkasan");
  const [warnaTersalin, aturWarnaTersalin] = useState<string | null>(null);
  const [statusNotchAktif, aturStatusNotchAktif] = useState<string>("siaga");
  const [kilauAktif, aturKilauAktif] = useState<boolean>(true);
  const [catatanUji, aturCatatanUji] = useState<string>("");
  const [judulUji, aturJudulUji] = useState<string>("");
  const [infoRuntime, aturInfoRuntime] = useState<InfoRuntimeSistem | null>(null);
  const [sedangMuatRuntime, aturSedangMuatRuntime] = useState<boolean>(false);
  const [galatRuntime, aturGalatRuntime] = useState<string | null>(null);

  async function muatInfoRuntime(): Promise<void> {
    aturSedangMuatRuntime(true);
    aturGalatRuntime(null);
    try {
      const data = await ambilInfoRuntime();
      aturInfoRuntime(data);
    } catch (galat) {
      aturGalatRuntime(
        galat instanceof Error
          ? galat.message
          : "Gagal ambil info runtime lokal."
      );
    } finally {
      aturSedangMuatRuntime(false);
    }
  }

  useEffect(() => {
    void muatInfoRuntime();
  }, []);

  async function salinKodeWarna(nilaiHex: string): Promise<void> {
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(nilaiHex);
      }
      aturWarnaTersalin(nilaiHex);
      window.setTimeout(() => aturWarnaTersalin(null), 1600);
    } catch {
      aturWarnaTersalin(nilaiHex);
    }
  }

  const infoStatusNotch =
    DAFTAR_STATUS_NOTCH.find((item) => item.id === statusNotchAktif) ??
    DAFTAR_STATUS_NOTCH[0];

  return (
    <div className="min-h-screen latar-futuristik px-5 py-6 md:px-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <Lencana varian="biru" titikAktif>
                Fase 2 • Design System
              </Lencana>
              <Lencana varian="teal">Local-First</Lencana>
            </div>
            <h1 className="text-2xl font-semibold tracking-tight text-[var(--warna-teks-utama)]">
              Overthinker Notch
            </h1>
            <p className="text-sm text-[var(--warna-teks-sekunder)]">
              Desktop Productivity Hub — {ambilDeskripsiTema(modeTema)}
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <PeralihanTema />
          </div>
        </header>

        <nav aria-label="Navigasi Design System">
          <TabNavigasi
            daftarTab={DAFTAR_TAB_ETALASE}
            tabAktif={bagianAktif}
            saatPilihTab={aturBagianAktif}
            idGrup="etalase-utama"
          />
        </nav>

        {bagianAktif === "ringkasan" && (
          <section className="grid gap-5 lg:grid-cols-12">
            <Kartu
              elevasi="angkat"
              kilau={kilauAktif ? "biru" : "tanpa"}
              className="lg:col-span-7"
            >
              <KepalaKartu>
                <div className="flex items-center justify-between gap-2">
                  <JudulKartu>Palet Warna Utama</JudulKartu>
                  <Lencana varian="netral">Klik buat copy hex</Lencana>
                </div>
                <DeskripsiKartu>
                  Warna inti Overthinker Notch dengan kontras enak dilihat di Dark Mode maupun Light Mode.
                </DeskripsiKartu>
              </KepalaKartu>

              <IsiKartu>
                <div className="grid gap-3 sm:grid-cols-2">
                  {TOKEN_WARNA_IDENTITAS.map((warna) => {
                    const tersalin = warnaTersalin === warna.nilaiHex;
                    return (
                      <button
                        key={warna.nilaiHex}
                        type="button"
                        onClick={() => void salinKodeWarna(warna.nilaiHex)}
                        className="group flex items-center gap-3 rounded-xl border border-[var(--warna-batas)] bg-black/[0.02] dark:bg-white/[0.03] p-3 text-left transition hover:border-[var(--warna-batas-kuat)] cursor-pointer"
                      >
                        <span
                          className="h-10 w-10 shrink-0 rounded-lg border border-white/15 shadow-inner"
                          style={{ backgroundColor: warna.nilaiHex }}
                          aria-hidden="true"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <span className="truncate text-sm font-semibold text-[var(--warna-teks-utama)]">
                              {warna.nama}
                            </span>
                            {tersalin ? (
                              <Check className="h-3.5 w-3.5 text-[var(--aksen-teal-siber)]" />
                            ) : (
                              <Copy className="h-3.5 w-3.5 text-[var(--warna-teks-redup)] opacity-0 transition group-hover:opacity-100" />
                            )}
                          </div>
                          <p className="font-kode text-xs text-[var(--aksen-biru-elektrik)]">
                            {warna.nilaiHex}
                          </p>
                          <p className="truncate text-[11px] text-[var(--warna-teks-sekunder)]">
                            {warna.peran}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </IsiKartu>
            </Kartu>

            <Kartu className="lg:col-span-5">
              <KepalaKartu>
                <div className="flex items-center gap-2">
                  <Type className="h-4 w-4 text-[var(--aksen-ungu-neon)]" />
                  <JudulKartu>Tipografi Lokal</JudulKartu>
                </div>
                <DeskripsiKartu>
                  Pakai font bawaan sistem biar ringan dan nggak bergantung CDN eksternal.
                </DeskripsiKartu>
              </KepalaKartu>

              <IsiKartu className="space-y-3.5">
                {SKALA_TIPOGRAFI.map((item) => (
                  <div
                    key={item.label}
                    className="rounded-xl border border-[var(--warna-batas)] p-3 space-y-1"
                  >
                    <div className="flex items-center justify-between text-[11px] text-[var(--warna-teks-redup)]">
                      <span className="font-medium">{item.label}</span>
                      <span className="font-kode">{item.ukuran}</span>
                    </div>
                    <p className={item.kelas}>{item.contoh}</p>
                  </div>
                ))}
              </IsiKartu>
            </Kartu>
          </section>
        )}

        {bagianAktif === "komponen" && (
          <section className="grid gap-5 lg:grid-cols-2">
            <Kartu elevasi="angkat" kilau={kilauAktif ? "ungu" : "tanpa"}>
              <KepalaKartu>
                <JudulKartu>Button & Badge</JudulKartu>
                <DeskripsiKartu>
                  Semua varian button dan badge otomatis ngikutin tema yang lagi aktif.
                </DeskripsiKartu>
              </KepalaKartu>

              <IsiKartu className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <Tombol varian="utama" onClick={() => aturBagianAktif("interaksi")}>
                    Primary
                  </Tombol>
                  <Tombol varian="sekunder" onClick={() => aturBagianAktif("runtime")}>
                    Secondary
                  </Tombol>
                  <Tombol varian="kaca" onClick={() => aturKilauAktif((v) => !v)}>
                    {kilauAktif ? "Matikan Glow" : "Nyalakan Glow"}
                  </Tombol>
                  <Tombol varian="kerangka" onClick={() => aturJudulUji("Tes Input")}>
                    Outline
                  </Tombol>
                  <Tombol varian="hantu" onClick={() => aturJudulUji("")}>
                    Reset
                  </Tombol>
                  <Tombol varian="bahaya" disabled>
                    Disabled
                  </Tombol>
                </div>

                <div className="flex flex-wrap gap-2 pt-2 border-t border-[var(--warna-batas)]">
                  <Lencana varian="biru" titikAktif>
                    Electric Blue
                  </Lencana>
                  <Lencana varian="ungu" titikAktif>
                    Neon Purple
                  </Lencana>
                  <Lencana varian="teal" titikAktif>
                    Cyber Teal
                  </Lencana>
                  <Lencana varian="peringatan">Butuh Izin</Lencana>
                  <Lencana varian="bahaya">Error</Lencana>
                  <Lencana varian="netral">Netral</Lencana>
                </div>
              </IsiKartu>
            </Kartu>

            <Kartu>
              <KepalaKartu>
                <JudulKartu>Form & Switch Interaktif</JudulKartu>
                <DeskripsiKartu>
                  Coba ketik di sini lalu pindah tab — isinya bakal tetap aman.
                </DeskripsiKartu>
              </KepalaKartu>

              <IsiKartu className="space-y-4">
                <KolomMasukan
                  label="Judul Tes Input"
                  placeholder="Ketik judul singkat buat tes state..."
                  value={judulUji}
                  onChange={(e) => aturJudulUji(e.target.value)}
                  bantuan="Nilai ini nggak hilang walaupun kamu pindah tab."
                />
                <AreaTeks
                  label="Catatan Tes"
                  placeholder="Tulis catatan singkat di sini..."
                  value={catatanUji}
                  onChange={(e) => aturCatatanUji(e.target.value)}
                />
                <Sakelar
                  aktif={kilauAktif}
                  saatBerubah={aturKilauAktif}
                  label="Efek Glow Halus"
                  deskripsi="Nyalakan atau matikan efek glow tipis di panel utama."
                />
              </IsiKartu>
            </Kartu>
          </section>
        )}

        {bagianAktif === "interaksi" && (
          <section className="space-y-5">
            <Kartu elevasi="angkat" kilau={kilauAktif ? "teal" : "tanpa"}>
              <KepalaKartu>
                <JudulKartu>Preview Animasi 9 Status Notch</JudulKartu>
                <DeskripsiKartu>
                  Tes animasi spring Framer Motion buat tiap status kapsul Notch.
                </DeskripsiKartu>
              </KepalaKartu>

              <IsiKartu className="space-y-5">
                <div className="flex flex-wrap gap-2">
                  {DAFTAR_STATUS_NOTCH.map((status) => (
                    <Tombol
                      key={status.id}
                      ukuran="kecil"
                      varian={statusNotchAktif === status.id ? "utama" : "kaca"}
                      onClick={() => aturStatusNotchAktif(status.id)}
                    >
                      {status.label}
                    </Tombol>
                  ))}
                </div>

                <div className="flex justify-center py-4">
                  <motion.div
                    layout
                    transition={PRESET_PEGAS.notch}
                    className="permukaan-kaca-angkat kilau-biru rounded-[28px] px-6 py-4"
                    style={{
                      width:
                        statusNotchAktif === "siaga"
                          ? 260
                          : statusNotchAktif === "ringkas"
                            ? 360
                            : 540,
                      maxWidth: "100%",
                    }}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <span className="h-2.5 w-2.5 rounded-full bg-[#66E5D2]" />
                        <span className="text-sm font-semibold">
                          Status: {infoStatusNotch.label}
                        </span>
                      </div>
                      <Lencana varian="biru">Spring Aktif</Lencana>
                    </div>
                    <p className="mt-2 text-xs text-[var(--warna-teks-sekunder)]">
                      {infoStatusNotch.deskripsi}
                    </p>
                  </motion.div>
                </div>
              </IsiKartu>
            </Kartu>
          </section>
        )}

        {bagianAktif === "runtime" && (
          <section className="space-y-5">
            <Kartu elevasi="angkat">
              <KepalaKartu>
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-[var(--aksen-teal-siber)]" />
                    <JudulKartu>Runtime & Kapabilitas Lokal</JudulKartu>
                  </div>
                  <Tombol
                    varian="kaca"
                    ukuran="kecil"
                    sedangMemuat={sedangMuatRuntime}
                    ikonKiri={<RefreshCw className="h-3.5 w-3.5" />}
                    onClick={() => void muatInfoRuntime()}
                  >
                    Refresh
                  </Tombol>
                </div>
                <DeskripsiKartu>
                  Data dibaca langsung dari environment sekarang, tanpa data dummy atau simulasi.
                </DeskripsiKartu>
              </KepalaKartu>

              <IsiKartu>
                {galatRuntime && (
                  <PanelKaca className="p-3 border-[var(--aksen-bahaya)]/40 text-xs text-[var(--aksen-bahaya)]">
                    {galatRuntime}
                  </PanelKaca>
                )}

                {infoRuntime && (
                  <div className="space-y-4">
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                      <div className="rounded-xl border border-[var(--warna-batas)] p-3">
                        <span className="text-[11px] text-[var(--warna-teks-redup)]">
                          Versi App
                        </span>
                        <p className="mt-1 font-kode text-sm font-semibold">
                          v{infoRuntime.versiAplikasi}
                        </p>
                      </div>
                      <div className="rounded-xl border border-[var(--warna-batas)] p-3">
                        <span className="text-[11px] text-[var(--warna-teks-redup)]">
                          Mode Runtime
                        </span>
                        <p className="mt-1 text-xs font-medium">
                          {infoRuntime.modeRuntime}
                        </p>
                      </div>
                      <div className="rounded-xl border border-[var(--warna-batas)] p-3">
                        <span className="text-[11px] text-[var(--warna-teks-redup)]">
                          OS
                        </span>
                        <p className="mt-1 text-xs font-medium">
                          {infoRuntime.sistemOperasi}
                        </p>
                      </div>
                      <div className="rounded-xl border border-[var(--warna-batas)] p-3">
                        <span className="text-[11px] text-[var(--warna-teks-redup)]">
                          Arsitektur CPU
                        </span>
                        <p className="mt-1 font-kode text-xs font-medium">
                          {infoRuntime.arsitekturCpu}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="text-xs font-semibold text-[var(--warna-teks-sekunder)]">
                        Status Kapabilitas Platform
                      </h4>
                      <div className="space-y-2">
                        {infoRuntime.kapabilitas.map((kap) => (
                          <div
                            key={kap.namaFitur}
                            className="flex flex-col gap-2 rounded-xl border border-[var(--warna-batas)] p-3 sm:flex-row sm:items-center sm:justify-between"
                          >
                            <div>
                              <p className="text-sm font-medium">{kap.namaFitur}</p>
                              <p className="text-xs text-[var(--warna-teks-sekunder)]">
                                {kap.keterangan}
                              </p>
                            </div>
                            <Lencana varian={petakanVarianKapabilitas(kap.status)}>
                              {terjemahkanStatusKapabilitas(kap.status)}
                            </Lencana>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </IsiKartu>

              <KakiKartu>
                <span className="text-xs text-[var(--warna-teks-redup)]">
                  Design System aktif dan dipakai langsung oleh Mesin Notch & Database.
                </span>
              </KakiKartu>
            </Kartu>
          </section>
        )}
      </div>
    </div>
  );
}
