# Rencana Implementasi — Overthinker Living Mascot

## 1. Analisis Arsitektur Aplikasi Saat Ini
- **Shell & State Machine Notch (`src/notch/`):** `RuangKerjaNotch.tsx` mengelola 15 tab ruang kerja dan merender `KapsulNotch.tsx` di bagian atas. `tokoNotch.ts` mengatur mode tampilan (`notch_adaptif` vs `pulau_melayang`), geometri Floating Island (`posisiX`, `posisiY`, `lebarDiperluas`), dan 9 status interaksi (`siaga`, `ringkas`, `diperluas`, `musik`, `catatan`, `kode`, `berkas`, `fokus`, `dasbor`).
- **Modul Aktivitas:** `tokoMusik.ts` (`trekAktif` & `sedangMemutar`), `tokoFokus.ts` (`timer.status`), `tokoCatatan.ts`, `tokoCuplikan.ts`, `tokoProyek.ts`, dan `RuangKerjaNotch` berdiri terpisah tanpa event bus terpusat.
- **Kesenjangan yang Diisi Living Mascot:** Dibutuhkan modul terisolasi `src/features/mascot/` dengan `MascotEventBus` dan `MascotController` terpusat sehingga modul lain hanya memancarkan event aktivitas (`app:opened`, `workspace:changed`, `focus:started`, `focus:completed`, `music:started`, `notification:received`, `app:idle`, `error:occurred`) tanpa mengendalikan animasi secara langsung.

## 2. Arsitektur Modul `src/features/mascot/`
- `types/mascotTypes.ts`: 15 animation states (`idle`, `blink`, `look_left`, `look_right`, `look_cursor`, `happy`, `thinking`, `sleepy`, `surprised`, `confused`, `focused`, `talking`, `listening`, `music_reaction`, `celebrating`), 3 personality presets (`friendly`, `professional`, `playful`), event contracts, dan schema pengaturan Zod.
- `animations/MascotStateMachine.ts` & `RiveMascotCanvas.tsx`: State machine deterministik dengan prioritas transisi, natural variable blink/idle interval, dukungan `@rive-app/react-canvas` lokal (zero CDN), dan renderer kepala robot futuristik interaktif (neon cyan `#66E5D2`, electric blue `#55A7FF`, purple ambient glow `#A879FF`, glowing eyes, animated eyelids, animated mouth, holographic particles).
- `services/`:
  - `MascotEventBus.ts`: Pub/sub terpusat untuk seluruh event aplikasi.
  - `MascotAnimationService.ts`: Natural blink interval, idle micro-movements, dan reduced-motion / visibility pause guard.
  - `MascotSettingsService.ts`: Persistensi pengaturan & 3 personality presets (`Friendly`, `Professional`, `Playful`) ke `localStorage`.
  - `MascotAudioReactionService.ts`: Analisis intensitas audio aman (Web Audio API `AnalyserNode` jika stream tersedia, atau sinkronisasi metadata `trekAktif` saat bridge OS aktif — tanpa gerakan acak palsu).
  - `MascotSpeechService.ts`: Text greeting + optional Web Speech API (`speechSynthesis`) dengan mouth sync, speed, voice selection, dan mute/unmute (jujur tanpa klaim AI chat jika belum ada integrasi AI).
- `controllers/MascotController.ts`: Koordinator tunggal antara EventBus, StateMachine, AudioReaction, Speech, dan Zustand store (`useMascotStore`).
- `components/`:
  - `CompactMascot.tsx`: Kepala robot di `KapsulNotch` dengan idle, eye tracking, status singkat, klik untuk membuka panel, double-click reaksi, dan context menu.
  - `ExpandedMascot.tsx`: Panel maskot lebih besar dengan sapaan, talking/TTS, quick actions, ringkasan project, focus, music, quick notes, quick command, dan `MascotSettingsPanel.tsx`.
- `hooks/`: `useMascotTracking.ts` (bounded mouse/eye tracking & idle timer) & `useMascotActivityBridge.ts` (menghubungkan `RuangKerjaNotch`, `tokoFokus`, `tokoMusik`, `KapsulNotch` ke `MascotEventBus`).
- `tests/`: Pengujian menyeluruh seluruh 15 animation states, eye tracking, click/double-click, context menu, music reaction, focus reaction, notification reaction, window/visibility pause, multi-monitor, macOS/Windows, dan persistence pengaturan.
