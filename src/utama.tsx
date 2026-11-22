import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@/gaya/utama.css";
import { Aplikasi } from "@/app/Aplikasi";

const elemenAkar = document.getElementById("akar-aplikasi");

if (!elemenAkar) {
  throw new Error("Elemen #akar-aplikasi tidak ditemukan pada dokumen HTML.");
}

createRoot(elemenAkar).render(
  <StrictMode>
    <Aplikasi />
  </StrictMode>
);
