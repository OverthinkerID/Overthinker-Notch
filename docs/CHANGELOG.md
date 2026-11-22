# Catatan Perubahan (Changelog)

Semua perubahan penting pada **Overthinker Notch** dicatat pada berkas ini.

## [0.10.0] - 2026-11-22

### Ditambahkan (Fase 10 — Music Engine)
- Menambahkan backend Rust `src-tauri/src/perintah/musik.rs` (`ambil_status_musik_os`, `kirim_kontrol_media`, `ambil_kapabilitas_musik`, `daftar_riwayat_musik`, `simpan_riwayat_musik`) dengan integrasi nyata Apple Music & Spotify di macOS serta pelaporan status kapabilitas jujur untuk ScreenCaptureKit, WASAPI Loopback, dan GSMTC.
- Membangun modul `src/musik/` (`PanelMusik`, `tokoMusik`, `layananMusik`, skema Zod):
  - Now Playing tanpa lagu palsu (menampilkan kondisi standby jujur jika tidak ada pemutar aktif).
  - Media Controls (Play/Pause, Previous, Next) otomatis nonaktif jika kontrol OS tidak tersedia.
  - Antarmuka konfigurasi Authorized Song Recognition Provider (`AudD`, `ACRCloud`, `Kustom`) + pengecekan izin mikrofon nyata (`navigator.mediaDevices.getUserMedia`), menolak simulasi hasil palsu.
  - Riwayat musik (`music_history`) persisten dan integrasi kontrol cepat di `KapsulNotch`.
- Menambahkan tab **Music** di `RuangKerjaNotch` dan 3 uji otomatis Fase 10 (`src/musik/__tests__/musik.test.tsx`); total **42/42 lulus**.

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
