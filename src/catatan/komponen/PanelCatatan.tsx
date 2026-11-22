import { useEffect, useMemo, useRef, useState } from "react";
import {
  Archive,
  ArchiveRestore,
  Bold,
  CheckSquare,
  Code,
  Download,
  Eye,
  FileText,
  Heading2,
  Italic,
  List,
  Pin,
  Plus,
  Search,
  Tag,
  Trash2,
  X,
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
  Tombol,
} from "@/sistem-desain";
import { gunakanTokoCatatan } from "@/catatan/toko/tokoCatatan";
import type {
  FilterArsipCatatan,
  FormatCatatan,
} from "@/catatan/tipe/tipeCatatan";
import {
  buatKontenEksporJson,
  buatKontenEksporMarkdown,
  normalisasiTag,
  tambahItemChecklist,
  ubahStatusBarisChecklist,
  unduhBerkasTeks,
  uraiChecklist,
} from "@/catatan/utilitas/formatCatatan";

const LABEL_FORMAT: Record<FormatCatatan, string> = {
  markdown: "Markdown",
  rich_text: "Rich Text",
  checklist: "Checklist",
};

export function PanelCatatan() {
  const daftarCatatan = gunakanTokoCatatan((s) => s.daftarCatatan);
  const idTerpilih = gunakanTokoCatatan((s) => s.idTerpilih);
  const kataCari = gunakanTokoCatatan((s) => s.kataCari);
  const tagTerpilih = gunakanTokoCatatan((s) => s.tagTerpilih);
  const filterArsip = gunakanTokoCatatan((s) => s.filterArsip);
  const statusSimpan = gunakanTokoCatatan((s) => s.statusSimpan);
  const pesanGalat = gunakanTokoCatatan((s) => s.pesanGalat);

  const muatCatatan = gunakanTokoCatatan((s) => s.muatCatatan);
  const pilihCatatan = gunakanTokoCatatan((s) => s.pilihCatatan);
  const aturKataCari = gunakanTokoCatatan((s) => s.aturKataCari);
  const aturTagTerpilih = gunakanTokoCatatan((s) => s.aturTagTerpilih);
  const aturFilterArsip = gunakanTokoCatatan((s) => s.aturFilterArsip);
  const tangkapCepat = gunakanTokoCatatan((s) => s.tangkapCepat);
  const simpanPerubahanCatatan = gunakanTokoCatatan(
    (s) => s.simpanPerubahanCatatan
  );
  const ubahPinCatatan = gunakanTokoCatatan((s) => s.ubahPinCatatan);
  const ubahArsipCatatan = gunakanTokoCatatan((s) => s.ubahArsipCatatan);
  const hapusCatatan = gunakanTokoCatatan((s) => s.hapusCatatan);

  const [teksQuickCapture, aturTeksQuickCapture] = useState("");
  const [judulDraft, aturJudulDraft] = useState("");
  const [kontenDraft, aturKontenDraft] = useState("");
  const [formatDraft, aturFormatDraft] = useState<FormatCatatan>("markdown");
  const [tagDraft, aturTagDraft] = useState<string[]>([]);
  const [inputTagBaru, aturInputTagBaru] = useState("");
  const [itemChecklistBaru, aturItemChecklistBaru] = useState("");
  const [modePreview, aturModePreview] = useState(false);

  const timerAutoSave = useRef<number | null>(null);

  useEffect(() => {
    void muatCatatan();
  }, [muatCatatan]);

  const catatanAktif = useMemo(
    () => daftarCatatan.find((item) => item.id === idTerpilih) ?? null,
    [daftarCatatan, idTerpilih]
  );

  useEffect(() => {
    if (catatanAktif) {
      aturJudulDraft(catatanAktif.judul);
      aturKontenDraft(catatanAktif.kontenMarkdown);
      aturFormatDraft(catatanAktif.formatKonten);
      aturTagDraft(catatanAktif.daftarTag);
    } else {
      aturJudulDraft("");
      aturKontenDraft("");
      aturFormatDraft("markdown");
      aturTagDraft([]);
    }
  }, [catatanAktif?.id]);

  const semuaTagUnik = useMemo(() => {
    const setTag = new Set<string>();
    daftarCatatan.forEach((c) => c.daftarTag.forEach((t) => setTag.add(t)));
    return Array.from(setTag).sort();
  }, [daftarCatatan]);

  const catatanTersaring = useMemo(() => {
    const q = kataCari.trim().toLowerCase();
    return daftarCatatan.filter((item) => {
      if (filterArsip === "aktif" && item.diarsipkan) return false;
      if (filterArsip === "arsip" && !item.diarsipkan) return false;
      if (tagTerpilih && !item.daftarTag.includes(tagTerpilih)) return false;
      if (!q) return true;
      return (
        item.judul.toLowerCase().includes(q) ||
        item.kontenMarkdown.toLowerCase().includes(q) ||
        item.daftarTag.some((t) => t.toLowerCase().includes(q))
      );
    });
  }, [daftarCatatan, filterArsip, tagTerpilih, kataCari]);

  function jadwalkanAutoSave(
    judulBaru: string,
    kontenBaru: string,
    formatBaru: FormatCatatan,
    daftarTagBaru: string[]
  ): void {
    if (!catatanAktif) return;
    if (timerAutoSave.current !== null) {
      window.clearTimeout(timerAutoSave.current);
    }
    const idTarget = catatanAktif.id;
    const projectId = catatanAktif.projectId;
    const disematkan = catatanAktif.disematkan;
    const diarsipkan = catatanAktif.diarsipkan;

    timerAutoSave.current = window.setTimeout(() => {
      if (!judulBaru.trim() && !kontenBaru.trim()) return;
      void simpanPerubahanCatatan({
        id: idTarget,
        projectId,
        judul: judulBaru,
        kontenMarkdown: kontenBaru,
        formatKonten: formatBaru,
        disematkan,
        diarsipkan,
        daftarTag: daftarTagBaru,
      });
    }, 300);
  }

  useEffect(() => {
    return () => {
      if (timerAutoSave.current !== null) {
        window.clearTimeout(timerAutoSave.current);
      }
    };
  }, []);

  async function tanganiQuickCapture(): Promise<void> {
    const teks = teksQuickCapture.trim();
    if (!teks) return;
    const barisPertama = teks.split("\n")[0] ?? "Catatan Cepat";
    const baru = await tangkapCepat(barisPertama.slice(0, 60), teks, "markdown");
    if (baru) {
      aturTeksQuickCapture("");
    }
  }

  function sisipkanFormat(potongan: string): void {
    const kontenBaru = kontenDraft
      ? `${kontenDraft}\n${potongan}`
      : potongan;
    aturKontenDraft(kontenBaru);
    jadwalkanAutoSave(judulDraft, kontenBaru, formatDraft, tagDraft);
  }

  function tanganiTambahTag(): void {
    const bersih = normalisasiTag(inputTagBaru);
    if (!bersih || tagDraft.includes(bersih) || !catatanAktif) {
      aturInputTagBaru("");
      return;
    }
    const tagBaru = [...tagDraft, bersih];
    aturTagDraft(tagBaru);
    aturInputTagBaru("");
    void simpanPerubahanCatatan({
      id: catatanAktif.id,
      projectId: catatanAktif.projectId,
      judul: judulDraft,
      kontenMarkdown: kontenDraft,
      formatKonten: formatDraft,
      disematkan: catatanAktif.disematkan,
      diarsipkan: catatanAktif.diarsipkan,
      daftarTag: tagBaru,
    });
  }

  function tanganiHapusTag(tagHapus: string): void {
    if (!catatanAktif) return;
    const tagBaru = tagDraft.filter((t) => t !== tagHapus);
    aturTagDraft(tagBaru);
    void simpanPerubahanCatatan({
      id: catatanAktif.id,
      projectId: catatanAktif.projectId,
      judul: judulDraft,
      kontenMarkdown: kontenDraft,
      formatKonten: formatDraft,
      disematkan: catatanAktif.disematkan,
      diarsipkan: catatanAktif.diarsipkan,
      daftarTag: tagBaru,
    });
  }

  function tanganiToggleChecklist(indeksBaris: number): void {
    if (!catatanAktif) return;
    const kontenBaru = ubahStatusBarisChecklist(kontenDraft, indeksBaris);
    aturKontenDraft(kontenBaru);
    void simpanPerubahanCatatan({
      id: catatanAktif.id,
      projectId: catatanAktif.projectId,
      judul: judulDraft,
      kontenMarkdown: kontenBaru,
      formatKonten: formatDraft,
      disematkan: catatanAktif.disematkan,
      diarsipkan: catatanAktif.diarsipkan,
      daftarTag: tagDraft,
    });
  }

  function tanganiTambahChecklist(): void {
    if (!catatanAktif || !itemChecklistBaru.trim()) return;
    const kontenBaru = tambahItemChecklist(kontenDraft, itemChecklistBaru);
    aturKontenDraft(kontenBaru);
    aturItemChecklistBaru("");
    void simpanPerubahanCatatan({
      id: catatanAktif.id,
      projectId: catatanAktif.projectId,
      judul: judulDraft,
      kontenMarkdown: kontenBaru,
      formatKonten: "checklist",
      disematkan: catatanAktif.disematkan,
      diarsipkan: catatanAktif.diarsipkan,
      daftarTag: tagDraft,
    });
  }

  const daftarChecklist = useMemo(
    () => uraiChecklist(kontenDraft),
    [kontenDraft]
  );

  return (
    <div className="space-y-5">
      {pesanGalat && (
        <PanelKaca className="p-3 border-[var(--aksen-bahaya)]/40 text-xs text-[var(--aksen-bahaya)]">
          {pesanGalat}
        </PanelKaca>
      )}

      {/* Quick Capture Bar */}
      <Kartu elevasi="angkat" kilau="biru">
        <KepalaKartu>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-[var(--aksen-biru-elektrik)]" />
              <JudulKartu>Quick Capture</JudulKartu>
            </div>
            <div className="flex items-center gap-2">
              <Lencana varian="teal">
                {statusSimpan === "menyimpan"
                  ? "Menyimpan..."
                  : statusSimpan === "tersimpan"
                    ? "Auto-save aktif"
                    : "Siap"}
              </Lencana>
              <Tombol
                varian="kaca"
                ukuran="kecil"
                ikonKiri={<Download className="h-3.5 w-3.5" />}
                disabled={daftarCatatan.length === 0}
                onClick={() =>
                  unduhBerkasTeks(
                    "overthinker-quick-notes.json",
                    buatKontenEksporJson(daftarCatatan),
                    "application/json"
                  )
                }
              >
                Export JSON
              </Tombol>
            </div>
          </div>
          <DeskripsiKartu>
            Tangkap ide cepat, checklist, atau catatan Markdown. Semua otomatis tersimpan lokal.
          </DeskripsiKartu>
        </KepalaKartu>

        <IsiKartu>
          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="flex-1">
              <KolomMasukan
                aria-label="Quick Capture catatan baru"
                placeholder="Tulis ide cepat lalu klik Tambah..."
                value={teksQuickCapture}
                onChange={(e) => aturTeksQuickCapture(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    void tanganiQuickCapture();
                  }
                }}
              />
            </div>
            <Tombol
              varian="utama"
              ikonKiri={<Plus className="h-4 w-4" />}
              onClick={() => void tanganiQuickCapture()}
            >
              Tambah Catatan
            </Tombol>
          </div>
        </IsiKartu>
      </Kartu>

      {/* Workspace 2 Kolom: Daftar Catatan + Editor */}
      <div className="grid gap-5 lg:grid-cols-12">
        {/* Sidebar Daftar Catatan */}
        <Kartu className="lg:col-span-4 space-y-4">
          <div className="space-y-3">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-[var(--warna-teks-redup)]" />
              <input
                type="search"
                aria-label="Cari catatan"
                placeholder="Cari judul, isi, atau tag..."
                value={kataCari}
                onChange={(e) => aturKataCari(e.target.value)}
                className="h-9 w-full rounded-xl border border-[var(--warna-batas-kuat)] bg-white/70 dark:bg-[#101521]/75 pl-9 pr-3 text-xs text-[var(--warna-teks-utama)] focus:outline-none focus:ring-2 focus:ring-[var(--aksen-biru-elektrik)]/60"
              />
            </div>

            <div className="flex flex-wrap gap-1.5">
              {(["aktif", "arsip", "semua"] as FilterArsipCatatan[]).map(
                (tab) => (
                  <Tombol
                    key={tab}
                    ukuran="kecil"
                    varian={filterArsip === tab ? "utama" : "kaca"}
                    onClick={() => aturFilterArsip(tab)}
                  >
                    {tab === "aktif"
                      ? "Aktif"
                      : tab === "arsip"
                        ? "Arsip"
                        : "Semua"}
                  </Tombol>
                )
              )}
            </div>

            {semuaTagUnik.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <Tag className="h-3.5 w-3.5 text-[var(--warna-teks-redup)]" />
                {tagTerpilih && (
                  <button
                    type="button"
                    onClick={() => aturTagTerpilih(null)}
                    className="rounded-full border border-[var(--warna-batas-kuat)] px-2 py-0.5 text-[11px] text-[var(--warna-teks-sekunder)] cursor-pointer"
                  >
                    Reset tag
                  </button>
                )}
                {semuaTagUnik.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() =>
                      aturTagTerpilih(tagTerpilih === tag ? null : tag)
                    }
                    className={`rounded-full border px-2 py-0.5 text-[11px] transition cursor-pointer ${
                      tagTerpilih === tag
                        ? "border-[var(--aksen-ungu-neon)] bg-[#A879FF]/20 text-[var(--warna-teks-utama)]"
                        : "border-[var(--warna-batas)] text-[var(--warna-teks-sekunder)] hover:border-[var(--warna-batas-kuat)]"
                    }`}
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2 max-h-[440px] overflow-y-auto pr-1">
            {catatanTersaring.length === 0 ? (
              <p className="rounded-xl border border-dashed border-[var(--warna-batas-kuat)] p-4 text-center text-xs text-[var(--warna-teks-redup)]">
                Belum ada catatan di filter ini. Bikin satu lewat Quick Capture di atas.
              </p>
            ) : (
              catatanTersaring.map((item) => {
                const terpilih = item.id === idTerpilih;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => pilihCatatan(item.id)}
                    className={`w-full rounded-xl border p-3 text-left transition cursor-pointer space-y-1.5 ${
                      terpilih
                        ? "border-[var(--aksen-biru-elektrik)] bg-[#55A7FF]/10"
                        : "border-[var(--warna-batas)] hover:border-[var(--warna-batas-kuat)]"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate text-xs font-semibold text-[var(--warna-teks-utama)]">
                        {item.judul}
                      </span>
                      {item.disematkan && (
                        <Pin
                          className="h-3.5 w-3.5 shrink-0 text-[var(--aksen-biru-elektrik)]"
                          aria-label="Disematkan"
                        />
                      )}
                    </div>
                    <p className="line-clamp-2 text-[11px] text-[var(--warna-teks-sekunder)]">
                      {item.kontenMarkdown || "(Catatan kosong)"}
                    </p>
                    <div className="flex flex-wrap items-center gap-1">
                      <Lencana varian="netral">
                        {LABEL_FORMAT[item.formatKonten]}
                      </Lencana>
                      {item.daftarTag.map((tag) => (
                        <Lencana key={tag} varian="ungu">
                          #{tag}
                        </Lencana>
                      ))}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </Kartu>

        {/* Panel Editor Catatan */}
        <Kartu elevasi="angkat" className="lg:col-span-8">
          {!catatanAktif ? (
            <div className="flex min-h-[340px] flex-col items-center justify-center text-center space-y-2">
              <FileText className="h-8 w-8 text-[var(--warna-teks-redup)]" />
              <p className="text-sm font-medium text-[var(--warna-teks-utama)]">
                Pilih catatan atau bikin baru
              </p>
              <p className="text-xs text-[var(--warna-teks-sekunder)] max-w-sm">
                Mendukung Markdown, Rich Text, Checklist interaktif, Auto-save, Tag, Pin, Arsip, dan Export.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Bar Aksi Catatan */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--warna-batas)] pb-3">
                <div className="flex flex-wrap gap-1.5">
                  {(["markdown", "rich_text", "checklist"] as FormatCatatan[]).map(
                    (fmt) => (
                      <Tombol
                        key={fmt}
                        ukuran="kecil"
                        varian={formatDraft === fmt ? "utama" : "kaca"}
                        onClick={() => {
                          aturFormatDraft(fmt);
                          jadwalkanAutoSave(judulDraft, kontenDraft, fmt, tagDraft);
                        }}
                      >
                        {LABEL_FORMAT[fmt]}
                      </Tombol>
                    )
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                  <Tombol
                    ukuran="kecil"
                    varian={modePreview ? "sekunder" : "kaca"}
                    ikonKiri={<Eye className="h-3.5 w-3.5" />}
                    onClick={() => aturModePreview((v) => !v)}
                  >
                    Preview
                  </Tombol>
                  <Tombol
                    ukuran="kecil"
                    varian={catatanAktif.disematkan ? "utama" : "kaca"}
                    ikonKiri={<Pin className="h-3.5 w-3.5" />}
                    onClick={() => void ubahPinCatatan(catatanAktif.id)}
                  >
                    {catatanAktif.disematkan ? "Unpin" : "Pin"}
                  </Tombol>
                  <Tombol
                    ukuran="kecil"
                    varian="kaca"
                    ikonKiri={
                      catatanAktif.diarsipkan ? (
                        <ArchiveRestore className="h-3.5 w-3.5" />
                      ) : (
                        <Archive className="h-3.5 w-3.5" />
                      )
                    }
                    onClick={() => void ubahArsipCatatan(catatanAktif.id)}
                  >
                    {catatanAktif.diarsipkan ? "Pulihkan" : "Arsipkan"}
                  </Tombol>
                  <Tombol
                    ukuran="kecil"
                    varian="kaca"
                    ikonKiri={<Download className="h-3.5 w-3.5" />}
                    onClick={() =>
                      unduhBerkasTeks(
                        `${catatanAktif.judul.toLowerCase().replace(/[^a-z0-9]+/g, "-") || "catatan"}.md`,
                        buatKontenEksporMarkdown({
                          ...catatanAktif,
                          judul: judulDraft,
                          kontenMarkdown: kontenDraft,
                          formatKonten: formatDraft,
                          daftarTag: tagDraft,
                        }),
                        "text/markdown"
                      )
                    }
                  >
                    Export .md
                  </Tombol>
                  <Tombol
                    ukuran="kecil"
                    varian="bahaya"
                    ikonKiri={<Trash2 className="h-3.5 w-3.5" />}
                    onClick={() => void hapusCatatan(catatanAktif.id)}
                  >
                    Hapus
                  </Tombol>
                </div>
              </div>

              {/* Judul Catatan */}
              <KolomMasukan
                label="Judul Catatan"
                value={judulDraft}
                onChange={(e) => {
                  aturJudulDraft(e.target.value);
                  jadwalkanAutoSave(
                    e.target.value,
                    kontenDraft,
                    formatDraft,
                    tagDraft
                  );
                }}
              />

              {/* Toolbar Format */}
              <div className="flex flex-wrap items-center gap-1.5">
                <Tombol
                  ukuran="kecil"
                  varian="hantu"
                  aria-label="Format Bold"
                  ikonKiri={<Bold className="h-3.5 w-3.5" />}
                  onClick={() => sisipkanFormat("**teks tebal**")}
                >
                  Bold
                </Tombol>
                <Tombol
                  ukuran="kecil"
                  varian="hantu"
                  aria-label="Format Italic"
                  ikonKiri={<Italic className="h-3.5 w-3.5" />}
                  onClick={() => sisipkanFormat("*teks miring*")}
                >
                  Italic
                </Tombol>
                <Tombol
                  ukuran="kecil"
                  varian="hantu"
                  aria-label="Format Heading"
                  ikonKiri={<Heading2 className="h-3.5 w-3.5" />}
                  onClick={() => sisipkanFormat("## Subjudul")}
                >
                  Heading
                </Tombol>
                <Tombol
                  ukuran="kecil"
                  varian="hantu"
                  aria-label="Format List"
                  ikonKiri={<List className="h-3.5 w-3.5" />}
                  onClick={() => sisipkanFormat("- Poin baru")}
                >
                  List
                </Tombol>
                <Tombol
                  ukuran="kecil"
                  varian="hantu"
                  aria-label="Format Checklist"
                  ikonKiri={<CheckSquare className="h-3.5 w-3.5" />}
                  onClick={() => sisipkanFormat("- [ ] Tugas baru")}
                >
                  Checklist
                </Tombol>
                <Tombol
                  ukuran="kecil"
                  varian="hantu"
                  aria-label="Format Kode"
                  ikonKiri={<Code className="h-3.5 w-3.5" />}
                  onClick={() => sisipkanFormat("`kode`")}
                >
                  Kode
                </Tombol>
              </div>

              {/* Mode Checklist Interaktif */}
              {formatDraft === "checklist" && (
                <div className="rounded-xl border border-[var(--warna-batas)] p-3 space-y-2.5">
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <KolomMasukan
                        aria-label="Item checklist baru"
                        placeholder="Tambah item checklist..."
                        value={itemChecklistBaru}
                        onChange={(e) => aturItemChecklistBaru(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            tanganiTambahChecklist();
                          }
                        }}
                      />
                    </div>
                    <Tombol
                      ukuran="sedang"
                      varian="kaca"
                      onClick={tanganiTambahChecklist}
                    >
                      Tambah Item
                    </Tombol>
                  </div>

                  {daftarChecklist.length > 0 && (
                    <div className="space-y-1.5">
                      {daftarChecklist.map((item) => (
                        <label
                          key={item.indeksBaris}
                          className="flex items-center gap-2.5 rounded-lg px-2 py-1 text-xs hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={item.selesai}
                            onChange={() =>
                              tanganiToggleChecklist(item.indeksBaris)
                            }
                            className="accent-[#66E5D2]"
                          />
                          <span
                            className={
                              item.selesai
                                ? "line-through text-[var(--warna-teks-redup)]"
                                : "text-[var(--warna-teks-utama)]"
                            }
                          >
                            {item.teks}
                          </span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Editor atau Preview */}
              {modePreview ? (
                <div className="min-h-[180px] rounded-xl border border-[var(--warna-batas)] bg-black/[0.02] dark:bg-white/[0.02] p-4 space-y-2 text-sm">
                  {kontenDraft.split("\n").map((baris, idx) => {
                    if (baris.startsWith("## ")) {
                      return (
                        <h4 key={idx} className="text-base font-semibold">
                          {baris.slice(3)}
                        </h4>
                      );
                    }
                    if (baris.startsWith("# ")) {
                      return (
                        <h3 key={idx} className="text-lg font-semibold">
                          {baris.slice(2)}
                        </h3>
                      );
                    }
                    return (
                      <p
                        key={idx}
                        className="text-xs leading-relaxed text-[var(--warna-teks-sekunder)] whitespace-pre-wrap"
                      >
                        {baris || "\u00A0"}
                      </p>
                    );
                  })}
                </div>
              ) : (
                <AreaTeks
                  label="Isi Catatan"
                  rows={8}
                  value={kontenDraft}
                  onChange={(e) => {
                    aturKontenDraft(e.target.value);
                    jadwalkanAutoSave(
                      judulDraft,
                      e.target.value,
                      formatDraft,
                      tagDraft
                    );
                  }}
                />
              )}

              {/* Pengelola Tag */}
              <div className="space-y-2 pt-2 border-t border-[var(--warna-batas)]">
                <div className="flex flex-wrap items-center gap-1.5">
                  {tagDraft.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 rounded-full border border-[#A879FF]/35 bg-[#A879FF]/15 px-2.5 py-0.5 text-xs text-[#6D28D9] dark:text-[#C5A3FF]"
                    >
                      #{tag}
                      <button
                        type="button"
                        aria-label={`Hapus tag ${tag}`}
                        onClick={() => tanganiHapusTag(tag)}
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
                      aria-label="Tambah tag baru"
                      placeholder="Tambah tag (misal: kerja, ide, bug)..."
                      value={inputTagBaru}
                      onChange={(e) => aturInputTagBaru(e.target.value)}
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
            </div>
          )}
        </Kartu>
      </div>
    </div>
  );
}
