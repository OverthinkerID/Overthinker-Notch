import { useEffect } from "react";
import { BatasGalat } from "@/bersama/komponen/BatasGalat";
import { gunakanTokoTema } from "@/sistem-desain/tema/tokoTema";
import { EtalaseSistemDesain } from "@/sistem-desain/komponen/EtalaseSistemDesain";

export function Aplikasi() {
  const inisialisasiTema = gunakanTokoTema((state) => state.inisialisasiTema);

  useEffect(() => {
    inisialisasiTema();
  }, [inisialisasiTema]);

  return (
    <BatasGalat>
      <EtalaseSistemDesain />
    </BatasGalat>
  );
}
