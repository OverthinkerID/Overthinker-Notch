# Arsitektur Sistem — Overthinker Notch

**Versi Dokumen:** 0.2.0  
**Tanggal:** 22 November 2026  

## 1. Arsitektur Dua Lapisan (Tauri 2)

1. **Lapisan Antarmuka (`src/`):** React 19 + TypeScript (mode ketat) + Vite + Tailwind CSS v4 + Framer Motion + Zustand + Zod. Tidak mengakses sistem berkas atau OS secara langsung.
2. **Lapisan Inti Native (`src-tauri/`):** Rust + Tauri 2 + SQLx/SQLite (Fase 4+) + adapter platform OS (`macos` & `windows`). Seluruh masukan IPC divalidasi di sisi Rust dengan kapabilitas hak akses minimal (`src-tauri/capabilities/default.json`).

## 2. Struktur Direktori Saat Ini (Fase 1 & Fase 2)

```text
Overthinker-Notch/
├── docs/
│   ├── MASTER_SPECIFICATION.md
│   ├── ARCHITECTURE.md
│   ├── DEVELOPMENT_ROADMAP.md
│   ├── IMPLEMENTATION_STATUS.md
│   ├── TEST_REPORT.md
│   └── CHANGELOG.md
├── src/
│   ├── app/Aplikasi.tsx
│   ├── bersama/
│   │   ├── ipc/klienIpc.ts
│   │   ├── komponen/BatasGalat.tsx
│   │   └── utilitas/kelas.ts
│   ├── gaya/utama.css
│   ├── pengujian/persiapan.ts
│   ├── sistem-desain/
│   │   ├── __tests__/sistemDesain.test.tsx
│   │   ├── komponen/
│   │   │   ├── EtalaseSistemDesain.tsx
│   │   │   ├── Kartu.tsx
│   │   │   ├── KolomMasukan.tsx
│   │   │   ├── Lencana.tsx
│   │   │   ├── PanelKaca.tsx
│   │   │   ├── PeralihanTema.tsx
│   │   │   ├── Sakelar.tsx
│   │   │   ├── TabNavigasi.tsx
│   │   │   └── Tombol.tsx
│   │   ├── tema/tokoTema.ts
│   │   ├── token/tokenDesain.ts
│   │   └── index.ts
│   └── utama.tsx
└── src-tauri/
    ├── capabilities/default.json
    ├── src/
    │   ├── galat.rs
    │   ├── lib.rs
    │   ├── main.rs
    │   ├── perintah/
    │   │   ├── mod.rs
    │   │   └── sistem.rs
    │   └── platform/mod.rs
    ├── build.rs
    ├── Cargo.toml
    └── tauri.conf.json
```

## 3. Arsitektur Sistem Desain (Fase 2)

- **Token CSS Semantik (`src/gaya/utama.css`):** Variabel CSS terpisah untuk `:root` (Mode Terang) dan `.dark` (Mode Gelap) tanpa ketergantungan CDN.
- **Toko Tema Persisten (`src/sistem-desain/tema/tokoTema.ts`):** Zustand + `localStorage` (`overthinker_notch_mode_tema`) yang langsung menyinkronkan kelas `.dark` pada `document.documentElement`.
- **Komponen Modular:** `PanelKaca`, `Tombol`, `Lencana`, `Kartu`, `KolomMasukan`, `AreaTeks`, `Sakelar`, `TabNavigasi`, `PeralihanTema`, dan `EtalaseSistemDesain`.
- **Jembatan IPC Jujur (`src/bersama/ipc/klienIpc.ts`):** Memeriksa keberadaan `__TAURI_INTERNALS__`. Saat berjalan di Tauri 2 native, memanggil `ambil_info_runtime` dan `periksa_kesehatan_aplikasi` dengan validasi Zod; saat berjalan di pratinjau peramban Vite, melaporkan secara jujur bahwa runtime native Rust belum aktif.
