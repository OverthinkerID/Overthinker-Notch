# Catatan Perubahan (Changelog)

Semua perubahan penting pada **Overthinker Notch** dicatat pada berkas ini.

## [0.5.0] - 2026-11-22

### Ditambahkan (Fase 5 — Quick Notes)
- Menambahkan backend Rust SQLx `src-tauri/src/perintah/catatan.rs` (`daftar_catatan`, `simpan_catatan`, `hapus_catatan`) dengan sinkronisasi relasi tabel `notes`, `tags`, dan `note_tags`.
- Membangun modul frontend `src/catatan/` lengkap (`PanelCatatan`, `tokoCatatan`, `layananCatatan`, `formatCatatan`, skema Zod):
  - Quick Capture di `PanelCatatan` dan langsung dari `KapsulNotch` (`Simpan ke Quick Notes`).
  - Format **Markdown**, **Rich Text**, dan **Checklist interaktif** (tambah item & centang `- [ ]` / `- [x]`), lengkap dengan toolbar format dan toggle **Preview**.
  - **Auto-save** otomatis (debounce 300ms), **Search** real-time, **Tags**, **Pin** (selalu di atas), **Arsipkan / Pulihkan**, dan **Export** ke `.md` maupun `.json`.
- Menambahkan tab **Quick Notes** di `RuangKerjaNotch`.
- Menambahkan 6 uji otomatis Fase 5 (`src/catatan/__tests__/catatan.test.tsx`); total **26/26 lulus**.

## [0.4.0] - 2026-11-22
- **Fase 4 — Database & Persistensi:** Skema SQLite 18 tabel (`0001_inisialisasi_skema.sql`), modul Rust SQLx + `VACUUM INTO` backup + retensi, `PanelDatabase`, dan penyesuaian copy UI santai + istilah teknis Inggris (20/20 uji lulus).

## [0.3.0] - 2026-11-22
- Menambahkan `README.md`, `LICENSE` hak cipta terbatas, dan **Fase 3 — Mesin Notch** (14/14 uji lulus).

## [0.2.0] - 2026-11-22
- Inisialisasi **Fase 1 Fondasi** & **Fase 2 Design System** (8/8 uji lulus).
