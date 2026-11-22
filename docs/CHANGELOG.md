# Catatan Perubahan (Changelog)

Semua perubahan penting pada **Overthinker Notch** dicatat pada berkas ini.

## [0.3.0] - 2026-11-22

### Ditambahkan (Dokumentasi Lisensi & Fase 3 Mesin Notch)
- Menambahkan `README.md` profesional berbahasa Indonesia dan `LICENSE` Hak Cipta Terbatas (*All Rights Reserved* — mewajibkan izin tertulis sebelum penggunaan).
- Menambahkan perintah jendela native Rust `src-tauri/src/perintah/jendela.rs` (`ambil_daftar_monitor`, `terapkan_geometri_jendela`, deteksi area aman notch macOS, validasi geometri sisi Rust, dan unit test Rust).
- Membangun **Mesin Notch** (`src/notch/`):
  - Mode **Notch Adaptif** dengan deteksi dimensi/area aman layar dan fallback otomatis ke **Pulau Melayang**.
  - Mode **Pulau Melayang** yang dapat diseret, diubah ukurannya, mendukung `Selalu di Atas`, multi-monitor, dan menyimpan posisi/ukuran di `localStorage`.
  - Mesin 9 status deterministik (`siaga`, `ringkas`, `diperluas`, `musik`, `catatan`, `kode`, `berkas`, `fokus`, `dasbor`) dengan riwayat kembali dan perlindungan buffer masukan (`bufferMasukan`) agar teks tidak hilang saat transisi.
  - Pintasan papan ketik (`Alt+Spasi`, `Alt+M`, `Alt+1..6`, `Escape`).
  - Komponen `KapsulNotch` dan `RuangKerjaNotch` terintegrasi dengan `EtalaseSistemDesain`.
- Menambahkan 6 uji otomatis Fase 3 (`src/notch/__tests__/mesinNotch.test.tsx`); total 14/14 lulus.

### Diperbaiki
- Memperbaiki sinkronisasi `statusTerakhirDiperluas` pada `kembaliKeStatusSebelumnya` di `tokoNotch.ts` agar `bukaTutupNotch` selalu membuka kembali status terakhir yang benar.

## [0.2.0] - 2026-11-22

### Ditambahkan (Fase 1 Fondasi & Fase 2 Sistem Desain)
- Inisialisasi fondasi Tauri 2 + React 19 + TypeScript + Vite + Tailwind CSS v4 + Framer Motion + Zustand + Zod + Vitest dalam 100% Bahasa Indonesia.
- Sistem Desain Mode Gelap/Terang, 5 warna identitas, glassmorphism, 8 komponen inti, `EtalaseSistemDesain`, dan 8 uji Vitest.
