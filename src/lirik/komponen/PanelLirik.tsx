import { useEffect, useMemo, useState } from "react";
import {
  AlignLeft,
  Languages,
  Plus,
  Radio,
  Search,
  Sparkles,
  Trash2,
} from "lucide-react";
import {
  AreaTeks,
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
} from "@/sistem-desain";
import { formatDurasiTimer } from "@/fokus/utilitas/waktuFokus";
import { gunakanTokoMusik } from "@/musik";
import { gunakanTokoLirik } from "@/lirik/toko/tokoLirik";
import type {
  JenisPenyediaLirik,
  KonfigurasiPenyediaLirik,
} from "@/lirik/tipe/tipeLirik";
import {
  ambilJendelaLirik,
  uraiLirikLrc,
} from "@/lirik/utilitas/penguraiLrc";
import { buatTautanSumberLirikResmi } from "@/lirik/utilitas/pencocokanLirik";
import { MascotEventBus } from "@/features/mascot";

export function PanelLirik() {
  const riwayatLirik = gunakanTokoLirik((s) => s.riwayatLirik);
  const idTerpilih = gunakanTokoLirik((s) => s.idTerpilih);
  const konfigPenyedia = gunakanTokoLirik((s) => s.konfigPenyedia);
  const posisiDetik = gunakanTokoLirik((s) => s.posisiDetik);
  const tampilkanTerjemahan = gunakanTokoLirik((s) => s.tampilkanTerjemahan);
  const pesanStatus = gunakanTokoLirik((s) => s.pesanStatus);
  const pesanGalat = gunakanTokoLirik((s) => s.pesanGalat);

  const muatLirik = gunakanTokoLirik((s) => s.muatLirik);
  const pilihLirik = gunakanTokoLirik((s) => s.pilihLirik);
  const aturPosisiDetik = gunakanTokoLirik((s) => s.aturPosisiDetik);
  const aturTampilkanTerjemahan = gunakanTokoLirik(
    (s) => s.aturTampilkanTerjemahan
  );
  const cariLirikManual = gunakanTokoLirik((s) => s.cariLirikManual);
  const simpanLirik = gunakanTokoLirik((s) => s.simpanLirik);
  const hapusLirik = gunakanTokoLirik((s) => s.hapusLirik);
  const perbaruiKonfigPenyedia = gunakanTokoLirik(
    (s) => s.perbaruiKonfigPenyedia
  );

  const trekAktifMusik = gunakanTokoMusik((s) => s.trekAktif);

  const [cariJudul, aturCariJudul] = useState("");
  const [cariArtis, aturCariArtis] = useState("");

  const [formJudul, aturFormJudul] = useState("");
  const [formArtis, aturFormArtis] = useState("");
  const [formBahasa, aturFormBahasa] = useState("id");
  const [formTeks, aturFormTeks] = useState("");
  const [formTerjemahan, aturFormTerjemahan] = useState("");

  const [formPenyedia, aturFormPenyedia] =
    useState<KonfigurasiPenyediaLirik>(konfigPenyedia);

  useEffect(() => {
    void muatLirik();
  }, [muatLirik]);

  useEffect(() => {
    aturFormPenyedia(konfigPenyedia);
  }, [konfigPenyedia]);

  const lirikAktif = useMemo(
    () => riwayatLirik.find((item) => item.id === idTerpilih) ?? null,
    [riwayatLirik, idTerpilih]
  );

  const hasilUrai = useMemo(() => {
    if (!lirikAktif) return null;
    return uraiLirikLrc(lirikAktif.teksLirik);
  }, [lirikAktif]);

  const jendelaLirik = useMemo(() => {
    if (!hasilUrai || !hasilUrai.tersinkronisasi) return null;
    return ambilJendelaLirik(hasilUrai.barisTerjadwal, posisiDetik);
  }, [hasilUrai, posisiDetik]);

  const durasiMaksSlider = useMemo(() => {
    if (!hasilUrai || hasilUrai.barisTerjadwal.length === 0) return 240;
    const akhir =
      hasilUrai.barisTerjadwal[hasilUrai.barisTerjadwal.length - 1]
        ?.waktuDetik ?? 240;
    return Math.max(60, Math.ceil(akhir + 10));
  }, [hasilUrai]);

  async function tanganiSimpanLirik(): Promise<void> {
    const tersimpan = await simpanLirik({
      judulLagu: formJudul,
      artis: formArtis,
      penyedia:
        konfigPenyedia.jenisPenyedia === "belum_diatur"
          ? "Manual Lokal"
          : konfigPenyedia.jenisPenyedia,
      bahasa: formBahasa,
      teksLirik: formTeks,
      terjemahan: formTerjemahan.trim() || null,
    });

    if (tersimpan) {
      aturFormJudul("");
      aturFormArtis("");
      aturFormTeks("");
      aturFormTerjemahan("");
    }
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

      {/* Pencarian Lirik Manual */}
      <Kartu elevasi="angkat" kilau="ungu">
        <KepalaKartu>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <AlignLeft className="h-4 w-4 text-[var(--aksen-ungu-neon)]" />
              <JudulKartu>Lyrics Engine</JudulKartu>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {trekAktifMusik.judulLagu && (
                <Tombol
                  ukuran="kecil"
                  varian="kaca"
                  ikonKiri={<Sparkles className="h-3.5 w-3.5" />}
                  onClick={() => {
                    aturCariJudul(trekAktifMusik.judulLagu ?? "");
                    aturCariArtis(trekAktifMusik.artis ?? "");
                    if (trekAktifMusik.posisiDetik > 0) {
                      aturPosisiDetik(trekAktifMusik.posisiDetik);
                    }
                    void cariLirikManual(
                      trekAktifMusik.judulLagu ?? "",
                      trekAktifMusik.artis ?? ""
                    );
                  }}
                >
                  Cari dari Lagu Aktif
                </Tombol>
              )}
            </div>
          </div>
          <DeskripsiKartu>
            Cari lirik dari cache lokal atau penyedia resmi. Lirik polos nggak akan pernah diklaim sebagai lirik tersinkronisasi.
          </DeskripsiKartu>
        </KepalaKartu>

        <IsiKartu>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
            <div className="flex-1">
              <KolomMasukan
                aria-label="Cari judul lagu lirik"
                label="Judul Lagu"
                placeholder="Ketik judul lagu..."
                value={cariJudul}
                onChange={(e) => aturCariJudul(e.target.value)}
              />
            </div>
            <div className="flex-1">
              <KolomMasukan
                aria-label="Cari artis lirik"
                label="Artis (Opsional)"
                placeholder="Nama artis..."
                value={cariArtis}
                onChange={(e) => aturCariArtis(e.target.value)}
              />
            </div>
            <Tombol
              varian="utama"
              ikonKiri={<Search className="h-4 w-4" />}
              onClick={() => {
                MascotEventBus.pancarkan("lyrics:searching", {
                  kueri: `${cariJudul} ${cariArtis}`.trim(),
                });
                void cariLirikManual(cariJudul, cariArtis);
              }}
            >
              Cari Lirik
            </Tombol>
          </div>
        </IsiKartu>
      </Kartu>

      <div className="grid gap-5 lg:grid-cols-12">
        {/* Penampil Lirik Aktif */}
        <Kartu elevasi="angkat" className="lg:col-span-7 space-y-4">
          {!lirikAktif || !hasilUrai ? (
            <div className="flex min-h-[280px] flex-col items-center justify-center text-center space-y-3">
              <AlignLeft className="h-8 w-8 text-[var(--warna-teks-redup)]" />
              <p className="text-sm font-medium">Belum ada lirik dipilih</p>
              <p className="text-xs text-[var(--warna-teks-sekunder)] max-w-sm">
                Cari dari riwayat cache, buka sumber resmi eksternal, atau tempel lirik secara manual di sebelah kanan.
              </p>
              {(cariJudul.trim() || trekAktifMusik.judulLagu) && (
                <div className="flex flex-wrap justify-center gap-2 pt-1">
                  {buatTautanSumberLirikResmi(
                    cariJudul.trim() || trekAktifMusik.judulLagu || "",
                    cariArtis.trim() || trekAktifMusik.artis || ""
                  ).map((tautan) => (
                    <a
                      key={tautan.nama}
                      href={tautan.url}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-lg border border-[var(--warna-batas-kuat)] px-2.5 py-1 text-xs text-[var(--aksen-biru-elektrik)] hover:underline"
                    >
                      {tautan.nama}
                    </a>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--warna-batas)] pb-3">
                <div>
                  <h3 className="text-sm font-semibold">
                    {lirikAktif.judulLagu} — {lirikAktif.artis}
                  </h3>
                  <p className="text-[11px] text-[var(--warna-teks-sekunder)]">
                    Sumber: {lirikAktif.penyedia} • Bahasa: {lirikAktif.bahasa}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Lencana
                    varian={
                      lirikAktif.tersinkronisasi && hasilUrai.tersinkronisasi
                        ? "teal"
                        : "peringatan"
                    }
                  >
                    {lirikAktif.tersinkronisasi && hasilUrai.tersinkronisasi
                      ? "Tersinkronisasi (Timed LRC)"
                      : "Lirik Polos (Tidak Tersinkronisasi)"}
                  </Lencana>
                  {lirikAktif.terjemahan && (
                    <Tombol
                      ukuran="kecil"
                      varian={tampilkanTerjemahan ? "sekunder" : "kaca"}
                      ikonKiri={<Languages className="h-3.5 w-3.5" />}
                      onClick={() =>
                        aturTampilkanTerjemahan(!tampilkanTerjemahan)
                      }
                    >
                      Terjemahan
                    </Tombol>
                  )}
                </div>
              </div>

              {lirikAktif.tersinkronisasi &&
              hasilUrai.tersinkronisasi &&
              jendelaLirik ? (
                <div className="space-y-4">
                  {/* Sorotan Baris Sebelumnya, Aktif, Berikutnya */}
                  <div className="rounded-2xl border border-[var(--warna-batas)] bg-black/[0.03] dark:bg-white/[0.03] p-5 text-center space-y-3">
                    <p
                      data-testid="lirik-baris-sebelumnya"
                      className="text-xs text-[var(--warna-teks-redup)] min-h-[18px]"
                    >
                      {jendelaLirik.barisSebelumnya?.teks ?? "—"}
                    </p>
                    <p
                      data-testid="lirik-baris-aktif"
                      className="text-base font-semibold text-[#55A7FF] min-h-[24px]"
                    >
                      {jendelaLirik.barisAktif?.teks ??
                        "Menunggu baris pertama..."}
                    </p>
                    <p
                      data-testid="lirik-baris-berikutnya"
                      className="text-xs text-[var(--warna-teks-sekunder)] min-h-[18px]"
                    >
                      {jendelaLirik.barisBerikutnya?.teks ?? "—"}
                    </p>
                  </div>

                  {/* Penggeser Posisi Waktu */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs text-[var(--warna-teks-sekunder)]">
                      <span>Posisi Waktu LRC</span>
                      <span className="font-kode">
                        {formatDurasiTimer(posisiDetik)}
                      </span>
                    </div>
                    <input
                      aria-label="Posisi waktu lirik"
                      type="range"
                      min={0}
                      max={durasiMaksSlider}
                      step={1}
                      value={posisiDetik}
                      onChange={(e) => aturPosisiDetik(Number(e.target.value))}
                      className="w-full accent-[#55A7FF]"
                    />
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl border border-[var(--warna-batas)] bg-black/[0.02] dark:bg-white/[0.02] p-4 space-y-2 max-h-64 overflow-y-auto">
                  {hasilUrai.barisPolos.map((baris, idx) => (
                    <p
                      key={idx}
                      className="text-xs leading-relaxed text-[var(--warna-teks-utama)]"
                    >
                      {baris}
                    </p>
                  ))}
                </div>
              )}

              {tampilkanTerjemahan && lirikAktif.terjemahan && (
                <div className="rounded-xl border border-[#A879FF]/30 bg-[#A879FF]/10 p-3 space-y-1">
                  <span className="block text-[11px] font-semibold text-[#6D28D9] dark:text-[#C5A3FF]">
                    Terjemahan
                  </span>
                  <p className="text-xs whitespace-pre-wrap text-[var(--warna-teks-utama)]">
                    {lirikAktif.terjemahan}
                  </p>
                </div>
              )}
            </div>
          )}
        </Kartu>

        {/* Form Tambah Cache Lirik, Penyedia Resmi & Riwayat */}
        <div className="lg:col-span-5 space-y-5">
          <Kartu className="space-y-3">
            <KepalaKartu>
              <JudulKartu>Simpan Lirik ke Cache Lokal</JudulKartu>
              <DeskripsiKartu>
                Tempel format LRC `[00:12.50]` untuk mode tersinkronisasi, atau lirik biasa.
              </DeskripsiKartu>
            </KepalaKartu>

            <IsiKartu className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <KolomMasukan
                  label="Judul Lagu"
                  value={formJudul}
                  onChange={(e) => aturFormJudul(e.target.value)}
                />
                <KolomMasukan
                  label="Artis"
                  value={formArtis}
                  onChange={(e) => aturFormArtis(e.target.value)}
                />
              </div>
              <KolomMasukan
                label="Bahasa (Misal: id, en, jp)"
                value={formBahasa}
                onChange={(e) => aturFormBahasa(e.target.value)}
              />
              <AreaTeks
                label="Teks Lirik (LRC atau Polos)"
                rows={4}
                placeholder="[00:12.00] Baris pertama&#10;[00:18.50] Baris kedua"
                value={formTeks}
                onChange={(e) => aturFormTeks(e.target.value)}
              />
              <AreaTeks
                label="Terjemahan (Opsional)"
                rows={2}
                placeholder="Terjemahan lirik jika tersedia..."
                value={formTerjemahan}
                onChange={(e) => aturFormTerjemahan(e.target.value)}
              />
              <Tombol
                varian="utama"
                ukuran="kecil"
                ikonKiri={<Plus className="h-3.5 w-3.5" />}
                onClick={() => void tanganiSimpanLirik()}
              >
                Simpan Lirik
              </Tombol>
            </IsiKartu>
          </Kartu>

          <Kartu className="space-y-3">
            <KepalaKartu>
              <div className="flex items-center gap-2">
                <Radio className="h-4 w-4 text-[var(--aksen-teal-siber)]" />
                <JudulKartu>Penyedia Lirik Resmi & Riwayat</JudulKartu>
              </div>
            </KepalaKartu>

            <IsiKartu className="space-y-3">
              <select
                aria-label="Penyedia lirik resmi"
                value={formPenyedia.jenisPenyedia}
                onChange={(e) =>
                  aturFormPenyedia((p) => ({
                    ...p,
                    jenisPenyedia: e.target.value as JenisPenyediaLirik,
                  }))
                }
                className="h-9 w-full rounded-xl border border-[var(--warna-batas-kuat)] bg-white/80 dark:bg-[#101521] px-2.5 text-xs text-[var(--warna-teks-utama)]"
              >
                <option value="belum_diatur">Belum Dikonfigurasi</option>
                <option value="musixmatch_authorized">
                  Musixmatch (Authorized API)
                </option>
                <option value="lrclib_authorized">LRCLIB (Legal Source)</option>
                <option value="kustom">Endpoint Penyedia Resmi Kustom</option>
              </select>

              <Sakelar
                aktif={formPenyedia.kredensialTersimpan}
                saatBerubah={(v) =>
                  aturFormPenyedia((p) => ({ ...p, kredensialTersimpan: v }))
                }
                label="Kredensial Terotorisasi Aktif"
              />

              <Tombol
                ukuran="kecil"
                varian="kaca"
                onClick={() => perbaruiKonfigPenyedia(formPenyedia)}
              >
                Simpan Penyedia Lirik
              </Tombol>

              <div className="space-y-1.5 pt-2 border-t border-[var(--warna-batas)] max-h-40 overflow-y-auto">
                {riwayatLirik.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between gap-2 rounded-xl border border-[var(--warna-batas)] px-2.5 py-1.5 text-xs"
                  >
                    <button
                      type="button"
                      onClick={() => pilihLirik(item.id)}
                      className="min-w-0 flex-1 text-left cursor-pointer"
                    >
                      <p className="truncate font-medium">{item.judulLagu}</p>
                      <p className="truncate text-[11px] text-[var(--warna-teks-redup)]">
                        {item.artis} •{" "}
                        {item.tersinkronisasi ? "Timed LRC" : "Polos"}
                      </p>
                    </button>
                    <Tombol
                      ukuran="kecil"
                      varian="hantu"
                      aria-label={`Hapus lirik ${item.judulLagu}`}
                      onClick={() => void hapusLirik(item.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5 text-[var(--aksen-bahaya)]" />
                    </Tombol>
                  </div>
                ))}
              </div>
            </IsiKartu>
          </Kartu>
        </div>
      </div>
    </div>
  );
}
