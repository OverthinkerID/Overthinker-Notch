import type { BarisDiff, HasilRegexCocok } from "@/utilitas/tipe/tipeUtilitas";

// 1. JSON Formatter & Validator
export function formatJsonLuring(
  masukan: string,
  mode: "rapikan" | "minify"
): { ok: true; hasil: string } | { ok: false; galat: string } {
  try {
    const parsed = JSON.parse(masukan);
    return {
      ok: true,
      hasil:
        mode === "rapikan"
          ? JSON.stringify(parsed, null, 2)
          : JSON.stringify(parsed),
    };
  } catch (err) {
    return {
      ok: false,
      galat: err instanceof Error ? err.message : "JSON nggak valid.",
    };
  }
}

// 2. Base64 Encode / Decode (UTF-8 aman)
export function encodeBase64Utf8(teks: string): string {
  const bytes = new TextEncoder().encode(teks);
  let biner = "";
  for (const b of bytes) {
    biner += String.fromCharCode(b);
  }
  return btoa(biner);
}

export function decodeBase64Utf8(
  kode: string
): { ok: true; hasil: string } | { ok: false; galat: string } {
  try {
    const biner = atob(kode.trim());
    const bytes = Uint8Array.from(biner, (c) => c.charCodeAt(0));
    return { ok: true, hasil: new TextDecoder().decode(bytes) };
  } catch {
    return { ok: false, galat: "Format Base64 nggak valid." };
  }
}

// 3. URL Encode / Decode
export function konversiUrl(
  teks: string,
  mode: "encode" | "decode"
): { ok: true; hasil: string } | { ok: false; galat: string } {
  try {
    return {
      ok: true,
      hasil:
        mode === "encode"
          ? encodeURIComponent(teks)
          : decodeURIComponent(teks),
    };
  } catch {
    return { ok: false, galat: "String URL nggak valid untuk di-decode." };
  }
}

// 4. UUID v4 Generator
export function buatDaftarUuid(jumlah: number): string[] {
  const aman = Math.min(20, Math.max(1, Math.floor(jumlah)));
  const hasil: string[] = [];
  for (let i = 0; i < aman; i++) {
    if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
      hasil.push(crypto.randomUUID());
    } else {
      hasil.push(
        "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
          const r = (Math.random() * 16) | 0;
          const v = c === "x" ? r : (r & 0x3) | 0x8;
          return v.toString(16);
        })
      );
    }
  }
  return hasil;
}

// 5. Hash Generator (Web Crypto API)
export async function hitungHashTeks(
  teks: string,
  algoritma: "SHA-1" | "SHA-256" | "SHA-512"
): Promise<string> {
  const data = new TextEncoder().encode(teks);
  const buffer = await crypto.subtle.digest(algoritma, data);
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// 6. Regex Tester
export function ujiRegexLuring(
  pola: string,
  flags: string,
  teksUji: string
):
  | { ok: true; cocok: HasilRegexCocok[] }
  | { ok: false; galat: string } {
  if (!pola) {
    return { ok: true, cocok: [] };
  }
  try {
    const flagsAman = flags.includes("g") ? flags : `${flags}g`;
    const re = new RegExp(pola, flagsAman);
    const cocok: HasilRegexCocok[] = [];
    for (const m of teksUji.matchAll(re)) {
      cocok.push({
        teks: m[0] ?? "",
        indeks: m.index ?? 0,
        grup: m.slice(1).map((g) => g ?? ""),
      });
      if (cocok.length >= 200) break;
    }
    return { ok: true, cocok };
  } catch (err) {
    return {
      ok: false,
      galat: err instanceof Error ? err.message : "Pola regex nggak valid.",
    };
  }
}

// 7. Timestamp Converter
export function konversiTimestamp(masukan: string):
  | {
      ok: true;
      detik: number;
      milidetik: number;
      iso: string;
      lokal: string;
    }
  | { ok: false; galat: string } {
  const bersih = masukan.trim();
  if (!bersih) {
    return { ok: false, galat: "Masukkan angka timestamp atau tanggal ISO." };
  }
  const angka = Number(bersih);
  const date = Number.isFinite(angka)
    ? new Date(Math.abs(angka) < 1e12 ? angka * 1000 : angka)
    : new Date(bersih);

  if (Number.isNaN(date.getTime())) {
    return { ok: false, galat: "Format timestamp atau tanggal nggak dikenali." };
  }

  return {
    ok: true,
    detik: Math.floor(date.getTime() / 1000),
    milidetik: date.getTime(),
    iso: date.toISOString(),
    lokal: date.toLocaleString("id-ID", {
      dateStyle: "full",
      timeStyle: "medium",
    }),
  };
}

// 8. JWT Decoder (Inspeksi Luring)
function decodeBase64Url(bagian: string): string {
  const normal = bagian.replace(/-/g, "+").replace(/_/g, "/");
  const pad = normal.length % 4 === 0 ? "" : "=".repeat(4 - (normal.length % 4));
  const decoded = decodeBase64Utf8(normal + pad);
  if (!decoded.ok) {
    throw new Error("Bagian Base64URL JWT nggak valid.");
  }
  return decoded.hasil;
}

export function decodeJwtLuring(token: string):
  | {
      ok: true;
      header: Record<string, unknown>;
      payload: Record<string, unknown>;
      kedaluwarsa: boolean | null;
    }
  | { ok: false; galat: string } {
  const bagian = token.trim().split(".");
  if (bagian.length < 2) {
    return { ok: false, galat: "Token JWT minimal punya header dan payload." };
  }
  try {
    const header = JSON.parse(decodeBase64Url(bagian[0]!)) as Record<
      string,
      unknown
    >;
    const payload = JSON.parse(decodeBase64Url(bagian[1]!)) as Record<
      string,
      unknown
    >;
    const exp = typeof payload.exp === "number" ? payload.exp : null;
    const kedaluwarsa = exp !== null ? exp * 1000 < Date.now() : null;
    return { ok: true, header, payload, kedaluwarsa };
  } catch (err) {
    return {
      ok: false,
      galat: err instanceof Error ? err.message : "Gagal mendekode JWT.",
    };
  }
}

// 9. Case Converter
function pecahKata(teks: string): string[] {
  return teks
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[_\-]+/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
}

export function konversiSemuaCase(teks: string): Record<string, string> {
  const kata = pecahKata(teks);
  if (kata.length === 0) {
    return {
      camelCase: "",
      PascalCase: "",
      snake_case: "",
      "kebab-case": "",
      UPPER_SNAKE_CASE: "",
      "Title Case": "",
    };
  }
  const kecil = kata.map((k) => k.toLowerCase());
  const kapital = kecil.map((k) => k.charAt(0).toUpperCase() + k.slice(1));

  return {
    camelCase: [kecil[0]!, ...kapital.slice(1)].join(""),
    PascalCase: kapital.join(""),
    snake_case: kecil.join("_"),
    "kebab-case": kecil.join("-"),
    UPPER_SNAKE_CASE: kecil.join("_").toUpperCase(),
    "Title Case": kapital.join(" "),
  };
}

// 10. Color Converter (HEX -> RGB & HSL)
export function konversiWarnaHex(hex: string):
  | { ok: true; hex: string; rgb: string; hsl: string }
  | { ok: false; galat: string } {
  const bersih = hex.trim().replace(/^#/, "");
  const penuh =
    bersih.length === 3
      ? bersih
          .split("")
          .map((c) => c + c)
          .join("")
      : bersih;

  if (!/^[0-9a-fA-F]{6}$/.test(penuh)) {
    return { ok: false, galat: "Masukkan warna HEX 3 atau 6 digit (misal #55A7FF)." };
  }

  const r = parseInt(penuh.slice(0, 2), 16);
  const g = parseInt(penuh.slice(2, 4), 16);
  const b = parseInt(penuh.slice(4, 6), 16);

  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  let h = 0;
  let s = 0;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === rn) h = (gn - bn) / d + (gn < bn ? 6 : 0);
    else if (max === gn) h = (bn - rn) / d + 2;
    else h = (rn - gn) / d + 4;
    h /= 6;
  }

  return {
    ok: true,
    hex: `#${penuh.toUpperCase()}`,
    rgb: `rgb(${r}, ${g}, ${b})`,
    hsl: `hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`,
  };
}

// 11. Diff Checker (Baris demi baris)
export function bandingkanTeksBaris(
  teksA: string,
  teksB: string
): BarisDiff[] {
  const barisA = teksA.split("\n");
  const barisB = teksB.split("\n");
  const maks = Math.max(barisA.length, barisB.length);
  const hasil: BarisDiff[] = [];

  for (let i = 0; i < maks; i++) {
    const a = barisA[i];
    const b = barisB[i];
    if (a === b && a !== undefined) {
      hasil.push({ tipe: "sama", isi: a, nomorBaris: i + 1 });
    } else {
      if (a !== undefined) {
        hasil.push({ tipe: "hapus", isi: a, nomorBaris: i + 1 });
      }
      if (b !== undefined) {
        hasil.push({ tipe: "tambah", isi: b, nomorBaris: i + 1 });
      }
    }
  }
  return hasil;
}

// 12. Password Generator
export function buatKataSandiKripto(opsi: {
  panjang: number;
  hurufBesar: boolean;
  hurufKecil: boolean;
  angka: boolean;
  simbol: boolean;
}): string {
  let kolam = "";
  if (opsi.hurufBesar) kolam += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  if (opsi.hurufKecil) kolam += "abcdefghijklmnopqrstuvwxyz";
  if (opsi.angka) kolam += "0123456789";
  if (opsi.simbol) kolam += "!@#$%^&*()-_=+[]{};:,.?";
  if (!kolam) {
    kolam = "abcdefghijklmnopqrstuvwxyz0123456789";
  }

  const panjangAman = Math.min(64, Math.max(8, Math.floor(opsi.panjang)));
  const acak = new Uint32Array(panjangAman);
  crypto.getRandomValues(acak);

  let hasil = "";
  for (let i = 0; i < panjangAman; i++) {
    hasil += kolam[acak[i]! % kolam.length];
  }
  return hasil;
}
