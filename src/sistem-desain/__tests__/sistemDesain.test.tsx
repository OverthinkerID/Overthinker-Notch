import { describe, expect, it, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Aplikasi } from "@/app/Aplikasi";
import {
  gunakanTokoTema,
  Sakelar,
  Tombol,
  TOKEN_WARNA_IDENTITAS,
  DAFTAR_STATUS_NOTCH,
} from "@/sistem-desain";
import { ambilInfoRuntime, SkemaInfoRuntimeSistem } from "@/bersama/ipc/klienIpc";
import { BatasGalat } from "@/bersama/komponen/BatasGalat";

function KomponenPemicuGalat(): never {
  throw new Error("Simulasi galat uji unit");
}

describe("Sistem Desain Overthinker Notch (Fase 2)", () => {
  beforeEach(() => {
    window.localStorage.clear();
    gunakanTokoTema.getState().aturModeTema("gelap");
  });

  it("memiliki seluruh 5 warna identitas visual sesuai spesifikasi", () => {
    const daftarHex = TOKEN_WARNA_IDENTITAS.map((w) => w.nilaiHex);
    expect(daftarHex).toEqual([
      "#55A7FF",
      "#A879FF",
      "#66E5D2",
      "#101521",
      "#171C29",
    ]);
  });

  it("mendefinisikan 9 status interaksi Notch dalam Bahasa Indonesia", () => {
    expect(DAFTAR_STATUS_NOTCH).toHaveLength(9);
    expect(DAFTAR_STATUS_NOTCH.map((s) => s.label)).toEqual([
      "Siaga",
      "Ringkas",
      "Diperluas",
      "Musik",
      "Catatan",
      "Kode",
      "Berkas",
      "Fokus",
      "Dasbor",
    ]);
  });

  it("mengganti Mode Gelap ke Mode Terang dan menyimpannya di localStorage", async () => {
    const pengguna = userEvent.setup();
    render(<Aplikasi />);

    expect(document.documentElement.classList.contains("dark")).toBe(true);

    const tombolTema = screen.getByRole("button", {
      name: /Beralih ke Mode Terang/i,
    });
    await pengguna.click(tombolTema);

    expect(document.documentElement.classList.contains("dark")).toBe(false);
    expect(window.localStorage.getItem("overthinker_notch_mode_tema")).toBe(
      "terang"
    );
  });

  it("menjaga nilai masukan formulir saat berpindah tab navigasi", async () => {
    const pengguna = userEvent.setup();
    render(<Aplikasi />);

    await pengguna.click(screen.getByRole("tab", { name: /Komponen Inti/i }));
    const masukan = screen.getByLabelText(/Judul Masukan Uji/i);
    await pengguna.type(masukan, "Pengujian State Lokal");

    await pengguna.click(screen.getByRole("tab", { name: /Pegas & Status Notch/i }));
    await pengguna.click(screen.getByRole("tab", { name: /Komponen Inti/i }));

    expect(screen.getByLabelText(/Judul Masukan Uji/i)).toHaveValue(
      "Pengujian State Lokal"
    );
  });

  it("merender Tombol dalam status memuat dan menonaktifkan klik", () => {
    render(<Tombol sedangMemuat>Menyimpan</Tombol>);
    const tombol = screen.getByRole("button", { name: /Menyimpan/i });
    expect(tombol).toBeDisabled();
    expect(tombol).toHaveAttribute("aria-busy", "true");
  });

  it("mengubah status komponen Sakelar saat diklik", async () => {
    const pengguna = userEvent.setup();
    const saatBerubah = vi.fn();
    render(
      <Sakelar
        aktif={false}
        saatBerubah={saatBerubah}
        label="Aktifkan Mode Fokus"
      />
    );

    const sakelar = screen.getByRole("switch", { name: /Aktifkan Mode Fokus/i });
    expect(sakelar).toHaveAttribute("aria-checked", "false");
    await pengguna.click(sakelar);
    expect(saatBerubah).toHaveBeenCalledWith(true);
  });

  it("memvalidasi respons ambilInfoRuntime dengan skema Zod tanpa data palsu", async () => {
    const info = await ambilInfoRuntime();
    expect(() => SkemaInfoRuntimeSistem.parse(info)).not.toThrow();
    expect(info.namaAplikasi).toBe("Overthinker Notch");
    expect(info.modeRuntime).toContain("Pratinjau Web Vite");
  });

  it("menangkap galat antarmuka pada BatasGalat dan menampilkan tombol pemulihan", () => {
    const mataKonsol = vi.spyOn(console, "error").mockImplementation(() => {});
    render(
      <BatasGalat>
        <KomponenPemicuGalat />
      </BatasGalat>
    );

    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByText(/Simulasi galat uji unit/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Muat Ulang Komponen/i })
    ).toBeInTheDocument();
    mataKonsol.mockRestore();
  });
});
