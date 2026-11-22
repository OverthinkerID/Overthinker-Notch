# Overthinker Notch

**Pusat Produktivitas Desktop Futuristik untuk macOS & Windows**

> **Status Lisensi:** Hak Cipta Dilindungi Sepenuhnya (*All Rights Reserved*) — Wajib Izin Tertulis Sebelum Penggunaan.  
> **Platform Target:** macOS (Apple Silicon & Intel) dan Windows 10/11.  
> **Arsitektur:** Lokal-Pertama (*Local-First*) berbasis Tauri 2 + React + TypeScript + Rust + SQLite.

---

## Ringkasan Produk

**Overthinker Notch** adalah aplikasi produktivitas desktop lintas platform yang menggabungkan antarmuka **Notch Adaptif / Pulau Melayang** (*Dynamic Island / Floating Island*) dengan ruang kerja produktivitas modular dalam satu basis kode terpadu.

Aplikasi ini membantu pengembang dan pengguna produktif mengelola **musik, lirik, catatan cepat, berkas sementara, cuplikan kode, riwayat papan klip, prompt AI, proyek, sesi fokus, alat cepat, dan pemantau sistem** tanpa harus terus-menerus berpindah aplikasi.

### Prinsip Inti

1. **Arsitektur Lokal-Pertama** — Seluruh data pengguna tersimpan lokal di perangkat.
2. **Tanpa Akun Cloud Wajib** — Tidak memerlukan pendaftaran akun untuk fitur inti.
3. **Berfungsi Luring** — Seluruh modul inti bekerja tanpa koneksi internet.
4. **Integrasi OS Native** — Menggunakan adapter khusus macOS dan Windows tanpa simulasi palsu.
5. **Privasi & Keamanan Ketat** — Hak akses minimal (*least-privilege*) Tauri 2, validasi sisi Rust, dan penyaringan data sensitif papan klip.
6. **Penamaan 100% Bahasa Indonesia** — Seluruh nama fungsi, komponen, perintah IPC, dan label antarmuka menggunakan Bahasa Indonesia.

---

## Arsitektur & Teknologi

| Lapisan | Teknologi |
| :--- | :--- |
| **Shell Desktop Native** | Tauri 2, Rust |
| **Antarmuka Frontend** | React 19, TypeScript (mode ketat), Vite 6 |
| **Gaya & Animasi** | Tailwind CSS v4, Framer Motion, Lucide Icons |
| **State & Validasi** | Zustand, Zod |
| **Basis Data & Penyimpanan** | SQLite, SQLx (Fase 4+) |
| **Editor Kode** | Monaco Editor lokal (Fase 7+) |
| **Pengujian Otomatis** | Vitest, React Testing Library, Playwright, Cargo Test |

### Identitas Visual

- **Biru Elektrik:** `#55A7FF`
- **Ungu Neon:** `#A879FF`
- **Teal Siber:** `#66E5D2`
- **Latar Gelap:** `#101521`
- **Permukaan Gelap:** `#171C29`
- Mendukung penuh **Mode Gelap** dan **Mode Terang** dengan glassmorphism terkendali dan bundling 100% lokal tanpa CDN eksternal.

---

## Modul Fitur Utama

| Modul | Cakupan Fitur |
| :--- | :--- |
| **Mesin Notch** | Mode **Notch Adaptif** (deteksi area aman layar & fallback otomatis) dan **Pulau Melayang** (seret, ubah ukuran, selalu di atas, multi-monitor, simpan posisi, 9 status interaksi, pintasan global) |
| **Kecerdasan Musik** | Deteksi sumber audio, metadata, kontrol media, Apple Music/Spotify/GSMTC, tangkapan audio sistem (`ScreenCaptureKit`/`WASAPI`), pengenalan lagu via penyedia resmi |
| **Lirik** | Penyedia lirik legal, pencarian manual, penandaan jujur lirik tersinkronisasi vs teks polos, terjemahan, riwayat lokal |
| **Catatan Cepat** | Tangkap cepat, Markdown, daftar periksa, simpan otomatis, pencarian, tag, sematkan, arsip, ekspor |
| **Penyimpanan Berkas Sementara** | Seret-dan-lepas ke brankas lokal (tidak pernah menghapus berkas asli pengguna), pratinjau, kedaluwarsa, pemulihan, tautan proyek |
| **Brankas Cuplikan Kode** | Monaco Editor lokal (14 bahasa), deteksi bahasa, tag, kategori, favorit, riwayat versi, impor/ekspor |
| **Pengelola Papan Klip** | Riwayat teks/kode/URL/gambar, sematkan, aplikasi dikecualikan, penyaring data sensitif, retensi |
| **Mode Fokus** | Pomodoro, Kerja Mendalam, pengatur waktu kustom, stopwatch, statistik sesi, notifikasi akurat saat diminimalkan |
| **Pustaka Prompt AI** | Kategori, templat variabel dinamis, riwayat versi, impor/ekspor JSON |
| **Ruang Kerja Proyek** | Multi-proyek terhubung relasional ke tugas, catatan, berkas, cuplikan kode, prompt, dan linimasa aktivitas |
| **Alat Cepat & Pemantau Sistem** | 12 utilitas luring + pemantauan CPU, RAM, Baterai, Penyimpanan, Jaringan nyata dari OS |

---

## Panduan Pengembangan Lokal

### Prasyarat

- **Node.js** `>= 20.x` dan **npm**
- **Rust Toolchain** (`rustup`, `rustc`, `cargo`)
- **macOS:** Xcode Command Line Tools (`xcode-select --install`)
- **Windows:** Visual Studio C++ Build Tools & WebView2 Runtime

### Perintah Utama

```bash
# Instal dependensi frontend
npm install

# Jalankan mode pengembangan web (Vite)
npm run dev

# Jalankan aplikasi desktop native Tauri 2 (memerlukan Rust)
npm run tauri dev

# Jalankan pengujian otomatis frontend (Vitest + RTL)
npm run test

# Pemeriksaan tipe & build produksi frontend
npm run build

# Jalankan pengujian unit backend Rust
cargo test --manifest-path src-tauri/Cargo.toml
```

---

## Dokumentasi Proyek

- `docs/MASTER_SPECIFICATION.md` — Spesifikasi produk dan teknis lengkap
- `docs/ARCHITECTURE.md` — Arsitektur Tauri 2, IPC, Mesin Notch, dan skema data
- `docs/DEVELOPMENT_ROADMAP.md` — Peta jalan 18 fase pengembangan
- `docs/IMPLEMENTATION_STATUS.md` — Pelacak status implementasi & lingkungan
- `docs/TEST_REPORT.md` — Laporan pengujian otomatis & manual terverifikasi
- `docs/CHANGELOG.md` — Riwayat perubahan setiap fase

---

## Lisensi & Hak Cipta

**Hak Cipta © 2026 Overthinker Studio (OverthinkerID). Seluruh Hak Cipta Dilindungi (*All Rights Reserved*).**

Perangkat lunak ini **bukan** perangkat lunak bebas pakai. Dilarang menyalin, memodifikasi, mendistribusikan, mengkompilasi ulang, atau menggunakan sebagian maupun seluruh kode sumber untuk keperluan pribadi, komersial, maupun publik **tanpa izin tertulis resmi terlebih dahulu** dari pemegang hak cipta.

Baca ketentuan lengkap pada berkas `LICENSE`.
