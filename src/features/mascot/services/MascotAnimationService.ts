import type {
  MascotAnimationState,
  MascotEyeVector,
  MascotSettings,
} from "@/features/mascot/types/mascotTypes";

export const MascotAnimationService = {
  // Batasi pergerakan mata agar tidak menyebabkan distorsi karakter
  hitungVektorMataTerbatas(
    klienX: number,
    klienY: number,
    pusatX: number,
    pusatY: number,
    radiusMaks = 260
  ): MascotEyeVector {
    const dx = (klienX - pusatX) / Math.max(80, radiusMaks);
    const dy = (klienY - pusatY) / Math.max(80, radiusMaks);
    const clamp = (n: number) => Math.max(-1, Math.min(1, Number(n.toFixed(3))));
    return {
      x: clamp(dx),
      y: clamp(dy),
    };
  },

  // Interval kedipan bervariasi agar tidak terlihat seperti animasi berulang yang kaku
  hitungIntervalKedipanMs(pengaturan: MascotSettings): number {
    const dasar = 2600 + Math.floor(Math.random() * 2800);
    return Math.round(dasar / Math.max(0.5, pengaturan.animationSpeed));
  },

  pilihAksiIdleVariatif(): MascotAnimationState {
    const acak = Math.random();
    if (acak < 0.35) return "look_left";
    if (acak < 0.7) return "look_right";
    return "idle";
  },
};
