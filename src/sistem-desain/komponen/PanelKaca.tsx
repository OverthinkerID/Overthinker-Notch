import type { HTMLAttributes, ReactNode } from "react";
import { gabungKelas } from "@/bersama/utilitas/kelas";

export type JenisKilau = "tanpa" | "biru" | "ungu" | "teal";

export interface PropertiPanelKaca extends HTMLAttributes<HTMLDivElement> {
  elevasi?: "dasar" | "angkat";
  kilau?: JenisKilau;
  children: ReactNode;
}

const KELAS_KILAU: Record<JenisKilau, string> = {
  tanpa: "",
  biru: "kilau-biru",
  ungu: "kilau-ungu",
  teal: "kilau-teal",
};

export function PanelKaca({
  elevasi = "dasar",
  kilau = "tanpa",
  className,
  children,
  ...sisaProperti
}: PropertiPanelKaca) {
  return (
    <div
      className={gabungKelas(
        "rounded-2xl transition-colors duration-200",
        elevasi === "angkat" ? "permukaan-kaca-angkat" : "permukaan-kaca",
        KELAS_KILAU[kilau],
        className
      )}
      {...sisaProperti}
    >
      {children}
    </div>
  );
}
