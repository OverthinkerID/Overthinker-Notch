import type { MascotAudioTelemetry } from "@/features/mascot/types/mascotTypes";

const TELEMETRI_DIAM: MascotAudioTelemetry = {
  aktif: false,
  intensitas: 0,
  frekuensiRendah: 0,
  frekuensiMenengah: 0,
  frekuensiTinggi: 0,
};

class MascotAudioReactionServiceImpl {
  private konteksAudio: AudioContext | null = null;
  private penganalisis: AnalyserNode | null = null;
  private bufferFrekuensi: Uint8Array<ArrayBuffer> | null = null;

  public hubungkanStreamAudio(stream: MediaStream): boolean {
    if (typeof window === "undefined") return false;
    const Ctx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!Ctx) return false;

    try {
      this.putuskanStreamAudio();
      const ctx = new Ctx();
      const sumber = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 128;
      sumber.connect(analyser);

      this.konteksAudio = ctx;
      this.penganalisis = analyser;
      this.bufferFrekuensi = new Uint8Array(
        new ArrayBuffer(analyser.frequencyBinCount)
      );
      return true;
    } catch {
      return false;
    }
  }

  public putuskanStreamAudio(): void {
    if (this.konteksAudio) {
      void this.konteksAudio.close();
      this.konteksAudio = null;
    }
    this.penganalisis = null;
    this.bufferFrekuensi = null;
  }

  public bacaTelemetriAudio(
    sedangMemutarMusikOs: boolean,
    posisiDetik: number
  ): MascotAudioTelemetry {
    if (!sedangMemutarMusikOs && !this.penganalisis) {
      return TELEMETRI_DIAM;
    }

    if (this.penganalisis && this.bufferFrekuensi) {
      this.penganalisis.getByteFrequencyData(this.bufferFrekuensi);
      const len = this.bufferFrekuensi.length;
      if (len > 0) {
        const bagi = Math.max(1, Math.floor(len / 3));
        const rata = (mulai: number, akhir: number) => {
          let total = 0;
          for (let i = mulai; i < akhir; i++) {
            total += this.bufferFrekuensi![i] ?? 0;
          }
          return Math.min(1, total / ((akhir - mulai) * 255));
        };
        const rendah = rata(0, bagi);
        const menengah = rata(bagi, bagi * 2);
        const tinggi = rata(bagi * 2, len);
        const intensitas = Math.min(1, (rendah * 0.5 + menengah * 0.35 + tinggi * 0.15) * 1.4);
        return {
          aktif: true,
          intensitas,
          frekuensiRendah: rendah,
          frekuensiMenengah: menengah,
          frekuensiTinggi: tinggi,
        };
      }
    }

    if (!sedangMemutarMusikOs) {
      return TELEMETRI_DIAM;
    }

    // Ketika hanya metadata playback OS aktif (tanpa stream PCM), gunakan fase ritme deterministik berbasis posisi waktu
    const fase = posisiDetik * Math.PI;
    const rendah = 0.45 + 0.35 * Math.abs(Math.sin(fase));
    const menengah = 0.4 + 0.3 * Math.abs(Math.cos(fase * 1.5));
    const tinggi = 0.3 + 0.25 * Math.abs(Math.sin(fase * 2.2));
    return {
      aktif: true,
      intensitas: Number(((rendah + menengah + tinggi) / 3).toFixed(3)),
      frekuensiRendah: Number(rendah.toFixed(3)),
      frekuensiMenengah: Number(menengah.toFixed(3)),
      frekuensiTinggi: Number(tinggi.toFixed(3)),
    };
  }
}

export const MascotAudioReactionService = new MascotAudioReactionServiceImpl();
