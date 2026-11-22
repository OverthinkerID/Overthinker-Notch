export type IdAlatUtilitas =
  | "json_formatter"
  | "base64"
  | "url_encoder"
  | "uuid_generator"
  | "hash_generator"
  | "regex_tester"
  | "timestamp_converter"
  | "jwt_decoder"
  | "case_converter"
  | "color_converter"
  | "diff_checker"
  | "password_generator";

export interface DefinisiAlatUtilitas {
  id: IdAlatUtilitas;
  nama: string;
  kategori: "Format & Data" | "Kripto & Token" | "Teks & Warna" | "Developer";
  deskripsi: string;
}

export const DAFTAR_12_UTILITAS: readonly DefinisiAlatUtilitas[] = [
  {
    id: "json_formatter",
    nama: "JSON Formatter & Validator",
    kategori: "Format & Data",
    deskripsi: "Rapikan, minify, dan validasi struktur JSON secara luring.",
  },
  {
    id: "base64",
    nama: "Base64 Encode / Decode",
    kategori: "Format & Data",
    deskripsi: "Konversi teks UTF-8 ke Base64 dan sebaliknya.",
  },
  {
    id: "url_encoder",
    nama: "URL Encode / Decode",
    kategori: "Format & Data",
    deskripsi: "Encode dan decode komponen URL secara aman.",
  },
  {
    id: "uuid_generator",
    nama: "UUID v4 Generator",
    kategori: "Kripto & Token",
    deskripsi: "Buat 1–20 UUID v4 acak memakai Web Crypto API.",
  },
  {
    id: "hash_generator",
    nama: "Hash Generator (SHA)",
    kategori: "Kripto & Token",
    deskripsi: "Hitung digest SHA-1, SHA-256, dan SHA-512 secara lokal.",
  },
  {
    id: "regex_tester",
    nama: "Regex Tester",
    kategori: "Developer",
    deskripsi: "Uji pola RegExp, flags, dan tangkap grup kecocokan.",
  },
  {
    id: "timestamp_converter",
    nama: "Timestamp Converter",
    kategori: "Developer",
    deskripsi: "Konversi Unix timestamp (detik/ms) ke ISO 8601 & waktu lokal.",
  },
  {
    id: "jwt_decoder",
    nama: "JWT Decoder",
    kategori: "Kripto & Token",
    deskripsi: "Inspeksi header, payload, dan status kedaluwarsa token JWT.",
  },
  {
    id: "case_converter",
    nama: "Case Converter",
    kategori: "Teks & Warna",
    deskripsi: "Ubah teks ke camelCase, PascalCase, snake_case, kebab-case, dll.",
  },
  {
    id: "color_converter",
    nama: "Color Converter",
    kategori: "Teks & Warna",
    deskripsi: "Konversi warna HEX, RGB, dan HSL dengan pratinjau langsung.",
  },
  {
    id: "diff_checker",
    nama: "Diff Checker",
    kategori: "Developer",
    deskripsi: "Bandingkan dua blok teks baris demi baris.",
  },
  {
    id: "password_generator",
    nama: "Password Generator",
    kategori: "Kripto & Token",
    deskripsi: "Buat kata sandi kriptografis dengan panjang & karakter kustom.",
  },
] as const;

export interface HasilRegexCocok {
  teks: string;
  indeks: number;
  grup: string[];
}

export interface BarisDiff {
  tipe: "sama" | "tambah" | "hapus";
  isi: string;
  nomorBaris: number;
}
