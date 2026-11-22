import { useId, type InputHTMLAttributes, type TextareaHTMLAttributes } from "react";
import { gabungKelas } from "@/bersama/utilitas/kelas";

export interface PropertiKolomMasukan
  extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  bantuan?: string;
  galat?: string;
}

export function KolomMasukan({
  label,
  bantuan,
  galat,
  id,
  className,
  ...sisaProperti
}: PropertiKolomMasukan) {
  const idOtomatis = useId();
  const idAkhir = id ?? idOtomatis;

  return (
    <div className="space-y-1.5">
      {label && (
        <label
          htmlFor={idAkhir}
          className="block text-xs font-medium text-[var(--warna-teks-sekunder)]"
        >
          {label}
        </label>
      )}
      <input
        id={idAkhir}
        aria-invalid={Boolean(galat) || undefined}
        className={gabungKelas(
          "h-9 w-full rounded-xl border bg-white/70 dark:bg-[#101521]/75 px-3 text-sm text-[var(--warna-teks-utama)]",
          "placeholder:text-[var(--warna-teks-redup)] transition-colors duration-150",
          "focus:outline-none focus:ring-2 focus:ring-[var(--aksen-biru-elektrik)]/60 focus:border-[var(--aksen-biru-elektrik)]",
          galat
            ? "border-[var(--aksen-bahaya)]"
            : "border-[var(--warna-batas-kuat)]",
          className
        )}
        {...sisaProperti}
      />
      {galat ? (
        <p className="text-xs text-[var(--aksen-bahaya)]">{galat}</p>
      ) : bantuan ? (
        <p className="text-xs text-[var(--warna-teks-redup)]">{bantuan}</p>
      ) : null}
    </div>
  );
}

export interface PropertiAreaTeks
  extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  bantuan?: string;
  galat?: string;
}

export function AreaTeks({
  label,
  bantuan,
  galat,
  id,
  className,
  ...sisaProperti
}: PropertiAreaTeks) {
  const idOtomatis = useId();
  const idAkhir = id ?? idOtomatis;

  return (
    <div className="space-y-1.5">
      {label && (
        <label
          htmlFor={idAkhir}
          className="block text-xs font-medium text-[var(--warna-teks-sekunder)]"
        >
          {label}
        </label>
      )}
      <textarea
        id={idAkhir}
        aria-invalid={Boolean(galat) || undefined}
        className={gabungKelas(
          "min-h-[88px] w-full rounded-xl border bg-white/70 dark:bg-[#101521]/75 p-3 text-sm text-[var(--warna-teks-utama)]",
          "placeholder:text-[var(--warna-teks-redup)] transition-colors duration-150 resize-y",
          "focus:outline-none focus:ring-2 focus:ring-[var(--aksen-biru-elektrik)]/60 focus:border-[var(--aksen-biru-elektrik)]",
          galat
            ? "border-[var(--aksen-bahaya)]"
            : "border-[var(--warna-batas-kuat)]",
          className
        )}
        {...sisaProperti}
      />
      {galat ? (
        <p className="text-xs text-[var(--aksen-bahaya)]">{galat}</p>
      ) : bantuan ? (
        <p className="text-xs text-[var(--warna-teks-redup)]">{bantuan}</p>
      ) : null}
    </div>
  );
}
