import type { HTMLAttributes, ReactNode } from "react";
import { gabungKelas } from "@/bersama/utilitas/kelas";

export type VarianLencana =
  | "biru"
  | "ungu"
  | "teal"
  | "netral"
  | "peringatan"
  | "bahaya";

export interface PropertiLencana extends HTMLAttributes<HTMLSpanElement> {
  varian?: VarianLencana;
  titikAktif?: boolean;
  children: ReactNode;
}

const KELAS_VARIAN: Record<VarianLencana, string> = {
  biru: "bg-[#F1E4D0]/20 text-[#344C3D] dark:text-[#F1E4D0] border-[#F1E4D0]/35",
  ungu: "bg-[#A83235]/18 text-[#A83235] dark:text-[#FFF8ED] border-[#A83235]/35",
  teal: "bg-[#344C3D]/25 text-[#344C3D] dark:text-[#C5D4C5] border-[#344C3D]/45",
  netral:
    "bg-black/5 dark:bg-white/8 text-[var(--warna-teks-sekunder)] border-[var(--warna-batas)]",
  peringatan:
    "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30",
  bahaya: "bg-red-500/15 text-red-700 dark:text-red-300 border-red-500/30",
};

const WARNA_TITIK: Record<VarianLencana, string> = {
  biru: "bg-[#F1E4D0]",
  ungu: "bg-[#A83235]",
  teal: "bg-[#C5D4C5]",
  netral: "bg-slate-400",
  peringatan: "bg-amber-400",
  bahaya: "bg-red-400",
};

export function Lencana({
  varian = "netral",
  titikAktif = false,
  className,
  children,
  ...sisaProperti
}: PropertiLencana) {
  return (
    <span
      className={gabungKelas(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium tracking-tight",
        KELAS_VARIAN[varian],
        className
      )}
      {...sisaProperti}
    >
      {titikAktif && (
        <span
          className={gabungKelas("h-1.5 w-1.5 rounded-full", WARNA_TITIK[varian])}
          aria-hidden="true"
        />
      )}
      {children}
    </span>
  );
}
