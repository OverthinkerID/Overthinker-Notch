# Laporan Pengujian — Overthinker Notch

**Terakhir Diperbarui:** 22 November 2026  
**Versi:** 0.4.0  
**Fase:** Fase 4 — Database & Persistensi  

## 1. Ringkasan Eksekusi Pengujian

| Jenis Pengujian | Perintah | Status | Hasil |
| :--- | :--- | :--- | :--- |
| Uji Nyata Migrasi SQLite 18 Tabel (`sqlite3` 3.54.0) | `npm run test` | **LULUS (3/3)** | `src/database/__tests__/skemaSqlite.test.ts` (128 ms) |
| Uji UI & Persistensi `PanelDatabase` (Fase 4) | `npm run test` | **LULUS (3/3)** | `src/database/__tests__/panelDatabase.test.tsx` (366 ms) |
| Uji Sistem Desain (Fase 2) | `npm run test` | **LULUS (8/8)** | `src/sistem-desain/__tests__/sistemDesain.test.tsx` (294 ms) |
| Uji Mesin Notch (Fase 3) | `npm run test` | **LULUS (6/6)** | `src/notch/__tests__/mesinNotch.test.tsx` (337 ms) |
| **Total Pengujian Otomatis** | `npm run test` | **LULUS (20/20)** | 4 berkas uji lulus dalam 1,40 detik |
| Typecheck & Build Produksi | `npm run build` | **LULUS** | `tsc --noEmit` 0 galat; `vite build` 2038 modul dalam 1,43 detik |
| Uji Unit Rust SQLx (`cargo test`) | `cargo test` | **BELUM DIJALANKAN** | `rustc`/`cargo` belum terpasang di PATH standar |

## 2. Kasus Uji Baru Fase 4

### A. Verifikasi SQLite Nyata (`skemaSqlite.test.ts`)
1. Menjalankan berkas migrasi `src-tauri/migrations/0001_inisialisasi_skema.sql` pada SQLite 3.54.0 dan memastikan seluruh **18 tabel wajib** terbentuk.
2. Membuktikan `PRAGMA foreign_keys = ON` menolak insert ilegal (`FOREIGN KEY constraint failed`), menguji relasi `workspaces -> projects -> tasks` serta `notes + tags + note_tags`, dan memverifikasi `PRAGMA integrity_check` mengembalikan `ok`.
3. Membuktikan backup atomik `VACUUM INTO` menghasilkan berkas `.db` terpisah yang utuh dan dapat dibaca kembali setelah dibuka ulang.

### B. Uji Frontend `PanelDatabase` (`panelDatabase.test.tsx`)
1. Menampilkan seluruh 18 tabel SQLite dan menjalankan tombol `Integrity Check` (`Sehat (OK)`).
2. Membuat backup manual dengan catatan kustom dan memverifikasi penyimpanan persisten.
3. Mengubah `Retensi Clipboard (Hari)` ke `60`, menyimpan, lalu klik `Refresh` untuk memastikan nilai bertahan (menangkap dan memperbaiki bug UX input angka yang sebelumnya langsung menimpa nilai menjadi `1` saat dikosongkan).

## 3. Keluaran Build Produksi (`npm run build`)

```text
dist/index.html                   0.52 kB │ gzip:   0.36 kB
dist/assets/index-BXZBkZMq.css   29.87 kB │ gzip:   6.23 kB
dist/assets/index-CYMnMdWp.js   508.96 kB │ gzip: 152.68 kB
```
