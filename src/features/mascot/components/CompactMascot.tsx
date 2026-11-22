import { useRef, useState, type MouseEvent } from "react";
import { LABEL_STATUS_MASCOT } from "@/features/mascot/animations/MascotStateMachine";
import { RiveMascotCanvas } from "@/features/mascot/animations/RiveMascotCanvas";
import { MascotController } from "@/features/mascot/controllers/MascotController";
import { useMascotTracking } from "@/features/mascot/hooks/useMascotTracking";
import { MascotEventBus } from "@/features/mascot/services/MascotEventBus";
import { useMascotStore } from "@/features/mascot/stores/useMascotStore";
import { gunakanTokoNotch } from "@/notch/toko/tokoNotch";

export function CompactMascot({
  ukuranOverridePx,
}: { ukuranOverridePx?: number } = {}) {
  const refWadah = useRef<HTMLDivElement | null>(null);
  const [menuTerbuka, aturMenuTerbuka] = useState(false);

  const stateAktif = useMascotStore((s) => s.stateAktif);
  const statusSingkat = useMascotStore((s) => s.statusSingkat);
  const pengaturan = useMascotStore((s) => s.pengaturan);
  const aturPanelTerbuka = useMascotStore((s) => s.aturPanelTerbuka);
  const perbaruiPengaturan = useMascotStore((s) => s.perbaruiPengaturan);
  const ubahStatusNotch = gunakanTokoNotch((s) => s.ubahStatusNotch);

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
    ukuranOverridePx ??
    (pengaturan.characterSize === "kecil"
      ? 34
      : pengaturan.characterSize === "besar"
        ? 50
        : 42);

  const labelKarakter =
    pengaturan.selectedCharacter === "hush_puppy"
      ? "Hush Puppy"
      : pengaturan.selectedCharacter === "little_companion"
        ? "Little Companion"
        : "Overthinker Robot";

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
          ubahStatusNotch("dasbor");
        }}
        className="flex items-center gap-2.5 rounded-full border border-[#344C3D]/65 bg-[#101521]/90 pl-1.5 pr-3 py-0.5 hover:border-[#F1E4D0]/70 transition cursor-pointer"
      >
        <RiveMascotCanvas ukuranPx={ukuranPx} />
        <div className="hidden sm:block text-left">
          <p className="text-[11px] font-semibold leading-tight text-[#FFF8ED]">
            {LABEL_STATUS_MASCOT[stateAktif]} •{" "}
            <span className="text-[#F1E4D0]">{labelKarakter}</span>
          </p>
          <p className="max-w-[160px] truncate text-[10px] text-[#C5D4C5]">
            {statusSingkat}
          </p>
        </div>
      </button>

      {menuTerbuka && (
        <div
          role="menu"
          className="absolute left-0 top-full z-50 mt-1.5 w-48 rounded-xl border border-[var(--warna-batas-kuat)] bg-[var(--warna-permukaan-angkat)] p-1.5 shadow-xl text-xs space-y-1"
        >
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              MascotController.ucapkanSapaan("Hai! Ada yang mau dikerjain?");
              aturMenuTerbuka(false);
            }}
            className="w-full rounded-lg px-2.5 py-1.5 text-left hover:bg-[#344C3D]/25 cursor-pointer"
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
            className="w-full rounded-lg px-2.5 py-1.5 text-left hover:bg-[#344C3D]/25 cursor-pointer"
          >
            Buka Expanded Mascot
          </button>
          <div className="border-t border-[var(--warna-batas)] pt-1 space-y-0.5">
            {(
              [
                ["overthinker_robot", "Overthinker Robot"],
                ["hush_puppy", "Hush Puppy"],
                ["little_companion", "Little Companion"],
              ] as const
            ).map(([id, nama]) => (
              <button
                key={id}
                type="button"
                role="menuitem"
                onClick={() => {
                  perbaruiPengaturan({ selectedCharacter: id });
                  aturMenuTerbuka(false);
                }}
                className={`w-full rounded-lg px-2.5 py-1 text-left cursor-pointer ${
                  pengaturan.selectedCharacter === id
                    ? "bg-[#344C3D] text-[#FFF8ED]"
                    : "hover:bg-[#344C3D]/20"
                }`}
              >
                {nama}
              </button>
            ))}
          </div>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              perbaruiPengaturan({ enabled: false });
              aturMenuTerbuka(false);
            }}
            className="w-full rounded-lg px-2.5 py-1.5 text-left text-[#A83235] hover:bg-[#A83235]/15 cursor-pointer"
          >
            Nonaktifkan Maskot
          </button>
        </div>
      )}
    </div>
  );
}
