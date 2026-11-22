# Catatan Perubahan (Changelog)

Semua perubahan penting pada **Overthinker Notch** dicatat pada berkas ini.

## [0.6.0] - 2026-11-22

### Ditambahkan (Fase 6 — Temporary File Storage)
- Menambahkan backend Rust vault `src-tauri/src/perintah/berkas.rs` (`daftar_berkas`, `impor_berkas_sementara`, `ubah_nama_berkas`, `hapus_sementara_berkas`, `pulihkan_berkas`, `hapus_permanen_berkas`, `tampilkan_berkas_di_folder`) dengan jaminan keamanan: impor selalu menggunakan `fs::copy` ke folder vault internal dan tidak pernah menyentuh atau menghapus file asli pengguna.
- Membangun modul frontend `src/berkas/` lengkap (`PanelBerkas`, `tokoBerkas`, `layananBerkas`, `formatBerkas`, skema Zod):
  - Drag & drop multi-file import + pemilih file perangkat.
  - Preview teks/kode dan gambar langsung di panel, Rename inline, Copy, Buka/Unduh, Reveal in Folder (Finder/Explorer di Tauri native).
  - Manajemen kedaluwarsa (`24 Jam`, `7 Hari`, `14 Hari`, `30 Hari`, `Tanpa Batas`), `Bersihkan Kedaluwarsa`, tab **Recovery** (Pulihkan & Hapus Permanen salinan vault), dan tautan ke Project.
- Menambahkan tab **Temp Files** di `RuangKerjaNotch` dan tombol impor cepat di status `Berkas` pada `KapsulNotch`.
- Menambahkan 4 uji otomatis Fase 6 (`src/berkas/__tests__/berkas.test.tsx`); total **30/30 lulus**.

## [0.5.0] - 2026-11-22
- **Fase 5 — Quick Notes:** Backend Rust SQLx `catatan.rs`, `PanelCatatan`, integrasi Quick Capture di `KapsulNotch`, Checklist interaktif, Auto-save, Tags, Pin, Arsip, Export `.md`/`.json` (26/26 uji lulus).

## [0.4.0] - 2026-11-22
- **Fase 4 — Database & Persistensi:** Skema SQLite 18 tabel, modul Rust SQLx + backup `VACUUM INTO` + retensi, `PanelDatabase`, dan penyesuaian bahasa santai Fase 1–4 (20/20 uji lulus).

## [0.3.0] - 2026-11-22
- `README.md`, `LICENSE` hak cipta terbatas, dan **Fase 3 — Mesin Notch** (14/14 uji lulus).

## [0.2.0] - 2026-11-22
- **Fase 1 Fondasi** & **Fase 2 Design System** (8/8 uji lulus).
