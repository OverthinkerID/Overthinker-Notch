import { describe, expect, it, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  DAFTAR_14_BAHASA,
  PanelCuplikan,
  buatEksporJsonCuplikan,
  deteksiBahasaKode,
  gunakanTokoCuplikan,
} from "@/cuplikan";

describe("Code Snippet Vault Overthinker Notch (Fase 7)", () => {
  beforeEach(() => {
    window.localStorage.clear();
    gunakanTokoCuplikan.setState({
      daftarCuplikan: [],
      idTerpilih: null,
      kataCari: "",
      kategoriTerpilih: null,
      hanyaFavorit: false,
      sedangMemuat: false,
      pesanStatus: null,
      pesanGalat: null,
    });
  });

  it("mendukung seluruh 14 bahasa wajib dan mendeteksi bahasa secara akurat", () => {
    expect(DAFTAR_14_BAHASA).toHaveLength(14);
    expect(deteksiBahasaKode("<!DOCTYPE html><div>Halo</div>")).toBe("html");
    expect(deteksiBahasaKode(".panel { color: #55A7FF; }")).toBe("css");
    expect(deteksiBahasaKode("const x = (a) => console.log(a);")).toBe("javascript");
    expect(deteksiBahasaKode("interface User { id: string; }")).toBe("typescript");
    expect(deteksiBahasaKode("def hitung(x):\n  return x * 2")).toBe("python");
    expect(deteksiBahasaKode("public class App { public static void main(String[] a) {} }")).toBe("java");
    expect(deteksiBahasaKode("#include <iostream>\nint main() { return 0; }")).toBe("cpp");
    expect(deteksiBahasaKode("using System;\nConsole.WriteLine(\"Hi\");")).toBe("csharp");
    expect(deteksiBahasaKode("SELECT id, nama FROM projects;")).toBe("sql");
    expect(deteksiBahasaKode('{"nama": "Overthinker"}')).toBe("json");
    expect(deteksiBahasaKode("nama: overthinker\nversi: 7")).toBe("yaml");
    expect(deteksiBahasaKode("#!/bin/bash\necho $HOME")).toBe("shell");
    expect(deteksiBahasaKode("pub struct App {}\nfn main() { println!(\"ok\"); }")).toBe("rust");
    expect(deteksiBahasaKode("<?php echo 'halo';")).toBe("php");
  });

  it("menyimpan snippet baru, membuat version history saat diedit, dan memulihkan versi lama", async () => {
    const pengguna = userEvent.setup();
    render(<PanelCuplikan />);

    await pengguna.type(screen.getByLabelText(/Judul Snippet/i), "Query Proyek");
    const editor = screen.getByLabelText(/Editor Kode Snippet/i);
    await pengguna.type(editor, "SELECT * FROM projects;");
    await pengguna.click(screen.getByRole("button", { name: /Deteksi Bahasa/i }));
    await pengguna.click(screen.getByRole("button", { name: /Simpan Snippet/i }));

    expect(
      await screen.findByText(/Snippet "Query Proyek" tersimpan \(v1\)/i)
    ).toBeInTheDocument();
    expect(gunakanTokoCuplikan.getState().daftarCuplikan[0]?.bahasa).toBe("sql");

    // Edit kode -> menghasilkan v2
    await pengguna.clear(editor);
    await pengguna.type(editor, "SELECT id, nama FROM projects LIMIT 10;");
    await pengguna.click(screen.getByRole("button", { name: /Simpan Snippet/i }));

    expect(
      await screen.findByText(/Snippet "Query Proyek" tersimpan \(v2\)/i)
    ).toBeInTheDocument();
    expect(
      gunakanTokoCuplikan.getState().daftarCuplikan[0]?.riwayatVersi
    ).toHaveLength(2);

    // Buka riwayat & pulihkan v1
    await pengguna.click(screen.getByRole("button", { name: /Riwayat \(2\)/i }));
    const tombolPulihkan = await screen.findAllByRole("button", {
      name: /Pulihkan Versi/i,
    });
    await pengguna.click(tombolPulihkan[1]!);
    expect(editor).toHaveValue("SELECT * FROM projects;");
  });

  it("mendukung favorit, ekspor JSON, dan impor JSON tervalidasi Zod", async () => {
    const toko = gunakanTokoCuplikan.getState();
    const tersimpan = await toko.simpanCuplikan({
      judul: "Hello Rust",
      bahasa: "rust",
      kategori: "Backend",
      kode: 'fn main() { println!("Halo"); }',
      deskripsi: "Contoh Rust",
      daftarTag: ["rust", "cli"],
      favorit: false,
    });
    expect(tersimpan).not.toBeNull();

    await gunakanTokoCuplikan.getState().ubahFavoritCuplikan(tersimpan!.id);
    expect(gunakanTokoCuplikan.getState().daftarCuplikan[0]?.favorit).toBe(true);

    const jsonEkspor = buatEksporJsonCuplikan(
      gunakanTokoCuplikan.getState().daftarCuplikan
    );
    window.localStorage.clear();
    await gunakanTokoCuplikan.getState().imporDariJson(jsonEkspor);

    expect(gunakanTokoCuplikan.getState().daftarCuplikan).toHaveLength(1);
    expect(gunakanTokoCuplikan.getState().daftarCuplikan[0]?.judul).toBe(
      "Hello Rust"
    );
  });
});
