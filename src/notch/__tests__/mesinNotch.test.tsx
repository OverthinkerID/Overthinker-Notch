import { describe, expect, it, beforeEach } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Aplikasi } from "@/app/Aplikasi";
import {
  gunakanTokoNotch,
  hitungPosisiAman,
  tentukanModeEfektif,
  type InfoMonitor,
} from "@/notch";

const MONITOR_MACBOOK_NOTCH: InfoMonitor = {
  idMonitor: "macbook-m1",
  nama: "Built-in Retina Display",
  lebarLogis: 1512,
  tinggiLogis: 982,
  posisiX: 0,
  posisiY: 0,
  faktorSkala: 2,
  utama: true,
  dukunganNotch: true,
  tinggiAreaAmanAtas: 38,
};

const MONITOR_EKSTERNAL: InfoMonitor = {
  idMonitor: "monitor-eksternal",
  nama: "Monitor Eksternal 4K",
  lebarLogis: 1920,
  tinggiLogis: 1080,
  posisiX: 1512,
  posisiY: 0,
  faktorSkala: 2,
  utama: false,
  dukunganNotch: false,
  tinggiAreaAmanAtas: 0,
};

describe("Mesin Notch Overthinker Notch (Fase 3)", () => {
  beforeEach(() => {
    window.localStorage.clear();
    gunakanTokoNotch.setState({
      modeDiminta: "notch_adaptif",
      statusAktif: "ringkas",
      statusTerakhirDiperluas: "diperluas",
      riwayatStatus: ["siaga"],
      selaluDiAtas: true,
      daftarMonitor: [MONITOR_MACBOOK_NOTCH, MONITOR_EKSTERNAL],
      idMonitorAktif: MONITOR_MACBOOK_NOTCH.idMonitor,
      geometriPulau: {
        posisiX: 48,
        posisiY: 40,
        lebarDiperluas: 680,
        tinggiDiperluas: 400,
      },
      bufferMasukan: {
        catatanCepat: "",
        cuplikanKode: "",
        cariMusik: "",
        labelFokus: "",
      },
    });
  });

  it("mengaktifkan Notch Adaptif pada monitor bernotch dan fallback otomatis ke Pulau Melayang pada monitor standar", () => {
    const hasilNotch = tentukanModeEfektif("notch_adaptif", MONITOR_MACBOOK_NOTCH);
    expect(hasilNotch.modeEfektif).toBe("notch_adaptif");
    expect(hasilNotch.fallbackAktif).toBe(false);

    const hasilFallback = tentukanModeEfektif("notch_adaptif", MONITOR_EKSTERNAL);
    expect(hasilFallback.modeEfektif).toBe("pulau_melayang");
    expect(hasilFallback.fallbackAktif).toBe(true);
    expect(hasilFallback.alasanFallback).toContain("Monitor Eksternal 4K");
  });

  it("menjaga koordinat Pulau Melayang tetap di dalam area aman layar", () => {
    const posisi = hitungPosisiAman(-200, -50, 640, 360, MONITOR_MACBOOK_NOTCH);
    expect(posisi.posisiX).toBe(12);
    expect(posisi.posisiY).toBe(38);
  });

  it("menjalankan transisi deterministik 9 status dan tombol kembali", () => {
    const toko = gunakanTokoNotch.getState();
    toko.ubahStatusNotch("catatan");
    expect(gunakanTokoNotch.getState().statusAktif).toBe("catatan");

    toko.ubahStatusNotch("fokus");
    expect(gunakanTokoNotch.getState().statusAktif).toBe("fokus");

    toko.kembaliKeStatusSebelumnya();
    expect(gunakanTokoNotch.getState().statusAktif).toBe("catatan");

    toko.bukaTutupNotch();
    expect(gunakanTokoNotch.getState().statusAktif).toBe("ringkas");

    toko.bukaTutupNotch();
    expect(gunakanTokoNotch.getState().statusAktif).toBe("catatan");
  });

  it("menyimpan preferensi mode, posisi, ukuran, dan Selalu di Atas di localStorage", () => {
    const toko = gunakanTokoNotch.getState();
    toko.aturModeTampilan("pulau_melayang");
    toko.aturSelaluDiAtas(false);
    toko.perbaruiPosisiPulau(220, 96);
    toko.perbaruiUkuranPulau(760, 440);

    gunakanTokoNotch.getState().muatUlangPreferensi();
    const hasil = gunakanTokoNotch.getState();

    expect(hasil.modeDiminta).toBe("pulau_melayang");
    expect(hasil.selaluDiAtas).toBe(false);
    expect(hasil.geometriPulau.posisiX).toBe(220);
    expect(hasil.geometriPulau.posisiY).toBe(96);
    expect(hasil.geometriPulau.lebarDiperluas).toBe(760);
    expect(hasil.geometriPulau.tinggiDiperluas).toBe(440);
  });

  it("tidak menghilangkan teks masukan pengguna saat berpindah status Notch", async () => {
    const pengguna = userEvent.setup();
    render(<Aplikasi />);

    await pengguna.click(screen.getAllByRole("button", { name: /^Catatan$/i })[0]!);
    const areaCatatan = await screen.findByLabelText(/Draft Catatan Cepat/i);
    await pengguna.type(areaCatatan, "Catatan penting tidak boleh hilang");

    await pengguna.click(screen.getByRole("button", { name: /^Musik$/i }));
    await pengguna.click(screen.getByRole("button", { name: /^Siaga$/i }));
    await pengguna.click(screen.getByRole("button", { name: /^Catatan$/i }));

    expect(
      await screen.findByLabelText(/Draft Catatan Cepat/i)
    ).toHaveValue("Catatan penting tidak boleh hilang");
  });

  it("merespons pintasan papan ketik Alt+2 (Catatan), Alt+M (Mode), dan Escape (Siaga)", async () => {
    render(<Aplikasi />);

    fireEvent.keyDown(window, { key: "2", altKey: true });
    expect(gunakanTokoNotch.getState().statusAktif).toBe("catatan");

    fireEvent.keyDown(window, { key: "m", altKey: true });
    expect(gunakanTokoNotch.getState().modeDiminta).toBe("pulau_melayang");

    fireEvent.keyDown(window, { key: "Escape" });
    expect(gunakanTokoNotch.getState().statusAktif).toBe("siaga");
    await screen.findByTestId("kapsul-notch");
  });
});
