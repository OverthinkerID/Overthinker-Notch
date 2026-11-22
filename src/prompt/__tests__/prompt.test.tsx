import { beforeEach, describe, expect, it } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import {
  buatEksporJsonPrompt,
  ekstrakVariabelPrompt,
  PanelPrompt,
  terapkanVariabelPrompt,
  gunakanTokoPrompt,
} from "@/prompt";

describe("Fase 12 — AI Prompt Library", () => {
  beforeEach(() => {
    window.localStorage.clear();
    gunakanTokoPrompt.setState({
      daftarPrompt: [],
      idTerpilih: null,
      kataCari: "",
      kategoriTerpilih: null,
      hanyaFavorit: false,
      pesanStatus: null,
      pesanGalat: null,
    });
  });

  it("mengekstrak dan mensubstitusi variabel {{variabel}} secara dinamis tanpa duplikasi", () => {
    const template =
      "Buat review kode {{bahasa}} fokus ke {{fokus}} untuk file {{bahasa}}.";
    const variabel = ekstrakVariabelPrompt(template);
    expect(variabel).toEqual(["bahasa", "fokus"]);

    const hasil = terapkanVariabelPrompt(template, {
      bahasa: "TypeScript",
      fokus: "keamanan tipe",
    });
    expect(hasil).toBe(
      "Buat review kode TypeScript fokus ke keamanan tipe untuk file TypeScript."
    );
  });

  it("mendukung simpan prompt, substitusi live di UI, Version History, dan rollback ke v1", async () => {
    render(<PanelPrompt />);

    fireEvent.change(screen.getByLabelText("Judul Prompt"), {
      target: { value: "Review Arsitektur Tauri" },
    });
    fireEvent.change(screen.getByLabelText("Template Prompt"), {
      target: { value: "Audit modul {{modul}} untuk target {{platform}}." },
    });

    // Variabel dinamis otomatis muncul dan bisa diisi
    fireEvent.change(screen.getByLabelText("Nilai variabel modul"), {
      target: { value: "SQLite" },
    });
    fireEvent.change(screen.getByLabelText("Nilai variabel platform"), {
      target: { value: "macOS" },
    });

    expect(screen.getByTestId("pratinjau-hasil-prompt")).toHaveTextContent(
      "Audit modul SQLite untuk target macOS."
    );

    fireEvent.click(screen.getByRole("button", { name: /Simpan Prompt/i }));

    await waitFor(() => {
      expect(screen.getByText(/tersimpan \(v1\)/i)).toBeInTheDocument();
    });

    // Update ke versi 2
    fireEvent.change(screen.getByLabelText("Template Prompt"), {
      target: { value: "Audit mendalam {{modul}} v2." },
    });
    fireEvent.change(screen.getByLabelText("Catatan Versi (Opsional)"), {
      target: { value: "Perbarui instruksi v2" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Simpan Prompt/i }));

    await waitFor(() => {
      expect(screen.getByText(/tersimpan \(v2\)/i)).toBeInTheDocument();
    });

    // Buka Version History dan rollback ke v1
    fireEvent.click(screen.getByRole("button", { name: /Riwayat \(2\)/i }));
    const tombolPulihkan = screen.getAllByRole("button", {
      name: /Pulihkan Versi/i,
    });
    fireEvent.click(tombolPulihkan[1]!);

    expect(screen.getByLabelText("Template Prompt")).toHaveValue(
      "Audit modul {{modul}} untuk target {{platform}}."
    );
  });

  it("mendukung filter favorit, pencarian, serta Import/Export JSON round-trip", async () => {
    await gunakanTokoPrompt.getState().simpanPrompt({
      judul: "Ringkasan Rapat",
      kategori: "Produktivitas",
      templatePrompt: "Ringkas catatan rapat {{tim}} dalam {{jumlah}} poin.",
      daftarTag: ["rapat", "ringkas"],
      favorit: true,
    });

    await gunakanTokoPrompt.getState().simpanPrompt({
      judul: "Generator Regex",
      kategori: "Coding",
      templatePrompt: "Buat regex untuk {{pola}}.",
      daftarTag: ["regex"],
      favorit: false,
    });

    const ekspor = buatEksporJsonPrompt(
      gunakanTokoPrompt.getState().daftarPrompt
    );
    expect(ekspor).toContain("Ringkasan Rapat");
    expect(ekspor).toContain("Generator Regex");

    // Reset dan impor ulang dari JSON
    window.localStorage.clear();
    gunakanTokoPrompt.setState({ daftarPrompt: [], idTerpilih: null });
    await gunakanTokoPrompt.getState().imporDariJson(ekspor);

    render(<PanelPrompt />);

    await waitFor(() => {
      expect(screen.getByText("Ringkasan Rapat")).toBeInTheDocument();
      expect(screen.getByText("Generator Regex")).toBeInTheDocument();
    });

    // Filter hanya favorit
    fireEvent.click(screen.getByRole("button", { name: /^Favorit$/i }));
    expect(screen.getByText("Ringkasan Rapat")).toBeInTheDocument();
    expect(screen.queryByText("Generator Regex")).not.toBeInTheDocument();

    // Nonaktifkan favorit lalu uji pencarian
    fireEvent.click(screen.getByRole("button", { name: /^Favorit$/i }));
    fireEvent.change(screen.getByLabelText("Cari prompt AI"), {
      target: { value: "regex" },
    });
    expect(screen.queryByText("Ringkasan Rapat")).not.toBeInTheDocument();
    expect(screen.getByText("Generator Regex")).toBeInTheDocument();
  });
});
