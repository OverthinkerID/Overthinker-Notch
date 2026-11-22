import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type DragEvent as ReactDragEvent,
} from "react";
import {
  Clock,
  Copy,
  Download,
  FileCode2,
  FileImage,
  FileText,
  FolderOpen,
  FolderSearch,
  Pencil,
  RotateCcw,
  Search,
  ShieldCheck,
  Trash2,
  Upload,
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
  Tombol,
} from "@/sistem-desain";
import { gunakanTokoBerkas } from "@/berkas/toko/tokoBerkas";
import type {
  FilterTabBerkas,
  OpsiKedaluwarsa,
} from "@/berkas/tipe/tipeBerkas";
import {
  apakahBerkasKedaluwarsa,
  deteksiKategoriPreview,
  formatUkuranBerkas,
} from "@/berkas/utilitas/formatBerkas";

const DAFTAR_OPSI_KEDALUWARSA: readonly {
  nilai: OpsiKedaluwarsa;
  label: string;
}[] = [
  { nilai: "24_jam", label: "24 Jam" },
  { nilai: "7_hari", label: "7 Hari" },
  { nilai: "14_hari", label: "14 Hari" },
  { nilai: "30_hari", label: "30 Hari" },
  { nilai: "tanpa_batas", label: "Tanpa Batas" },
];

export function PanelBerkas() {
  const daftarBerkas = gunakanTokoBerkas((s) => s.daftarBerkas);
  const idTerpilih = gunakanTokoBerkas((s) => s.idTerpilih);
  const tabAktif = gunakanTokoBerkas((s) => s.tabAktif);
  const kataCari = gunakanTokoBerkas((s) => s.kataCari);
  const opsiKedaluwarsaBawaan = gunakanTokoBerkas(
    (s) => s.opsiKedaluwarsaBawaan
  );
  const sedangMemuat = gunakanTokoBerkas((s) => s.sedangMemuat);
  const pesanStatus = gunakanTokoBerkas((s) => s.pesanStatus);
  const pesanGalat = gunakanTokoBerkas((s) => s.pesanGalat);

  const muatBerkas = gunakanTokoBerkas((s) => s.muatBerkas);
  const pilihBerkas = gunakanTokoBerkas((s) => s.pilihBerkas);
  const aturTabAktif = gunakanTokoBerkas((s) => s.aturTabAktif);
  const aturKataCari = gunakanTokoBerkas((s) => s.aturKataCari);
  const aturOpsiKedaluwarsaBawaan = gunakanTokoBerkas(
    (s) => s.aturOpsiKedaluwarsaBawaan
  );
  const imporBanyakFile = gunakanTokoBerkas((s) => s.imporBanyakFile);
  const ubahNamaBerkas = gunakanTokoBerkas((s) => s.ubahNamaBerkas);
  const aturProyekBerkas = gunakanTokoBerkas((s) => s.aturProyekBerkas);
  const aturKedaluwarsaBerkas = gunakanTokoBerkas(
    (s) => s.aturKedaluwarsaBerkas
  );
  const pindahKeRecovery = gunakanTokoBerkas((s) => s.pindahKeRecovery);
  const pulihkanDariRecovery = gunakanTokoBerkas(
    (s) => s.pulihkanDariRecovery
  );
  const hapusPermanenVault = gunakanTokoBerkas((s) => s.hapusPermanenVault);
  const bersihkanKedaluwarsa = gunakanTokoBerkas(
    (s) => s.bersihkanKedaluwarsa
  );
  const tampilkanDiFolder = gunakanTokoBerkas((s) => s.tampilkanDiFolder);

  const inputFileRef = useRef<HTMLInputElement | null>(null);
  const [sedangSeret, aturSedangSeret] = useState(false);
  const [namaEdit, aturNamaEdit] = useState("");
  const [proyekEdit, aturProyekEdit] = useState("");
  const [pesanSalin, aturPesanSalin] = useState<string | null>(null);

  useEffect(() => {
    void muatBerkas();
  }, [muatBerkas]);

  const berkasTersaring = useMemo(() => {
    const q = kataCari.trim().toLowerCase();
    const sekarang = new Date();

    return daftarBerkas.filter((item) => {
      const diRecovery = Boolean(item.dihapusPada);
      const kedaluwarsa = apakahBerkasKedaluwarsa(
        item.kedaluwarsaPada,
        sekarang
      );

      if (tabAktif === "aktif" && (diRecovery || kedaluwarsa)) return false;
      if (tabAktif === "kedaluwarsa" && (diRecovery || !kedaluwarsa))
        return false;
      if (tabAktif === "recovery" && !diRecovery) return false;

      if (!q) return true;
      return (
        item.namaTampil.toLowerCase().includes(q) ||
        item.namaAsli.toLowerCase().includes(q) ||
        (item.projectId?.toLowerCase().includes(q) ?? false)
      );
    });
  }, [daftarBerkas, tabAktif, kataCari]);

  const berkasAktif = useMemo(
    () =>
      berkasTersaring.find((item) => item.id === idTerpilih) ??
      berkasTersaring[0] ??
      null,
    [berkasTersaring, idTerpilih]
  );

  useEffect(() => {
    if (berkasAktif) {
      aturNamaEdit(berkasAktif.namaTampil);
      aturProyekEdit(berkasAktif.projectId ?? "");
    } else {
      aturNamaEdit("");
      aturProyekEdit("");
    }
  }, [berkasAktif?.id, berkasAktif?.namaTampil, berkasAktif?.projectId]);

  function tanganiDrop(peristiwa: ReactDragEvent<HTMLDivElement>): void {
    peristiwa.preventDefault();
    aturSedangSeret(false);
    const files = Array.from(peristiwa.dataTransfer.files ?? []);
    if (files.length > 0) {
      void imporBanyakFile(files);
    }
  }

  async function tanganiSalin(): Promise<void> {
    if (!berkasAktif) return;
    const kontenSalin =
      berkasAktif.pratinjauTeks ?? berkasAktif.pathRelatifVault;
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(kontenSalin);
      }
      aturPesanSalin("Berhasil di-copy!");
      window.setTimeout(() => aturPesanSalin(null), 1600);
    } catch {
      aturPesanSalin("Copy siap digunakan.");
    }
  }

  function tanganiBukaAtauUnduh(): void {
    if (!berkasAktif || typeof document === "undefined") return;
    const blob = berkasAktif.pratinjauTeks
      ? new Blob([berkasAktif.pratinjauTeks], {
          type: berkasAktif.tipeMime || "text/plain",
        })
      : new Blob([`Salinan vault: ${berkasAktif.pathRelatifVault}`], {
          type: "text/plain",
        });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = berkasAktif.namaTampil;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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

      {/* Zona Drag & Drop Multi-File */}
      <Kartu elevasi="angkat" kilau="biru">
        <KepalaKartu>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <FolderOpen className="h-4 w-4 text-[var(--aksen-biru-elektrik)]" />
              <JudulKartu>Temporary File Storage</JudulKartu>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Lencana varian="teal" titikAktif>
                File asli kamu selalu aman
              </Lencana>
              <Tombol
                varian="kaca"
                ukuran="kecil"
                ikonKiri={<Clock className="h-3.5 w-3.5" />}
                onClick={() => void bersihkanKedaluwarsa()}
              >
                Bersihkan Kedaluwarsa
              </Tombol>
            </div>
          </div>
          <DeskripsiKartu>
            Drag & drop satu atau banyak file sekaligus. Aplikasi cuma menyimpan salinan di vault lokal dan nggak pernah menghapus file asli kamu.
          </DeskripsiKartu>
        </KepalaKartu>

        <IsiKartu className="space-y-3">
          <div
            onDragOver={(e) => {
              e.preventDefault();
              aturSedangSeret(true);
            }}
            onDragLeave={() => aturSedangSeret(false)}
            onDrop={tanganiDrop}
            className={`rounded-2xl border-2 border-dashed p-5 text-center transition ${
              sedangSeret
                ? "border-[var(--aksen-biru-elektrik)] bg-[#55A7FF]/12"
                : "border-[var(--warna-batas-kuat)] bg-black/[0.02] dark:bg-white/[0.02]"
            }`}
          >
            <input
              ref={inputFileRef}
              type="file"
              multiple
              aria-label="Pilih banyak file untuk diimpor"
              className="hidden"
              onChange={(e) => {
                const files = Array.from(e.target.files ?? []);
                if (files.length > 0) {
                  void imporBanyakFile(files);
                  e.target.value = "";
                }
              }}
            />
            <Upload className="mx-auto h-6 w-6 text-[var(--aksen-biru-elektrik)]" />
            <p className="mt-2 text-xs font-medium text-[var(--warna-teks-utama)]">
              Taruh file di sini atau pilih dari perangkat
            </p>
            <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
              <Tombol
                varian="utama"
                ukuran="kecil"
                sedangMemuat={sedangMemuat}
                onClick={() => inputFileRef.current?.click()}
              >
                Pilih File (Multi-Import)
              </Tombol>
              <select
                aria-label="Masa simpan default"
                value={opsiKedaluwarsaBawaan}
                onChange={(e) =>
                  aturOpsiKedaluwarsaBawaan(e.target.value as OpsiKedaluwarsa)
                }
                className="h-8 rounded-lg border border-[var(--warna-batas-kuat)] bg-white/80 dark:bg-[#101521] px-2.5 text-xs text-[var(--warna-teks-utama)]"
              >
                {DAFTAR_OPSI_KEDALUWARSA.map((o) => (
                  <option key={o.nilai} value={o.nilai}>
                    Kedaluwarsa: {o.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </IsiKartu>
      </Kartu>

      {/* Daftar File & Preview */}
      <div className="grid gap-5 lg:grid-cols-12">
        <Kartu className="lg:col-span-5 space-y-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-[var(--warna-teks-redup)]" />
            <input
              type="search"
              aria-label="Cari file sementara"
              placeholder="Cari nama file atau project..."
              value={kataCari}
              onChange={(e) => aturKataCari(e.target.value)}
              className="h-9 w-full rounded-xl border border-[var(--warna-batas-kuat)] bg-white/70 dark:bg-[#101521]/75 pl-9 pr-3 text-xs text-[var(--warna-teks-utama)] focus:outline-none focus:ring-2 focus:ring-[var(--aksen-biru-elektrik)]/60"
            />
          </div>

          <div className="flex flex-wrap gap-1.5">
            {(["aktif", "kedaluwarsa", "recovery"] as FilterTabBerkas[]).map(
              (tab) => (
                <Tombol
                  key={tab}
                  ukuran="kecil"
                  varian={tabAktif === tab ? "utama" : "kaca"}
                  onClick={() => aturTabAktif(tab)}
                >
                  {tab === "aktif"
                    ? "Aktif"
                    : tab === "kedaluwarsa"
                      ? "Kedaluwarsa"
                      : "Recovery"}
                </Tombol>
              )
            )}
          </div>

          <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
            {berkasTersaring.length === 0 ? (
              <p className="rounded-xl border border-dashed border-[var(--warna-batas-kuat)] p-4 text-center text-xs text-[var(--warna-teks-redup)]">
                Belum ada file di tab ini.
              </p>
            ) : (
              berkasTersaring.map((item) => {
                const kategori = deteksiKategoriPreview(
                  item.namaTampil,
                  item.tipeMime
                );
                const terpilih = item.id === berkasAktif?.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => pilihBerkas(item.id)}
                    className={`w-full rounded-xl border p-3 text-left transition cursor-pointer space-y-1 ${
                      terpilih
                        ? "border-[var(--aksen-biru-elektrik)] bg-[#55A7FF]/10"
                        : "border-[var(--warna-batas)] hover:border-[var(--warna-batas-kuat)]"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {kategori === "gambar" ? (
                        <FileImage className="h-4 w-4 shrink-0 text-[#A879FF]" />
                      ) : kategori === "teks" ? (
                        <FileCode2 className="h-4 w-4 shrink-0 text-[#66E5D2]" />
                      ) : (
                        <FileText className="h-4 w-4 shrink-0 text-[#55A7FF]" />
                      )}
                      <span className="truncate text-xs font-semibold">
                        {item.namaTampil}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-[var(--warna-teks-sekunder)]">
                      <span>{formatUkuranBerkas(item.ukuranByte)}</span>
                      {item.projectId && (
                        <Lencana varian="ungu">{item.projectId}</Lencana>
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </Kartu>

        <Kartu elevasi="angkat" className="lg:col-span-7">
          {!berkasAktif ? (
            <div className="flex min-h-[320px] flex-col items-center justify-center text-center space-y-2">
              <ShieldCheck className="h-8 w-8 text-[var(--warna-teks-redup)]" />
              <p className="text-sm font-medium">Pilih file buat lihat preview</p>
              <p className="text-xs text-[var(--warna-teks-sekunder)] max-w-sm">
                Bisa preview teks/gambar, rename, copy, open, reveal in folder, atur kedaluwarsa, tautkan project, atau pulihkan dari Recovery.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Aksi File */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--warna-batas)] pb-3">
                <div className="min-w-0">
                  <h3 className="truncate text-sm font-semibold">
                    {berkasAktif.namaTampil}
                  </h3>
                  <p className="font-kode text-[11px] text-[var(--warna-teks-redup)] truncate">
                    {berkasAktif.pathRelatifVault} •{" "}
                    {formatUkuranBerkas(berkasAktif.ukuranByte)}
                  </p>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  <Tombol
                    ukuran="kecil"
                    varian="kaca"
                    ikonKiri={<Copy className="h-3.5 w-3.5" />}
                    onClick={() => void tanganiSalin()}
                  >
                    {pesanSalin ?? "Copy"}
                  </Tombol>
                  <Tombol
                    ukuran="kecil"
                    varian="kaca"
                    ikonKiri={<Download className="h-3.5 w-3.5" />}
                    onClick={tanganiBukaAtauUnduh}
                  >
                    Buka / Unduh
                  </Tombol>
                  <Tombol
                    ukuran="kecil"
                    varian="kaca"
                    ikonKiri={<FolderSearch className="h-3.5 w-3.5" />}
                    onClick={() => void tampilkanDiFolder(berkasAktif.id)}
                  >
                    Reveal in Folder
                  </Tombol>
                  {berkasAktif.dihapusPada ? (
                    <>
                      <Tombol
                        ukuran="kecil"
                        varian="utama"
                        ikonKiri={<RotateCcw className="h-3.5 w-3.5" />}
                        onClick={() => void pulihkanDariRecovery(berkasAktif.id)}
                      >
                        Pulihkan
                      </Tombol>
                      <Tombol
                        ukuran="kecil"
                        varian="bahaya"
                        ikonKiri={<Trash2 className="h-3.5 w-3.5" />}
                        onClick={() => void hapusPermanenVault(berkasAktif.id)}
                      >
                        Hapus Permanen
                      </Tombol>
                    </>
                  ) : (
                    <Tombol
                      ukuran="kecil"
                      varian="bahaya"
                      ikonKiri={<Trash2 className="h-3.5 w-3.5" />}
                      onClick={() => void pindahKeRecovery(berkasAktif.id)}
                    >
                      Hapus
                    </Tombol>
                  )}
                </div>
              </div>

              {/* Area Preview */}
              <div className="rounded-xl border border-[var(--warna-batas)] bg-black/[0.02] dark:bg-white/[0.02] p-3">
                {berkasAktif.pratinjauDataUrl ? (
                  <img
                    src={berkasAktif.pratinjauDataUrl}
                    alt={berkasAktif.namaTampil}
                    className="max-h-56 mx-auto rounded-lg object-contain"
                  />
                ) : berkasAktif.pratinjauTeks !== null &&
                  berkasAktif.pratinjauTeks !== undefined ? (
                  <pre className="max-h-56 overflow-auto font-kode text-xs text-[var(--warna-teks-utama)] whitespace-pre-wrap">
                    {berkasAktif.pratinjauTeks}
                  </pre>
                ) : (
                  <p className="text-xs text-[var(--warna-teks-sekunder)]">
                    File biner ({berkasAktif.tipeMime}) — klik "Buka / Unduh" atau "Reveal in Folder" buat membuka file ini.
                  </p>
                )}
              </div>

              {/* Rename, Project, & Kedaluwarsa */}
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="flex items-end gap-2">
                  <div className="flex-1">
                    <KolomMasukan
                      label="Rename File"
                      value={namaEdit}
                      onChange={(e) => aturNamaEdit(e.target.value)}
                    />
                  </div>
                  <Tombol
                    ukuran="sedang"
                    varian="kaca"
                    ikonKiri={<Pencil className="h-3.5 w-3.5" />}
                    onClick={() =>
                      void ubahNamaBerkas(berkasAktif.id, namaEdit)
                    }
                  >
                    Simpan Nama
                  </Tombol>
                </div>

                <div className="flex items-end gap-2">
                  <div className="flex-1">
                    <KolomMasukan
                      label="Tautkan ke Project"
                      placeholder="Misal: Overthinker Notch"
                      value={proyekEdit}
                      onChange={(e) => aturProyekEdit(e.target.value)}
                    />
                  </div>
                  <Tombol
                    ukuran="sedang"
                    varian="kaca"
                    onClick={() =>
                      void aturProyekBerkas(berkasAktif.id, proyekEdit)
                    }
                  >
                    Simpan Project
                  </Tombol>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[var(--warna-batas)]">
                <span className="text-xs text-[var(--warna-teks-sekunder)]">
                  Kedaluwarsa:{" "}
                  <strong className="font-kode text-[var(--warna-teks-utama)]">
                    {berkasAktif.kedaluwarsaPada
                      ? berkasAktif.kedaluwarsaPada.slice(0, 10)
                      : "Tanpa batas"}
                  </strong>
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {DAFTAR_OPSI_KEDALUWARSA.map((o) => (
                    <Tombol
                      key={o.nilai}
                      ukuran="kecil"
                      varian="hantu"
                      onClick={() =>
                        void aturKedaluwarsaBerkas(berkasAktif.id, o.nilai)
                      }
                    >
                      {o.label}
                    </Tombol>
                  ))}
                </div>
              </div>
            </div>
          )}
        </Kartu>
      </div>
    </div>
  );
}
