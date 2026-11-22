import { describe, expect, it, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  PanelCatatan,
  gunakanTokoCatatan,
  buatKontenEksporJson,
  buatKontenEksporMarkdown,
} from "@/catatan";
import { Aplikasi } from "@/app/Aplikasi";

describe("Quick Notes Overthinker Notch (Fase 5)", () => {
  beforeEach(() => {
    window.localStorage.clear();
    gunakanTokoCatatan.setState({
      daftarCatatan: [],
      idTerpilih: null,
      kataCari: "",
      tagTerpilih: null,
      filterArsip: "aktif",
      sedangMemuat: false,
      statusSimpan: "siaga",
      pesanGalat: null,
    });
  });

  it("membuat catatan lewat Quick Capture dan bertahan setelah dimuat ulang", async () => {
    const pengguna = userEvent.setup();
    render(<PanelCatatan />);

    const inputCepat = screen.getByLabelText(/Quick Capture catatan baru/i);
    await pengguna.type(inputCepat, "Ide fitur Fase 5 Quick Notes");
    await pengguna.click(
      screen.getByRole("button", { name: /Tambah Catatan/i })
    );

    expect(
      await screen.findByLabelText(/Judul Catatan/i)
    ).toHaveValue("Ide fitur Fase 5 Quick Notes");

    await gunakanTokoCatatan.getState().muatCatatan();
    expect(gunakanTokoCatatan.getState().daftarCatatan).toHaveLength(1);
    expect(gunakanTokoCatatan.getState().daftarCatatan[0]?.judul).toBe(
      "Ide fitur Fase 5 Quick Notes"
    );
  });

  it("mendukung Auto-save saat mengubah judul dan isi catatan", async () => {
    const pengguna = userEvent.setup();
    render(<PanelCatatan />);

    await pengguna.type(
      screen.getByLabelText(/Quick Capture catatan baru/i),
      "Judul Awal"
    );
    await pengguna.click(
      screen.getByRole("button", { name: /Tambah Catatan/i })
    );

    const inputJudul = await screen.findByLabelText(/Judul Catatan/i);
    await pengguna.clear(inputJudul);
    await pengguna.type(inputJudul, "Judul Terbaru Auto-save");

    await waitFor(
      () => {
        expect(gunakanTokoCatatan.getState().daftarCatatan[0]?.judul).toBe(
          "Judul Terbaru Auto-save"
        );
      },
      { timeout: 1500 }
    );
  });

  it("mengelola Checklist interaktif (tambah item & centang selesai)", async () => {
    const pengguna = userEvent.setup();
    render(<PanelCatatan />);

    await pengguna.type(
      screen.getByLabelText(/Quick Capture catatan baru/i),
      "Daftar Rilis"
    );
    await pengguna.click(
      screen.getByRole("button", { name: /Tambah Catatan/i })
    );

    await pengguna.click(screen.getByRole("button", { name: /^Checklist$/i }));
    const inputItem = await screen.findByLabelText(/Item checklist baru/i);
    await pengguna.type(inputItem, "Jalankan vitest");
    await pengguna.click(screen.getByRole("button", { name: /Tambah Item/i }));

    const checkbox = await screen.findByRole("checkbox");
    expect(checkbox).not.toBeChecked();
    await pengguna.click(checkbox);
    expect(checkbox).toBeChecked();
    expect(
      gunakanTokoCatatan.getState().daftarCatatan[0]?.kontenMarkdown
    ).toContain("- [x] Jalankan vitest");
  });

  it("menambah tag, memfilter berdasarkan tag, serta mencari catatan", async () => {
    const pengguna = userEvent.setup();
    render(<PanelCatatan />);

    await pengguna.type(
      screen.getByLabelText(/Quick Capture catatan baru/i),
      "Rencana Sprint"
    );
    await pengguna.click(
      screen.getByRole("button", { name: /Tambah Catatan/i })
    );

    const inputTag = await screen.findByLabelText(/Tambah tag baru/i);
    await pengguna.type(inputTag, "kerja");
    await pengguna.click(screen.getByRole("button", { name: /Tambah Tag/i }));

    expect(await screen.findAllByText("#kerja")).not.toHaveLength(0);

    const inputCari = screen.getByLabelText(/Cari catatan/i);
    await pengguna.type(inputCari, "tidak-ada-kecocokan");
    expect(
      screen.getByText(/Belum ada catatan di filter ini/i)
    ).toBeInTheDocument();
  });

  it("mendukung Pin dan Arsip catatan serta ekspor Markdown dan JSON", async () => {
    const pengguna = userEvent.setup();
    render(<PanelCatatan />);

    await pengguna.type(
      screen.getByLabelText(/Quick Capture catatan baru/i),
      "Catatan Penting"
    );
    await pengguna.click(
      screen.getByRole("button", { name: /Tambah Catatan/i })
    );

    await pengguna.click(screen.getByRole("button", { name: /^Pin$/i }));
    expect(gunakanTokoCatatan.getState().daftarCatatan[0]?.disematkan).toBe(
      true
    );

    const catatan = gunakanTokoCatatan.getState().daftarCatatan[0]!;
    const md = buatKontenEksporMarkdown(catatan);
    expect(md).toContain("# Catatan Penting");
    expect(md).toContain("disematkan: true");

    const json = JSON.parse(buatKontenEksporJson([catatan]));
    expect(json.totalCatatan).toBe(1);

    await pengguna.click(screen.getByRole("button", { name: /^Arsipkan$/i }));
    expect(gunakanTokoCatatan.getState().daftarCatatan[0]?.diarsipkan).toBe(
      true
    );
  });

  it("menyimpan catatan langsung dari KapsulNotch ke Quick Notes", async () => {
    const pengguna = userEvent.setup();
    render(<Aplikasi />);

    await pengguna.click(
      screen.getAllByRole("button", { name: /^Catatan$/i })[0]!
    );
    const areaDraft = await screen.findByLabelText(/Draft Catatan Cepat/i);
    await pengguna.type(areaDraft, "Catatan kilat dari Notch");
    await pengguna.click(
      screen.getByRole("button", { name: /Simpan ke Quick Notes/i })
    );

    expect(
      await screen.findByText(/Tersimpan ke Quick Notes/i)
    ).toBeInTheDocument();
    expect(gunakanTokoCatatan.getState().daftarCatatan).toHaveLength(1);
    expect(gunakanTokoCatatan.getState().daftarCatatan[0]?.kontenMarkdown).toBe(
      "Catatan kilat dari Notch"
    );
  });
});
