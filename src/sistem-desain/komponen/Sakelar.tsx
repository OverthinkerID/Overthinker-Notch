import { useId } from "react";
import { motion } from "framer-motion";
import { gabungKelas } from "@/bersama/utilitas/kelas";
import { PRESET_PEGAS } from "@/sistem-desain/token/tokenDesain";

export interface PropertiSakelar {
  aktif: boolean;
  saatBerubah: (nilaiBaru: boolean) => void;
  label: string;
  deskripsi?: string;
  nonaktif?: boolean;
}

export function Sakelar({
  aktif,
  saatBerubah,
  label,
  deskripsi,
  nonaktif = false,
}: PropertiSakelar) {
  const idLabel = useId();

  return (
    <div className="flex items-center justify-between gap-4">
      <div className="space-y-0.5">
        <span
          id={idLabel}
          className="block text-sm font-medium text-[var(--warna-teks-utama)]"
        >
          {label}
        </span>
        {deskripsi && (
          <span className="block text-xs text-[var(--warna-teks-sekunder)]">
            {deskripsi}
          </span>
        )}
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={aktif}
        aria-labelledby={idLabel}
        disabled={nonaktif}
        onClick={() => saatBerubah(!aktif)}
        className={gabungKelas(
          "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border p-0.5 transition-colors duration-200 cursor-pointer",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--aksen-biru-elektrik)]",
          "disabled:cursor-not-allowed disabled:opacity-50",
          aktif
            ? "bg-[var(--aksen-biru-elektrik)] border-transparent"
            : "bg-black/10 dark:bg-white/12 border-[var(--warna-batas-kuat)]"
        )}
      >
        <motion.span
          layout
          transition={PRESET_PEGAS.responsif}
          className={gabungKelas(
            "block h-4.5 w-4.5 rounded-full bg-white shadow-sm",
            aktif ? "ml-auto" : "mr-auto"
          )}
        />
      </button>
    </div>
  );
}
