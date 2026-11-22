import type { HTMLAttributes, ReactNode } from "react";
import { gabungKelas } from "@/bersama/utilitas/kelas";
import { PanelKaca, type JenisKilau } from "./PanelKaca";

export interface PropertiKartu extends HTMLAttributes<HTMLDivElement> {
  elevasi?: "dasar" | "angkat";
  kilau?: JenisKilau;
  children: ReactNode;
}

export function Kartu({
  elevasi = "dasar",
  kilau = "tanpa",
  className,
  children,
  ...sisaProperti
}: PropertiKartu) {
  return (
    <PanelKaca
      elevasi={elevasi}
      kilau={kilau}
      className={gabungKelas("p-5", className)}
      {...sisaProperti}
    >
      {children}
    </PanelKaca>
  );
}

export function KepalaKartu({
  className,
  ...sisaProperti
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={gabungKelas("flex flex-col gap-1 mb-4", className)}
      {...sisaProperti}
    />
  );
}

export function JudulKartu({
  className,
  ...sisaProperti
}: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={gabungKelas(
        "text-[15px] font-semibold tracking-tight text-[var(--warna-teks-utama)]",
        className
      )}
      {...sisaProperti}
    />
  );
}

export function DeskripsiKartu({
  className,
  ...sisaProperti
}: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={gabungKelas(
        "text-xs leading-relaxed text-[var(--warna-teks-sekunder)]",
        className
      )}
      {...sisaProperti}
    />
  );
}

export function IsiKartu({
  className,
  ...sisaProperti
}: HTMLAttributes<HTMLDivElement>) {
  return <div className={gabungKelas("space-y-3", className)} {...sisaProperti} />;
}

export function KakiKartu({
  className,
  ...sisaProperti
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={gabungKelas(
        "mt-4 pt-3 border-t border-[var(--warna-batas)] flex items-center justify-between gap-2",
        className
      )}
      {...sisaProperti}
    />
  );
}
