# Catatan Perubahan (Changelog)

Semua perubahan penting pada **Overthinker Notch** dicatat pada berkas ini.

## [0.7.0] - 2026-11-22

### Ditambahkan (Fase 7 — Code Snippet Vault)
- Menginstal `monaco-editor` dan `@monaco-editor/react` secara lokal tanpa CDN eksternal (`loader.config({ monaco })`).
- Menambahkan backend Rust SQLx `src-tauri/src/perintah/cuplikan.rs` (`daftar_cuplikan`, `simpan_cuplikan`, `hapus_cuplikan`) dengan pencatatan otomatis `snippet_versions` setiap kali kode berubah.
- Membangun modul `src/cuplikan/` (`EditorKodeMonaco`, `PanelCuplikan`, `tokoCuplikan`, `layananCuplikan`, `deteksiBahasa`, skema Zod):
  - Dukungan penuh 14 bahasa wajib (HTML, CSS, JavaScript, TypeScript, Python, Java, C++, C#, SQL, JSON, YAML, Bash, Rust, PHP) beserta deteksi bahasa otomatis.
  - Simpan & edit snippet, pencarian real-time, tags, kategori, favorit, **Version History** dengan tombol **Pulihkan Versi**, serta **Export & Import JSON** tervalidasi Zod.
- Menambahkan tab **Code Snippets** di `RuangKerjaNotch`.
- Menambahkan 3 uji otomatis Fase 7 (`src/cuplikan/__tests__/cuplikan.test.tsx`); total **33/33 lulus**.

### Diperbaiki
- Memperbaiki aturan regex deteksi CSS di `deteksiBahasa.ts` agar tidak salah mendeteksi deklarasi `interface` TypeScript.

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
