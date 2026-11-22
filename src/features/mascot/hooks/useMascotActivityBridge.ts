import { useEffect, useRef } from "react";
import { MascotController } from "@/features/mascot/controllers/MascotController";
import { MascotEventBus } from "@/features/mascot/services/MascotEventBus";
import { useMascotStore } from "@/features/mascot/stores/useMascotStore";
import { gunakanTokoFokus } from "@/fokus";
import { gunakanTokoMusik } from "@/musik";

export function useMascotActivityBridge(ruangAktif: string): void {
  const statusFokus = gunakanTokoFokus((s) => s.timer.status);
  const trekAktif = gunakanTokoMusik((s) => s.trekAktif);
  const statusFokusSebelumnya = useRef(statusFokus);
  const musikSebelumnya = useRef(trekAktif.sedangMemutar);

  useEffect(() => {
    const lepas = MascotController.inisialisasi();
    MascotEventBus.pancarkan("app:opened", {
      waktu: new Date().toISOString(),
    });
    return lepas;
  }, []);

  useEffect(() => {
    MascotEventBus.pancarkan("workspace:changed", { ruang: ruangAktif });
  }, [ruangAktif]);

  useEffect(() => {
    if (statusFokusSebelumnya.current !== statusFokus) {
      if (statusFokus === "berjalan") {
        MascotEventBus.pancarkan("focus:started", { mode: "timer" });
      } else if (
        statusFokusSebelumnya.current === "berjalan" &&
        statusFokus === "siaga"
      ) {
        MascotEventBus.pancarkan("focus:completed", { durasiDetik: 0 });
      }
      statusFokusSebelumnya.current = statusFokus;
    }
  }, [statusFokus]);

  useEffect(() => {
    if (musikSebelumnya.current !== trekAktif.sedangMemutar) {
      if (trekAktif.sedangMemutar && trekAktif.judulLagu) {
        MascotEventBus.pancarkan("music:started", {
          judulLagu: trekAktif.judulLagu,
          artis: trekAktif.artis ?? undefined,
        });
      } else {
        MascotEventBus.pancarkan("music:stopped");
      }
      musikSebelumnya.current = trekAktif.sedangMemutar;
    }
    MascotController.perbaruiReaksiMusik(
      trekAktif.sedangMemutar,
      trekAktif.posisiDetik
    );
  }, [trekAktif.sedangMemutar, trekAktif.posisiDetik, trekAktif.judulLagu, trekAktif.artis]);

  useEffect(() => {
    const saatTekanTombol = (e: KeyboardEvent) => {
      if (e.altKey && e.key.toLowerCase() === "l") {
        e.preventDefault();
        const sekarang = useMascotStore.getState().panelTerbuka;
        useMascotStore.getState().aturPanelTerbuka(!sekarang);
      }
    };
    window.addEventListener("keydown", saatTekanTombol);
    return () => window.removeEventListener("keydown", saatTekanTombol);
  }, []);
}
