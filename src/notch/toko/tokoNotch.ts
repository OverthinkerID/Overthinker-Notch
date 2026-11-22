import { create } from "zustand";
import {
  apakahStatusDiperluas,
  hitungPosisiAman,
  hitungStatusToggle,
  METADATA_STATUS_NOTCH,
  tentukanModeEfektif,
} from "@/notch/mesin/mesinStatusNotch";
import {
  ambilDaftarMonitorAktif,
  buatMonitorDariViewport,
  terapkanGeometriKeOs,
} from "@/notch/layanan/layananJendela";
import {
  SkemaPreferensiNotch,
  type PreferensiNotchTersimpan,
} from "@/notch/skema/skemaNotch";
import type {
  BufferMasukanNotch,
  GeometriPulau,
  InfoMonitor,
  ModeTampilanNotch,
  StatusInteraksiNotch,
} from "@/notch/tipe/tipeNotch";

const KUNCI_PREFERENSI_NOTCH = "overthinker_notch_preferensi_jendela";

const GEOMETRI_BAWAAN: GeometriPulau = {
  posisiX: 48,
  posisiY: 28,
  lebarDiperluas: 680,
  tinggiDiperluas: 400,
};

const BUFFER_BAWAAN: BufferMasukanNotch = {
  catatanCepat: "",
  cuplikanKode: "",
  cariMusik: "",
  labelFokus: "",
};

export function bacaPreferensiNotchTersimpan(): PreferensiNotchTersimpan {
  const bawaan: PreferensiNotchTersimpan = {
    modeDiminta: "notch_adaptif",
    selaluDiAtas: true,
    idMonitorAktif: null,
    geometriPulau: GEOMETRI_BAWAAN,
  };

  if (typeof window === "undefined") {
    return bawaan;
  }

  try {
    const mentah = window.localStorage.getItem(KUNCI_PREFERENSI_NOTCH);
    if (!mentah) {
      return bawaan;
    }
    const hasil = SkemaPreferensiNotch.safeParse(JSON.parse(mentah));
    return hasil.success ? hasil.data : bawaan;
  } catch {
    return bawaan;
  }
}

function simpanPreferensiNotch(preferensi: PreferensiNotchTersimpan): void {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem(
    KUNCI_PREFERENSI_NOTCH,
    JSON.stringify(preferensi)
  );
}

interface KondisiTokoNotch {
  modeDiminta: ModeTampilanNotch;
  statusAktif: StatusInteraksiNotch;
  statusTerakhirDiperluas: StatusInteraksiNotch;
  riwayatStatus: StatusInteraksiNotch[];
  selaluDiAtas: boolean;
  daftarMonitor: InfoMonitor[];
  idMonitorAktif: string | null;
  geometriPulau: GeometriPulau;
  bufferMasukan: BufferMasukanNotch;
  sinkronisasiOsAktif: boolean;

  muatMonitor: () => Promise<void>;
  aturDaftarMonitor: (daftar: InfoMonitor[]) => void;
  pilihMonitor: (idMonitor: string) => void;
  aturModeTampilan: (modeBaru: ModeTampilanNotch) => void;
  gantiModeTampilan: () => void;
  ubahStatusNotch: (statusBaru: StatusInteraksiNotch) => void;
  kembaliKeStatusSebelumnya: () => void;
  bukaTutupNotch: () => void;
  aturSelaluDiAtas: (aktif: boolean) => void;
  perbaruiPosisiPulau: (posisiX: number, posisiY: number) => void;
  perbaruiUkuranPulau: (lebar: number, tinggi: number) => void;
  perbaruiBufferMasukan: <K extends keyof BufferMasukanNotch>(
    kunci: K,
    nilai: BufferMasukanNotch[K]
  ) => void;
  muatUlangPreferensi: () => void;
}

export function ambilMonitorAktif(
  daftarMonitor: InfoMonitor[],
  idMonitorAktif: string | null
): InfoMonitor | null {
  if (daftarMonitor.length === 0) {
    return null;
  }
  return (
    daftarMonitor.find((m) => m.idMonitor === idMonitorAktif) ??
    daftarMonitor.find((m) => m.utama) ??
    daftarMonitor[0] ??
    null
  );
}

export const gunakanTokoNotch = create<KondisiTokoNotch>((set, get) => {
  const awal = bacaPreferensiNotchTersimpan();
  const monitorAwal = buatMonitorDariViewport();

  const simpanDanSinkronkan = () => {
    const state = get();
    simpanPreferensiNotch({
      modeDiminta: state.modeDiminta,
      selaluDiAtas: state.selaluDiAtas,
      idMonitorAktif: state.idMonitorAktif,
      geometriPulau: state.geometriPulau,
    });

    const dimensi = METADATA_STATUS_NOTCH[state.statusAktif].dimensiBawaan;
    void terapkanGeometriKeOs({
      lebar:
        state.statusAktif === "diperluas"
          ? state.geometriPulau.lebarDiperluas
          : dimensi.lebar,
      tinggi:
        state.statusAktif === "diperluas"
          ? state.geometriPulau.tinggiDiperluas
          : dimensi.tinggi,
      posisiX: state.geometriPulau.posisiX,
      posisiY: state.geometriPulau.posisiY,
      selaluDiAtas: state.selaluDiAtas,
    }).then((tersinkron) => {
      if (tersinkron !== get().sinkronisasiOsAktif) {
        set({ sinkronisasiOsAktif: tersinkron });
      }
    });
  };

  return {
    modeDiminta: awal.modeDiminta,
    statusAktif: "ringkas",
    statusTerakhirDiperluas: "diperluas",
    riwayatStatus: ["siaga"],
    selaluDiAtas: awal.selaluDiAtas,
    daftarMonitor: [monitorAwal],
    idMonitorAktif: awal.idMonitorAktif ?? monitorAwal.idMonitor,
    geometriPulau: awal.geometriPulau,
    bufferMasukan: BUFFER_BAWAAN,
    sinkronisasiOsAktif: false,

    muatMonitor: async () => {
      const daftar = await ambilDaftarMonitorAktif();
      get().aturDaftarMonitor(daftar);
    },

    aturDaftarMonitor: (daftar) => {
      const daftarValid = daftar.length > 0 ? daftar : [buatMonitorDariViewport()];
      const state = get();
      const monitorTerpilih = ambilMonitorAktif(daftarValid, state.idMonitorAktif);
      const idBaru = monitorTerpilih?.idMonitor ?? daftarValid[0]!.idMonitor;

      let geometriBaru = state.geometriPulau;
      if (monitorTerpilih) {
        const posisiAman = hitungPosisiAman(
          state.geometriPulau.posisiX,
          state.geometriPulau.posisiY,
          state.geometriPulau.lebarDiperluas,
          state.geometriPulau.tinggiDiperluas,
          monitorTerpilih
        );
        geometriBaru = {
          ...state.geometriPulau,
          posisiX: posisiAman.posisiX,
          posisiY: posisiAman.posisiY,
        };
      }

      set({
        daftarMonitor: daftarValid,
        idMonitorAktif: idBaru,
        geometriPulau: geometriBaru,
      });
      simpanDanSinkronkan();
    },

    pilihMonitor: (idMonitor) => {
      const state = get();
      const monitorTarget = state.daftarMonitor.find(
        (m) => m.idMonitor === idMonitor
      );
      if (!monitorTarget) {
        return;
      }
      const posisiAman = hitungPosisiAman(
        monitorTarget.posisiX + 40,
        monitorTarget.posisiY + Math.max(24, monitorTarget.tinggiAreaAmanAtas),
        state.geometriPulau.lebarDiperluas,
        state.geometriPulau.tinggiDiperluas,
        monitorTarget
      );
      set({
        idMonitorAktif: monitorTarget.idMonitor,
        geometriPulau: {
          ...state.geometriPulau,
          posisiX: posisiAman.posisiX,
          posisiY: posisiAman.posisiY,
        },
      });
      simpanDanSinkronkan();
    },

    aturModeTampilan: (modeBaru) => {
      set({ modeDiminta: modeBaru });
      simpanDanSinkronkan();
    },

    gantiModeTampilan: () => {
      const modeSaatIni = get().modeDiminta;
      get().aturModeTampilan(
        modeSaatIni === "notch_adaptif" ? "pulau_melayang" : "notch_adaptif"
      );
    },

    ubahStatusNotch: (statusBaru) => {
      const state = get();
      if (state.statusAktif === statusBaru) {
        return;
      }
      set({
        riwayatStatus: [...state.riwayatStatus.slice(-11), state.statusAktif],
        statusAktif: statusBaru,
        statusTerakhirDiperluas: apakahStatusDiperluas(statusBaru)
          ? statusBaru
          : state.statusTerakhirDiperluas,
      });
      simpanDanSinkronkan();
    },

    kembaliKeStatusSebelumnya: () => {
      const state = get();
      const sebelumnya = state.riwayatStatus[state.riwayatStatus.length - 1];
      if (!sebelumnya) {
        set({ statusAktif: "siaga" });
        return;
      }
      set({
        statusAktif: sebelumnya,
        riwayatStatus: state.riwayatStatus.slice(0, -1),
        statusTerakhirDiperluas: apakahStatusDiperluas(sebelumnya)
          ? sebelumnya
          : state.statusTerakhirDiperluas,
      });
      simpanDanSinkronkan();
    },

    bukaTutupNotch: () => {
      const state = get();
      const target = hitungStatusToggle(
        state.statusAktif,
        state.statusTerakhirDiperluas
      );
      get().ubahStatusNotch(target);
    },

    aturSelaluDiAtas: (aktif) => {
      set({ selaluDiAtas: aktif });
      simpanDanSinkronkan();
    },

    perbaruiPosisiPulau: (posisiX, posisiY) => {
      const state = get();
      const monitor = ambilMonitorAktif(state.daftarMonitor, state.idMonitorAktif);
      const dimensi = METADATA_STATUS_NOTCH[state.statusAktif].dimensiBawaan;
      const aman = monitor
        ? hitungPosisiAman(posisiX, posisiY, dimensi.lebar, dimensi.tinggi, monitor)
        : { posisiX, posisiY };

      set({
        geometriPulau: {
          ...state.geometriPulau,
          posisiX: aman.posisiX,
          posisiY: aman.posisiY,
        },
      });
      simpanDanSinkronkan();
    },

    perbaruiUkuranPulau: (lebar, tinggi) => {
      const lebarAman = Math.min(Math.max(Math.round(lebar), 420), 1280);
      const tinggiAman = Math.min(Math.max(Math.round(tinggi), 260), 860);
      set((state) => ({
        geometriPulau: {
          ...state.geometriPulau,
          lebarDiperluas: lebarAman,
          tinggiDiperluas: tinggiAman,
        },
      }));
      simpanDanSinkronkan();
    },

    perbaruiBufferMasukan: (kunci, nilai) => {
      set((state) => ({
        bufferMasukan: {
          ...state.bufferMasukan,
          [kunci]: nilai,
        },
      }));
    },

    muatUlangPreferensi: () => {
      const tersimpan = bacaPreferensiNotchTersimpan();
      set({
        modeDiminta: tersimpan.modeDiminta,
        selaluDiAtas: tersimpan.selaluDiAtas,
        idMonitorAktif: tersimpan.idMonitorAktif,
        geometriPulau: tersimpan.geometriPulau,
      });
    },
  };
});

export function ambilRingkasanModeNotch() {
  const state = gunakanTokoNotch.getState();
  const monitor = ambilMonitorAktif(state.daftarMonitor, state.idMonitorAktif);
  return tentukanModeEfektif(state.modeDiminta, monitor);
}
