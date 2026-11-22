# Spesifikasi Kontrak & State Machine — Overthinker Living Mascot

## 1. Final Color Identity (Palet Resmi Karakter)

- **Panna Cotta (`#F1E4D0` — 50%):** Permukaan wajah holografik utama, iluminasi hangat, dan highlight wajah.
- **Ivy Lacquer (`#344C3D` — 35%):** Warna struktural utama, kontur kepala, pola sirkuit teknologi, dan kedalaman holografik.
- **Marinara Red (`#A83235` — 10%):** Aksen terkendali untuk detail mata digital, indikator energi dahi, dan sorotan ekspresi terpilih.
- **Pendukung (5%):** Deep Navy (`#101521`), Soft Sage (`#C5D4C5`), Warm White (`#FFF8ED`).
- **Larangan Warna:** Tidak menggunakan electric blue, neon purple, atau bright green pada karakter maskot.

## 2. Animation States (16 State)

| State | Pemicu Utama | Kembali ke State Dasar? |
| :--- | :--- | :--- |
| `idle` | Default saat aplikasi siaga | Ya (Dasar) |
| `blink` | Kedipan berkala dengan interval acak alami | Ya |
| `look_left` / `look_right` | Variasi gerakan idle kepala & mata | Ya |
| `look_cursor` | Hover pada area Compact/Expanded Mascot | Ya |
| `happy` | `app:opened`, single-click Compact Mascot, tab Music | Ya (sementara) |
| `thinking` | Buka workspace `catatan` atau `prompt` | Ya (Dasar) |
| `sleepy` | `app:idle` setelah tidak ada aktivitas | Ya (Dasar) |
| `surprised` | `notification:received` atau double-click | Ya (sementara) |
| `confused` | `error:occurred` | Ya (sementara) |
| `focused` | `focus:started` atau workspace `kode` / `proyek` / `utilitas` | Ya (Dasar) |
| `talking` | `mascot:speech_started` (sinkronisasi mulut + TTS opsional) | Ya setelah selesai |
| `listening` | `mascot:listening` aktif | Ya setelah nonaktif |
| `music_reaction` | `music:started` (mengikuti intensitas/ritme musik) | Ya (Dasar) |
| `celebrating` | `focus:completed` atau klik pada preset `playful` | Ya (sementara) |
| `minimized` | `notch:minimized` (saat Notch diringkas ke `siaga`) | Ya saat `notch:restored` |

## 3. Kontrak `MascotEventBus`

- `app:opened` `{ waktu?: string }`
- `workspace:changed` `{ ruang: string }`
- `focus:started` `{ mode: string }`
- `focus:completed` `{ durasiDetik: number }`
- `music:started` `{ judulLagu: string; artis?: string }`
- `music:stopped`
- `notification:received` `{ pesan: string }`
- `app:idle`
- `error:occurred` `{ pesan: string }`
- `mascot:clicked` (single-click -> buka panel asisten)
- `mascot:double_clicked` (double-click -> buka Dashboard Notch)
- `mascot:hovered` `{ aktif: boolean }`
- `mascot:speech_started` `{ teks: string }` / `mascot:speech_ended` / `mascot:listening` `{ aktif: boolean }`
- `notch:minimized` / `notch:restored`

## 4. Status Aset Rive (`.riv`)

- Runtime `@rive-app/react-canvas` sudah terpasang lokal (tanpa CDN) dan `RiveMascotCanvas` mengikat input `stateIndex`, `eyeX`, `eyeY`, `mouthOpen`, `audioIntensity` pada State Machine `"MascotStateMachine"`.
- Karena berkas biner `.riv` belum diekspor dari Rive Editor GUI, aplikasi secara otomatis menggunakan **Hybrid 2.5D Fallback Vector Character** (`#F1E4D0`, `#344C3D`, `#A83235`) dengan transisi penuh 16 state tanpa error.
