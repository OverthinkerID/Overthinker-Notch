import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { gabungKelas } from "@/bersama/utilitas/kelas";
import { PRESET_PEGAS } from "@/sistem-desain/token/tokenDesain";

export interface ItemTab<T extends string = string> {
  id: T;
  label: string;
  ikon?: ReactNode;
}

export interface PropertiTabNavigasi<T extends string = string> {
  daftarTab: readonly ItemTab<T>[];
  tabAktif: T;
  saatPilihTab: (idTab: T) => void;
  idGrup?: string;
  className?: string;
}

export function TabNavigasi<T extends string = string>({
  daftarTab,
  tabAktif,
  saatPilihTab,
  idGrup = "tab-navigasi",
  className,
}: PropertiTabNavigasi<T>) {
  return (
    <div
      role="tablist"
      className={gabungKelas(
        "inline-flex flex-wrap items-center gap-1 rounded-2xl p-1 permukaan-kaca",
        className
      )}
    >
      {daftarTab.map((item) => {
        const terpilih = item.id === tabAktif;
        return (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={terpilih}
            onClick={() => saatPilihTab(item.id)}
            className={gabungKelas(
              "relative inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer",
              terpilih
                ? "text-[var(--warna-teks-utama)]"
                : "text-[var(--warna-teks-sekunder)] hover:text-[var(--warna-teks-utama)]"
            )}
          >
            {terpilih && (
              <motion.span
                layoutId={`indikator-${idGrup}`}
                transition={PRESET_PEGAS.notch}
                className="absolute inset-0 rounded-xl bg-[var(--aksen-biru-elektrik)]/18 border border-[var(--aksen-biru-elektrik)]/35"
              />
            )}
            <span className="relative z-10 inline-flex items-center gap-1.5">
              {item.ikon}
              {item.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
