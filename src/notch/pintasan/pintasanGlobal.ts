import { useEffect } from "react";
import { gunakanTokoNotch } from "@/notch/toko/tokoNotch";
import type {
  DefinisiPintasan,
  StatusInteraksiNotch,
} from "@/notch/tipe/tipeNotch";

export const DAFTAR_PINTASAN_BAWAAN: readonly DefinisiPintasan[] = [
  {
    id: "buka-tutup",
    kombinasi: "Alt + Space",
    label: "Buka / Tutup Notch",
    keterangan: "Buka panel terakhir atau ringkas ke bar atas.",
  },
  {
    id: "ganti-mode",
    kombinasi: "Alt + M",
    label: "Ganti Mode Tampilan",
    keterangan: "Pindah antara Notch Adaptif dan Floating Island.",
  },
  {
    id: "status-musik",
    kombinasi: "Alt + 1",
    label: "Buka Musik",
    keterangan: "Langsung pindah ke panel Musik.",
  },
  {
    id: "status-catatan",
    kombinasi: "Alt + 2",
    label: "Buka Catatan",
    keterangan: "Langsung pindah ke Quick Notes.",
  },
  {
    id: "status-kode",
    kombinasi: "Alt + 3",
    label: "Buka Kode",
    keterangan: "Langsung pindah ke Code Snippets.",
  },
  {
    id: "status-berkas",
    kombinasi: "Alt + 4",
    label: "Buka Berkas",
    keterangan: "Langsung pindah ke Temporary Files.",
  },
  {
    id: "status-fokus",
    kombinasi: "Alt + 5",
    label: "Buka Fokus",
    keterangan: "Langsung pindah ke Focus Mode.",
  },
  {
    id: "status-dasbor",
    kombinasi: "Alt + 6",
    label: "Buka Dasbor",
    keterangan: "Langsung pindah ke Dashboard penuh.",
  },
  {
    id: "kembali-siaga",
    kombinasi: "Esc",
    label: "Balik ke Siaga",
    keterangan: "Ringkas cepat ke kapsul Siaga tanpa hapus input.",
  },
] as const;

const PETA_ANGKA_STATUS: Record<string, StatusInteraksiNotch> = {
  "1": "musik",
  "2": "catatan",
  "3": "kode",
  "4": "berkas",
  "5": "fokus",
  "6": "dasbor",
};

export function gunakanPintasanNotch(): void {
  useEffect(() => {
    const tanganiTombolTekan = (peristiwa: KeyboardEvent) => {
      const toko = gunakanTokoNotch.getState();

      if (peristiwa.key === "Escape") {
        if (toko.statusAktif !== "siaga") {
          peristiwa.preventDefault();
          toko.ubahStatusNotch("siaga");
        }
        return;
      }

      if (!peristiwa.altKey || peristiwa.ctrlKey || peristiwa.metaKey) {
        return;
      }

      if (peristiwa.code === "Space" || peristiwa.key === " ") {
        peristiwa.preventDefault();
        toko.bukaTutupNotch();
        return;
      }

      if (peristiwa.key.toLowerCase() === "m") {
        peristiwa.preventDefault();
        toko.gantiModeTampilan();
        return;
      }

      const statusTarget = PETA_ANGKA_STATUS[peristiwa.key];
      if (statusTarget) {
        peristiwa.preventDefault();
        toko.ubahStatusNotch(statusTarget);
      }
    };

    window.addEventListener("keydown", tanganiTombolTekan);
    return () => {
      window.removeEventListener("keydown", tanganiTombolTekan);
    };
  }, []);
}
