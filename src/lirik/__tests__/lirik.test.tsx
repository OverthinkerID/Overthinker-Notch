import { describe, expect, it, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  KONFIG_PENYEDIA_LIRIK_BAWAAN,
  PanelLirik,
  ambilJendelaLirik,
  gunakanTokoLirik,
  uraiLirikLrc,
} from "@/lirik";

describe("Lyrics Engine Overthinker Notch (Fase 11)", () => {
  beforeEach(() => {
    window.localStorage.clear();
    gunakanTokoLirik.setState({
      riwayatLirik: [],
      idTerpilih: null,
      konfigPenyedia: { ...KONFIG_PENYEDIA_LIRIK_BAWAAN },
      posisiDetik: 0,
      tampilkanTerjemahan: true,
      pesanStatus: null,
      pesanGalat: null,
    });
  });

  it("mengurai LRC bertimestamp dengan sorotan baris sebelumnya, aktif, dan berikutnya", () => {
    const lrc = [
      "[00:05.00] Baris satu",
      "[00:12.50] Baris dua",
      "[00:20.00] Baris tiga",
    ].join("\n");

    const hasil = uraiLirikLrc(lrc);
    expect(hasil.tersinkronisasi).toBe(true);
    expect(hasil.barisTerjadwal).toHaveLength(3);

    const jendela = ambilJendelaLirik(hasil.barisTerjadwal, 15);
    expect(jendela.barisSebelumnya?.teks).toBe("Baris satu");
    expect(jendela.barisAktif?.teks).toBe("Baris dua");
    expect(jendela.barisBerikutnya?.teks).toBe("Baris tiga");
  });

  it("tidak pernah mengklaim lirik polos sebagai lirik tersinkronisasi", async () => {
    const teksPolos = "Ini lirik biasa tanpa timestamp\nBaris kedua lirik polos";
    const hasil = uraiLirikLrc(teksPolos);
    expect(hasil.tersinkronisasi).toBe(false);

    await gunakanTokoLirik.getState().simpanLirik({
      judulLagu: "Lagu Polos",
      artis: "Artis Uji",
      penyedia: "Manual Lokal",
      bahasa: "id",
      teksLirik: teksPolos,
      terjemahan: "Plain lyric translation",
    });

    render(<PanelLirik />);

    expect(
      await screen.findAllByText(/Lirik Polos \(Tidak Tersinkronisasi\)/i)
    ).not.toHaveLength(0);
    expect(screen.getByText(/Plain lyric translation/i)).toBeInTheDocument();
  });

  it("mencari lirik dari cache lokal atau menolak fabrikasi jika penyedia resmi belum diatur", async () => {
    const pengguna = userEvent.setup();
    render(<PanelLirik />);

    await pengguna.type(
      screen.getByLabelText(/Cari judul lagu lirik/i),
      "Lagu Belum Ada"
    );
    await pengguna.click(screen.getByRole("button", { name: /^Cari Lirik$/i }));

    expect(
      await screen.findByText(/penyedia lirik resmi belum dikonfigurasi/i)
    ).toBeInTheDocument();
  });
});
