# Spesifikasi Kontrak & State Machine — Overthinker Living Mascot

## 1. Animation States (15 State)

| State | Pemicu Utama | Kembali ke State Dasar? |
| :--- | :--- | :--- |
| `idle` | Default saat aplikasi siaga | Ya (Dasar) |
| `blink` | Kedipan berkala dengan interval acak alami | Ya |
| `look_left` / `look_right` | Variasi gerakan idle kepala & mata | Ya |
| `look_cursor` | Hover pada area Compact/Expanded Mascot | Ya |
| `happy` | `app:opened`, klik Compact Mascot, tab Music | Ya (sementara) |
| `thinking` | Buka workspace `catatan` atau `prompt` | Ya (Dasar) |
| `sleepy` | `app:idle` setelah tidak ada aktivitas | Ya (Dasar) |
| `surprised` | `notification:received` atau double-click | Ya (sementara) |
| `confused` | `error:occurred` | Ya (sementara) |
| `focused` | `focus:started` atau workspace `kode` / `proyek` / `utilitas` | Ya (Dasar) |
| `talking` | `mascot:speech_started` (sinkronisasi mulut + TTS opsional) | Ya setelah selesai |
| `listening` | `mascot:listening` aktif | Ya setelah nonaktif |
| `music_reaction` | `music:started` (mengikuti intensitas/ritme musik) | Ya (Dasar) |
| `celebrating` | `focus:completed` atau klik pada preset `playful` | Ya (sementara) |

## 2. Kontrak `MascotEventBus`

- `app:opened` `{ waktu?: string }`
- `workspace:changed` `{ ruang: string }`
- `focus:started` `{ mode: string }`
- `focus:completed` `{ durasiDetik: number }`
- `music:started` `{ judulLagu: string; artis?: string }`
- `music:stopped`
- `notification:received` `{ pesan: string }`
- `app:idle`
- `error:occurred` `{ pesan: string }`
- `mascot:clicked` / `mascot:double_clicked` / `mascot:hovered` `{ aktif: boolean }`
- `mascot:speech_started` `{ teks: string }` / `mascot:speech_ended` / `mascot:listening` `{ aktif: boolean }`

## 3. Kontrak Rive State Machine (`MascotStateMachine`)

Saat aset `.riv` lokal ditambahkan ke `src/features/mascot/assets/overthinker_mascot.riv`, `RiveMascotCanvas` mengikat input berikut secara otomatis:
- `stateIndex` (Number: `0..14` sesuai urutan `MASCOT_ANIMATION_STATES`)
- `eyeX` (Number: `-1..1`) & `eyeY` (Number: `-1..1`)
- `mouthOpen` (Number: `0..1`)
- `audioIntensity` (Number: `0..1`)
