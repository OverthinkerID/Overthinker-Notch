import { create } from "zustand";
import { MascotSettingsService } from "@/features/mascot/services/MascotSettingsService";
import type {
  MascotAnimationState,
  MascotAudioTelemetry,
  MascotEyeVector,
  MascotPersonalityPreset,
  MascotSettings,
} from "@/features/mascot/types/mascotTypes";

interface KondisiStoreMascot {
  stateAktif: MascotAnimationState;
  sedangBerkedip: boolean;
  mataVektor: MascotEyeVector;
  mulutTerbuka: number;
  audioTelemetri: MascotAudioTelemetry;
  statusSingkat: string;
  pesanSapaan: string;
  panelTerbuka: boolean;
  daftarSuara: string[];
  pengaturan: MascotSettings;

  aturStateAktif: (state: MascotAnimationState) => void;
  aturSedangBerkedip: (aktif: boolean) => void;
  aturMataVektor: (vektor: MascotEyeVector) => void;
  aturMulutTerbuka: (nilai: number) => void;
  aturAudioTelemetri: (telemetri: MascotAudioTelemetry) => void;
  aturStatusSingkat: (status: string) => void;
  aturPesanSapaan: (pesan: string) => void;
  aturPanelTerbuka: (terbuka: boolean) => void;
  aturDaftarSuara: (daftar: string[]) => void;
  perbaruiPengaturan: (sebagian: Partial<MascotSettings>) => void;
  terapkanPreset: (preset: MascotPersonalityPreset) => void;
}

export const useMascotStore = create<KondisiStoreMascot>((set, get) => ({
  stateAktif: "idle",
  sedangBerkedip: false,
  mataVektor: { x: 0, y: 0 },
  mulutTerbuka: 0,
  audioTelemetri: {
    aktif: false,
    intensitas: 0,
    frekuensiRendah: 0,
    frekuensiMenengah: 0,
    frekuensiTinggi: 0,
  },
  statusSingkat: "Siaga",
  pesanSapaan: "Hai! Aku Overthinker Bot, siap nemenin kerjaanmu.",
  panelTerbuka: false,
  daftarSuara: [],
  pengaturan: MascotSettingsService.baca(),

  aturStateAktif: (stateAktif) => set({ stateAktif }),
  aturSedangBerkedip: (sedangBerkedip) => set({ sedangBerkedip }),
  aturMataVektor: (mataVektor) => set({ mataVektor }),
  aturMulutTerbuka: (mulutTerbuka) => set({ mulutTerbuka }),
  aturAudioTelemetri: (audioTelemetri) => set({ audioTelemetri }),
  aturStatusSingkat: (statusSingkat) => set({ statusSingkat }),
  aturPesanSapaan: (pesanSapaan) => set({ pesanSapaan }),
  aturPanelTerbuka: (panelTerbuka) => set({ panelTerbuka }),
  aturDaftarSuara: (daftarSuara) => set({ daftarSuara }),

  perbaruiPengaturan: (sebagian) => {
    const tersimpan = MascotSettingsService.simpan({
      ...get().pengaturan,
      ...sebagian,
    });
    set({ pengaturan: tersimpan });
  },

  terapkanPreset: (preset) => {
    const tersimpan = MascotSettingsService.terapkanPreset(
      get().pengaturan,
      preset
    );
    set({ pengaturan: tersimpan });
  },
}));
