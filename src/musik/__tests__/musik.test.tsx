import { describe, expect, it, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  KONFIG_PENGENAL_BAWAAN,
  PanelMusik,
  gunakanTokoMusik,
} from "@/musik";

describe("Music Engine Overthinker Notch (Fase 10)", () => {
  beforeEach(() => {
    window.localStorage.clear();
    gunakanTokoMusik.setState({
      trekAktif: {
        sedangMemutar: false,
        judulLagu: null,
        artis: null,
        album: null,
        sumberAudio: "Belum terhubung",
        durasiDetik: 0,
        posisiDetik: 0,
        urlArtwork: null,
        kontrolDidukung: false,
      },
      kapabilitas: [],
      riwayatMusik: [],
      konfigPengenal: { ...KONFIG_PENGENAL_BAWAAN },
      sedangMemuat: false,
      pesanStatus: null,
      pesanGalat: null,
    });
  });

  it("tidak menampilkan lagu palsu saat tidak ada pemutar musik aktif dan menonaktifkan kontrol media", async () => {
    render(<PanelMusik />);

    expect(
      await screen.findByText(/Nggak ada musik yang lagi diputar/i)
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Putar Lagu/i })).toBeDisabled();
    expect(
      screen.getByRole("button", { name: /Lagu Berikutnya/i })
    ).toBeDisabled();
  });

  it("menolak simulasi pengenalan lagu palsu jika penyedia resmi belum dikonfigurasi", async () => {
    const pengguna = userEvent.setup();
    render(<PanelMusik />);

    await pengguna.click(
      await screen.findByRole("button", { name: /Identifikasi via Mikrofon/i })
    );

    expect(
      await screen.findByText(/Penyedia pengenal lagu resmi belum dikonfigurasi/i)
    ).toBeInTheDocument();
  });

  it("mencatat lagu ke riwayat musik secara persisten", async () => {
    const pengguna = userEvent.setup();
    render(<PanelMusik />);

    await pengguna.type(
      screen.getByLabelText(/Judul lagu manual/i),
      "Laskar Pelangi"
    );
    await pengguna.type(screen.getByLabelText(/Artis manual/i), "Nidji");
    await pengguna.click(
      screen.getByRole("button", { name: /Catat ke Riwayat Musik/i })
    );

    expect(await screen.findByText("Laskar Pelangi")).toBeInTheDocument();
    expect(gunakanTokoMusik.getState().riwayatMusik).toHaveLength(1);
    expect(gunakanTokoMusik.getState().riwayatMusik[0]?.artis).toBe("Nidji");
  });
});
