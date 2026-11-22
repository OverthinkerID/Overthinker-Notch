# Catatan Perubahan (Changelog)

Semua perubahan penting pada **Overthinker Notch** dicatat pada berkas ini.

### Ditambahkan — Overthinker Living Mascot
- Menginstal `@rive-app/react-canvas` secara lokal (tanpa CDN) dan membangun modul terisolasi `src/features/mascot/`:
  - **Visual & Rive Adapter (`RiveMascotCanvas.tsx`):** Kepala robot AI futuristik (neon cyan `#66E5D2`, electric blue `#55A7FF`, purple ambient glow `#A879FF`, glowing eyes dengan pupil tracking terbatas, animated eyelids, animated mouth, holographic particles) + adapter State Machine Rive lokal (`MascotStateMachine`).
  - **15 Animation States & Event Bus Terpusat:** `MascotController`, `MascotEventBus`, `MascotAnimationService`, `MascotAudioReactionService`, `MascotSpeechService` (sapaan teks + Web Speech API TTS opsional tanpa klaim AI chat palsu), dan `MascotSettingsService` (3 personality presets: `friendly`, `professional`, `playful`).
  - **UI & Integrasi Notch:** `CompactMascot` di `KapsulNotch` (click, double-click, hover, context menu), `ExpandedMascot` di `RuangKerjaNotch` (`Alt+L`), dan `useMascotActivityBridge`.
  - **Pengujian:** 5 uji otomatis di `src/features/mascot/tests/livingMascot.test.tsx`; total **64/64 lulus**.

## [0.17.0] - 2026-11-22

### Ditambahkan & Diverifikasi (Fase 17 — Quality Assurance)
- Menambahkan suite uji QA integrasi lintas modul `src/__tests__/qaIntegrasiUtama.test.tsx` yang memverifikasi:
  - Navigasi penuh seluruh **15 tab** ruang kerja di `RuangKerjaNotch` tanpa error runtime.
  - Alur lintas fitur pergantian tema `Dark Mode` / `Light Mode` dan penggunaan Quick Tools (`Rapikan JSON`).
- Melakukan audit kepatuhan lokal-pertama pada `index.html` (nol CDN eksternal) dan `src-tauri/tauri.conf.json` (CSP ketat `default-src 'self'`).
- Seluruh **59/59 uji otomatis** (17 file uji) dan build produksi TypeScript + Vite lulus bersih.

## [0.16.0] - 2026-11-22

### Ditambahkan (Fase 16 — macOS & Windows Integration)
- Menambahkan backend Rust `src-tauri/src/perintah/integrasi_os.rs` (`ambil_status_integrasi_os`, `atur_auto_start_os`, `buka_pengaturan_izin_os`) dan memperbarui `src-tauri/src/platform/mod.rs`:
  - **macOS:** Pengelolaan LaunchAgent plist (`~/Library/LaunchAgents/com.overthinker.notch.plist`) dan deep-link ke `System Settings` (`Privacy_Accessibility`, `Privacy_ScreenCapture`, `Privacy_Microphone`).
  - **Windows:** Pengelolaan Registry Startup (`HKCU\Software\Microsoft\Windows\CurrentVersion\Run\OverthinkerNotch`) dan deep-link ke `ms-settings:`.
- Membangun modul `src/integrasi/` (`PanelIntegrasiOs`, `tokoIntegrasiOs`, `layananIntegrasiOs`, `skemaIntegrasiOs`) beserta matriks kapabilitas OS nyata dan fallback browser yang jujur.
- Menambahkan tab **OS Integration** di `RuangKerjaNotch` dan 2 uji otomatis Fase 16 (`src/integrasi/__tests__/integrasiOs.test.tsx`); total **57/57 lulus**.

## [0.15.0] - 2026-11-22

### Ditambahkan (Fase 15 — System Monitor)
- Menambahkan backend Rust `src-tauri/src/perintah/monitor_sistem.rs` (`ambil_telemetri_sistem`) yang membaca telemetri OS nyata pada macOS (`sysctl`, `vm_stat`, `top`, `df`, `pmset`, `hostname`) dan Windows (CIM/WMI PowerShell): CPU %, core/model, RAM terpakai/total, Disk terpakai/total, Baterai %, status pengisian daya, dan Uptime.
- Membangun modul `src/monitor/` (`PanelMonitor`, `tokoMonitor`, `layananMonitor`, `skemaMonitor`) dengan fallback browser yang jujur (menampilkan API web nyata dan menandai metrik OS-only sebagai `Nggak tersedia di browser` tanpa angka simulasi), plus toggle `Auto-refresh (5 detik)`.
- Menambahkan tab **System Monitor** di `RuangKerjaNotch` dan 2 uji otomatis Fase 15 (`src/monitor/__tests__/monitor.test.tsx`); total **55/55 lulus**.

## [0.14.0] - 2026-11-22

### Ditambahkan (Fase 14 — Quick Tools)
- Membangun modul `src/utilitas/` (`mesinUtilitas.ts`, `PanelUtilitas.tsx`, `tipeUtilitas.ts`) berisi **12 utilitas luring penuh**:
  1. JSON Formatter & Validator (Rapikan & Minify)
  2. Base64 Encode / Decode (UTF-8 aman)
  3. URL Encode / Decode
  4. UUID v4 Generator (`crypto.randomUUID`, 1–20 buah)
  5. Hash Generator (SHA-1, SHA-256, SHA-512 via Web Crypto API)
  6. Regex Tester (pola, flags, kecocokan & posisi)
  7. Timestamp Converter (Unix detik/ms <-> ISO 8601 & waktu lokal)
  8. JWT Decoder (inspeksi header, payload & status `exp`)
  9. Case Converter (`camelCase`, `PascalCase`, `snake_case`, `kebab-case`, `UPPER_SNAKE_CASE`, `Title Case`)
  10. Color Converter (HEX <-> RGB & HSL + pratinjau warna)
  11. Diff Checker (perbandingan teks baris demi baris)
  12. Password Generator (kriptografis `crypto.getRandomValues` 8–64 karakter)
- Menambahkan tab **Quick Tools** di `RuangKerjaNotch` dan 2 uji otomatis Fase 14 (`src/utilitas/__tests__/utilitas.test.tsx`); total **53/53 lulus**.

## [0.13.0] - 2026-11-22

### Ditambahkan (Fase 13 — Project Workspace)
- Menambahkan backend Rust SQLx `src-tauri/src/perintah/proyek.rs` (`daftar_workspace`, `simpan_workspace`, `hapus_workspace`, `daftar_proyek`, `simpan_proyek`, `hapus_proyek`, `daftar_tugas`, `simpan_tugas`, `hapus_tugas`, `ambil_ringkasan_aset_proyek`) dengan auto-recalculate progres proyek saat task berubah.
- Membangun modul `src/proyek/` (`PanelProyek`, `tokoProyek`, `layananProyek`, skema Zod):
  - Pengelola Workspace & Project dengan pilihan warna, status (`aktif`, `dijeda`, `selesai`, `arsip`), pencarian, dan filter status.
  - Task Board/Checklist dengan prioritas (`rendah`, `sedang`, `tinggi`, `kritis`), status (`todo`, `proses`, `selesai`), serta kalkulasi progres otomatis (`0–100%`).
  - Agregasi nyata jumlah Notes, Temp Files, Code Snippets, AI Prompts, dan Focus Sessions yang tertaut ke setiap project.
- Menambahkan tab **Projects** di `RuangKerjaNotch` dan 3 uji otomatis Fase 13 (`src/proyek/__tests__/proyek.test.tsx`); total **51/51 lulus**.

## [0.12.0] - 2026-11-22

### Ditambahkan (Fase 12 — AI Prompt Library)
- Menambahkan backend Rust SQLx `src-tauri/src/perintah/prompt.rs` (`daftar_prompt`, `simpan_prompt`, `hapus_prompt`) untuk tabel `prompts` & `prompt_versions` dengan auto-versioning.
- Membangun modul `src/prompt/` (`PanelPrompt`, `tokoPrompt`, `layananPrompt`, `variabelPrompt`, skema Zod):
  - Pengelola kategori, tags, favorit, pencarian kata kunci, dan `Prompt Baru`.
  - Parser & substitusi dinamis `{{variabel}}` dengan form input otomatis, live preview `Hasil Prompt Siap Pakai`, serta tombol `Copy Hasil Prompt`.
  - `Version History` per prompt dengan fitur `Pulihkan Versi`.
  - Dukungan `Import JSON` & `Export JSON` tervalidasi Zod.
- Menambahkan tab **AI Prompts** di `RuangKerjaNotch` dan 3 uji otomatis Fase 12 (`src/prompt/__tests__/prompt.test.tsx`); total **48/48 lulus**.

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
