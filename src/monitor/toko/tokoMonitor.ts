import { create } from "zustand";
import { ambilTelemetriSistemLayanan } from "@/monitor/layanan/layananMonitor";
import type { TelemetriSistem } from "@/monitor/tipe/tipeMonitor";

interface KondisiTokoMonitor {
  telemetri: TelemetriSistem | null;
  sedangMemuat: boolean;
  autoRefresh: boolean;
  pesanGalat: string | null;

  muatTelemetri: () => Promise<void>;
  aturAutoRefresh: (aktif: boolean) => void;
}

export const gunakanTokoMonitor = create<KondisiTokoMonitor>((set) => ({
  telemetri: null,
  sedangMemuat: false,
  autoRefresh: false,
  pesanGalat: null,

  muatTelemetri: async () => {
    set({ sedangMemuat: true, pesanGalat: null });
    try {
      const data = await ambilTelemetriSistemLayanan();
      set({ telemetri: data, sedangMemuat: false });
    } catch (galat) {
      set({
        sedangMemuat: false,
        pesanGalat:
          galat instanceof Error ? galat.message : "Gagal membaca telemetri OS.",
      });
    }
  },

  aturAutoRefresh: (aktif) => set({ autoRefresh: aktif }),
}));
