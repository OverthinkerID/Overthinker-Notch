# Catatan Perubahan (Changelog)

Semua perubahan penting pada **Overthinker Notch** dicatat pada berkas ini.

## [0.8.0] - 2026-11-22

### Ditambahkan (Fase 8 — Clipboard Manager)
- Menambahkan backend Rust SQLx `src-tauri/src/perintah/papanklip.rs` (`daftar_papanklip`, `simpan_item_papanklip`, `ubah_pin_papanklip`, `hapus_item_papanklip`, `bersihkan_papanklip_non_pin`) dengan validasi filter data sensitif dan aplikasi dikecualikan di sisi Rust.
- Membangun modul `src/papanklip/` (`PanelPapanklip`, `tokoPapanklip`, `layananPapanklip`, `filterPapanklip`, skema Zod):
  - Riwayat teks, kode, URL, dan gambar (paste langsung `Ctrl/Cmd+V` maupun `Ambil dari Clipboard OS`).
  - Auto-klasifikasi konten, pencarian real-time, filter tipe, **Pin** (aman dari `Hapus Non-Pin`), daftar **Aplikasi Dikecualikan**, **Filter Data Sensitif** (API key, token, private key, password), dan retensi terkonfigurasi.
- Menambahkan tab **Clipboard** di `RuangKerjaNotch`.
- Menambahkan 3 uji otomatis Fase 8 (`src/papanklip/__tests__/papanklip.test.tsx`); total **36/36 lulus**.

## [0.7.0] - 2026-11-22
- **Fase 7 — Code Snippet Vault:** Monaco Editor lokal tanpa CDN, 14 bahasa wajib + auto-detect, tags, kategori, favorit, Version History + rollback, Export/Import JSON (33/33 uji lulus).

## [0.6.0] - 2026-11-22
- **Fase 6 — Temporary File Storage:** Vault copy-only Rust `berkas.rs`, drag & drop multi-file, preview, rename, expiration, Recovery bin, project link (30/30 uji lulus).

## [0.5.0] - 2026-11-22
- **Fase 5 — Quick Notes:** Backend Rust SQLx `catatan.rs`, Quick Capture, Checklist interaktif, Auto-save, Tags, Pin, Arsip, Export `.md`/`.json` (26/26 uji lulus).

## [0.4.0] - 2026-11-22
- **Fase 4 — Database & Persistensi:** Skema SQLite 18 tabel, modul Rust SQLx + backup `VACUUM INTO` + retensi, `PanelDatabase`, dan penyesuaian bahasa santai Fase 1–4 (20/20 uji lulus).

## [0.3.0] - 2026-11-22
- `README.md`, `LICENSE` hak cipta terbatas, dan **Fase 3 — Mesin Notch** (14/14 uji lulus).

## [0.2.0] - 2026-11-22
- **Fase 1 Fondasi** & **Fase 2 Design System** (8/8 uji lulus).
