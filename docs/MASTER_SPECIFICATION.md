# Spesifikasi Utama — Overthinker Notch

**Versi Dokumen:** 0.2.0  
**Tanggal:** 22 November 2026  
**Bahasa Kode & Antarmuka:** Bahasa Indonesia (seluruh nama fungsi, komponen, perintah IPC, dan label UI)

## 1. Tujuan Produk

**Overthinker Notch** adalah aplikasi produktivitas desktop lintas platform (**macOS** dan **Windows**) berarsitektur lokal-pertama (*local-first*). Aplikasi ini memadukan antarmuka **Notch Adaptif / Pulau Melayang** dengan ruang kerja produktivitas modular untuk mengelola musik, lirik, catatan, berkas sementara, cuplikan kode, riwayat papan klip, prompt AI, proyek, sesi fokus, alat cepat, dan pemantau sistem.

## 2. Konvensi Penamaan Bahasa Indonesia

Sesuai ketentuan proyek:
- Seluruh label antarmuka, judul, tombol, pesan galat, dan status menggunakan **Bahasa Indonesia**.
- Seluruh nama fungsi, komponen React, toko state Zustand, skema Zod, dan perintah IPC Rust menggunakan **Bahasa Indonesia** (contoh: `Aplikasi`, `PanelKaca`, `Tombol`, `PeralihanTema`, `gunakanTokoTema`, `ambilInfoRuntime`, `ambil_info_runtime`, `periksa_kesehatan_aplikasi`).

## 3. Identitas Visual (Sistem Desain Fase 2)

| Nama Token | Kode Hex | Peran |
| :--- | :--- | :--- |
| Biru Elektrik | `#55A7FF` | Aksen utama, fokus aktif, tombol primer |
| Ungu Neon | `#A879FF` | Aksen sekunder, modul AI & kreativitas |
| Teal Siber | `#66E5D2` | Indikator aktif, fokus selesai, telemetri |
| Latar Gelap | `#101521` | Latar belakang utama Mode Gelap |
| Permukaan Gelap | `#171C29` | Panel kaca, kartu, laci melayang Mode Gelap |

Mendukung penuh **Mode Gelap** (bawaan) dan **Mode Terang** (`#F4F7FC` / `#FFFFFF`) dengan glassmorphism terkendali, transisi pegas Framer Motion, dan bundling 100% lokal tanpa CDN eksternal.

## 4. Ringkasan 11 Modul Inti (A–K)

1. **A. Kecerdasan Musik** — Deteksi sumber audio, metadata, kontrol media, Apple Music/Spotify/GSMTC, tangkapan audio sistem (`ScreenCaptureKit`/`WASAPI`), pengenalan lagu via penyedia resmi.
2. **B. Lirik** — Arsitektur penyedia lirik legal, pencarian manual, lirik tersinkronisasi vs teks polos yang dilabeli jujur, terjemahan, riwayat & cache lokal.
3. **C. Catatan Cepat** — Tangkap cepat, rich text, Markdown, daftar periksa, simpan otomatis, pencarian, tag, sematkan, arsip, ekspor.
4. **D. Penyimpanan Berkas Sementara** — Seret-dan-lepas ke brankas lokal (tidak pernah menghapus berkas asli pengguna), pratinjau, ubah nama, salin, buka, tampilkan di folder, kedaluwarsa, pemulihan, tautan proyek.
5. **E. Brankas Cuplikan Kode** — Monaco Editor lokal (14 bahasa wajib), deteksi bahasa, tag, kategori, favorit, riwayat versi, impor/ekspor.
6. **F. Pengelola Papan Klip** — Riwayat teks, kode, URL, gambar, pencarian, sematkan, aplikasi dikecualikan, penyaring data sensitif, retensi terkonfigurasi.
7. **G. Mode Fokus** — Pomodoro, Kerja Mendalam, pengatur waktu kustom, stopwatch, pengingat istirahat, statistik sesi, target, notifikasi akurat saat diminimalkan.
8. **H. Pustaka Prompt AI** — Kategori, templat variabel dinamis, salin, ubah, cari, favorit, tag, riwayat versi, impor/ekspor JSON.
9. **I. Ruang Kerja Proyek** — Multi-proyek dengan relasi SQLite ke tugas, catatan, berkas, cuplikan kode, prompt, progres, dan linimasa aktivitas.
10. **J. Alat Cepat** — 12 utilitas luring (Kalkulator, Pemformat & Validator JSON, Base64, Generator UUID, Pemilih & Palet Warna, Generator QR, Pratinjau Markdown, Konverter Stempel Waktu, Penghitung Kata, Konverter Satuan).
11. **K. Pemantau Sistem** — Data OS nyata (CPU, RAM, Baterai, Penyimpanan, Jaringan, Tanggal/Waktu, Notifikasi) tanpa nilai contoh palsu.
