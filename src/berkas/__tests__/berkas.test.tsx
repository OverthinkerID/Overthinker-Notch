import { describe, expect, it, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PanelBerkas, gunakanTokoBerkas } from "@/berkas";

describe("Temporary File Storage Overthinker Notch (Fase 6)", () => {
  beforeEach(() => {
    window.localStorage.clear();
    gunakanTokoBerkas.setState({
      daftarBerkas: [],
      idTerpilih: null,
      tabAktif: "aktif",
      kataCari: "",
      opsiKedaluwarsaBawaan: "14_hari",
      sedangMemuat: false,
      pesanStatus: null,
      pesanGalat: null,
    });
  });

  it("mengimpor banyak file, menampilkan preview teks, dan bertahan setelah dimuat ulang", async () => {
    const pengguna = userEvent.setup();
    render(<PanelBerkas />);

    const inputFile = screen.getByLabelText(/Pilih banyak file untuk diimpor/i);
    const file1 = new File(["Halo dari Overthinker Notch!"], "catatan-uji.txt", {
      type: "text/plain",
    });
    const file2 = new File(['{"versi": 6}'], "konfig.json", {
      type: "application/json",
    });

    await pengguna.upload(inputFile, [file1, file2]);

    expect(
      await screen.findByText(/2 file berhasil disalin ke vault lokal/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Halo dari Overthinker Notch!/i)
    ).toBeInTheDocument();

    await gunakanTokoBerkas.getState().muatBerkas();
    expect(gunakanTokoBerkas.getState().daftarBerkas).toHaveLength(2);
  });

  it("mendukung rename file dan tautan project", async () => {
    const pengguna = userEvent.setup();
    render(<PanelBerkas />);

    const inputFile = screen.getByLabelText(/Pilih banyak file untuk diimpor/i);
    await pengguna.upload(
      inputFile,
      new File(["isi awal"], "lama.md", { type: "text/markdown" })
    );

    const inputRename = await screen.findByLabelText(/Rename File/i);
    await pengguna.clear(inputRename);
    await pengguna.type(inputRename, "baru-rapih.md");
    await pengguna.click(screen.getByRole("button", { name: /Simpan Nama/i }));

    expect(
      await screen.findByText(/Nama file berhasil diperbarui/i)
    ).toBeInTheDocument();
    expect(gunakanTokoBerkas.getState().daftarBerkas[0]?.namaTampil).toBe(
      "baru-rapih.md"
    );

    const inputProject = screen.getByLabelText(/Tautkan ke Project/i);
    await pengguna.type(inputProject, "Overthinker Notch");
    await pengguna.click(
      screen.getByRole("button", { name: /Simpan Project/i })
    );
    expect(gunakanTokoBerkas.getState().daftarBerkas[0]?.projectId).toBe(
      "Overthinker Notch"
    );
  });

  it("memindahkan file ke Recovery, memulihkan, dan menghapus permanen salinan vault", async () => {
    const pengguna = userEvent.setup();
    render(<PanelBerkas />);

    const inputFile = screen.getByLabelText(/Pilih banyak file untuk diimpor/i);
    await pengguna.upload(
      inputFile,
      new File(["data sementara"], "temp.txt", { type: "text/plain" })
    );

    await pengguna.click(await screen.findByRole("button", { name: /^Hapus$/i }));
    expect(gunakanTokoBerkas.getState().daftarBerkas[0]?.dihapusPada).not.toBeNull();

    await pengguna.click(screen.getByRole("button", { name: /^Recovery$/i }));
    await pengguna.click(
      await screen.findByRole("button", { name: /^Pulihkan$/i })
    );
    expect(gunakanTokoBerkas.getState().daftarBerkas[0]?.dihapusPada).toBeNull();

    // Hapus lagi lalu hapus permanen dari Recovery
    await pengguna.click(screen.getByRole("button", { name: /^Aktif$/i }));
    await pengguna.click(await screen.findByRole("button", { name: /^Hapus$/i }));
    await pengguna.click(screen.getByRole("button", { name: /^Recovery$/i }));
    await pengguna.click(
      await screen.findByRole("button", { name: /Hapus Permanen/i })
    );
    expect(gunakanTokoBerkas.getState().daftarBerkas).toHaveLength(0);
  });

  it("memindahkan file kedaluwarsa ke Recovery lewat Bersihkan Kedaluwarsa", async () => {
    const pengguna = userEvent.setup();
    window.localStorage.setItem(
      "overthinker_notch_temp_files",
      JSON.stringify([
        {
          id: "file-expired-1",
          projectId: null,
          namaAsli: "lama.log",
          namaTampil: "lama.log",
          pathRelatifVault: "vault/lama.log",
          tipeMime: "text/plain",
          ukuranByte: 42,
          checksumSha256: "abc",
          kedaluwarsaPada: "2020-01-01T00:00:00.000Z",
          dihapusPada: null,
          dibuatPada: "2020-01-01T00:00:00.000Z",
          diperbaruiPada: "2020-01-01T00:00:00.000Z",
          pratinjauTeks: "log lama",
        },
      ])
    );

    render(<PanelBerkas />);
    await pengguna.click(
      screen.getByRole("button", { name: /Bersihkan Kedaluwarsa/i })
    );

    expect(
      await screen.findByText(/1 file kedaluwarsa dipindahkan ke Recovery/i)
    ).toBeInTheDocument();
    expect(gunakanTokoBerkas.getState().daftarBerkas[0]?.dihapusPada).not.toBeNull();
  });
});
