import { useEffect, useMemo, useRef, useState } from "react";
import {
  Code2,
  Copy,
  Download,
  History,
  Plus,
  RotateCcw,
  Save,
  Search,
  Sparkles,
  Star,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import {
  DeskripsiKartu,
  JudulKartu,
  Kartu,
  KepalaKartu,
  KolomMasukan,
  Lencana,
  PanelKaca,
  Tombol,
} from "@/sistem-desain";
import {
  normalisasiTag,
  unduhBerkasTeks,
} from "@/catatan/utilitas/formatCatatan";
import {
  DAFTAR_14_BAHASA,
  KATEGORI_CUPLIKAN_BAWAAN,
  type BahasaCuplikan,
} from "@/cuplikan/tipe/tipeCuplikan";
import {
  buatEksporJsonCuplikan,
  deteksiBahasaKode,
} from "@/cuplikan/utilitas/deteksiBahasa";
import { gunakanTokoCuplikan } from "@/cuplikan/toko/tokoCuplikan";
import { EditorKodeMonaco } from "./EditorKodeMonaco";

export function PanelCuplikan() {
  const daftarCuplikan = gunakanTokoCuplikan((s) => s.daftarCuplikan);
  const idTerpilih = gunakanTokoCuplikan((s) => s.idTerpilih);
  const kataCari = gunakanTokoCuplikan((s) => s.kataCari);
  const kategoriTerpilih = gunakanTokoCuplikan((s) => s.kategoriTerpilih);
  const hanyaFavorit = gunakanTokoCuplikan((s) => s.hanyaFavorit);
  const pesanStatus = gunakanTokoCuplikan((s) => s.pesanStatus);
  const pesanGalat = gunakanTokoCuplikan((s) => s.pesanGalat);

  const muatCuplikan = gunakanTokoCuplikan((s) => s.muatCuplikan);
  const pilihCuplikan = gunakanTokoCuplikan((s) => s.pilihCuplikan);
  const aturKataCari = gunakanTokoCuplikan((s) => s.aturKataCari);
  const aturKategoriTerpilih = gunakanTokoCuplikan(
    (s) => s.aturKategoriTerpilih
  );
  const aturHanyaFavorit = gunakanTokoCuplikan((s) => s.aturHanyaFavorit);
  const simpanCuplikan = gunakanTokoCuplikan((s) => s.simpanCuplikan);
  const ubahFavoritCuplikan = gunakanTokoCuplikan((s) => s.ubahFavoritCuplikan);
  const hapusCuplikan = gunakanTokoCuplikan((s) => s.hapusCuplikan);
  const imporDariJson = gunakanTokoCuplikan((s) => s.imporDariJson);

  const inputImporRef = useRef<HTMLInputElement | null>(null);
  const [modeBaru, aturModeBaru] = useState(false);
  const [judul, aturJudul] = useState("");
  const [bahasa, aturBahasa] = useState<BahasaCuplikan>("typescript");
  const [kategori, aturKategori] = useState<string>("Umum");
  const [kode, aturKode] = useState("");
  const [deskripsi, aturDeskripsi] = useState("");
  const [catatanVersi, aturCatatanVersi] = useState("");
  const [daftarTag, aturDaftarTag] = useState<string[]>([]);
  const [inputTag, aturInputTag] = useState("");
  const [favorit, aturFavorit] = useState(false);
  const [tampilRiwayat, aturTampilRiwayat] = useState(false);
  const [pesanSalin, aturPesanSalin] = useState<string | null>(null);

  useEffect(() => {
    void muatCuplikan();
  }, [muatCuplikan]);

  const cuplikanAktif = useMemo(
    () =>
      modeBaru
        ? null
        : (daftarCuplikan.find((item) => item.id === idTerpilih) ?? null),
    [daftarCuplikan, idTerpilih, modeBaru]
  );

  useEffect(() => {
    if (cuplikanAktif) {
      aturJudul(cuplikanAktif.judul);
      aturBahasa(cuplikanAktif.bahasa);
      aturKategori(cuplikanAktif.kategori);
      aturKode(cuplikanAktif.kode);
      aturDeskripsi(cuplikanAktif.deskripsi);
      aturDaftarTag(cuplikanAktif.daftarTag);
      aturFavorit(cuplikanAktif.favorit);
      aturCatatanVersi("");
    }
  }, [cuplikanAktif?.id, cuplikanAktif?.diperbaruiPada]);

  const daftarTersaring = useMemo(() => {
    const q = kataCari.trim().toLowerCase();
    return daftarCuplikan.filter((item) => {
      if (hanyaFavorit && !item.favorit) return false;
      if (kategoriTerpilih && item.kategori !== kategoriTerpilih) return false;
      if (!q) return true;
      return (
        item.judul.toLowerCase().includes(q) ||
        item.kode.toLowerCase().includes(q) ||
        item.bahasa.toLowerCase().includes(q) ||
        item.kategori.toLowerCase().includes(q) ||
        item.daftarTag.some((t) => t.toLowerCase().includes(q))
      );
    });
  }, [daftarCuplikan, hanyaFavorit, kategoriTerpilih, kataCari]);

  function mulaiSnippetBaru(): void {
    aturModeBaru(true);
    pilihCuplikan(null);
    aturJudul("");
    aturBahasa("typescript");
    aturKategori("Umum");
    aturKode("");
    aturDeskripsi("");
    aturDaftarTag([]);
    aturFavorit(false);
    aturCatatanVersi("");
    aturTampilRiwayat(false);
  }

  async function tanganiSimpan(): Promise<void> {
    const hasil = await simpanCuplikan({
      id: cuplikanAktif?.id,
      projectId: cuplikanAktif?.projectId ?? null,
      judul,
      bahasa,
      kategori,
      kode,
      deskripsi,
      daftarTag,
      favorit,
      catatanPerubahan: catatanVersi,
    });
    if (hasil) {
      aturModeBaru(false);
      aturCatatanVersi("");
    }
  }

  function tanganiTambahTag(): void {
    const bersih = normalisasiTag(inputTag);
    if (!bersih || daftarTag.includes(bersih)) {
      aturInputTag("");
      return;
    }
    aturDaftarTag([...daftarTag, bersih]);
    aturInputTag("");
  }

  async function tanganiSalinKode(): Promise<void> {
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(kode);
      }
      aturPesanSalin("Kode di-copy!");
      window.setTimeout(() => aturPesanSalin(null), 1600);
    } catch {
      aturPesanSalin("Copy siap.");
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

      {/* Header & Aksi Vault */}
      <Kartu elevasi="angkat" kilau="ungu">
        <KepalaKartu>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Code2 className="h-4 w-4 text-[var(--aksen-ungu-neon)]" />
              <JudulKartu>Code Snippet Vault (Monaco Editor • 14 Bahasa)</JudulKartu>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <input
                ref={inputImporRef}
                type="file"
                accept=".json,application/json"
                aria-label="Impor file JSON snippet"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  void file.text().then((isi) => imporDariJson(isi));
                  e.target.value = "";
                }}
              />
              <Tombol
                varian="utama"
                ukuran="kecil"
                ikonKiri={<Plus className="h-3.5 w-3.5" />}
                onClick={mulaiSnippetBaru}
              >
                Snippet Baru
              </Tombol>
              <Tombol
                varian="kaca"
                ukuran="kecil"
                ikonKiri={<Upload className="h-3.5 w-3.5" />}
                onClick={() => inputImporRef.current?.click()}
              >
                Import JSON
              </Tombol>
              <Tombol
                varian="kaca"
                ukuran="kecil"
                disabled={daftarCuplikan.length === 0}
                ikonKiri={<Download className="h-3.5 w-3.5" />}
                onClick={() =>
                  unduhBerkasTeks(
                    "overthinker-code-snippets.json",
                    buatEksporJsonCuplikan(daftarCuplikan),
                    "application/json"
                  )
                }
              >
                Export JSON
              </Tombol>
            </div>
          </div>
          <DeskripsiKartu>
            Simpan potongan kode pakai Monaco Editor lokal (tanpa CDN), deteksi bahasa otomatis, version history, favorit, dan kategori.
          </DeskripsiKartu>
        </KepalaKartu>
      </Kartu>

      <div className="grid gap-5 lg:grid-cols-12">
        {/* Sidebar Daftar Snippet */}
        <Kartu className="lg:col-span-4 space-y-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-[var(--warna-teks-redup)]" />
            <input
              type="search"
              aria-label="Cari snippet kode"
              placeholder="Cari judul, bahasa, tag, atau kode..."
              value={kataCari}
              onChange={(e) => aturKataCari(e.target.value)}
              className="h-9 w-full rounded-xl border border-[var(--warna-batas-kuat)] bg-white/70 dark:bg-[#101521]/75 pl-9 pr-3 text-xs text-[var(--warna-teks-utama)] focus:outline-none focus:ring-2 focus:ring-[var(--aksen-biru-elektrik)]/60"
            />
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <Tombol
              ukuran="kecil"
              varian={hanyaFavorit ? "utama" : "kaca"}
              ikonKiri={<Star className="h-3.5 w-3.5" />}
              onClick={() => aturHanyaFavorit(!hanyaFavorit)}
            >
              Favorit
            </Tombol>
            <select
              aria-label="Filter kategori snippet"
              value={kategoriTerpilih ?? ""}
              onChange={(e) =>
                aturKategoriTerpilih(e.target.value ? e.target.value : null)
              }
              className="h-8 rounded-lg border border-[var(--warna-batas-kuat)] bg-white/80 dark:bg-[#101521] px-2 text-xs text-[var(--warna-teks-utama)]"
            >
              <option value="">Semua Kategori</option>
              {KATEGORI_CUPLIKAN_BAWAAN.map((kat) => (
                <option key={kat} value={kat}>
                  {kat}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
            {daftarTersaring.length === 0 ? (
              <p className="rounded-xl border border-dashed border-[var(--warna-batas-kuat)] p-4 text-center text-xs text-[var(--warna-teks-redup)]">
                Belum ada snippet. Klik "Snippet Baru" buat mulai nyimpen kode.
              </p>
            ) : (
              daftarTersaring.map((item) => {
                const terpilih = !modeBaru && item.id === idTerpilih;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      aturModeBaru(false);
                      pilihCuplikan(item.id);
                    }}
                    className={`w-full rounded-xl border p-3 text-left transition cursor-pointer space-y-1.5 ${
                      terpilih
                        ? "border-[var(--aksen-biru-elektrik)] bg-[#55A7FF]/10"
                        : "border-[var(--warna-batas)] hover:border-[var(--warna-batas-kuat)]"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate text-xs font-semibold">
                        {item.judul}
                      </span>
                      {item.favorit && (
                        <Star className="h-3.5 w-3.5 shrink-0 fill-amber-400 text-amber-400" />
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1">
                      <Lencana varian="biru">{item.bahasa}</Lencana>
                      <Lencana varian="netral">{item.kategori}</Lencana>
                      <Lencana varian="teal">
                        v{item.riwayatVersi[0]?.nomorVersi ?? 1}
                      </Lencana>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </Kartu>

        {/* Editor Monaco & Detail */}
        <Kartu elevasi="angkat" className="lg:col-span-8 space-y-4">
          <div className="grid gap-3 sm:grid-cols-12">
            <div className="sm:col-span-6">
              <KolomMasukan
                label="Judul Snippet"
                placeholder="Misal: Hook Debounce TypeScript"
                value={judul}
                onChange={(e) => aturJudul(e.target.value)}
              />
            </div>

            <div className="sm:col-span-3 space-y-1.5">
              <label
                htmlFor="pilih-bahasa-snippet"
                className="block text-xs font-medium text-[var(--warna-teks-sekunder)]"
              >
                Bahasa
              </label>
              <select
                id="pilih-bahasa-snippet"
                value={bahasa}
                onChange={(e) => aturBahasa(e.target.value as BahasaCuplikan)}
                className="h-9 w-full rounded-xl border border-[var(--warna-batas-kuat)] bg-white/80 dark:bg-[#101521] px-2.5 text-xs text-[var(--warna-teks-utama)]"
              >
                {DAFTAR_14_BAHASA.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-3 space-y-1.5">
              <label
                htmlFor="pilih-kategori-snippet"
                className="block text-xs font-medium text-[var(--warna-teks-sekunder)]"
              >
                Kategori
              </label>
              <select
                id="pilih-kategori-snippet"
                value={kategori}
                onChange={(e) => aturKategori(e.target.value)}
                className="h-9 w-full rounded-xl border border-[var(--warna-batas-kuat)] bg-white/80 dark:bg-[#101521] px-2.5 text-xs text-[var(--warna-teks-utama)]"
              >
                {KATEGORI_CUPLIKAN_BAWAAN.map((kat) => (
                  <option key={kat} value={kat}>
                    {kat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap gap-1.5">
              <Tombol
                ukuran="kecil"
                varian="kaca"
                ikonKiri={<Sparkles className="h-3.5 w-3.5" />}
                onClick={() => aturBahasa(deteksiBahasaKode(kode))}
              >
                Deteksi Bahasa
              </Tombol>
              <Tombol
                ukuran="kecil"
                varian="kaca"
                ikonKiri={<Copy className="h-3.5 w-3.5" />}
                onClick={() => void tanganiSalinKode()}
              >
                {pesanSalin ?? "Copy Kode"}
              </Tombol>
              {cuplikanAktif && (
                <>
                  <Tombol
                    ukuran="kecil"
                    varian={cuplikanAktif.favorit ? "utama" : "kaca"}
                    ikonKiri={<Star className="h-3.5 w-3.5" />}
                    onClick={() => void ubahFavoritCuplikan(cuplikanAktif.id)}
                  >
                    {cuplikanAktif.favorit ? "Favorit" : "Tandai Favorit"}
                  </Tombol>
                  <Tombol
                    ukuran="kecil"
                    varian={tampilRiwayat ? "sekunder" : "kaca"}
                    ikonKiri={<History className="h-3.5 w-3.5" />}
                    onClick={() => aturTampilRiwayat((v) => !v)}
                  >
                    Riwayat ({cuplikanAktif.riwayatVersi.length})
                  </Tombol>
                  <Tombol
                    ukuran="kecil"
                    varian="bahaya"
                    ikonKiri={<Trash2 className="h-3.5 w-3.5" />}
                    onClick={() => void hapusCuplikan(cuplikanAktif.id)}
                  >
                    Hapus
                  </Tombol>
                </>
              )}
            </div>

            <Tombol
              ukuran="kecil"
              varian="utama"
              ikonKiri={<Save className="h-3.5 w-3.5" />}
              onClick={() => void tanganiSimpan()}
            >
              Simpan Snippet
            </Tombol>
          </div>

          <EditorKodeMonaco
            nilai={kode}
            bahasa={bahasa}
            saatBerubah={aturKode}
            tinggi="280px"
          />

          <div className="grid gap-3 sm:grid-cols-2">
            <KolomMasukan
              label="Deskripsi Singkat"
              placeholder="Kapan snippet ini dipakai..."
              value={deskripsi}
              onChange={(e) => aturDeskripsi(e.target.value)}
            />
            <KolomMasukan
              label="Catatan Versi (Opsional)"
              placeholder="Misal: Tambah penanganan error"
              value={catatanVersi}
              onChange={(e) => aturCatatanVersi(e.target.value)}
            />
          </div>

          {/* Tag */}
          <div className="space-y-2 pt-2 border-t border-[var(--warna-batas)]">
            <div className="flex flex-wrap gap-1.5">
              {daftarTag.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 rounded-full border border-[#A879FF]/35 bg-[#A879FF]/15 px-2.5 py-0.5 text-xs text-[#6D28D9] dark:text-[#C5A3FF]"
                >
                  #{tag}
                  <button
                    type="button"
                    aria-label={`Hapus tag ${tag}`}
                    onClick={() =>
                      aturDaftarTag(daftarTag.filter((t) => t !== tag))
                    }
                    className="cursor-pointer hover:text-red-400"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <div className="flex-1">
                <KolomMasukan
                  aria-label="Tambah tag snippet"
                  placeholder="Tambah tag (misal: react, sql, utils)..."
                  value={inputTag}
                  onChange={(e) => aturInputTag(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      tanganiTambahTag();
                    }
                  }}
                />
              </div>
              <Tombol ukuran="sedang" varian="kaca" onClick={tanganiTambahTag}>
                Tambah Tag
              </Tombol>
            </div>
          </div>

          {/* Panel Version History */}
          {tampilRiwayat && cuplikanAktif && (
            <div className="rounded-xl border border-[var(--warna-batas)] p-3 space-y-2">
              <h4 className="text-xs font-semibold">
                Version History ({cuplikanAktif.riwayatVersi.length} versi)
              </h4>
              <div className="space-y-1.5 max-h-44 overflow-y-auto">
                {cuplikanAktif.riwayatVersi.map((versi) => (
                  <div
                    key={versi.id}
                    className="flex items-center justify-between gap-2 rounded-lg border border-[var(--warna-batas)] px-3 py-2 text-xs"
                  >
                    <div className="min-w-0">
                      <span className="font-kode font-semibold">
                        v{versi.nomorVersi}
                      </span>{" "}
                      <span className="text-[var(--warna-teks-sekunder)]">
                        — {versi.catatanPerubahan}
                      </span>
                    </div>
                    <Tombol
                      ukuran="kecil"
                      varian="kaca"
                      ikonKiri={<RotateCcw className="h-3 w-3" />}
                      onClick={() => aturKode(versi.kode)}
                    >
                      Pulihkan Versi
                    </Tombol>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Kartu>
      </div>
    </div>
  );
}
