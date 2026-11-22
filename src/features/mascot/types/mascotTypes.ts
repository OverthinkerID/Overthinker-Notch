import { z } from "zod";

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
  "celebrating",
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
  | "notification:received"
  | "app:idle"
  | "error:occurred"
  | "mascot:clicked"
  | "mascot:double_clicked"
  | "mascot:hovered"
  | "mascot:speech_started"
  | "mascot:speech_ended"
  | "mascot:listening";

export interface MascotEventPayloadMap {
  "app:opened": { waktu?: string };
  "workspace:changed": { ruang: string };
  "focus:started": { mode: string };
  "focus:completed": { durasiDetik: number };
  "music:started": { judulLagu: string; artis?: string };
  "music:stopped": undefined;
  "notification:received": { pesan: string };
  "app:idle": undefined;
  "error:occurred": { pesan: string };
  "mascot:clicked": undefined;
  "mascot:double_clicked": undefined;
  "mascot:hovered": { aktif: boolean };
  "mascot:speech_started": { teks: string };
  "mascot:speech_ended": undefined;
  "mascot:listening": { aktif: boolean };
}

export const SkemaPengaturanMascot = z.object({
  enabled: z.boolean().default(true),
  characterSize: z.enum(["kecil", "sedang", "besar"]).default("sedang"),
  animationIntensity: z.number().min(0.2).max(1.5).default(1),
  animationSpeed: z.number().min(0.5).max(2).default(1),
  idleBehavior: z.boolean().default(true),
  soundEnabled: z.boolean().default(true),
  voiceEnabled: z.boolean().default(false),
  speechRate: z.number().min(0.6).max(1.6).default(1),
  voiceName: z.string().nullable().default(null),
  musicReactionEnabled: z.boolean().default(true),
  cursorTrackingEnabled: z.boolean().default(true),
  reducedMotion: z.boolean().default(false),
  personalityPreset: z
    .enum(["friendly", "professional", "playful"])
    .default("friendly"),
});

export type MascotSettings = z.infer<typeof SkemaPengaturanMascot>;

export interface MascotEyeVector {
  x: number; // -1..1
  y: number; // -1..1
}

export interface MascotAudioTelemetry {
  aktif: boolean;
  intensitas: number; // 0..1
  frekuensiRendah: number; // 0..1
  frekuensiMenengah: number; // 0..1
  frekuensiTinggi: number; // 0..1
}
