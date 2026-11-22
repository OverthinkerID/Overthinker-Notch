export interface OpsiBicaraMascot {
  teks: string;
  voiceEnabled: boolean;
  soundEnabled: boolean;
  speechRate: number;
  voiceName: string | null;
  saatMulai: () => void;
  saatMulutBerubah: (bukaan: number) => void;
  saatSelesai: () => void;
}

class MascotSpeechServiceImpl {
  private timerMulut: number | null = null;
  private timerSelesaiTeks: number | null = null;

  public ambilDaftarSuara(): string[] {
    if (
      typeof window === "undefined" ||
      typeof window.speechSynthesis === "undefined"
    ) {
      return [];
    }
    return window.speechSynthesis
      .getVoices()
      .map((v) => v.name)
      .filter(Boolean);
  }

  public hentikan(): void {
    if (this.timerMulut !== null) {
      window.clearInterval(this.timerMulut);
      this.timerMulut = null;
    }
    if (this.timerSelesaiTeks !== null) {
      window.clearTimeout(this.timerSelesaiTeks);
      this.timerSelesaiTeks = null;
    }
    if (
      typeof window !== "undefined" &&
      typeof window.speechSynthesis !== "undefined"
    ) {
      window.speechSynthesis.cancel();
    }
  }

  public ucapkan(opsi: OpsiBicaraMascot): void {
    this.hentikan();
    const teksBersih = opsi.teks.trim();
    if (!teksBersih) return;

    opsi.saatMulai();

    // Sinkronisasi animasi mulut berbasis panjang suku kata
    let langkah = 0;
    this.timerMulut = window.setInterval(() => {
      langkah += 1;
      const bukaan = langkah % 2 === 0 ? 0.85 : 0.28;
      opsi.saatMulutBerubah(bukaan);
    }, Math.round(130 / Math.max(0.6, opsi.speechRate)));

    const selesai = () => {
      this.hentikan();
      opsi.saatMulutBerubah(0);
      opsi.saatSelesai();
    };

    const pakaiTts =
      opsi.voiceEnabled &&
      opsi.soundEnabled &&
      typeof window !== "undefined" &&
      typeof window.speechSynthesis !== "undefined" &&
      typeof SpeechSynthesisUtterance !== "undefined";

    if (pakaiTts) {
      try {
        const utter = new SpeechSynthesisUtterance(teksBersih);
        utter.rate = opsi.speechRate;
        utter.lang = "id-ID";
        if (opsi.voiceName) {
          const cocok = window.speechSynthesis
            .getVoices()
            .find((v) => v.name === opsi.voiceName);
          if (cocok) utter.voice = cocok;
        }
        utter.onend = selesai;
        utter.onerror = selesai;
        window.speechSynthesis.speak(utter);
        return;
      } catch {
        // Fallback ke timer teks
      }
    }

    const durasiMs = Math.min(3600, Math.max(1000, teksBersih.length * 48));
    this.timerSelesaiTeks = window.setTimeout(selesai, durasiMs);
  }
}

export const MascotSpeechService = new MascotSpeechServiceImpl();
