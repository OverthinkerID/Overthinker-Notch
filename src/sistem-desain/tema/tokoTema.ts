import { create } from "zustand";
import type { ModeTema } from "@/sistem-desain/token/tokenDesain";

const KUNCI_SIMPAN_TEMA = "overthinker_notch_mode_tema";

export function bacaTemaTersimpan(): ModeTema {
  if (typeof window === "undefined") {
    return "gelap";
  }
  const tersimpan = window.localStorage.getItem(KUNCI_SIMPAN_TEMA);
  return tersimpan === "terang" ? "terang" : "gelap";
}

export function terapkanTemaKeDokumen(mode: ModeTema): void {
  if (typeof document === "undefined") {
    return;
  }
  const akar = document.documentElement;
  if (mode === "gelap") {
    akar.classList.add("dark");
    akar.dataset.tema = "gelap";
  } else {
    akar.classList.remove("dark");
    akar.dataset.tema = "terang";
  }
}

interface KondisiTokoTema {
  mode: ModeTema;
  aturModeTema: (modeBaru: ModeTema) => void;
  gantiModeTema: () => void;
  inisialisasiTema: () => void;
}

export const gunakanTokoTema = create<KondisiTokoTema>((set, get) => ({
  mode: bacaTemaTersimpan(),

  aturModeTema: (modeBaru) => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(KUNCI_SIMPAN_TEMA, modeBaru);
    }
    terapkanTemaKeDokumen(modeBaru);
    set({ mode: modeBaru });
  },

  gantiModeTema: () => {
    const modeBerikutnya: ModeTema = get().mode === "gelap" ? "terang" : "gelap";
    get().aturModeTema(modeBerikutnya);
  },

  inisialisasiTema: () => {
    const modeAwal = bacaTemaTersimpan();
    terapkanTemaKeDokumen(modeAwal);
    set({ mode: modeAwal });
  },
}));
