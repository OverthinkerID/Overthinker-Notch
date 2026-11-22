# Catatan Perubahan (Changelog)

Semua perubahan penting pada **Overthinker Notch** dicatat pada berkas ini.

## [0.4.0] - 2026-11-22

### Ditambahkan (Fase 4 — Database & Persistensi)
- Membuat migrasi SQLite `src-tauri/migrations/0001_inisialisasi_skema.sql` untuk seluruh **18 tabel wajib** (`workspaces`, `projects`, `tasks`, `notes`, `tags`, `note_tags`, `files`, `snippets`, `snippet_versions`, `prompts`, `prompt_versions`, `clipboard_items`, `music_history`, `lyrics_cache`, `focus_sessions`, `app_settings`, `activity_logs`, `backups`) dengan UUID PK, Foreign Keys, CHECK constraints, dan indeks performa.
- Membangun lapisan database Rust SQLx (`src-tauri/src/db/mod.rs` & `src-tauri/src/perintah/database.rs`): inisialisasi WAL mode + `foreign_keys = ON`, migrasi otomatis, `PRAGMA integrity_check`, backup atomik `VACUUM INTO` + checksum SHA-256, pengaturan kebijakan retensi (`app_settings`), dan pembersihan data kedaluwarsa.
- Menambahkan modul frontend `src/database/` (`PanelDatabase`, `tokoDatabase`, `layananDatabase`, skema Zod) dan mengintegrasikannya sebagai tab **Database & Backup** di `RuangKerjaNotch`.
- Menambahkan 6 uji otomatis baru (3 uji SQLite nyata via `sqlite3` + 3 uji UI `PanelDatabase`); total **20/20 lulus**.

### Diperbaiki & Disempurnakan
- Merapikan seluruh copy UI, label, dan pesan status/error Fase 1–4 ke Bahasa Indonesia yang lebih santai dengan istilah teknis Inggris yang natural (`Dark Mode`, `Light Mode`, `Web Preview`, `Floating Island`, `Always on Top`, `Auto Backup`, `Integrity Check`, `Draft Catatan Cepat`, `Simpan Pengaturan`, `Bersihkan Sekarang`).
- Memperbaiki UX input angka pada `PanelDatabase` agar kolom dapat dikosongkan sementara sebelum mengetik angka baru tanpa menimpa menjadi `1`.

## [0.3.0] - 2026-11-22
- Menambahkan `README.md`, `LICENSE` hak cipta terbatas, dan **Fase 3 — Mesin Notch** (14/14 uji lulus).

## [0.2.0] - 2026-11-22
- Inisialisasi **Fase 1 Fondasi** & **Fase 2 Sistem Desain** (8/8 uji lulus).
