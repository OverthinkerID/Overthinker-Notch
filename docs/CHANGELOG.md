# Catatan Perubahan (Changelog)

Semua perubahan penting pada **Overthinker Notch** dicatat pada berkas ini.

## [0.2.0] - 2026-11-22

### Ditambahkan (Fase 1 Fondasi & Fase 2 Sistem Desain)
- Membangun fondasi proyek Tauri 2 + React 19 + TypeScript (mode ketat) + Vite + Tailwind CSS v4 + Framer Motion + Zustand + Zod + Vitest + React Testing Library.
- Menerapkan konvensi penamaan **100% Bahasa Indonesia** untuk seluruh fungsi, komponen, toko state, skema validasi, perintah IPC Rust, dan teks antarmuka.
- Menambahkan backend inti Rust (`src-tauri/`) dengan `jalankan_aplikasi`, `ambil_info_runtime`, `periksa_kesehatan_aplikasi`, `deteksi_kapabilitas_os`, tipe galat `GalatAplikasi`, kapabilitas hak akses minimal (`capabilities/default.json`), dan unit test Rust.
- Membangun Sistem Desain lengkap (`src/sistem-desain/`):
  - Palet warna identitas (`#55A7FF`, `#A879FF`, `#66E5D2`, `#101521`, `#171C29`) untuk Mode Gelap dan Mode Terang dengan penyimpanan lokal persisten (`tokoTema.ts`).
  - Efek glassmorphism dan kilau terkendali (`utama.css`, `PanelKaca`).
  - Komponen inti siap pakai: `Tombol`, `Lencana`, `Kartu`, `KolomMasukan`, `AreaTeks`, `Sakelar`, `TabNavigasi`, `PeralihanTema`, `BatasGalat`, dan `EtalaseSistemDesain`.
  - Suite pengujian otomatis Vitest + React Testing Library (`sistemDesain.test.tsx`).
- Menambahkan dan memperbarui 6 dokumen proyek di folder `docs/`.
