# Catatan Perubahan (Changelog)

Semua perubahan penting pada **Overthinker Notch** dicatat pada berkas ini.

## [0.9.0] - 2026-11-22

### Ditambahkan (Fase 9 — Focus Engine)
- Menambahkan backend Rust SQLx `src-tauri/src/perintah/fokus.rs` (`daftar_sesi_fokus`, `simpan_sesi_fokus`) untuk menyimpan sesi ke tabel `focus_sessions`.
- Membangun modul `src/fokus/` (`PanelFokus`, `tokoFokus`, `layananFokus`, `waktuFokus`, skema Zod):
  - Mode **Pomodoro**, **Deep Work**, **Custom Timer**, dan **Stopwatch**.
  - Kalkulasi timer berbasis selisih timestamp nyata (`Date.now()`) + event `visibilitychange` agar tetap akurat meskipun window diminimalkan atau tidak aktif.
  - **Break Reminders**, **Session Stats**, **Focus Goals** harian dengan progress bar, dan **Notifications** desktop.
- Menghubungkan kontrol cepat timer Fokus langsung di `KapsulNotch` dan menambah tab **Focus Mode** di `RuangKerjaNotch`.
- Menambahkan 3 uji otomatis Fase 9 (`src/fokus/__tests__/fokus.test.tsx`); total **39/39 lulus**.

### Diperbaiki
- Memperbaiki penerusan timestamp `sekarangMs` pada `selesaikanSesiSekarang` agar durasi aktual tercatat akurat saat penyelesaian otomatis dipicu.

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
