# Catatan Perubahan (Changelog)

Semua perubahan penting pada **Overthinker Notch** dicatat pada berkas ini.

## [0.11.0] - 2026-11-22

### Ditambahkan (Fase 11 — Lyrics Engine)
- Menambahkan backend Rust SQLx `src-tauri/src/perintah/lirik.rs` (`daftar_cache_lirik`, `simpan_cache_lirik`, `hapus_cache_lirik`) untuk tabel `lyrics_cache` dengan validasi sisi Rust agar lirik polos tidak pernah ditandai `tersinkronisasi`.
- Membangun modul `src/lirik/` (`PanelLirik`, `tokoLirik`, `layananLirik`, `penguraiLrc`, skema Zod):
  - Arsitektur penyedia lirik resmi (`Musixmatch`, `LRCLIB`, `Kustom`), pencarian manual, serta tombol `Cari dari Lagu Aktif`.
  - Parser Timed LRC (`[mm:ss.xx]`) dengan sorotan baris **sebelumnya**, **aktif**, dan **berikutnya**, serta penggeser posisi waktu.
  - Guard jujur `Lirik Polos (Tidak Tersinkronisasi)` jika lirik tidak memiliki timestamp LRC.
  - Dukungan terjemahan opsional dan riwayat cache lirik lokal.
- Menambahkan tab **Lyrics** di `RuangKerjaNotch` dan 3 uji otomatis Fase 11 (`src/lirik/__tests__/lirik.test.tsx`); total **45/45 lulus**.

## [0.10.0] - 2026-11-22
- **Fase 10 — Music Engine:** Bridge Apple Music & Spotify nyata (macOS AppleScript), kontrol media jujur, antarmuka penyedia pengenal lagu resmi + izin mikrofon, `music_history` SQLite (42/42 uji lulus).

## [0.9.0] - 2026-11-22
- **Fase 9 — Focus Engine:** Pomodoro, Deep Work, Custom, Stopwatch berbasis timestamp `Date.now()`, Break Reminders, Focus Goals, Desktop Notifications (39/39 uji lulus).

## [0.8.0] - 2026-11-22
- **Fase 8 — Clipboard Manager:** Filter data sensitif, excluded apps, pin aman dari `Hapus Non-Pin`, riwayat teks/kode/URL/gambar (36/36 uji lulus).

## [0.7.0] - 2026-11-22
- **Fase 7 — Code Snippet Vault:** Monaco Editor lokal tanpa CDN, 14 bahasa wajib + auto-detect, Version History + rollback, Export/Import JSON (33/33 uji lulus).

## [0.6.0] - 2026-11-22
- **Fase 6 — Temporary File Storage:** Vault copy-only Rust `berkas.rs`, drag & drop multi-file, preview, rename, expiration, Recovery bin, project link (30/30 uji lulus).

## [0.5.0] - 2026-11-22
- **Fase 5 — Quick Notes:** Backend Rust SQLx `catatan.rs`, Quick Capture, Checklist interaktif, Auto-save, Tags, Pin, Arsip, Export `.md`/`.json` (26/26 uji lulus).

## [0.4.0] - 2026-11-22
- **Fase 4 — Database & Persistensi:** Skema SQLite 18 tabel, modul Rust SQLx + backup `VACUUM INTO` + retensi, `PanelDatabase` (20/20 uji lulus).

## [0.3.0] - 2026-11-22
- `README.md`, `LICENSE` hak cipta terbatas, dan **Fase 3 — Mesin Notch** (14/14 uji lulus).

## [0.2.0] - 2026-11-22
- **Fase 1 Fondasi** & **Fase 2 Design System** (8/8 uji lulus).
