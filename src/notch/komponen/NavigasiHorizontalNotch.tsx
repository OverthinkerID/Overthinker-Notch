import { useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { PRESET_PEGAS, Tombol } from "@/sistem-desain";
import type { DefinisiMenuNotch } from "@/notch/toko/tokoMenuNotch";

interface PropsNavigasiHorizontalNotch {
  daftarMenu: DefinisiMenuNotch[];
  menuAktifId: string;
  saatPilihMenu: (id: string) => void;
}

function apakahFokusDiInput(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName.toLowerCase();
  if (tag === "input" || tag === "textarea" || tag === "select") return true;
  if (target.isContentEditable) return true;
  if (target.closest(".monaco-editor")) return true;
  return false;
}

export function NavigasiHorizontalNotch({
  daftarMenu,
  menuAktifId,
  saatPilihMenu,
}: PropsNavigasiHorizontalNotch) {
  const indeksAktif = Math.max(
    0,
    daftarMenu.findIndex((m) => m.id === menuAktifId)
  );

  function keSebelumnya(): void {
    if (daftarMenu.length === 0) return;
    const indeksBaru =
      (indeksAktif - 1 + daftarMenu.length) % daftarMenu.length;
    const target = daftarMenu[indeksBaru];
    if (target) saatPilihMenu(target.id);
  }

  function keBerikutnya(): void {
    if (daftarMenu.length === 0) return;
    const indeksBaru = (indeksAktif + 1) % daftarMenu.length;
    const target = daftarMenu[indeksBaru];
    if (target) saatPilihMenu(target.id);
  }

  useEffect(() => {
    const saatTekanPanah = (e: KeyboardEvent) => {
      if (apakahFokusDiInput(e.target)) return;
      if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        keSebelumnya();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        keBerikutnya();
      }
    };
    window.addEventListener("keydown", saatTekanPanah);
    return () => window.removeEventListener("keydown", saatTekanPanah);
  }, [indeksAktif, daftarMenu]);

  return (
    <div
      className="flex items-center gap-1.5 permukaan-kaca rounded-2xl p-1"
      role="navigation"
      aria-label="Navigasi Horizontal Menu Notch"
    >
      <Tombol
        ukuran="kecil"
        varian="hantu"
        aria-label="Menu Sebelumnya"
        onClick={keSebelumnya}
        ikonKiri={<ChevronLeft className="h-3.5 w-3.5" />}
      >
        Prev
      </Tombol>

      <div
        role="tablist"
        aria-label="Daftar Menu Horizontal"
        className="flex items-center gap-1 overflow-x-auto max-w-[66vw] px-1"
      >
        {daftarMenu.map((menu) => {
          const aktif = menu.id === menuAktifId;
          return (
            <button
              key={menu.id}
              type="button"
              role="tab"
              aria-selected={aktif}
              onClick={() => saatPilihMenu(menu.id)}
              className={`relative shrink-0 rounded-xl px-2.5 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
                aktif
                  ? "text-[var(--warna-teks-utama)]"
                  : "text-[var(--warna-teks-sekunder)] hover:text-[var(--warna-teks-utama)]"
              }`}
            >
              {aktif && (
                <motion.span
                  layoutId="indikator-menu-horizontal"
                  transition={PRESET_PEGAS.responsif}
                  className="absolute inset-0 rounded-xl bg-white/80 dark:bg-white/12 border border-[var(--warna-batas-kuat)]"
                />
              )}
              <span className="relative z-10">{menu.label}</span>
            </button>
          );
        })}
      </div>

      <Tombol
        ukuran="kecil"
        varian="hantu"
        aria-label="Menu Berikutnya"
        onClick={keBerikutnya}
        ikonKanan={<ChevronRight className="h-3.5 w-3.5" />}
      >
        Next
      </Tombol>
    </div>
  );
}
