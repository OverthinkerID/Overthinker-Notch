import {
  SkemaPengaturanMascot,
  type MascotPersonalityPreset,
  type MascotSettings,
} from "@/features/mascot/types/mascotTypes";

const KUNCI_PENGATURAN_MASCOT = "overthinker_notch_mascot_settings_v1";

export const PRESET_KEPRIBADIAN_MASCOT: Record<
  MascotPersonalityPreset,
  Partial<MascotSettings>
> = {
  friendly: {
    animationIntensity: 1.0,
    animationSpeed: 1.0,
    idleBehavior: true,
    cursorTrackingEnabled: true,
  },
  professional: {
    animationIntensity: 0.55,
    animationSpeed: 0.85,
    idleBehavior: false,
    cursorTrackingEnabled: true,
  },
  playful: {
    animationIntensity: 1.35,
    animationSpeed: 1.3,
    idleBehavior: true,
    cursorTrackingEnabled: true,
  },
};

export const MascotSettingsService = {
  baca(): MascotSettings {
    const bawaan = SkemaPengaturanMascot.parse({});
    if (typeof window === "undefined") return bawaan;
    try {
      const mentah = window.localStorage.getItem(KUNCI_PENGATURAN_MASCOT);
      if (!mentah) return bawaan;
      const parsed = SkemaPengaturanMascot.safeParse(JSON.parse(mentah));
      return parsed.success ? parsed.data : bawaan;
    } catch {
      return bawaan;
    }
  },

  simpan(pengaturan: MascotSettings): MascotSettings {
    const valid = SkemaPengaturanMascot.parse(pengaturan);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(
        KUNCI_PENGATURAN_MASCOT,
        JSON.stringify(valid)
      );
    }
    return valid;
  },

  terapkanPreset(
    sekarang: MascotSettings,
    preset: MascotPersonalityPreset
  ): MascotSettings {
    return this.simpan({
      ...sekarang,
      ...PRESET_KEPRIBADIAN_MASCOT[preset],
      personalityPreset: preset,
    });
  },
};
