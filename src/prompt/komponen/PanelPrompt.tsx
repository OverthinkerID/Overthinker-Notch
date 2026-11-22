import { useEffect, useMemo, useRef, useState } from "react";
import {
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
import { KATEGORI_PROMPT_BAWAAN } from "@/prompt/tipe/tipePrompt";
import {
  buatEksporJsonPrompt,
  ekstrakVariabelPrompt,
  terapkanVariabelPrompt,
} from "@/prompt/utilitas/variabelPrompt";
import { gunakanTokoPrompt } from "@/prompt/toko/tokoPrompt";

export function PanelPrompt() {
  const daftarPrompt = gunakanTokoPrompt((s) => s.daftarPrompt);
  const idTerpilih = gunakanTokoPrompt((s) => s.idTerpilih);
  const kataCari = gunakanTokoPrompt((s) => s.kataCari);
  const kategoriTerpilih = gunakanTokoPrompt((s) => s.kategoriTerpilih);
  const hanyaFavorit = gunakanTokoPrompt((s) => s.hanyaFavorit);
  const pesanStatus = gunakanTokoPrompt((s) => s.pesanStatus);
  const pesanGalat = gunakanTokoPrompt((s) => s.pesanGalat);

  const muatPrompt = gunakanTokoPrompt((s) => s.muatPrompt);
  const pilihPrompt = gunakanTokoPrompt((s) => s.pilihPrompt);
  const aturKataCari = gunakanTokoPrompt((s) => s.aturKataCari);
  const aturKategoriTerpilih = gunakanTokoPrompt((s) => s.aturKategoriTerpilih);
  const aturHanyaFavorit = gunakanTokoPrompt((s) => s.aturHanyaFavorit);
  const simpanPrompt = gunakanTokoPrompt((s) => s.simpanPrompt);
  const ubahFavoritPrompt = gunakanTokoPrompt((s) => s.ubahFavoritPrompt);
  const hapusPrompt = gunakanTokoPrompt((s) => s.hapusPrompt);
  const imporDariJson = gunakanTokoPrompt((s) => s.imporDariJson);

  const inputImporRef = useRef<HTMLInputElement | null>(null);
  const [modeBaru, aturModeBaru] = useState(false);
  const [judul, aturJudul] = useState("");
  const [kategori, aturKategori] = useState<string>("Umum");
  const [templatePrompt, aturTemplatePrompt] = useState("");
  const [nilaiVariabel, aturNilaiVariabel] = useState<Record<string, string>>(
    {}
  );
  const [catatanVersi, aturCatatanVersi] = useState("");
  const [daftarTag, aturDaftarTag] = useState<string[]>([]);
  const [inputTag, aturInputTag] = useState("");
  const [favorit, aturFavorit] = useState(false);
  const [tampilRiwayat, aturTampilRiwayat] = useState(false);
  const [pesanSalin, aturPesanSalin] = useState<string | null>(null);

  useEffect(() => {
    void muatPrompt();
  }, [muatPrompt]);

  const promptAktif = useMemo(
    () =>
      modeBaru
        ? null
        : (daftarPrompt.find((item) => item.id === idTerpilih) ?? null),
    [daftarPrompt, idTerpilih, modeBaru]
  );

  useEffect(() => {
    if (promptAktif) {
      aturJudul(promptAktif.judul);
      aturKategori(promptAktif.kategori);
      aturTemplatePrompt(promptAktif.templatePrompt);
      aturDaftarTag(promptAktif.daftarTag);
      aturFavorit(promptAktif.favorit);
      aturCatatanVersi("");
    }
  }, [promptAktif?.id, promptAktif?.diperbaruiPada]);

  const variabelTerdeteksi = useMemo(
    () => ekstrakVariabelPrompt(templatePrompt),
    [templatePrompt]
  );

  const hasilPrompt = useMemo(
    () => terapkanVariabelPrompt(templatePrompt, nilaiVariabel),
    [templatePrompt, nilaiVariabel]
  );

  const daftarTersaring = useMemo(() => {
    const q = kataCari.trim().toLowerCase();
    return daftarPrompt.filter((item) => {
      if (hanyaFavorit && !item.favorit) return false;
      if (kategoriTerpilih && item.kategori !== kategoriTerpilih) return false;
      if (!q) return true;
      return (
        item.judul.toLowerCase().includes(q) ||
        item.templatePrompt.toLowerCase().includes(q) ||
        item.kategori.toLowerCase().includes(q) ||
        item.daftarVariabel.some((v) => v.toLowerCase().includes(q)) ||
        item.daftarTag.some((t) => t.toLowerCase().includes(q))
      );
    });
  }, [daftarPrompt, hanyaFavorit, kategoriTerpilih, kataCari]);

  function mulaiPromptBaru(): void {
    aturModeBaru(true);
    pilihPrompt(null);
    aturJudul("");
    aturKategori("Umum");
    aturTemplatePrompt("");
    aturNilaiVariabel({});
    aturDaftarTag([]);
    aturFavorit(false);
    aturCatatanVersi("");
    aturTampilRiwayat(false);
  }

  async function tanganiSimpan(): Promise<void> {
    const hasil = await simpanPrompt({
      id: promptAktif?.id,
      projectId: promptAktif?.projectId ?? null,
      judul,
      kategori,
      templatePrompt,
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

  async function tanganiSalinHasil(): Promise<void> {
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(hasilPrompt);
      }
      aturPesanSalin("Hasil Prompt Di-copy!");
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

      {/* Header & Aksi Library */}
      <Kartu elevasi="angkat" kilau="biru">
        <KepalaKartu>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-[var(--aksen-biru-elektrik)]" />
              <JudulKartu>AI Prompt Library (Dynamic Variable Runner)</JudulKartu>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <input
                ref={inputImporRef}
                type="file"
                accept=".json,application/json"
                aria-label="Impor file JSON prompt"
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
                onClick={mulaiPromptBaru}
              >
                Prompt Baru
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
                disabled={daftarPrompt.length === 0}
                ikonKiri={<Download className="h-3.5 w-3.5" />}
                onClick={() =>
                  unduhBerkasTeks(
                    "overthinker-ai-prompts.json",
                    buatEksporJsonPrompt(daftarPrompt),
                    "application/json"
                  )
                }
              >
                Export JSON
              </Tombol>
            </div>
          </div>
          <DeskripsiKartu>
            Kelola template prompt AI dengan placeholder {"{{variabel}}"} dinamis, substitusi live, Version History, tags, favorit, dan Import/Export JSON.
          </DeskripsiKartu>
        </KepalaKartu>
      </Kartu>

      <div className="grid gap-5 lg:grid-cols-12">
        {/* Sidebar Daftar Prompt */}
        <Kartu className="lg:col-span-4 space-y-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-[var(--warna-teks-redup)]" />
            <input
              type="search"
              aria-label="Cari prompt AI"
              placeholder="Cari judul, isi, variabel, atau tag..."
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
              aria-label="Filter kategori prompt"
              value={kategoriTerpilih ?? ""}
              onChange={(e) =>
                aturKategoriTerpilih(e.target.value ? e.target.value : null)
              }
              className="h-8 rounded-lg border border-[var(--warna-batas-kuat)] bg-white/80 dark:bg-[#101521] px-2 text-xs text-[var(--warna-teks-utama)]"
            >
              <option value="">Semua Kategori</option>
              {KATEGORI_PROMPT_BAWAAN.map((kat) => (
                <option key={kat} value={kat}>
                  {kat}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
            {daftarTersaring.length === 0 ? (
              <p className="rounded-xl border border-dashed border-[var(--warna-batas-kuat)] p-4 text-center text-xs text-[var(--warna-teks-redup)]">
                Belum ada prompt. Klik &ldquo;Prompt Baru&rdquo; buat mulai nyimpen template AI.
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
                      pilihPrompt(item.id);
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
                      <Lencana varian="biru">{item.kategori}</Lencana>
                      <Lencana varian="ungu">
                        {item.daftarVariabel.length} variabel
                      </Lencana>
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

        {/* Editor Template & Dynamic Variable Runner */}
        <Kartu elevasi="angkat" className="lg:col-span-8 space-y-4">
          <div className="grid gap-3 sm:grid-cols-12">
            <div className="sm:col-span-8">
              <KolomMasukan
                label="Judul Prompt"
                placeholder="Misal: Code Reviewer Senior TypeScript"
                value={judul}
                onChange={(e) => aturJudul(e.target.value)}
              />
            </div>

            <div className="sm:col-span-4 space-y-1.5">
              <label
                htmlFor="pilih-kategori-prompt"
                className="block text-xs font-medium text-[var(--warna-teks-sekunder)]"
              >
                Kategori
              </label>
              <select
                id="pilih-kategori-prompt"
                value={kategori}
                onChange={(e) => aturKategori(e.target.value)}
                className="h-9 w-full rounded-xl border border-[var(--warna-batas-kuat)] bg-white/80 dark:bg-[#101521] px-2.5 text-xs text-[var(--warna-teks-utama)]"
              >
                {KATEGORI_PROMPT_BAWAAN.map((kat) => (
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
                ikonKiri={<Copy className="h-3.5 w-3.5" />}
                onClick={() => void tanganiSalinHasil()}
              >
                {pesanSalin ?? "Copy Hasil Prompt"}
              </Tombol>
              {promptAktif && (
                <>
                  <Tombol
                    ukuran="kecil"
                    varian={promptAktif.favorit ? "utama" : "kaca"}
                    ikonKiri={<Star className="h-3.5 w-3.5" />}
                    onClick={() => void ubahFavoritPrompt(promptAktif.id)}
                  >
                    {promptAktif.favorit ? "Batal Favorit" : "Tandai Favorit"}
                  </Tombol>
                  <Tombol
                    ukuran="kecil"
                    varian={tampilRiwayat ? "sekunder" : "kaca"}
                    ikonKiri={<History className="h-3.5 w-3.5" />}
                    onClick={() => aturTampilRiwayat((v) => !v)}
                  >
                    Riwayat ({promptAktif.riwayatVersi.length})
                  </Tombol>
                  <Tombol
                    ukuran="kecil"
                    varian="bahaya"
                    ikonKiri={<Trash2 className="h-3.5 w-3.5" />}
                    onClick={() => void hapusPrompt(promptAktif.id)}
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
              Simpan Prompt
            </Tombol>
          </div>

          {/* Template Prompt */}
          <div className="space-y-1.5">
            <label
              htmlFor="textarea-template-prompt"
              className="block text-xs font-medium text-[var(--warna-teks-sekunder)]"
            >
              Template Prompt (pakai {"{{nama_variabel}}"} untuk input dinamis)
            </label>
            <textarea
              id="textarea-template-prompt"
              aria-label="Template Prompt"
              rows={6}
              placeholder="Contoh: Tolong review kode {{bahasa}} berikut dengan fokus pada {{fokus_review}}:\n\n{{kode}}"
              value={templatePrompt}
              onChange={(e) => aturTemplatePrompt(e.target.value)}
              className="w-full rounded-xl border border-[var(--warna-batas-kuat)] bg-white/75 dark:bg-[#101521]/80 p-3 font-kode text-xs text-[var(--warna-teks-utama)] focus:outline-none focus:ring-2 focus:ring-[var(--aksen-biru-elektrik)]/60"
            />
          </div>

          {/* Dynamic Variable Substitution */}
          <div className="rounded-xl border border-[var(--warna-batas)] p-3.5 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-semibold">
                Substitusi Variabel Dinamis ({variabelTerdeteksi.length})
              </span>
              {variabelTerdeteksi.length > 0 && (
                <Tombol
                  ukuran="kecil"
                  varian="kaca"
                  onClick={() => aturNilaiVariabel({})}
                >
                  Reset Variabel
                </Tombol>
              )}
            </div>

            {variabelTerdeteksi.length === 0 ? (
              <p className="text-xs text-[var(--warna-teks-redup)]">
                Belum ada variabel terdeteksi. Tambahkan placeholder seperti{" "}
                <code className="font-kode text-[var(--aksen-biru-elektrik)]">
                  {"{{topik}}"}
                </code>{" "}
                di template buat ngisi nilai dinamis.
              </p>
            ) : (
              <div className="grid gap-2.5 sm:grid-cols-2">
                {variabelTerdeteksi.map((namaVar) => (
                  <KolomMasukan
                    key={namaVar}
                    label={`{{${namaVar}}}`}
                    aria-label={`Nilai variabel ${namaVar}`}
                    placeholder={`Isi ${namaVar}...`}
                    value={nilaiVariabel[namaVar] ?? ""}
                    onChange={(e) =>
                      aturNilaiVariabel((prev) => ({
                        ...prev,
                        [namaVar]: e.target.value,
                      }))
                    }
                  />
                ))}
              </div>
            )}

            <div className="space-y-1.5 pt-2 border-t border-[var(--warna-batas)]">
              <span className="block text-[11px] font-medium text-[var(--warna-teks-sekunder)]">
                Hasil Prompt Siap Pakai
              </span>
              <pre
                data-testid="pratinjau-hasil-prompt"
                className="whitespace-pre-wrap break-words rounded-xl border border-[var(--warna-batas)] bg-black/5 dark:bg-white/5 p-3 font-kode text-xs text-[var(--warna-teks-utama)] min-h-[72px]"
              >
                {hasilPrompt || "Belum ada isi prompt."}
              </pre>
            </div>
          </div>

          <KolomMasukan
            label="Catatan Versi (Opsional)"
            placeholder="Misal: Tambah instruksi format output JSON"
            value={catatanVersi}
            onChange={(e) => aturCatatanVersi(e.target.value)}
          />

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
                  aria-label="Tambah tag prompt"
                  placeholder="Tambah tag (misal: review, tauri, refactor)..."
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
          {tampilRiwayat && promptAktif && (
            <div className="rounded-xl border border-[var(--warna-batas)] p-3 space-y-2">
              <h4 className="text-xs font-semibold">
                Version History ({promptAktif.riwayatVersi.length} versi)
              </h4>
              <div className="space-y-1.5 max-h-44 overflow-y-auto">
                {promptAktif.riwayatVersi.map((versi) => (
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
                      onClick={() => aturTemplatePrompt(versi.templatePrompt)}
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
