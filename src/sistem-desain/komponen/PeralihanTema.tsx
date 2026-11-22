import { Moon, Sun } from "lucide-react";
import { gunakanTokoTema } from "@/sistem-desain/tema/tokoTema";
import { Tombol } from "./Tombol";

export function PeralihanTema() {
  const mode = gunakanTokoTema((state) => state.mode);
  const gantiModeTema = gunakanTokoTema((state) => state.gantiModeTema);

  const sedangGelap = mode === "gelap";

  return (
    <Tombol
      varian="kaca"
      ukuran="sedang"
      onClick={gantiModeTema}
      aria-label={sedangGelap ? "Ganti ke Light Mode" : "Ganti ke Dark Mode"}
      ikonKiri={
        sedangGelap ? (
          <Sun className="h-4 w-4 text-[#66E5D2]" />
        ) : (
          <Moon className="h-4 w-4 text-[#7C3AED]" />
        )
      }
    >
      {sedangGelap ? "Light Mode" : "Dark Mode"}
    </Tombol>
  );
}
