import { describe, expect, it, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PanelDatabase, gunakanTokoDatabase } from "@/database";

describe("Panel Database & Persistensi (Fase 4)", () => {
  beforeEach(() => {
    window.localStorage.clear();
    gunakanTokoDatabase.setState({
      ringkasan: null,
      hasilIntegrity: null,
      daftarBackup: [],
      hasilPembersihan: null,
      pesanStatus: null,
      pesanGalat: null,
    });
  });

  it("menampilkan ringkasan 18 tabel SQLite dan menjalankan Integrity Check", async () => {
    const pengguna = userEvent.setup();
    render(<PanelDatabase />);

    expect(await screen.findByText(/Total Tabel: 18/i)).toBeInTheDocument();
    expect(screen.getByText("workspaces")).toBeInTheDocument();
    expect(screen.getByText("backups")).toBeInTheDocument();

    await pengguna.click(
      screen.getByRole("button", { name: /Integrity Check/i })
    );

    expect(await screen.findByText(/Sehat \(OK\)/i)).toBeInTheDocument();
  });

  it("membuat backup manual dan menyimpannya secara persisten di penyimpanan lokal", async () => {
    const pengguna = userEvent.setup();
    render(<PanelDatabase />);

    const masukanCatatan = await screen.findByLabelText(/Catatan Backup Manual/i);
    await pengguna.type(masukanCatatan, "Snapshot sebelum Fase 5");
    await pengguna.click(screen.getByRole("button", { name: /Buat Backup/i }));

    expect(
      await screen.findByText(/Snapshot sebelum Fase 5/i)
    ).toBeInTheDocument();
    expect(window.localStorage.getItem("overthinker_notch_catatan_backup_web")).toContain(
      "Snapshot sebelum Fase 5"
    );
  });

  it("menyimpan kebijakan retensi data dan bertahan setelah dimuat ulang", async () => {
    const pengguna = userEvent.setup();
    render(<PanelDatabase />);

    const inputClipboard = await screen.findByLabelText(
      /Retensi Clipboard \(Hari\)/i
    );
    await pengguna.clear(inputClipboard);
    await pengguna.type(inputClipboard, "60");
    await pengguna.click(
      screen.getByRole("button", { name: /Simpan Pengaturan/i })
    );

    expect(
      await screen.findByText(/Pengaturan retensi berhasil disimpan/i)
    ).toBeInTheDocument();

    await pengguna.click(screen.getByRole("button", { name: /Refresh/i }));
    expect(
      gunakanTokoDatabase.getState().kebijakanRetensi.hariRetensiClipboard
    ).toBe(60);
  });
});
