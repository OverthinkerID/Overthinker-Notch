import { useMemo, useState } from "react";
import { Copy, Search, Wrench } from "lucide-react";
import {
  DeskripsiKartu,
  JudulKartu,
  Kartu,
  KepalaKartu,
  KolomMasukan,
  Lencana,
  Tombol,
} from "@/sistem-desain";
import {
  bandingkanTeksBaris,
  buatDaftarUuid,
  buatKataSandiKripto,
  decodeBase64Utf8,
  decodeJwtLuring,
  encodeBase64Utf8,
  formatJsonLuring,
  hitungHashTeks,
  konversiSemuaCase,
  konversiTimestamp,
  konversiUrl,
  konversiWarnaHex,
  ujiRegexLuring,
} from "@/utilitas/mesin/mesinUtilitas";
import {
  DAFTAR_12_UTILITAS,
  type IdAlatUtilitas,
} from "@/utilitas/tipe/tipeUtilitas";

export function PanelUtilitas() {
  const [alatAktif, aturAlatAktif] = useState<IdAlatUtilitas>("json_formatter");
  const [cariAlat, aturCariAlat] = useState("");
  const [pesanSalin, aturPesanSalin] = useState<string | null>(null);

  const [jsonInput, aturJsonInput] = useState(
    '{"aplikasi":"Overthinker Notch","fase":14,"luring":true}'
  );
  const [jsonOutput, aturJsonOutput] = useState("");
  const [jsonGalat, aturJsonGalat] = useState<string | null>(null);

  const [b64Input, aturB64Input] = useState("Halo Overthinker Notch!");
  const [b64Output, aturB64Output] = useState("");
  const [b64Galat, aturB64Galat] = useState<string | null>(null);

  const [urlInput, aturUrlInput] = useState("https://overthinker.local/?q=notch mac");
  const [urlOutput, aturUrlOutput] = useState("");
  const [urlGalat, aturUrlGalat] = useState<string | null>(null);

  const [jumlahUuid, aturJumlahUuid] = useState("5");
  const [daftarUuid, aturDaftarUuid] = useState<string[]>(() =>
    buatDaftarUuid(5)
  );

  const [hashInput, aturHashInput] = useState("Overthinker Notch");
  const [hashAlgoritma, aturHashAlgoritma] = useState<
    "SHA-1" | "SHA-256" | "SHA-512"
  >("SHA-256");
  const [hashOutput, aturHashOutput] = useState("");

  const [regexPola, aturRegexPola] = useState("\\b[A-Z][a-z]+\\b");
  const [regexFlags, aturRegexFlags] = useState("g");
  const [regexTeks, aturRegexTeks] = useState(
    "Overthinker Notch berjalan di MacBook Pro."
  );

  const [tsInput, aturTsInput] = useState("1795267200");
  const [jwtInput, aturJwtInput] = useState("");
  const [caseInput, aturCaseInput] = useState("overthinker_notch_quick_tools");
  const [colorInput, aturColorInput] = useState("#55A7FF");
  const [diffA, aturDiffA] = useState("baris satu\nbaris dua\nbaris tiga");
  const [diffB, aturDiffB] = useState("baris satu\nbaris diubah\nbaris tiga");

  const [sandiPanjang, aturSandiPanjang] = useState("16");
  const [sandiBesar, aturSandiBesar] = useState(true);
  const [sandiKecil, aturSandiKecil] = useState(true);
  const [sandiAngka, aturSandiAngka] = useState(true);
  const [sandiSimbol, aturSandiSimbol] = useState(true);
  const [sandiHasil, aturSandiHasil] = useState(() =>
    buatKataSandiKripto({
      panjang: 16,
      hurufBesar: true,
      hurufKecil: true,
      angka: true,
      simbol: true,
    })
  );

  const daftarTersaring = useMemo(() => {
    const q = cariAlat.trim().toLowerCase();
    if (!q) return DAFTAR_12_UTILITAS;
    return DAFTAR_12_UTILITAS.filter(
      (a) =>
        a.nama.toLowerCase().includes(q) ||
        a.kategori.toLowerCase().includes(q) ||
        a.deskripsi.toLowerCase().includes(q)
    );
  }, [cariAlat]);

  const definisiAktif = useMemo(
    () =>
      DAFTAR_12_UTILITAS.find((a) => a.id === alatAktif) ??
      DAFTAR_12_UTILITAS[0]!,
    [alatAktif]
  );

  const hasilRegex = useMemo(
    () => ujiRegexLuring(regexPola, regexFlags, regexTeks),
    [regexPola, regexFlags, regexTeks]
  );
  const hasilTs = useMemo(() => konversiTimestamp(tsInput), [tsInput]);
  const hasilJwt = useMemo(
    () => (jwtInput.trim() ? decodeJwtLuring(jwtInput) : null),
    [jwtInput]
  );
  const hasilCase = useMemo(() => konversiSemuaCase(caseInput), [caseInput]);
  const hasilWarna = useMemo(() => konversiWarnaHex(colorInput), [colorInput]);
  const hasilDiff = useMemo(
    () => bandingkanTeksBaris(diffA, diffB),
    [diffA, diffB]
  );

  async function salinTeks(teks: string): Promise<void> {
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(teks);
      }
      aturPesanSalin("Berhasil di-copy!");
      window.setTimeout(() => aturPesanSalin(null), 1500);
    } catch {
      aturPesanSalin("Siap disalin.");
    }
  }

  return (
    <div className="space-y-5">
      <Kartu elevasi="angkat" kilau="teal">
        <KepalaKartu>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Wrench className="h-4 w-4 text-[var(--aksen-teal-siber)]" />
              <JudulKartu>Quick Tools (12 Utilitas Luring)</JudulKartu>
            </div>
            <div className="flex items-center gap-2">
              {pesanSalin && <Lencana varian="teal">{pesanSalin}</Lencana>}
              <Lencana varian="biru">100% Luring</Lencana>
            </div>
          </div>
          <DeskripsiKartu>
            12 utilitas developer harian yang berjalan langsung di perangkat tanpa koneksi internet.
          </DeskripsiKartu>
        </KepalaKartu>
      </Kartu>

      <div className="grid gap-5 lg:grid-cols-12">
        <Kartu className="lg:col-span-4 space-y-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-[var(--warna-teks-redup)]" />
            <input
              type="search"
              aria-label="Cari alat quick tools"
              placeholder="Cari utilitas (JSON, UUID, JWT...)"
              value={cariAlat}
              onChange={(e) => aturCariAlat(e.target.value)}
              className="h-9 w-full rounded-xl border border-[var(--warna-batas-kuat)] bg-white/70 dark:bg-[#101521]/75 pl-9 pr-3 text-xs text-[var(--warna-teks-utama)]"
            />
          </div>

          <div className="space-y-1.5 max-h-[500px] overflow-y-auto pr-1">
            {daftarTersaring.map((alat) => {
              const terpilih = alat.id === alatAktif;
              return (
                <button
                  key={alat.id}
                  type="button"
                  onClick={() => aturAlatAktif(alat.id)}
                  className={`w-full rounded-xl border p-2.5 text-left transition cursor-pointer ${
                    terpilih
                      ? "border-[var(--aksen-biru-elektrik)] bg-[#55A7FF]/10"
                      : "border-[var(--warna-batas)] hover:border-[var(--warna-batas-kuat)]"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold">{alat.nama}</span>
                    <Lencana varian="netral">{alat.kategori}</Lencana>
                  </div>
                  <p className="mt-0.5 text-[11px] text-[var(--warna-teks-sekunder)]">
                    {alat.deskripsi}
                  </p>
                </button>
              );
            })}
          </div>
        </Kartu>

        <Kartu elevasi="angkat" className="lg:col-span-8 space-y-4">
          <div className="border-b border-[var(--warna-batas)] pb-3">
            <h3 className="text-sm font-semibold">{definisiAktif.nama}</h3>
            <p className="text-xs text-[var(--warna-teks-sekunder)]">
              {definisiAktif.deskripsi}
            </p>
          </div>

          {alatAktif === "json_formatter" && (
            <div className="space-y-3">
              <textarea
                aria-label="Masukan JSON"
                rows={5}
                value={jsonInput}
                onChange={(e) => aturJsonInput(e.target.value)}
                className="w-full rounded-xl border border-[var(--warna-batas-kuat)] bg-white/75 dark:bg-[#101521]/80 p-3 font-kode text-xs"
              />
              <div className="flex flex-wrap gap-2">
                <Tombol
                  ukuran="kecil"
                  varian="utama"
                  onClick={() => {
                    const r = formatJsonLuring(jsonInput, "rapikan");
                    if (r.ok) {
                      aturJsonOutput(r.hasil);
                      aturJsonGalat(null);
                    } else {
                      aturJsonGalat(r.galat);
                    }
                  }}
                >
                  Rapikan JSON
                </Tombol>
                <Tombol
                  ukuran="kecil"
                  varian="kaca"
                  onClick={() => {
                    const r = formatJsonLuring(jsonInput, "minify");
                    if (r.ok) {
                      aturJsonOutput(r.hasil);
                      aturJsonGalat(null);
                    } else {
                      aturJsonGalat(r.galat);
                    }
                  }}
                >
                  Minify JSON
                </Tombol>
                {jsonOutput && (
                  <Tombol
                    ukuran="kecil"
                    varian="kaca"
                    ikonKiri={<Copy className="h-3.5 w-3.5" />}
                    onClick={() => void salinTeks(jsonOutput)}
                  >
                    Copy Hasil
                  </Tombol>
                )}
              </div>
              {jsonGalat && (
                <p className="text-xs text-[var(--aksen-bahaya)]">{jsonGalat}</p>
              )}
              <pre
                data-testid="output-json-formatter"
                className="rounded-xl border border-[var(--warna-batas)] bg-black/5 dark:bg-white/5 p-3 font-kode text-xs whitespace-pre-wrap"
              >
                {jsonOutput || "Klik Rapikan JSON atau Minify JSON."}
              </pre>
            </div>
          )}

          {alatAktif === "base64" && (
            <div className="space-y-3">
              <textarea
                aria-label="Masukan Base64"
                rows={4}
                value={b64Input}
                onChange={(e) => aturB64Input(e.target.value)}
                className="w-full rounded-xl border border-[var(--warna-batas-kuat)] bg-white/75 dark:bg-[#101521]/80 p-3 font-kode text-xs"
              />
              <div className="flex flex-wrap gap-2">
                <Tombol
                  ukuran="kecil"
                  varian="utama"
                  onClick={() => {
                    aturB64Output(encodeBase64Utf8(b64Input));
                    aturB64Galat(null);
                  }}
                >
                  Encode Base64
                </Tombol>
                <Tombol
                  ukuran="kecil"
                  varian="kaca"
                  onClick={() => {
                    const r = decodeBase64Utf8(b64Input);
                    if (r.ok) {
                      aturB64Output(r.hasil);
                      aturB64Galat(null);
                    } else {
                      aturB64Galat(r.galat);
                    }
                  }}
                >
                  Decode Base64
                </Tombol>
              </div>
              {b64Galat && (
                <p className="text-xs text-[var(--aksen-bahaya)]">{b64Galat}</p>
              )}
              <pre
                data-testid="output-base64"
                className="rounded-xl border border-[var(--warna-batas)] bg-black/5 dark:bg-white/5 p-3 font-kode text-xs whitespace-pre-wrap"
              >
                {b64Output}
              </pre>
            </div>
          )}

          {alatAktif === "url_encoder" && (
            <div className="space-y-3">
              <textarea
                aria-label="Masukan URL"
                rows={3}
                value={urlInput}
                onChange={(e) => aturUrlInput(e.target.value)}
                className="w-full rounded-xl border border-[var(--warna-batas-kuat)] bg-white/75 dark:bg-[#101521]/80 p-3 font-kode text-xs"
              />
              <div className="flex gap-2">
                <Tombol
                  ukuran="kecil"
                  varian="utama"
                  onClick={() => {
                    const r = konversiUrl(urlInput, "encode");
                    if (r.ok) {
                      aturUrlOutput(r.hasil);
                      aturUrlGalat(null);
                    } else {
                      aturUrlGalat(r.galat);
                    }
                  }}
                >
                  Encode URL
                </Tombol>
                <Tombol
                  ukuran="kecil"
                  varian="kaca"
                  onClick={() => {
                    const r = konversiUrl(urlInput, "decode");
                    if (r.ok) {
                      aturUrlOutput(r.hasil);
                      aturUrlGalat(null);
                    } else {
                      aturUrlGalat(r.galat);
                    }
                  }}
                >
                  Decode URL
                </Tombol>
              </div>
              {urlGalat && (
                <p className="text-xs text-[var(--aksen-bahaya)]">{urlGalat}</p>
              )}
              <pre
                data-testid="output-url"
                className="rounded-xl border border-[var(--warna-batas)] bg-black/5 dark:bg-white/5 p-3 font-kode text-xs whitespace-pre-wrap"
              >
                {urlOutput}
              </pre>
            </div>
          )}

          {alatAktif === "uuid_generator" && (
            <div className="space-y-3">
              <div className="flex flex-wrap items-end gap-2">
                <div className="w-36">
                  <KolomMasukan
                    label="Jumlah UUID (1–20)"
                    type="number"
                    min={1}
                    max={20}
                    value={jumlahUuid}
                    onChange={(e) => aturJumlahUuid(e.target.value)}
                  />
                </div>
                <Tombol
                  ukuran="sedang"
                  varian="utama"
                  onClick={() =>
                    aturDaftarUuid(buatDaftarUuid(Number(jumlahUuid) || 1))
                  }
                >
                  Generate UUID
                </Tombol>
                <Tombol
                  ukuran="sedang"
                  varian="kaca"
                  ikonKiri={<Copy className="h-3.5 w-3.5" />}
                  onClick={() => void salinTeks(daftarUuid.join("\n"))}
                >
                  Copy Semua
                </Tombol>
              </div>
              <pre
                data-testid="output-uuid"
                className="rounded-xl border border-[var(--warna-batas)] bg-black/5 dark:bg-white/5 p-3 font-kode text-xs whitespace-pre-wrap"
              >
                {daftarUuid.join("\n")}
              </pre>
            </div>
          )}

          {alatAktif === "hash_generator" && (
            <div className="space-y-3">
              <textarea
                aria-label="Teks untuk di-hash"
                rows={3}
                value={hashInput}
                onChange={(e) => aturHashInput(e.target.value)}
                className="w-full rounded-xl border border-[var(--warna-batas-kuat)] bg-white/75 dark:bg-[#101521]/80 p-3 font-kode text-xs"
              />
              <div className="flex flex-wrap items-center gap-2">
                <select
                  aria-label="Algoritma hash"
                  value={hashAlgoritma}
                  onChange={(e) =>
                    aturHashAlgoritma(
                      e.target.value as "SHA-1" | "SHA-256" | "SHA-512"
                    )
                  }
                  className="h-9 rounded-xl border border-[var(--warna-batas-kuat)] bg-white/80 dark:bg-[#101521] px-2.5 text-xs"
                >
                  <option value="SHA-1">SHA-1</option>
                  <option value="SHA-256">SHA-256</option>
                  <option value="SHA-512">SHA-512</option>
                </select>
                <Tombol
                  ukuran="sedang"
                  varian="utama"
                  onClick={() =>
                    void hitungHashTeks(hashInput, hashAlgoritma).then(
                      aturHashOutput
                    )
                  }
                >
                  Hitung Hash
                </Tombol>
              </div>
              <pre
                data-testid="output-hash"
                className="rounded-xl border border-[var(--warna-batas)] bg-black/5 dark:bg-white/5 p-3 font-kode text-xs break-all whitespace-pre-wrap"
              >
                {hashOutput || "Klik Hitung Hash."}
              </pre>
            </div>
          )}

          {alatAktif === "regex_tester" && (
            <div className="space-y-3">
              <div className="grid gap-2 sm:grid-cols-12">
                <div className="sm:col-span-9">
                  <KolomMasukan
                    label="Pola RegExp"
                    value={regexPola}
                    onChange={(e) => aturRegexPola(e.target.value)}
                  />
                </div>
                <div className="sm:col-span-3">
                  <KolomMasukan
                    label="Flags"
                    value={regexFlags}
                    onChange={(e) => aturRegexFlags(e.target.value)}
                  />
                </div>
              </div>
              <textarea
                aria-label="Teks uji regex"
                rows={3}
                value={regexTeks}
                onChange={(e) => aturRegexTeks(e.target.value)}
                className="w-full rounded-xl border border-[var(--warna-batas-kuat)] bg-white/75 dark:bg-[#101521]/80 p-3 font-kode text-xs"
              />
              {!hasilRegex.ok ? (
                <p className="text-xs text-[var(--aksen-bahaya)]">
                  {hasilRegex.galat}
                </p>
              ) : (
                <div className="space-y-2">
                  <Lencana varian="teal">
                    {hasilRegex.cocok.length} kecocokan ditemukan
                  </Lencana>
                  <div className="flex flex-wrap gap-1.5">
                    {hasilRegex.cocok.map((c, idx) => (
                      <span
                        key={`${c.indeks}-${idx}`}
                        className="rounded-lg border border-[#55A7FF]/40 bg-[#55A7FF]/10 px-2 py-0.5 font-kode text-xs"
                      >
                        {c.teks} (@{c.indeks})
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {alatAktif === "timestamp_converter" && (
            <div className="space-y-3">
              <div className="flex flex-wrap items-end gap-2">
                <div className="flex-1">
                  <KolomMasukan
                    label="Unix Timestamp (detik/ms) atau ISO 8601"
                    value={tsInput}
                    onChange={(e) => aturTsInput(e.target.value)}
                  />
                </div>
                <Tombol
                  ukuran="sedang"
                  varian="kaca"
                  onClick={() =>
                    aturTsInput(String(Math.floor(Date.now() / 1000)))
                  }
                >
                  Waktu Sekarang
                </Tombol>
              </div>
              {!hasilTs.ok ? (
                <p className="text-xs text-[var(--aksen-bahaya)]">
                  {hasilTs.galat}
                </p>
              ) : (
                <div className="grid gap-2 sm:grid-cols-2 text-xs">
                  <div className="rounded-xl border border-[var(--warna-batas)] p-3">
                    <span className="text-[var(--warna-teks-sekunder)]">
                      Unix Detik:
                    </span>
                    <p className="font-kode font-semibold">{hasilTs.detik}</p>
                  </div>
                  <div className="rounded-xl border border-[var(--warna-batas)] p-3">
                    <span className="text-[var(--warna-teks-sekunder)]">
                      ISO 8601:
                    </span>
                    <p className="font-kode font-semibold">{hasilTs.iso}</p>
                  </div>
                  <div className="rounded-xl border border-[var(--warna-batas)] p-3 sm:col-span-2">
                    <span className="text-[var(--warna-teks-sekunder)]">
                      Waktu Lokal:
                    </span>
                    <p className="font-semibold">{hasilTs.lokal}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {alatAktif === "jwt_decoder" && (
            <div className="space-y-3">
              <textarea
                aria-label="Token JWT"
                rows={3}
                placeholder="Tempel token JWT (header.payload.signature)..."
                value={jwtInput}
                onChange={(e) => aturJwtInput(e.target.value)}
                className="w-full rounded-xl border border-[var(--warna-batas-kuat)] bg-white/75 dark:bg-[#101521]/80 p-3 font-kode text-xs"
              />
              {hasilJwt && !hasilJwt.ok && (
                <p className="text-xs text-[var(--aksen-bahaya)]">
                  {hasilJwt.galat}
                </p>
              )}
              {hasilJwt && hasilJwt.ok && (
                <div className="space-y-2">
                  {hasilJwt.kedaluwarsa !== null && (
                    <Lencana
                      varian={hasilJwt.kedaluwarsa ? "bahaya" : "teal"}
                    >
                      {hasilJwt.kedaluwarsa
                        ? "Status: Kedaluwarsa (exp)"
                        : "Status: Belum Kedaluwarsa"}
                    </Lencana>
                  )}
                  <pre className="rounded-xl border border-[var(--warna-batas)] bg-black/5 dark:bg-white/5 p-3 font-kode text-xs whitespace-pre-wrap">
                    {JSON.stringify(
                      { header: hasilJwt.header, payload: hasilJwt.payload },
                      null,
                      2
                    )}
                  </pre>
                </div>
              )}
            </div>
          )}

          {alatAktif === "case_converter" && (
            <div className="space-y-3">
              <KolomMasukan
                label="Teks Masukan"
                value={caseInput}
                onChange={(e) => aturCaseInput(e.target.value)}
              />
              <div className="grid gap-2 sm:grid-cols-2">
                {Object.entries(hasilCase).map(([namaCase, nilai]) => (
                  <div
                    key={namaCase}
                    className="flex items-center justify-between gap-2 rounded-xl border border-[var(--warna-batas)] p-2.5 text-xs"
                  >
                    <div className="min-w-0">
                      <span className="block text-[11px] text-[var(--warna-teks-sekunder)]">
                        {namaCase}
                      </span>
                      <span className="font-kode font-semibold truncate block">
                        {nilai}
                      </span>
                    </div>
                    <Tombol
                      ukuran="kecil"
                      varian="kaca"
                      onClick={() => void salinTeks(nilai)}
                    >
                      Copy
                    </Tombol>
                  </div>
                ))}
              </div>
            </div>
          )}

          {alatAktif === "color_converter" && (
            <div className="space-y-3">
              <div className="flex items-end gap-3">
                <div className="flex-1">
                  <KolomMasukan
                    label="Kode Warna HEX"
                    value={colorInput}
                    onChange={(e) => aturColorInput(e.target.value)}
                  />
                </div>
                {hasilWarna.ok && (
                  <div
                    aria-label="Pratinjau warna"
                    className="h-9 w-16 rounded-xl border border-[var(--warna-batas-kuat)]"
                    style={{ backgroundColor: hasilWarna.hex }}
                  />
                )}
              </div>
              {!hasilWarna.ok ? (
                <p className="text-xs text-[var(--aksen-bahaya)]">
                  {hasilWarna.galat}
                </p>
              ) : (
                <div className="grid gap-2 sm:grid-cols-3 text-xs">
                  <div className="rounded-xl border border-[var(--warna-batas)] p-3 font-kode">
                    {hasilWarna.hex}
                  </div>
                  <div className="rounded-xl border border-[var(--warna-batas)] p-3 font-kode">
                    {hasilWarna.rgb}
                  </div>
                  <div className="rounded-xl border border-[var(--warna-batas)] p-3 font-kode">
                    {hasilWarna.hsl}
                  </div>
                </div>
              )}
            </div>
          )}

          {alatAktif === "diff_checker" && (
            <div className="space-y-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <textarea
                  aria-label="Teks A"
                  rows={4}
                  value={diffA}
                  onChange={(e) => aturDiffA(e.target.value)}
                  className="w-full rounded-xl border border-[var(--warna-batas-kuat)] bg-white/75 dark:bg-[#101521]/80 p-2.5 font-kode text-xs"
                />
                <textarea
                  aria-label="Teks B"
                  rows={4}
                  value={diffB}
                  onChange={(e) => aturDiffB(e.target.value)}
                  className="w-full rounded-xl border border-[var(--warna-batas-kuat)] bg-white/75 dark:bg-[#101521]/80 p-2.5 font-kode text-xs"
                />
              </div>
              <div className="rounded-xl border border-[var(--warna-batas)] p-3 space-y-1 font-kode text-xs">
                {hasilDiff.map((b, i) => (
                  <div
                    key={`${b.nomorBaris}-${b.tipe}-${i}`}
                    className={
                      b.tipe === "tambah"
                        ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded"
                        : b.tipe === "hapus"
                          ? "bg-rose-500/15 text-rose-700 dark:text-rose-300 px-2 py-0.5 rounded"
                          : "px-2 py-0.5 text-[var(--warna-teks-sekunder)]"
                    }
                  >
                    {b.tipe === "tambah" ? "+ " : b.tipe === "hapus" ? "- " : "  "}
                    {b.isi}
                  </div>
                ))}
              </div>
            </div>
          )}

          {alatAktif === "password_generator" && (
            <div className="space-y-3">
              <div className="flex flex-wrap items-end gap-3">
                <div className="w-32">
                  <KolomMasukan
                    label="Panjang (8–64)"
                    type="number"
                    min={8}
                    max={64}
                    value={sandiPanjang}
                    onChange={(e) => aturSandiPanjang(e.target.value)}
                  />
                </div>
                <Tombol
                  ukuran="sedang"
                  varian="utama"
                  onClick={() =>
                    aturSandiHasil(
                      buatKataSandiKripto({
                        panjang: Number(sandiPanjang) || 16,
                        hurufBesar: sandiBesar,
                        hurufKecil: sandiKecil,
                        angka: sandiAngka,
                        simbol: sandiSimbol,
                      })
                    )
                  }
                >
                  Generate Password
                </Tombol>
                <Tombol
                  ukuran="sedang"
                  varian="kaca"
                  ikonKiri={<Copy className="h-3.5 w-3.5" />}
                  onClick={() => void salinTeks(sandiHasil)}
                >
                  Copy Password
                </Tombol>
              </div>
              <div className="flex flex-wrap gap-3 text-xs">
                <label className="flex items-center gap-1.5">
                  <input
                    type="checkbox"
                    checked={sandiBesar}
                    onChange={(e) => aturSandiBesar(e.target.checked)}
                  />
                  A-Z
                </label>
                <label className="flex items-center gap-1.5">
                  <input
                    type="checkbox"
                    checked={sandiKecil}
                    onChange={(e) => aturSandiKecil(e.target.checked)}
                  />
                  a-z
                </label>
                <label className="flex items-center gap-1.5">
                  <input
                    type="checkbox"
                    checked={sandiAngka}
                    onChange={(e) => aturSandiAngka(e.target.checked)}
                  />
                  0-9
                </label>
                <label className="flex items-center gap-1.5">
                  <input
                    type="checkbox"
                    checked={sandiSimbol}
                    onChange={(e) => aturSandiSimbol(e.target.checked)}
                  />
                  Simbol
                </label>
              </div>
              <pre
                data-testid="output-password"
                className="rounded-xl border border-[var(--warna-batas)] bg-black/5 dark:bg-white/5 p-3 font-kode text-sm font-semibold break-all"
              >
                {sandiHasil}
              </pre>
            </div>
          )}
        </Kartu>
      </div>
    </div>
  );
}
