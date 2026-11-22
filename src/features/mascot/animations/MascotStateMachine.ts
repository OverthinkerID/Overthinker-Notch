import type {
  MascotAnimationState,
  MascotEventType,
  MascotPersonalityPreset,
} from "@/features/mascot/types/mascotTypes";

export interface HasilTransisiMascot {
  stateBerikutnya: MascotAnimationState;
  stateDasar: MascotAnimationState;
  durasiSementaraMs: number | null;
  pesanStatusSingkat: string;
}

export const LABEL_STATUS_MASCOT: Record<MascotAnimationState, string> = {
  idle: "Siaga",
  blink: "Berkedip",
  look_left: "Menoleh Kiri",
  look_right: "Menoleh Kanan",
  look_cursor: "Mengikuti Kursor",
  happy: "Senang",
  thinking: "Berpikir",
  sleepy: "Mengantuk",
  surprised: "Kaget",
  confused: "Bingung",
  focused: "Fokus Penuh",
  talking: "Berbicara",
  listening: "Mendengarkan",
  music_reaction: "Ikut Irama Musik",
  celebrating: "Merayakan!",
};

export class MascotStateMachine {
  private stateDasar: MascotAnimationState = "idle";
  private stateAktif: MascotAnimationState = "idle";

  public ambilStateAktif(): MascotAnimationState {
    return this.stateAktif;
  }

  public ambilStateDasar(): MascotAnimationState {
    return this.stateDasar;
  }

  public aturStateLangsung(stateBaru: MascotAnimationState): void {
    this.stateAktif = stateBaru;
    if (
      stateBaru === "idle" ||
      stateBaru === "focused" ||
      stateBaru === "thinking" ||
      stateBaru === "music_reaction" ||
      stateBaru === "sleepy"
    ) {
      this.stateDasar = stateBaru;
    }
  }

  public prosesEvent(
    event: MascotEventType,
    preset: MascotPersonalityPreset,
    detail?: Record<string, unknown>
  ): HasilTransisiMascot {
    switch (event) {
      case "app:opened":
        this.stateAktif = "happy";
        return {
          stateBerikutnya: "happy",
          stateDasar: this.stateDasar,
          durasiSementaraMs: preset === "professional" ? 1400 : 2200,
          pesanStatusSingkat: "Halo! Siap bantu produktivitasmu.",
        };

      case "workspace:changed": {
        const ruang = String(detail?.ruang ?? "");
        if (ruang === "kode" || ruang === "proyek" || ruang === "utilitas") {
          this.stateDasar = "focused";
          this.stateAktif = "focused";
          return {
            stateBerikutnya: "focused",
            stateDasar: "focused",
            durasiSementaraMs: null,
            pesanStatusSingkat: "Mode coding & proyek aktif.",
          };
        }
        if (ruang === "catatan" || ruang === "prompt") {
          this.stateDasar = "thinking";
          this.stateAktif = "thinking";
          return {
            stateBerikutnya: "thinking",
            stateDasar: "thinking",
            durasiSementaraMs: null,
            pesanStatusSingkat: "Lagi mikir bareng catatan & prompt.",
          };
        }
        if (ruang === "musik" || ruang === "lirik") {
          this.stateAktif = "happy";
          return {
            stateBerikutnya: "happy",
            stateDasar: this.stateDasar,
            durasiSementaraMs: 1400,
            pesanStatusSingkat: "Siap nikmatin musik.",
          };
        }
        this.stateDasar = "idle";
        this.stateAktif = "idle";
        return {
          stateBerikutnya: "idle",
          stateDasar: "idle",
          durasiSementaraMs: null,
          pesanStatusSingkat: "Siaga di Notch.",
        };
      }

      case "focus:started":
        this.stateDasar = "focused";
        this.stateAktif = "focused";
        return {
          stateBerikutnya: "focused",
          stateDasar: "focused",
          durasiSementaraMs: null,
          pesanStatusSingkat: "Lagi fokus menemani sesi kamu.",
        };

      case "focus:completed":
        this.stateDasar = "idle";
        this.stateAktif = "celebrating";
        return {
          stateBerikutnya: "celebrating",
          stateDasar: "idle",
          durasiSementaraMs: 3200,
          pesanStatusSingkat: "Mantap! Sesi fokus selesai!",
        };

      case "music:started":
        this.stateDasar = "music_reaction";
        this.stateAktif = "music_reaction";
        return {
          stateBerikutnya: "music_reaction",
          stateDasar: "music_reaction",
          durasiSementaraMs: null,
          pesanStatusSingkat: `Ikut irama: ${String(detail?.judulLagu ?? "Musik")}`,
        };

      case "music:stopped":
        this.stateDasar = "idle";
        this.stateAktif = "idle";
        return {
          stateBerikutnya: "idle",
          stateDasar: "idle",
          durasiSementaraMs: null,
          pesanStatusSingkat: "Musik berhenti, kembali siaga.",
        };

      case "notification:received":
        this.stateAktif = "surprised";
        return {
          stateBerikutnya: "surprised",
          stateDasar: this.stateDasar,
          durasiSementaraMs: 1800,
          pesanStatusSingkat: "Ada notifikasi baru!",
        };

      case "app:idle":
        this.stateDasar = "sleepy";
        this.stateAktif = "sleepy";
        return {
          stateBerikutnya: "sleepy",
          stateDasar: "sleepy",
          durasiSementaraMs: null,
          pesanStatusSingkat: "Mode hemat daya (mengantuk)...",
        };

      case "error:occurred":
        this.stateAktif = "confused";
        return {
          stateBerikutnya: "confused",
          stateDasar: this.stateDasar,
          durasiSementaraMs: 2400,
          pesanStatusSingkat: "Hmm, ada kendala kecil.",
        };

      case "mascot:clicked":
        this.stateAktif = preset === "playful" ? "celebrating" : "happy";
        return {
          stateBerikutnya: this.stateAktif,
          stateDasar: this.stateDasar,
          durasiSementaraMs: 1300,
          pesanStatusSingkat: "Hai! Ada yang bisa dibantu?",
        };

      case "mascot:double_clicked":
        this.stateAktif = "surprised";
        return {
          stateBerikutnya: "surprised",
          stateDasar: this.stateDasar,
          durasiSementaraMs: 1400,
          pesanStatusSingkat: "Wah, diklik dua kali!",
        };

      case "mascot:hovered": {
        const aktif = Boolean(detail?.aktif);
        if (aktif && this.stateAktif === "idle") {
          this.stateAktif = "look_cursor";
          return {
            stateBerikutnya: "look_cursor",
            stateDasar: this.stateDasar,
            durasiSementaraMs: null,
            pesanStatusSingkat: "Memperhatikan kursor...",
          };
        }
        if (!aktif && this.stateAktif === "look_cursor") {
          this.stateAktif = this.stateDasar;
        }
        return {
          stateBerikutnya: this.stateAktif,
          stateDasar: this.stateDasar,
          durasiSementaraMs: null,
          pesanStatusSingkat: LABEL_STATUS_MASCOT[this.stateAktif],
        };
      }

      case "mascot:speech_started":
        this.stateAktif = "talking";
        return {
          stateBerikutnya: "talking",
          stateDasar: this.stateDasar,
          durasiSementaraMs: null,
          pesanStatusSingkat: "Sedang berbicara...",
        };

      case "mascot:speech_ended":
        this.stateAktif = this.stateDasar;
        return {
          stateBerikutnya: this.stateDasar,
          stateDasar: this.stateDasar,
          durasiSementaraMs: null,
          pesanStatusSingkat: LABEL_STATUS_MASCOT[this.stateDasar],
        };

      case "mascot:listening": {
        const aktif = Boolean(detail?.aktif);
        this.stateAktif = aktif ? "listening" : this.stateDasar;
        return {
          stateBerikutnya: this.stateAktif,
          stateDasar: this.stateDasar,
          durasiSementaraMs: null,
          pesanStatusSingkat: aktif
            ? "Mendengarkan..."
            : LABEL_STATUS_MASCOT[this.stateDasar],
        };
      }
    }
  }
}
