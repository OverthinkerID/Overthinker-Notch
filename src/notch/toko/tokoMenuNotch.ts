import { create } from "zustand";

export interface DefinisiMenuNotch {
  id: string;
  label: string;
  urutan: number;
}

export const MENU_BAWAAN_NOTCH: readonly DefinisiMenuNotch[] = [
  { id: "mesin_notch", label: "Mesin Notch", urutan: 1 },
  { id: "musik", label: "Music", urutan: 2 },
  { id: "lirik", label: "Lyrics", urutan: 3 },
  { id: "catatan", label: "Quick Notes", urutan: 4 },
  { id: "berkas", label: "Temp Files", urutan: 5 },
  { id: "papanklip", label: "Clipboard", urutan: 6 },
  { id: "fokus", label: "Focus Mode", urutan: 7 },
  { id: "prompt", label: "AI Prompts", urutan: 8 },
  { id: "proyek", label: "Projects", urutan: 9 },
  { id: "utilitas", label: "Quick Tools", urutan: 10 },
  { id: "pengaturan_maskot", label: "Settings", urutan: 11 },
  { id: "kode", label: "Code Snippets", urutan: 12 },
  { id: "monitor", label: "System Monitor", urutan: 13 },
  { id: "integrasi_os", label: "OS Integration", urutan: 14 },
  { id: "database", label: "Database & Backup", urutan: 15 },
  { id: "sistem_desain", label: "Design System", urutan: 16 },
];

interface KondisiMenuNotch {
  daftarMenu: DefinisiMenuNotch[];
  daftarkanMenu: (menu: DefinisiMenuNotch) => void;
  hapusMenu: (id: string) => void;
}

export const gunakanTokoMenuNotch = create<KondisiMenuNotch>((set, get) => ({
  daftarMenu: [...MENU_BAWAAN_NOTCH],

  daftarkanMenu: (menu) => {
    const ada = get().daftarMenu.some((m) => m.id === menu.id);
    const baru = ada
      ? get().daftarMenu.map((m) => (m.id === menu.id ? menu : m))
      : [...get().daftarMenu, menu];
    set({
      daftarMenu: [...baru].sort((a, b) => a.urutan - b.urutan),
    });
  },

  hapusMenu: (id) => {
    set({
      daftarMenu: get().daftarMenu.filter((m) => m.id !== id),
    });
  },
}));
