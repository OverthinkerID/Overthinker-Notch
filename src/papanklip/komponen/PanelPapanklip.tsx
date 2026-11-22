import {
  useEffect,
  useMemo,
  useState,
  type ClipboardEvent as ReactClipboardEvent,
} from "react";
import {
  Clipboard,
  ClipboardPaste,
  Code2,
  Copy,
  FileImage,
  FileText,
  Link2,
  Pin,
  Plus,
  Search,
  ShieldAlert,
  ShieldCheck,
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
  Sakelar,
  Tombol,
} from "@/sistem-desain";
import { gunakanTokoPapanklip } from "@/papanklip/toko/tokoPapanklip";
import type {
  FilterPapanklip,
  PengaturanPapanklip,
  TipeKontenPapanklip,
} from "@/papanklip/tipe/tipePapanklip";

const DAFTAR_FILTER: readonly { id: FilterPapanklip; label: string }[] = [
  { id: "semua", label: "Semua" },
  { id: "teks", label: "Teks" },
  { id: "kode", label: "Kode" },
  { id: "url", label: "URL" },
  { id: "gambar", label: "Gambar" },
  { id: "disematkan", label: "Di-pin" },
];

function ikonUntukTipe(tipe: TipeKontenPapanklip) {
  switch (tipe) {
    case "kode":
      return <Code2 className="h-3.5 w-3.5 text-[#A879FF]" />;
    case "url":
      return <Link2 className="h-3.5 w-3.5 text-[#55A7FF]" />;
    case "gambar":
      return <FileImage className="h-3.5 w-3.5 text-[#66E5D2]" />;
    default:
      return <FileText className="h-3.5 w-3.5 text-[var(--warna-teks-sekunder)]" />;
  }
}

export function PanelPapanklip() {
  const daftarItem = gunakanTokoPapanklip((s) => s.daftarItem);
  const pengaturan = gunakanTokoPapanklip((s) => s.pengaturan);
  const filterAktif = gunakanTokoPapanklip((s) => s.filterAktif);
  const kataCari = gunakanTokoPapanklip((s) => s.kataCari);
  const pesanStatus = gunakanTokoPapanklip((s) => s.pesanStatus);
  const pesanPeringatan = gunakanTokoPapanklip((s) => s.pesanPeringatan);

  const muatPapanklip = gunakanTokoPapanklip((s) => s.muatPapanklip);
  const aturFilterAktif = gunakanTokoPapanklip((s) => s.aturFilterAktif);
  const aturKataCari = gunakanTokoPapanklip((s) => s.aturKataCari);
  const tangkapTeks = gunakanTokoPapanklip((s) => s.tangkapTeks);
  const tangkapGambar = gunakanTokoPapanklip((s) => s.tangkapGambar);
  const ubahPin = gunakanTokoPapanklip((s) => s.ubahPin);
  const hapusItem = gunakanTokoPapanklip((s) => s.hapusItem);
  const bersihkanNonPin = gunakanTokoPapanklip((s) => s.bersihkanNonPin);
  const perbaruiPengaturan = gunakanTokoPapanklip((s) => s.perbaruiPengaturan);

  const [teksMasukan, aturTeksMasukan] = useState("");
  const [aplikasiSumber, aturAplikasiSumber] = useState("Overthinker Notch");
  const [formAturan, aturFormAturan] = useState<PengaturanPapanklip>(pengaturan);
  const [appBaru, aturAppBaru] = useState("");
  const [idTersalin, aturIdTersalin] = useState<string | null>(null);

  useEffect(() => {
    void muatPapanklip();
  }, [muatPapanklip]);

  useEffect(() => {
    aturFormAturan(pengaturan);
  }, [pengaturan]);

  const itemTersaring = useMemo(() => {
    const q = kataCari.trim().toLowerCase();
    return daftarItem.filter((item) => {
      if (filterAktif === "disematkan" && !item.disematkan) return false;
      if (
        filterAktif !== "semua" &&
        filterAktif !== "disematkan" &&
        item.tipeKonten !== filterAktif
      ) {
        return false;
      }
      if (!q) return true;
      return (
        (item.kontenTeks?.toLowerCase().includes(q) ?? false) ||
        item.aplikasiSumber.toLowerCase().includes(q) ||
        item.tipeKonten.toLowerCase().includes(q)
      );
    });
  }, [daftarItem, filterAktif, kataCari]);

  async function tanganiSimpanTeks(): Promise<void> {
    if (!teksMasukan.trim()) return;
    const berhasil = await tangkapTeks(teksMasukan, aplikasiSumber);
    if (berhasil) {
      aturTeksMasukan("");
    }
  }

  function tanganiPasteLangsung(
    peristiwa: ReactClipboardEvent<HTMLTextAreaElement>
  ): void {
    const items = peristiwa.clipboardData?.items;
    if (!items) return;
    for (const item of Array.from(items)) {
      if (item.type.startsWith("image/")) {
        peristiwa.preventDefault();
        const file = item.getAsFile();
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
          void tangkapGambar(String(reader.result ?? ""), aplikasiSumber);
        };
        reader.readAsDataURL(file);
        return;
      }
    }
  }

  async function tanganiBacaClipboardOs(): Promise<void> {
    if (typeof navigator === "undefined" || !navigator.clipboard?.readText) {
      return;
    }
    try {
      const teks = await navigator.clipboard.readText();
      if (teks.trim()) {
        await tangkapTeks(teks, "Clipboard OS");
      }
    } catch {
      // Izin clipboard ditolak browser/OS
    }
  }

  async function tanganiSalinItem(id: string, teks: string | null): Promise<void> {
    if (!teks) return;
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(teks);
      }
      aturIdTersalin(id);
      window.setTimeout(() => aturIdTersalin(null), 1400);
    } catch {
      aturIdTersalin(id);
    }
  }

  function tanganiTambahAppDikecualikan(): void {
    const bersih = appBaru.trim();
    if (
      !bersih ||
      formAturan.aplikasiDikecualikan.some(
        (a) => a.toLowerCase() === bersih.toLowerCase()
      )
    ) {
      aturAppBaru("");
      return;
    }
    const baru: PengaturanPapanklip = {
      ...formAturan,
      aplikasiDikecualikan: [...formAturan.aplikasiDikecualikan, bersih],
    };
    aturFormAturan(baru);
    perbaruiPengaturan(baru);
    aturAppBaru("");
  }

  return (
    <div className="space-y-5">
      {pesanPeringatan && (
        <PanelKaca className="p-3 border-amber-500/40 flex items-center gap-2 text-xs text-amber-700 dark:text-amber-300">
          <ShieldAlert className="h-4 w-4 shrink-0" />
          <span>{pesanPeringatan}</span>
        </PanelKaca>
      )}

      {pesanStatus && (
        <PanelKaca className="p-3 border-[#66E5D2]/40 text-xs text-[#0F766E] dark:text-[#66E5D2]">
          {pesanStatus}
        </PanelKaca>
      )}

      {/* Area Tangkap Clipboard */}
      <Kartu elevasi="angkat" kilau="biru">
        <KepalaKartu>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Clipboard className="h-4 w-4 text-[var(--aksen-biru-elektrik)]" />
              <JudulKartu>Clipboard Manager</JudulKartu>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Lencana varian={pengaturan.filterSensitifAktif ? "teal" : "peringatan"}>
                {pengaturan.filterSensitifAktif
                  ? "Filter Sensitif ON"
                  : "Filter Sensitif OFF"}
              </Lencana>
              <Tombol
                ukuran="kecil"
                varian="kaca"
                ikonKiri={<ClipboardPaste className="h-3.5 w-3.5" />}
                onClick={() => void tanganiBacaClipboardOs()}
              >
                Ambil dari Clipboard OS
              </Tombol>
              <Tombol
                ukuran="kecil"
                varian="kaca"
                ikonKiri={<Trash2 className="h-3.5 w-3.5" />}
                onClick={() => void bersihkanNonPin()}
              >
                Hapus Non-Pin
              </Tombol>
            </div>
          </div>
          <DeskripsiKartu>
            Simpan riwayat teks, kode, URL, dan gambar yang di-paste. Password, API key, dan aplikasi dikecualikan otomatis diblokir.
          </DeskripsiKartu>
        </KepalaKartu>

        <IsiKartu className="space-y-3">
          <AreaTeks
            label="Paste Teks, Kode, URL, atau Gambar (Ctrl/Cmd+V)"
            rows={3}
            placeholder="Paste teks, potongan kode, URL, atau gambar langsung di sini..."
            value={teksMasukan}
            onChange={(e) => aturTeksMasukan(e.target.value)}
            onPaste={tanganiPasteLangsung}
          />
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
            <div className="sm:w-64">
              <KolomMasukan
                label="Aplikasi Sumber"
                value={aplikasiSumber}
                onChange={(e) => aturAplikasiSumber(e.target.value)}
              />
            </div>
            <Tombol
              varian="utama"
              ikonKiri={<Plus className="h-4 w-4" />}
              onClick={() => void tanganiSimpanTeks()}
            >
              Simpan ke Riwayat
            </Tombol>
          </div>
        </IsiKartu>
      </Kartu>

      <div className="grid gap-5 lg:grid-cols-12">
        {/* Daftar Riwayat Clipboard */}
        <Kartu elevasi="angkat" className="lg:col-span-7 space-y-4">
          <div className="space-y-3">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-[var(--warna-teks-redup)]" />
              <input
                type="search"
                aria-label="Cari riwayat clipboard"
                placeholder="Cari isi clipboard atau nama aplikasi..."
                value={kataCari}
                onChange={(e) => aturKataCari(e.target.value)}
                className="h-9 w-full rounded-xl border border-[var(--warna-batas-kuat)] bg-white/70 dark:bg-[#101521]/75 pl-9 pr-3 text-xs text-[var(--warna-teks-utama)] focus:outline-none focus:ring-2 focus:ring-[var(--aksen-biru-elektrik)]/60"
              />
            </div>

            <div className="flex flex-wrap gap-1.5">
              {DAFTAR_FILTER.map((f) => (
                <Tombol
                  key={f.id}
                  ukuran="kecil"
                  varian={filterAktif === f.id ? "utama" : "kaca"}
                  onClick={() => aturFilterAktif(f.id)}
                >
                  {f.label}
                </Tombol>
              ))}
            </div>
          </div>

          <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1">
            {itemTersaring.length === 0 ? (
              <p className="rounded-xl border border-dashed border-[var(--warna-batas-kuat)] p-6 text-center text-xs text-[var(--warna-teks-redup)]">
                Belum ada riwayat clipboard di filter ini.
              </p>
            ) : (
              itemTersaring.map((item) => (
                <div
                  key={item.id}
                  className="rounded-xl border border-[var(--warna-batas)] bg-black/[0.02] dark:bg-white/[0.02] p-3 space-y-2"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      {ikonUntukTipe(item.tipeKonten)}
                      <Lencana varian="biru">{item.tipeKonten}</Lencana>
                      <Lencana varian="netral">{item.aplikasiSumber}</Lencana>
                    </div>
                    <div className="flex items-center gap-1">
                      {item.kontenTeks && (
                        <Tombol
                          ukuran="kecil"
                          varian="kaca"
                          ikonKiri={<Copy className="h-3 w-3" />}
                          onClick={() =>
                            void tanganiSalinItem(item.id, item.kontenTeks)
                          }
                        >
                          {idTersalin === item.id ? "Copied!" : "Copy"}
                        </Tombol>
                      )}
                      <Tombol
                        ukuran="kecil"
                        varian={item.disematkan ? "utama" : "kaca"}
                        aria-label={item.disematkan ? "Unpin item" : "Pin item"}
                        ikonKiri={<Pin className="h-3 w-3" />}
                        onClick={() => void ubahPin(item.id)}
                      >
                        {item.disematkan ? "Di-pin" : "Pin"}
                      </Tombol>
                      <Tombol
                        ukuran="kecil"
                        varian="hantu"
                        aria-label="Hapus item clipboard"
                        onClick={() => void hapusItem(item.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5 text-[var(--aksen-bahaya)]" />
                      </Tombol>
                    </div>
                  </div>

                  {item.pratinjauGambarDataUrl ? (
                    <img
                      src={item.pratinjauGambarDataUrl}
                      alt="Clipboard preview"
                      className="max-h-40 rounded-lg border border-[var(--warna-batas)] object-contain"
                    />
                  ) : item.tipeKonten === "url" && item.kontenTeks ? (
                    <a
                      href={item.kontenTeks}
                      target="_blank"
                      rel="noreferrer"
                      className="block truncate text-xs text-[var(--aksen-biru-elektrik)] underline"
                    >
                      {item.kontenTeks}
                    </a>
                  ) : (
                    <pre
                      className={`max-h-28 overflow-auto text-xs whitespace-pre-wrap break-words ${
                        item.tipeKonten === "kode"
                          ? "font-kode text-[var(--warna-teks-utama)]"
                          : "font-sans text-[var(--warna-teks-sekunder)]"
                      }`}
                    >
                      {item.kontenTeks}
                    </pre>
                  )}
                </div>
              ))
            )}
          </div>
        </Kartu>

        {/* Pengaturan Privasi & Retensi */}
        <Kartu className="lg:col-span-5 space-y-4">
          <KepalaKartu>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-[var(--aksen-teal-siber)]" />
              <JudulKartu>Privasi & Retensi Clipboard</JudulKartu>
            </div>
            <DeskripsiKartu>
              Lindungi kredensial rahasia dan atur daftar aplikasi yang nggak boleh direkam.
            </DeskripsiKartu>
          </KepalaKartu>

          <IsiKartu className="space-y-4">
            <Sakelar
              aktif={formAturan.filterSensitifAktif}
              saatBerubah={(aktif) => {
                const baru = { ...formAturan, filterSensitifAktif: aktif };
                aturFormAturan(baru);
                perbaruiPengaturan(baru);
              }}
              label="Filter Data Sensitif"
              deskripsi="Otomatis blokir API key, token, private key, dan pola password."
            />

            <div className="space-y-2 pt-2 border-t border-[var(--warna-batas)]">
              <span className="block text-xs font-medium text-[var(--warna-teks-sekunder)]">
                Aplikasi Dikecualikan
              </span>
              <div className="flex flex-wrap gap-1.5">
                {formAturan.aplikasiDikecualikan.map((app) => (
                  <span
                    key={app}
                    className="inline-flex items-center gap-1 rounded-full border border-[var(--warna-batas-kuat)] bg-black/5 dark:bg-white/6 px-2.5 py-0.5 text-xs"
                  >
                    {app}
                    <button
                      type="button"
                      aria-label={`Hapus pengecualian ${app}`}
                      onClick={() => {
                        const baru = {
                          ...formAturan,
                          aplikasiDikecualikan:
                            formAturan.aplikasiDikecualikan.filter(
                              (a) => a !== app
                            ),
                        };
                        aturFormAturan(baru);
                        perbaruiPengaturan(baru);
                      }}
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
                    aria-label="Tambah aplikasi dikecualikan"
                    placeholder="Misal: Safari Private, Enpass..."
                    value={appBaru}
                    onChange={(e) => aturAppBaru(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        tanganiTambahAppDikecualikan();
                      }
                    }}
                  />
                </div>
                <Tombol
                  ukuran="sedang"
                  varian="kaca"
                  onClick={tanganiTambahAppDikecualikan}
                >
                  Tambah App
                </Tombol>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-[var(--warna-batas)]">
              <KolomMasukan
                label="Retensi (Hari)"
                type="number"
                min={1}
                max={365}
                value={formAturan.hariRetensi || ""}
                onChange={(e) =>
                  aturFormAturan((prev) => ({
                    ...prev,
                    hariRetensi: Number(e.target.value) || 0,
                  }))
                }
              />
              <KolomMasukan
                label="Maks. Item"
                type="number"
                min={10}
                max={1000}
                value={formAturan.maksimalItem || ""}
                onChange={(e) =>
                  aturFormAturan((prev) => ({
                    ...prev,
                    maksimalItem: Number(e.target.value) || 0,
                  }))
                }
              />
            </div>

            <Tombol
              varian="sekunder"
              onClick={() =>
                perbaruiPengaturan({
                  ...formAturan,
                  hariRetensi: Math.max(1, formAturan.hariRetensi),
                  maksimalItem: Math.max(10, formAturan.maksimalItem),
                })
              }
            >
              Simpan Pengaturan Clipboard
            </Tombol>
          </IsiKartu>
        </Kartu>
      </div>
    </div>
  );
}
