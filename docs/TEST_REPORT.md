# Laporan Pengujian — Overthinker Notch

**Terakhir Diperbarui:** 22 November 2026  
**Versi:** 0.3.0  
**Fase:** Fase 3 — Mesin Notch  

## 1. Ringkasan Eksekusi Pengujian

| Jenis Pengujian | Perintah | Status | Hasil |
| :--- | :--- | :--- | :--- |
| Uji Unit & UI Sistem Desain (Fase 2) | `npm run test` | **LULUS (8/8)** | `src/sistem-desain/__tests__/sistemDesain.test.tsx` (279 ms) |
| Uji Unit & UI Mesin Notch (Fase 3) | `npm run test` | **LULUS (6/6)** | `src/notch/__tests__/mesinNotch.test.tsx` (314 ms) |
| Total Pengujian Frontend | `npm run test` | **LULUS (14/14)** | 2 berkas uji lulus dalam 1,25 detik, 0 peringatan |
| Pemeriksaan Tipe & Build Produksi | `npm run build` | **LULUS** | `tsc --noEmit` 0 galat; `vite build` 2032 modul berhasil dalam 1,40 detik |
| Uji Unit Backend Rust (`jendela.rs`, `sistem.rs`) | `cargo test` | **BELUM DIJALANKAN** | `rustc`/`cargo` belum terpasang di PATH standar |
| Build Native Tauri 2 | `npm run tauri build -- --debug` | **BELUM DIJALANKAN** | Menunggu instalasi Rust toolchain (`rustup`) |

## 2. Kasus Uji Baru Fase 3 (`mesinNotch.test.tsx`)

1. Memverifikasi aktivasi **Notch Adaptif** pada monitor bernotch dan **fallback otomatis ke Pulau Melayang** pada monitor standar.
2. Memverifikasi pembatasan koordinat (*clamping*) Pulau Melayang agar selalu berada di dalam area aman layar (`hitungPosisiAman`).
3. Memverifikasi transisi deterministik 9 status, riwayat `kembaliKeStatusSebelumnya`, serta `bukaTutupNotch` (menangkap dan memperbaiki bug sinkronisasi `statusTerakhirDiperluas`).
4. Memverifikasi persistensi mode tampilan, posisi X/Y, ukuran diperluas, dan status `Selalu di Atas` di `localStorage`.
5. Memverifikasi bahwa teks masukan pengguna (`Draf Catatan Cepat`) tidak hilang saat berpindah antar-status (`Catatan -> Musik -> Siaga -> Catatan`).
6. Memverifikasi pintasan papan ketik `Alt+2` (Catatan), `Alt+M` (Ganti Mode), dan `Escape` (Siaga).

## 3. Keluaran Build Produksi (`npm run build`)

```text
dist/index.html                   0.52 kB │ gzip:   0.36 kB
dist/assets/index-BH0w7qPE.css   29.31 kB │ gzip:   6.16 kB
dist/assets/index-DDR13G3t.js   495.09 kB │ gzip: 149.29 kB
```
