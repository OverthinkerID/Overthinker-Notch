import { useEffect, useState } from "react";
import {
  Disc3,
  Mic,
  Music,
  Pause,
  Play,
  Radio,
  RefreshCw,
  ShieldCheck,
  SkipBack,
  SkipForward,
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
  type VarianLencana,
} from "@/sistem-desain";
import type { StatusKapabilitas } from "@/bersama/ipc/klienIpc";
import { formatDurasiTimer } from "@/fokus/utilitas/waktuFokus";
import { gunakanTokoMusik } from "@/musik/toko/tokoMusik";
import { MATRIKS_ADAPTER_MUSIK } from "@/musik/provider/adapterMusik";
import type {
  JenisPenyediaPengenal,
  KonfigurasiPengenalLagu,
} from "@/musik/tipe/tipeMusik";

function varianKapabilitas(status: StatusKapabilitas): VarianLencana {
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

function labelKapabilitas(status: StatusKapabilitas): string {
  switch (status) {
    case "didukung":
      return "Didukung";
    case "perlu_izin":
      return "Perlu Izin OS";
    case "penyedia_belum_dikonfigurasi":
      return "Provider Belum Diatur";
    case "tidak_didukung_os":
      return "Tidak Aktif di Mode Ini";
  }
}

export function PanelMusik() {
  const trekAktif = gunakanTokoMusik((s) => s.trekAktif);
  const kapabilitas = gunakanTokoMusik((s) => s.kapabilitas);
  const riwayatMusik = gunakanTokoMusik((s) => s.riwayatMusik);
  const konfigPengenal = gunakanTokoMusik((s) => s.konfigPengenal);
  const sedangMemuat = gunakanTokoMusik((s) => s.sedangMemuat);
  const pesanStatus = gunakanTokoMusik((s) => s.pesanStatus);
  const pesanGalat = gunakanTokoMusik((s) => s.pesanGalat);

  const muatSemuaMusik = gunakanTokoMusik((s) => s.muatSemuaMusik);
  const segarkanStatusMusik = gunakanTokoMusik((s) => s.segarkanStatusMusik);
  const kontrolMedia = gunakanTokoMusik((s) => s.kontrolMedia);
  const catatLaguKeRiwayat = gunakanTokoMusik((s) => s.catatLaguKeRiwayat);
  const perbaruiKonfigPengenal = gunakanTokoMusik(
    (s) => s.perbaruiKonfigPengenal
  );
  const ujiIdentifikasiMikrofon = gunakanTokoMusik(
    (s) => s.ujiIdentifikasiMikrofon
  );

  const [formKonfig, aturFormKonfig] =
    useState<KonfigurasiPengenalLagu>(konfigPengenal);
  const [judulManual, aturJudulManual] = useState("");
  const [artisManual, aturArtisManual] = useState("");
  const [albumManual, aturAlbumManual] = useState("");

  useEffect(() => {
    void muatSemuaMusik();
  }, [muatSemuaMusik]);

  useEffect(() => {
    aturFormKonfig(konfigPengenal);
  }, [konfigPengenal]);

  async function tanganiSimpanRiwayatManual(): Promise<void> {
    if (!judulManual.trim() || !artisManual.trim()) return;
    await catatLaguKeRiwayat({
      judulLagu: judulManual,
      artis: artisManual,
      album: albumManual,
      sumberAudio: "Catatan Manual",
      durasiDetik: 0,
    });
    aturJudulManual("");
    aturArtisManual("");
    aturAlbumManual("");
  }

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

      {/* Now Playing & Kontrol Media */}
      <Kartu elevasi="angkat" kilau="biru">
        <KepalaKartu>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Music className="h-4 w-4 text-[var(--aksen-biru-elektrik)]" />
              <JudulKartu>Music Engine</JudulKartu>
            </div>
            <div className="flex items-center gap-2">
              <Lencana varian={trekAktif.sedangMemutar ? "teal" : "netral"}>
                {trekAktif.sedangMemutar ? "Sedang Diputar" : "Standby"}
              </Lencana>
              <Tombol
                ukuran="kecil"
                varian="kaca"
                sedangMemuat={sedangMemuat}
                ikonKiri={<RefreshCw className="h-3.5 w-3.5" />}
                onClick={() => void segarkanStatusMusik()}
              >
                Refresh Status
              </Tombol>
            </div>
          </div>
          <DeskripsiKartu>
            Sumber audio: {trekAktif.sumberAudio} — hanya menampilkan data musik nyata dari OS, tanpa lagu dummy.
          </DeskripsiKartu>
        </KepalaKartu>

        <IsiKartu>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-[var(--warna-batas)] bg-black/[0.02] dark:bg-white/[0.02] p-4">
            <div className="flex items-center gap-4 min-w-0">
              {trekAktif.urlArtwork ? (
                <img
                  src={trekAktif.urlArtwork}
                  alt="Artwork lagu"
                  className="h-14 w-14 rounded-xl object-cover shrink-0"
                />
              ) : (
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-[var(--warna-batas)] bg-[#55A7FF]/10">
                  <Disc3 className="h-6 w-6 text-[var(--aksen-biru-elektrik)]" />
                </div>
              )}

              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-[var(--warna-teks-utama)]">
                  {trekAktif.judulLagu ?? "Nggak ada musik yang lagi diputar"}
                </p>
                <p className="truncate text-xs text-[var(--warna-teks-sekunder)]">
                  {trekAktif.artis
                    ? `${trekAktif.artis}${trekAktif.album ? ` • ${trekAktif.album}` : ""}`
                    : "Putar lagu di Apple Music atau Spotify (mode Tauri native) buat lihat metadata langsung."}
                </p>
                {trekAktif.durasiDetik > 0 && (
                  <p className="mt-1 font-kode text-[11px] text-[var(--warna-teks-redup)]">
                    {formatDurasiTimer(trekAktif.posisiDetik)} /{" "}
                    {formatDurasiTimer(trekAktif.durasiDetik)}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Tombol
                ukuran="ikon"
                varian="kaca"
                aria-label="Lagu Sebelumnya"
                disabled={!trekAktif.kontrolDidukung}
                onClick={() => void kontrolMedia("previous")}
              >
                <SkipBack className="h-4 w-4" />
              </Tombol>
              <Tombol
                ukuran="ikon"
                varian="utama"
                aria-label={trekAktif.sedangMemutar ? "Jeda Lagu" : "Putar Lagu"}
                disabled={!trekAktif.kontrolDidukung}
                onClick={() => void kontrolMedia("play_pause")}
              >
                {trekAktif.sedangMemutar ? (
                  <Pause className="h-4 w-4" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
              </Tombol>
              <Tombol
                ukuran="ikon"
                varian="kaca"
                aria-label="Lagu Berikutnya"
                disabled={!trekAktif.kontrolDidukung}
                onClick={() => void kontrolMedia("next")}
              >
                <SkipForward className="h-4 w-4" />
              </Tombol>
            </div>
          </div>
        </IsiKartu>
      </Kartu>

      <div className="grid gap-5 lg:grid-cols-12">
        {/* Identifikasi Lagu & Penyedia Resmi */}
        <Kartu className="lg:col-span-6 space-y-4">
          <KepalaKartu>
            <div className="flex items-center gap-2">
              <Radio className="h-4 w-4 text-[var(--aksen-ungu-neon)]" />
              <JudulKartu>Song Recognition & Audio Capture</JudulKartu>
            </div>
            <DeskripsiKartu>
              Gunakan penyedia pengenal lagu resmi (authorized provider) + izin mikrofon atau audio sistem OS.
            </DeskripsiKartu>
          </KepalaKartu>

          <IsiKartu className="space-y-3.5">
            <div className="space-y-1.5">
              <label
                htmlFor="pilih-penyedia-musik"
                className="block text-xs font-medium text-[var(--warna-teks-sekunder)]"
              >
                Penyedia Pengenal Lagu Resmi
              </label>
              <select
                id="pilih-penyedia-musik"
                value={formKonfig.jenisPenyedia}
                onChange={(e) =>
                  aturFormKonfig((p) => ({
                    ...p,
                    jenisPenyedia: e.target.value as JenisPenyediaPengenal,
                  }))
                }
                className="h-9 w-full rounded-xl border border-[var(--warna-batas-kuat)] bg-white/80 dark:bg-[#101521] px-2.5 text-xs text-[var(--warna-teks-utama)]"
              >
                <option value="belum_diatur">Belum Dikonfigurasi</option>
                <option value="audd">AudD (Authorized API)</option>
                <option value="acrcloud">ACRCloud (Authorized API)</option>
                <option value="kustom">Endpoint Penyedia Kustom</option>
              </select>
            </div>

            <KolomMasukan
              label="Endpoint Penyedia (Opsional)"
              placeholder="https://api.penyedia-resmi.example/recognize"
              value={formKonfig.endpointUrl}
              onChange={(e) =>
                aturFormKonfig((p) => ({ ...p, endpointUrl: e.target.value }))
              }
            />

            <Sakelar
              aktif={formKonfig.apiTokenTersimpan}
              saatBerubah={(v) =>
                aturFormKonfig((p) => ({ ...p, apiTokenTersimpan: v }))
              }
              label="Kredensial API Tersedia di Pengaturan Lokal"
              deskripsi="Wajib aktif beserta penyedia resmi agar identifikasi audio diizinkan."
            />

            <div className="flex flex-wrap gap-2 pt-1">
              <Tombol
                ukuran="kecil"
                varian="sekunder"
                onClick={() => perbaruiKonfigPengenal(formKonfig)}
              >
                Simpan Penyedia
              </Tombol>
              <Tombol
                ukuran="kecil"
                varian="kaca"
                ikonKiri={<Mic className="h-3.5 w-3.5" />}
                onClick={() => void ujiIdentifikasiMikrofon()}
              >
                Identifikasi via Mikrofon
              </Tombol>
            </div>

            <div className="space-y-2 pt-2 border-t border-[var(--warna-batas)]">
              <span className="block text-xs font-medium text-[var(--warna-teks-sekunder)]">
                Status Kapabilitas Platform
              </span>
              {kapabilitas.map((kap) => (
                <div
                  key={kap.namaFitur}
                  className="flex items-start justify-between gap-2 rounded-xl border border-[var(--warna-batas)] p-2.5 text-xs"
                >
                  <div>
                    <p className="font-medium">{kap.namaFitur}</p>
                    <p className="text-[11px] text-[var(--warna-teks-sekunder)]">
                      {kap.keterangan}
                    </p>
                  </div>
                  <Lencana varian={varianKapabilitas(kap.status)}>
                    {labelKapabilitas(kap.status)}
                  </Lencana>
                </div>
              ))}
            </div>
          </IsiKartu>
        </Kartu>

        {/* Riwayat Musik */}
        <Kartu className="lg:col-span-6 space-y-4">
          <KepalaKartu>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-[var(--aksen-teal-siber)]" />
              <JudulKartu>Music History</JudulKartu>
            </div>
            <DeskripsiKartu>
              Catat lagu yang diputar atau ditemukan ke database `music_history`.
            </DeskripsiKartu>
          </KepalaKartu>

          <IsiKartu className="space-y-3">
            <div className="grid gap-2 sm:grid-cols-3">
              <KolomMasukan
                aria-label="Judul lagu manual"
                placeholder="Judul lagu..."
                value={judulManual}
                onChange={(e) => aturJudulManual(e.target.value)}
              />
              <KolomMasukan
                aria-label="Artis manual"
                placeholder="Nama artis..."
                value={artisManual}
                onChange={(e) => aturArtisManual(e.target.value)}
              />
              <KolomMasukan
                aria-label="Album manual"
                placeholder="Album (opsional)..."
                value={albumManual}
                onChange={(e) => aturAlbumManual(e.target.value)}
              />
            </div>

            <Tombol
              ukuran="kecil"
              varian="utama"
              onClick={() => void tanganiSimpanRiwayatManual()}
            >
              Catat ke Riwayat Musik
            </Tombol>

            <div className="space-y-2 max-h-64 overflow-y-auto pr-1 pt-2 border-t border-[var(--warna-batas)]">
              {riwayatMusik.length === 0 ? (
                <p className="text-xs text-[var(--warna-teks-redup)]">
                  Belum ada riwayat lagu tercatat.
                </p>
              ) : (
                riwayatMusik.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between gap-2 rounded-xl border border-[var(--warna-batas)] px-3 py-2 text-xs"
                  >
                    <div className="min-w-0">
                      <p className="font-semibold truncate">{item.judulLagu}</p>
                      <p className="text-[11px] text-[var(--warna-teks-sekunder)] truncate">
                        {item.artis}
                        {item.album ? ` • ${item.album}` : ""}
                      </p>
                    </div>
                    <Lencana varian="netral">{item.sumberAudio}</Lencana>
                  </div>
                ))
              )}
            </div>
          </IsiKartu>
        </Kartu>
      </div>

      {/* Matriks 4 Adapter Penyedia Musik (6 Kapabilitas Terpisah) */}
      <Kartu>
        <KepalaKartu>
          <JudulKartu>Matriks Kapabilitas Penyedia Musik (4 Adapter)</JudulKartu>
          <DeskripsiKartu>
            Deteksi sesi, metadata, kontrol playback, tangkapan audio, pengenalan lagu, dan lirik adalah kapabilitas terpisah — tidak ada klaim palsu.
          </DeskripsiKartu>
        </KepalaKartu>
        <IsiKartu className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[var(--warna-batas)] text-[var(--warna-teks-sekunder)]">
                <th className="py-2 pr-3">Penyedia</th>
                <th className="py-2 px-2">Sesi</th>
                <th className="py-2 px-2">Metadata</th>
                <th className="py-2 px-2">Playback</th>
                <th className="py-2 px-2">Audio</th>
                <th className="py-2 px-2">Pengenal</th>
                <th className="py-2 px-2">Lirik</th>
              </tr>
            </thead>
            <tbody>
              {MATRIKS_ADAPTER_MUSIK.map((p) => (
                <tr key={p.id} className="border-b border-[var(--warna-batas)]/60">
                  <td className="py-2 pr-3 font-semibold">{p.nama}</td>
                  <td className="py-2 px-2 font-kode text-[11px]">{p.deteksiSesi}</td>
                  <td className="py-2 px-2 font-kode text-[11px]">{p.metadataTrek}</td>
                  <td className="py-2 px-2 font-kode text-[11px]">{p.kontrolPlayback}</td>
                  <td className="py-2 px-2 font-kode text-[11px]">{p.tangkapanAudio}</td>
                  <td className="py-2 px-2 font-kode text-[11px]">{p.pengenalanLagu}</td>
                  <td className="py-2 px-2 font-kode text-[11px]">{p.pengambilanLirik}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </IsiKartu>
      </Kartu>
    </div>
  );
}
