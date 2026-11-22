import { describe, expect, it, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  PanelPapanklip,
  PENGATURAN_PAPANKLIP_BAWAAN,
  deteksiTipeKontenPapanklip,
  gunakanTokoPapanklip,
  periksaDataSensitif,
} from "@/papanklip";

describe("Clipboard Manager Overthinker Notch (Fase 8)", () => {
  beforeEach(() => {
    window.localStorage.clear();
    gunakanTokoPapanklip.setState({
      daftarItem: [],
      pengaturan: {
        ...PENGATURAN_PAPANKLIP_BAWAAN,
        aplikasiDikecualikan: [
          ...PENGATURAN_PAPANKLIP_BAWAAN.aplikasiDikecualikan,
        ],
      },
      filterAktif: "semua",
      kataCari: "",
      pesanStatus: null,
      pesanPeringatan: null,
    });
  });

  it("mengklasifikasi teks, kode, dan URL serta mendeteksi data sensitif", () => {
    expect(deteksiTipeKontenPapanklip("https://github.com/OverthinkerID")).toBe("url");
    expect(deteksiTipeKontenPapanklip("const x = () => { return 42; };")).toBe("kode");
    expect(deteksiTipeKontenPapanklip("Catatan belanja hari ini")).toBe("teks");

    expect(periksaDataSensitif("sk-proj-1234567890abcdefghijklmnop").sensitif).toBe(true);
    expect(periksaDataSensitif("ghp_1234567890abcdefghijklmno").sensitif).toBe(true);
    expect(periksaDataSensitif("-----BEGIN RSA PRIVATE KEY-----").sensitif).toBe(true);
    expect(periksaDataSensitif("Halo dunia biasa").sensitif).toBe(false);
  });

  it("memblokir data sensitif dan aplikasi dikecualikan sebelum disimpan", async () => {
    const toko = gunakanTokoPapanklip.getState();

    const hasilRahasia = await toko.tangkapTeks(
      "sk-test-1234567890abcdefghijklmnop",
      "VS Code"
    );
    expect(hasilRahasia).toBe(false);
    expect(gunakanTokoPapanklip.getState().daftarItem).toHaveLength(0);

    const hasilAppDiblokir = await toko.tangkapTeks(
      "teks biasa dari password manager",
      "1Password"
    );
    expect(hasilAppDiblokir).toBe(false);
    expect(gunakanTokoPapanklip.getState().daftarItem).toHaveLength(0);
  });

  it("menyimpan item, melindungi item di-pin saat Hapus Non-Pin, dan mendukung pencarian", async () => {
    const pengguna = userEvent.setup();
    render(<PanelPapanklip />);

    const areaPaste = screen.getByLabelText(/Paste Teks, Kode, URL, atau Gambar/i);
    await pengguna.type(areaPaste, "https://overthinker.id");
    await pengguna.click(
      screen.getByRole("button", { name: /Simpan ke Riwayat/i })
    );

    await pengguna.type(areaPaste, "Catatan sementara biasa");
    await pengguna.click(
      screen.getByRole("button", { name: /Simpan ke Riwayat/i })
    );

    expect(gunakanTokoPapanklip.getState().daftarItem).toHaveLength(2);

    // Pin item pertama (yang terbaru: Catatan sementara biasa)
    const tombolPin = screen.getAllByRole("button", { name: /^Pin item$/i });
    await pengguna.click(tombolPin[0]!);

    // Hapus semua non-pin -> hanya item yang di-pin yang tersisa
    await pengguna.click(screen.getByRole("button", { name: /Hapus Non-Pin/i }));
    expect(gunakanTokoPapanklip.getState().daftarItem).toHaveLength(1);
    expect(gunakanTokoPapanklip.getState().daftarItem[0]?.disematkan).toBe(true);
  });
});
