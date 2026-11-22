import { MascotStateMachine } from "@/features/mascot/animations/MascotStateMachine";
import { MascotAnimationService } from "@/features/mascot/services/MascotAnimationService";
import { MascotAudioReactionService } from "@/features/mascot/services/MascotAudioReactionService";
import { MascotEventBus } from "@/features/mascot/services/MascotEventBus";
import { MascotSpeechService } from "@/features/mascot/services/MascotSpeechService";
import { useMascotStore } from "@/features/mascot/stores/useMascotStore";
import type {
  MascotAnimationState,
  MascotEventType,
} from "@/features/mascot/types/mascotTypes";

class MascotControllerImpl {
  private mesin = new MascotStateMachine();
  private timerSementara: number | null = null;
  private timerKedip: number | null = null;
  private timerIdle: number | null = null;
  private sudahTerpasang = false;
  private lepasLangganan: Array<() => void> = [];

  public inisialisasi(): () => void {
    if (this.sudahTerpasang) {
      return () => {};
    }
    this.sudahTerpasang = true;

    const daftarEvent: MascotEventType[] = [
      "app:opened",
      "workspace:changed",
      "focus:started",
      "focus:completed",
      "music:started",
      "music:stopped",
      "notification:received",
      "app:idle",
      "error:occurred",
      "mascot:clicked",
      "mascot:double_clicked",
      "mascot:hovered",
      "mascot:speech_started",
      "mascot:speech_ended",
      "mascot:listening",
    ];

    this.lepasLangganan = daftarEvent.map((ev) =>
      MascotEventBus.langganan(ev, (payload) => {
        this.tanganiEvent(ev, payload as Record<string, unknown> | undefined);
      })
    );

    const daftarSuara = MascotSpeechService.ambilDaftarSuara();
    if (daftarSuara.length > 0) {
      useMascotStore.getState().aturDaftarSuara(daftarSuara);
    }

    this.jadwalkanKedipBerikutnya();
    this.jadwalkanIdleVariatif();

    return () => {
      this.hancurkan();
    };
  }

  public hancurkan(): void {
    for (const lepas of this.lepasLangganan) {
      lepas();
    }
    this.lepasLangganan = [];
    this.sudahTerpasang = false;
    this.mesin.aturStateLangsung("idle");
    if (this.timerSementara !== null) {
      window.clearTimeout(this.timerSementara);
      this.timerSementara = null;
    }
    if (this.timerKedip !== null) {
      window.clearTimeout(this.timerKedip);
      this.timerKedip = null;
    }
    if (this.timerIdle !== null) {
      window.clearTimeout(this.timerIdle);
      this.timerIdle = null;
    }
    MascotSpeechService.hentikan();
  }

  public tanganiEvent(
    event: MascotEventType,
    detail?: Record<string, unknown>
  ): void {
    const store = useMascotStore.getState();
    const { pengaturan } = store;
    if (!pengaturan.enabled) return;

    if (event === "music:started" && !pengaturan.musicReactionEnabled) {
      return;
    }

    const hasil = this.mesin.prosesEvent(
      event,
      pengaturan.personalityPreset,
      detail
    );
    store.aturStateAktif(hasil.stateBerikutnya);
    store.aturStatusSingkat(hasil.pesanStatusSingkat);

    if (this.timerSementara !== null) {
      window.clearTimeout(this.timerSementara);
      this.timerSementara = null;
    }

    if (hasil.durasiSementaraMs !== null) {
      this.timerSementara = window.setTimeout(() => {
        const dasar = this.mesin.ambilStateDasar();
        this.mesin.aturStateLangsung(dasar);
        useMascotStore.getState().aturStateAktif(dasar);
      }, hasil.durasiSementaraMs);
    }
  }

  public aturStateManual(stateBaru: MascotAnimationState): void {
    this.mesin.aturStateLangsung(stateBaru);
    useMascotStore.getState().aturStateAktif(stateBaru);
  }

  public perbaruiPosisiKursor(
    klienX: number,
    klienY: number,
    pusatX: number,
    pusatY: number
  ): void {
    const store = useMascotStore.getState();
    if (
      !store.pengaturan.enabled ||
      !store.pengaturan.cursorTrackingEnabled ||
      store.pengaturan.reducedMotion
    ) {
      return;
    }
    const vektor = MascotAnimationService.hitungVektorMataTerbatas(
      klienX,
      klienY,
      pusatX,
      pusatY
    );
    store.aturMataVektor(vektor);
  }

  public ucapkanSapaan(teks: string): void {
    const store = useMascotStore.getState();
    if (!store.pengaturan.enabled) return;
    store.aturPesanSapaan(teks);
    MascotSpeechService.ucapkan({
      teks,
      voiceEnabled: store.pengaturan.voiceEnabled,
      soundEnabled: store.pengaturan.soundEnabled,
      speechRate: store.pengaturan.speechRate,
      voiceName: store.pengaturan.voiceName,
      saatMulai: () => {
        MascotEventBus.pancarkan("mascot:speech_started", { teks });
      },
      saatMulutBerubah: (bukaan) => {
        useMascotStore.getState().aturMulutTerbuka(bukaan);
      },
      saatSelesai: () => {
        MascotEventBus.pancarkan("mascot:speech_ended");
      },
    });
  }

  public perbaruiReaksiMusik(sedangMemutar: boolean, posisiDetik: number): void {
    const store = useMascotStore.getState();
    if (!store.pengaturan.enabled || !store.pengaturan.musicReactionEnabled) {
      store.aturAudioTelemetri({
        aktif: false,
        intensitas: 0,
        frekuensiRendah: 0,
        frekuensiMenengah: 0,
        frekuensiTinggi: 0,
      });
      return;
    }
    const telemetri = MascotAudioReactionService.bacaTelemetriAudio(
      sedangMemutar,
      posisiDetik
    );
    store.aturAudioTelemetri(telemetri);
  }

  private jadwalkanKedipBerikutnya(): void {
    if (typeof window === "undefined") return;
    const store = useMascotStore.getState();
    const interval = MascotAnimationService.hitungIntervalKedipanMs(
      store.pengaturan
    );
    this.timerKedip = window.setTimeout(() => {
      const s = useMascotStore.getState();
      const terlihat =
        typeof document === "undefined" ? true : !document.hidden;
      if (s.pengaturan.enabled && !s.pengaturan.reducedMotion && terlihat) {
        s.aturSedangBerkedip(true);
        window.setTimeout(() => {
          useMascotStore.getState().aturSedangBerkedip(false);
        }, 140);
      }
      this.jadwalkanKedipBerikutnya();
    }, interval);
  }

  private jadwalkanIdleVariatif(): void {
    if (typeof window === "undefined") return;
    this.timerIdle = window.setTimeout(() => {
      const s = useMascotStore.getState();
      const terlihat =
        typeof document === "undefined" ? true : !document.hidden;
      if (
        s.pengaturan.enabled &&
        s.pengaturan.idleBehavior &&
        !s.pengaturan.reducedMotion &&
        terlihat &&
        this.mesin.ambilStateAktif() === "idle"
      ) {
        const aksi = MascotAnimationService.pilihAksiIdleVariatif();
        if (aksi !== "idle") {
          s.aturStateAktif(aksi);
          window.setTimeout(() => {
            if (useMascotStore.getState().stateAktif === aksi) {
              useMascotStore
                .getState()
                .aturStateAktif(this.mesin.ambilStateDasar());
            }
          }, 950);
        }
      }
      this.jadwalkanIdleVariatif();
    }, 5200);
  }
}

export const MascotController = new MascotControllerImpl();
