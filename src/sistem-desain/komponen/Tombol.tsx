import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { gabungKelas } from "@/bersama/utilitas/kelas";

export type VarianTombol =
  | "utama"
  | "sekunder"
  | "kaca"
  | "hantu"
  | "kerangka"
  | "bahaya";

export type UkuranTombol = "kecil" | "sedang" | "besar" | "ikon";

export interface PropertiTombol extends ButtonHTMLAttributes<HTMLButtonElement> {
  varian?: VarianTombol;
  ukuran?: UkuranTombol;
  sedangMemuat?: boolean;
  ikonKiri?: ReactNode;
  ikonKanan?: ReactNode;
}

const KELAS_VARIAN: Record<VarianTombol, string> = {
  utama:
    "bg-[var(--aksen-biru-elektrik)] text-[#FFF8ED] dark:text-[#101521] font-semibold shadow-sm hover:brightness-105 active:scale-[0.98]",
  sekunder:
    "bg-[#A83235] text-[#FFF8ED] font-semibold shadow-sm hover:brightness-110 active:scale-[0.98]",
  kaca:
    "permukaan-kaca text-[var(--warna-teks-utama)] hover:border-[var(--warna-batas-kuat)] active:scale-[0.98]",
  hantu:
    "bg-transparent text-[var(--warna-teks-sekunder)] hover:bg-black/5 dark:hover:bg-white/8 hover:text-[var(--warna-teks-utama)]",
  kerangka:
    "bg-transparent border border-[var(--warna-batas-kuat)] text-[var(--warna-teks-utama)] hover:bg-black/5 dark:hover:bg-white/6",
  bahaya:
    "bg-[var(--aksen-bahaya)] text-white font-semibold hover:brightness-110 active:scale-[0.98]",
};

const KELAS_UKURAN: Record<UkuranTombol, string> = {
  kecil: "h-8 px-3 text-xs rounded-lg gap-1.5",
  sedang: "h-9 px-4 text-sm rounded-xl gap-2",
  besar: "h-11 px-5 text-sm rounded-xl gap-2",
  ikon: "h-9 w-9 p-0 rounded-xl justify-center",
};

export function Tombol({
  varian = "utama",
  ukuran = "sedang",
  sedangMemuat = false,
  ikonKiri,
  ikonKanan,
  disabled,
  className,
  children,
  type = "button",
  ...sisaProperti
}: PropertiTombol) {
  const nonaktif = Boolean(disabled || sedangMemuat);

  return (
    <button
      type={type}
      disabled={nonaktif}
      aria-busy={sedangMemuat || undefined}
      className={gabungKelas(
        "inline-flex items-center justify-center whitespace-nowrap font-medium transition-all duration-150 cursor-pointer",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--aksen-biru-elektrik)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--warna-latar)]",
        "disabled:pointer-events-none disabled:opacity-50",
        KELAS_VARIAN[varian],
        KELAS_UKURAN[ukuran],
        className
      )}
      {...sisaProperti}
    >
      {sedangMemuat ? (
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
      ) : (
        ikonKiri
      )}
      {children}
      {!sedangMemuat && ikonKanan}
    </button>
  );
}
