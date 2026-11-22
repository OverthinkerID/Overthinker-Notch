import { useEffect, type RefObject } from "react";
import { MascotController } from "@/features/mascot/controllers/MascotController";
import { MascotEventBus } from "@/features/mascot/services/MascotEventBus";
import { useMascotStore } from "@/features/mascot/stores/useMascotStore";

export function useMascotTracking(
  refElemen: RefObject<HTMLElement | null>,
  idleTimeoutMs = 90000
): void {
  const cursorTrackingEnabled = useMascotStore(
    (s) => s.pengaturan.cursorTrackingEnabled
  );
  const reducedMotion = useMascotStore((s) => s.pengaturan.reducedMotion);
  const enabled = useMascotStore((s) => s.pengaturan.enabled);

  useEffect(() => {
    if (!enabled) return;

    let timerIdle: number | null = null;
    const resetIdle = () => {
      if (timerIdle !== null) window.clearTimeout(timerIdle);
      timerIdle = window.setTimeout(() => {
        if (typeof document === "undefined" || !document.hidden) {
          MascotEventBus.pancarkan("app:idle");
        }
      }, idleTimeoutMs);
    };

    const saatGerakPointer = (ev: PointerEvent) => {
      resetIdle();
      if (!cursorTrackingEnabled || reducedMotion) return;
      if (typeof document !== "undefined" && document.hidden) return;
      const el = refElemen.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const pusatX = rect.left + rect.width / 2;
      const pusatY = rect.top + rect.height / 2;
      MascotController.perbaruiPosisiKursor(ev.clientX, ev.clientY, pusatX, pusatY);
    };

    resetIdle();
    window.addEventListener("pointermove", saatGerakPointer, { passive: true });
    window.addEventListener("keydown", resetIdle, { passive: true });

    return () => {
      if (timerIdle !== null) window.clearTimeout(timerIdle);
      window.removeEventListener("pointermove", saatGerakPointer);
      window.removeEventListener("keydown", resetIdle);
    };
  }, [refElemen, cursorTrackingEnabled, reducedMotion, enabled, idleTimeoutMs]);
}
