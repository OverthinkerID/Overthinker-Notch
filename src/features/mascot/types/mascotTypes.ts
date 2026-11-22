import { z } from "zod";

export const MASCOT_CHARACTERS = [
  "overthinker_robot",
  "hush_puppy",
  "little_companion",
] as const;

export type MascotCharacterId = (typeof MASCOT_CHARACTERS)[number];

export const LABEL_KARAKTER_MASCOT: Record<
  MascotCharacterId,
  { nama: string; deskripsi: string }
> = {
  overthinker_robot: {
    nama: "Overthinker Robot",
    deskripsi:
      "Kepala AI holografik 2.5D dengan mata digital ekspresif dan kepribadian asisten profesional.",
  },
  hush_puppy: {
    nama: "Hush Puppy",
    deskripsi:
      "Anjing Basset Hound original bertelinga panjang, ekor bergoyang, dan gaya santai yang ramah.",
  },
  little_companion: {
    nama: "Little Companion",
    deskripsi:
      "Karakter anak digital bergaya orisinal dengan ekspresi ceria namun tetap rapi dan profesional.",
  },
};

export const MASCOT_ANIMATION_STATES = [
  "idle",
  "blink",
  "look_left",
  "look_right",
  "look_cursor",
  "happy",
  "thinking",
  "sleepy",
  "surprised",
  "confused",
  "focused",
  "talking",
  "listening",
  "music_reaction",
  "reading_lyrics",
  "searching_lyrics",
  "celebrating",
  "minimized",
] as const;

export type MascotAnimationState = (typeof MASCOT_ANIMATION_STATES)[number];

export const MASCOT_PERSONALITY_PRESETS = [
  "friendly",
  "professional",
  "playful",
] as const;

export type MascotPersonalityPreset =
  (typeof MASCOT_PERSONALITY_PRESETS)[number];

export type MascotCharacterSize = "kecil" | "sedang" | "besar";

export type MascotEventType =
  | "app:opened"
  | "workspace:changed"
  | "focus:started"
  | "focus:completed"
  | "music:started"
  | "music:stopped"
  | "lyrics:reading"
  | "lyrics:searching"
  | "lyrics:stopped"
  | "notification:received"
  | "app:idle"
  | "error:occurred"
  | "mascot:clicked"
  | "mascot:double_clicked"
  | "mascot:hovered"
  | "mascot:speech_started"
  | "mascot:speech_ended"
  | "mascot:listening"
  | "notch:minimized"
  | "notch:restored";

export interface MascotEventPayloadMap {
  "app:opened": { waktu?: string };
  "workspace:changed": { ruang: string };
  "focus:started": { mode: string };
  "focus:completed": { durasiDetik: number };
  "music:started": { judulLagu: string; artis?: string };
  "music:stopped": undefined;
  "lyrics:reading": { barisAktif?: string };
  "lyrics:searching": { kueri: string };
  "lyrics:stopped": undefined;
  "notification:received": { pesan: string };
  "app:idle": undefined;
  "error:occurred": { pesan: string };
  "mascot:clicked": undefined;
  "mascot:double_clicked": undefined;
  "mascot:hovered": { aktif: boolean };
  "mascot:speech_started": { teks: string };
  "mascot:speech_ended": undefined;
  "mascot:listening": { aktif: boolean };
  "notch:minimized": undefined;
  "notch:restored": undefined;
}

export const SkemaPengaturanMascot = z.object({
  enabled: z.boolean().default(true),
  selectedCharacter: z
    .enum(["overthinker_robot", "hush_puppy", "little_companion"])
    .default("overthinker_robot"),
  characterSize: z.enum(["kecil", "sedang", "besar"]).default("sedang"),
  animationIntensity: z.number().min(0.2).max(1.5).default(1),
  animationSpeed: z.number().min(0.5).max(2).default(1),
  idleBehavior: z.boolean().default(true),
  soundEnabled: z.boolean().default(true),
  voiceEnabled: z.boolean().default(false),
  speechRate: z.number().min(0.6).max(1.6).default(1),
  voiceName: z.string().nullable().default(null),
  musicReactionEnabled: z.boolean().default(true),
  lyricsAutoDisplay: z.boolean().default(true),
  cursorTrackingEnabled: z.boolean().default(true),
  reducedMotion: z.boolean().default(false),
  personalityPreset: z
    .enum(["friendly", "professional", "playful"])
    .default("professional"),
});

export type MascotSettings = z.infer<typeof SkemaPengaturanMascot>;

export interface MascotEyeVector {
  x: number;
  y: number;
}

export interface MascotAudioTelemetry {
  aktif: boolean;
  intensitas: number;
  frekuensiRendah: number;
  frekuensiMenengah: number;
  frekuensiTinggi: number;
}
