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
  { id: "ringkasan", label: "Token & Tipografi", ikon: <Palette className="h-3.5 w-3.5" /> },
  { id: "komponen", label: "Komponen Inti", ikon: <Layers className="h-3.5 w-3.5" /> },
  { id: "interaksi", label: "Pegas & Status Notch", ikon: <Sparkles className="h-3.5 w-3.5" /> },
  { id: "runtime", label: "Runtime Lokal", ikon: <Cpu className="h-3.5 w-3.5" /> },
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
      return "Perlu Izin OS";
    case "penyedia_belum_dikonfigurasi":
      return "Penyedia Belum Diatur";
    case "tidak_didukung_os":
      return "Tidak Aktif di Lingkungan Ini";
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
          : "Gagal mengambil informasi runtime lokal."
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
                Fase 2 • Sistem Desain
              </Lencana>
              <Lencana varian="teal">Lokal-Pertama</Lencana>
              <Lencana varian="ungu">Bahasa Indonesia</Lencana>
            </div>
            <h1 className="text-2xl font-semibold tracking-tight text-[var(--warna-teks-utama)]">
              Overthinker Notch
            </h1>
            <p className="text-sm text-[var(--warna-teks-sekunder)]">
              Pusat Produktivitas Desktop Futuristik — {ambilDeskripsiTema(modeTema)}
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <PeralihanTema />
          </div>
        </header>

        <nav aria-label="Navigasi Etalase Sistem Desain">
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
                  <JudulKartu>Palet Identitas Visual</JudulKartu>
                  <Lencana varian="netral">Klik warna untuk menyalin</Lencana>
                </div>
                <DeskripsiKartu>
                  Warna inti Overthinker Notch dengan kontras terkendali untuk Mode
                  Gelap dan Mode Terang.
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
                  <JudulKartu>Skala Tipografi Lokal</JudulKartu>
                </div>
                <DeskripsiKartu>
                  Menggunakan font sistem asli tanpa ketergantungan CDN eksternal.
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
                <JudulKartu>Tombol & Lencana Status</JudulKartu>
                <DeskripsiKartu>
                  Seluruh varian tombol dan lencana mengikuti token tema aktif.
                </DeskripsiKartu>
              </KepalaKartu>

              <IsiKartu className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <Tombol varian="utama" onClick={() => aturBagianAktif("interaksi")}>
                    Tombol Utama
                  </Tombol>
                  <Tombol varian="sekunder" onClick={() => aturBagianAktif("runtime")}>
                    Tombol Sekunder
                  </Tombol>
                  <Tombol varian="kaca" onClick={() => aturKilauAktif((v) => !v)}>
                    {kilauAktif ? "Matikan Kilau" : "Aktifkan Kilau"}
                  </Tombol>
                  <Tombol varian="kerangka" onClick={() => aturJudulUji("Catatan Uji")}>
                    Kerangka
                  </Tombol>
                  <Tombol varian="hantu" onClick={() => aturJudulUji("")}>
                    Bersihkan
                  </Tombol>
                  <Tombol varian="bahaya" disabled>
                    Nonaktif
                  </Tombol>
                </div>

                <div className="flex flex-wrap gap-2 pt-2 border-t border-[var(--warna-batas)]">
                  <Lencana varian="biru" titikAktif>
                    Biru Elektrik
                  </Lencana>
                  <Lencana varian="ungu" titikAktif>
                    Ungu Neon
                  </Lencana>
                  <Lencana varian="teal" titikAktif>
                    Teal Siber
                  </Lencana>
                  <Lencana varian="peringatan">Perlu Izin</Lencana>
                  <Lencana varian="bahaya">Galat</Lencana>
                  <Lencana varian="netral">Netral</Lencana>
                </div>
              </IsiKartu>
            </Kartu>

            <Kartu>
              <KepalaKartu>
                <JudulKartu>Formulir & Sakelar Interaktif</JudulKartu>
                <DeskripsiKartu>
                  Uji masukan teks dan sakelar; nilai tetap tersimpan saat Anda
                  berpindah tab.
                </DeskripsiKartu>
              </KepalaKartu>

              <IsiKartu className="space-y-4">
                <KolomMasukan
                  label="Judul Masukan Uji"
                  placeholder="Ketik judul singkat untuk menguji persistensi state..."
                  value={judulUji}
                  onChange={(e) => aturJudulUji(e.target.value)}
                  bantuan="Nilai ini tetap terjaga meskipun Anda berpindah tab."
                />
                <AreaTeks
                  label="Catatan Uji Sistem Desain"
                  placeholder="Tulis catatan singkat di sini..."
                  value={catatanUji}
                  onChange={(e) => aturCatatanUji(e.target.value)}
                />
                <Sakelar
                  aktif={kilauAktif}
                  saatBerubah={aturKilauAktif}
                  label="Aktifkan Efek Kilau Halus"
                  deskripsi="Mengatur kilau halus pada panel kaca utama."
                />
              </IsiKartu>
            </Kartu>
          </section>
        )}

        {bagianAktif === "interaksi" && (
          <section className="space-y-5">
            <Kartu elevasi="angkat" kilau={kilauAktif ? "teal" : "tanpa"}>
              <KepalaKartu>
                <JudulKartu>Pratinjau Transisi Pegas 9 Status Notch</JudulKartu>
                <DeskripsiKartu>
                  Simulasi fisik pegas sistem desain sebelum integrasi mesin jendela
                  native pada Fase 3 (Mesin Notch).
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
                      <Lencana varian="biru">Pegas Aktif</Lencana>
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
                    <JudulKartu>Informasi Runtime & Kapabilitas Lokal</JudulKartu>
                  </div>
                  <Tombol
                    varian="kaca"
                    ukuran="kecil"
                    sedangMemuat={sedangMuatRuntime}
                    ikonKiri={<RefreshCw className="h-3.5 w-3.5" />}
                    onClick={() => void muatInfoRuntime()}
                  >
                    Segarkan
                  </Tombol>
                </div>
                <DeskripsiKartu>
                  Data dibaca langsung dari lingkungan berjalan saat ini tanpa angka
                  palsu atau simulasi.
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
                          Versi Aplikasi
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
                          Sistem Operasi
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
                        Laporan Kapabilitas Platform
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
                  Fase berikutnya: Fase 3 — Mesin Notch (Notch Adaptif & Pulau Melayang)
                </span>
              </KakiKartu>
            </Kartu>
          </section>
        )}
      </div>
    </div>
  );
}
