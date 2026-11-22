import { useRef, useState, type MouseEvent } from "react";
import { LABEL_STATUS_MASCOT } from "@/features/mascot/animations/MascotStateMachine";
import { RiveMascotCanvas } from "@/features/mascot/animations/RiveMascotCanvas";
import { MascotController } from "@/features/mascot/controllers/MascotController";
import { useMascotTracking } from "@/features/mascot/hooks/useMascotTracking";
import { MascotEventBus } from "@/features/mascot/services/MascotEventBus";
import { useMascotStore } from "@/features/mascot/stores/useMascotStore";

export function CompactMascot() {
  const refWadah = useRef<HTMLDivElement | null>(null);
  const [menuTerbuka, aturMenuTerbuka] = useState(false);

  const stateAktif = useMascotStore((s) => s.stateAktif);
  const statusSingkat = useMascotStore((s) => s.statusSingkat);
  const pengaturan = useMascotStore((s) => s.pengaturan);
  const aturPanelTerbuka = useMascotStore((s) => s.aturPanelTerbuka);
  const perbaruiPengaturan = useMascotStore((s) => s.perbaruiPengaturan);

  useMascotTracking(refWadah);

  if (!pengaturan.enabled) {
    return (
      <button
        type="button"
        onClick={() => perbaruiPengaturan({ enabled: true })}
        className="rounded-full border border-[var(--warna-batas)] px-2.5 py-1 text-[11px] text-[var(--warna-teks-sekunder)] hover:border-[var(--aksen-biru-elektrik)] cursor-pointer"
      >
        Aktifkan Maskot
      </button>
    );
  }

  const ukuranPx =
    pengaturan.characterSize === "kecil"
      ? 32
      : pengaturan.characterSize === "besar"
        ? 46
        : 38;

  function tanganiContextMenu(e: MouseEvent): void {
    e.preventDefault();
    aturMenuTerbuka((v) => !v);
  }

  return (
    <div
      ref={refWadah}
      className="relative flex items-center gap-2"
      onMouseEnter={() =>
        MascotEventBus.pancarkan("mascot:hovered", { aktif: true })
      }
      onMouseLeave={() => {
        MascotEventBus.pancarkan("mascot:hovered", { aktif: false });
        aturMenuTerbuka(false);
      }}
      onContextMenu={tanganiContextMenu}
    >
      <button
        type="button"
        data-testid="compact-mascot-button"
        aria-label={`Compact Mascot — ${LABEL_STATUS_MASCOT[stateAktif]}`}
        onClick={() => {
          MascotEventBus.pancarkan("mascot:clicked");
          aturPanelTerbuka(true);
        }}
        onDoubleClick={() => {
          MascotEventBus.pancarkan("mascot:double_clicked");
        }}
        className="flex items-center gap-2 rounded-full border border-[#55A7FF]/30 bg-[#55A7FF]/10 pl-1 pr-2.5 py-0.5 hover:border-[#66E5D2]/60 transition cursor-pointer"
      >
        <RiveMascotCanvas ukuranPx={ukuranPx} />
        <div className="hidden sm:block text-left">
          <p className="text-[11px] font-semibold leading-tight text-[var(--warna-teks-utama)]">
            {LABEL_STATUS_MASCOT[stateAktif]}
          </p>
          <p className="max-w-[140px] truncate text-[10px] text-[var(--warna-teks-sekunder)]">
            {statusSingkat}
          </p>
        </div>
      </button>

      {menuTerbuka && (
        <div
          role="menu"
          className="absolute left-0 top-full z-50 mt-1.5 w-44 rounded-xl border border-[var(--warna-batas-kuat)] bg-[var(--warna-permukaan-pekat)] p-1.5 shadow-xl text-xs space-y-1"
        >
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              MascotController.ucapkanSapaan("Hai! Ada yang mau dikerjain?");
              aturMenuTerbuka(false);
            }}
            className="w-full rounded-lg px-2.5 py-1.5 text-left hover:bg-[#55A7FF]/15 cursor-pointer"
          >
            Sapa Sekarang
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              aturPanelTerbuka(true);
              aturMenuTerbuka(false);
            }}
            className="w-full rounded-lg px-2.5 py-1.5 text-left hover:bg-[#55A7FF]/15 cursor-pointer"
          >
            Buka Expanded Mascot
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              perbaruiPengaturan({ enabled: false });
              aturMenuTerbuka(false);
            }}
            className="w-full rounded-lg px-2.5 py-1.5 text-left text-rose-400 hover:bg-rose-500/15 cursor-pointer"
          >
            Nonaktifkan Maskot
          </button>
        </div>
      )}
    </div>
  );
}
