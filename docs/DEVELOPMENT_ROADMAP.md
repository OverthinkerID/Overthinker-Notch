# Peta Jalan Pengembangan — Overthinker Notch

**Versi Dokumen:** 0.2.0  
**Tanggal:** 22 November 2026  

## Urutan 18 Fase Pengembangan

| Fase | Judul | Status |
| :--- | :--- | :--- |
| **1** | **Fondasi Proyek** | Selesai (Kode & Struktur Siap; Build Rust menunggu `rustup` lokal) |
| **2** | **Sistem Desain** | **Selesai (Diverifikasi Vitest & Build TypeScript/Vite)** |
| **3** | **Mesin Notch (Notch Adaptif & Pulau Melayang)** | Berikutnya |
| **4** | **Basis Data & Persistensi (SQLite + SQLx 18 Tabel)** | Belum Dimulai |
| **5** | **Catatan Cepat** | Belum Dimulai |
| **6** | **Penyimpanan Berkas Sementara** | Belum Dimulai |
| **7** | **Brankas Cuplikan Kode (Monaco Editor)** | Belum Dimulai |
| **8** | **Pengelola Papan Klip** | Belum Dimulai |
| **9** | **Mesin Fokus** | Belum Dimulai |
| **10** | **Mesin Musik** | Belum Dimulai |
| **11** | **Mesin Lirik** | Belum Dimulai |
| **12** | **Pustaka Prompt AI** | Belum Dimulai |
| **13** | **Ruang Kerja Proyek** | Belum Dimulai |
| **14** | **Alat Cepat (12 Utilitas Luring)** | Belum Dimulai |
| **15** | **Pemantau Sistem (Data OS Nyata)** | Belum Dimulai |
| **16** | **Integrasi macOS & Windows** | Belum Dimulai |
| **17** | **Penjaminan Mutu (QA)** | Belum Dimulai |
| **18** | **Rekayasa Rilis (DMG & NSIS/MSI)** | Belum Dimulai |

## Rencana Fase 3 (Mesin Notch)

1. Implementasi mesin status deterministik 9 status (`siaga`, `ringkas`, `diperluas`, `musik`, `catatan`, `kode`, `berkas`, `fokus`, `dasbor`) menggunakan Zustand tanpa menghapus state masukan aktif.
2. Mode **Notch Adaptif** (deteksi area aman layar & fallback otomatis) dan **Pulau Melayang** (seret, ubah ukuran, selalu di atas, dukungan multi-monitor, simpan posisi jendela).
3. Pintasan papan ketik global (*global shortcuts*) dan perintah IPC Rust jendela di `src-tauri/src/perintah/jendela.rs`.
