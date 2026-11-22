import { describe, expect, it, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  PENGATURAN_FOKUS_BAWAAN,
  PanelFokus,
  formatDurasiTimer,
  gunakanTokoFokus,
  hitungDetikBerjalan,
  hitungDetikTersisa,
} from "@/fokus";

describe("Focus Engine Overthinker Notch (Fase 9)", () => {
  beforeEach(() => {
    window.localStorage.clear();
    gunakanTokoFokus.setState({
      pengaturan: { ...PENGATURAN_FOKUS_BAWAAN },
      timer: {
        mode: "pomodoro",
        label: "",
        targetDetik: 25 * 60,
        status: "siaga",
        waktuMulaiMs: null,
        akumulasiDetikSebelumJeda: 0,
        mulaiPadaIso: null,
      },
      riwayatSesi: [],
      pesanStatus: null,
    });
  });

  it("menghitung waktu berjalan dan tersisa berbasis timestamp secara akurat saat window tidak aktif", () => {
    const t0 = 1_700_000_000_000;
    const timer = {
      mode: "pomodoro" as const,
      label: "Tes Akurasi",
      targetDetik: 1500,
      status: "berjalan" as const,
      waktuMulaiMs: t0,
      akumulasiDetikSebelumJeda: 0,
      mulaiPadaIso: new Date(t0).toISOString(),
    };

    // Simulasi 10 menit berlalu tanpa tick interval
    const tSetelah10Menit = t0 + 600_000;
    expect(hitungDetikBerjalan(timer, tSetelah10Menit)).toBe(600);
    expect(hitungDetikTersisa(timer, tSetelah10Menit)).toBe(900);
    expect(formatDurasiTimer(900)).toBe("15:00");
  });

  it("menyimpan sesi fokus ke riwayat dan memicu penyelesaian otomatis saat target tercapai", async () => {
    const pengguna = userEvent.setup();
    render(<PanelFokus />);

    await pengguna.type(
      screen.getByLabelText(/Label tugas fokus/i),
      "Review Kode Rust"
    );
    await pengguna.click(screen.getByRole("button", { name: /^Mulai Fokus$/i }));
    expect(gunakanTokoFokus.getState().timer.status).toBe("berjalan");

    const mulai = gunakanTokoFokus.getState().timer.waktuMulaiMs!;
    await gunakanTokoFokus
      .getState()
      .periksaPenyelesaianOtomatis(mulai + 25 * 60 * 1000);

    expect(gunakanTokoFokus.getState().timer.status).toBe("siaga");
    expect(gunakanTokoFokus.getState().riwayatSesi).toHaveLength(1);
    expect(gunakanTokoFokus.getState().riwayatSesi[0]?.label).toBe(
      "Review Kode Rust"
    );
    expect(gunakanTokoFokus.getState().riwayatSesi[0]?.durasiAktualDetik).toBe(
      1500
    );
  });

  it("mendukung perpindahan mode Deep Work, Custom Timer, Stopwatch, dan mode Istirahat", async () => {
    const pengguna = userEvent.setup();
    render(<PanelFokus />);

    await pengguna.click(screen.getByRole("button", { name: /^Deep Work$/i }));
    expect(screen.getByTestId("tampilan-timer-fokus")).toHaveTextContent("50:00");

    await pengguna.click(screen.getByRole("button", { name: /^Stopwatch$/i }));
    expect(screen.getByTestId("tampilan-timer-fokus")).toHaveTextContent("00:00");

    await pengguna.click(screen.getByRole("button", { name: /Istirahat \(5m\)/i }));
    expect(gunakanTokoFokus.getState().timer.status).toBe("istirahat");
    expect(screen.getByTestId("tampilan-timer-fokus")).toHaveTextContent("05:00");
  });
});
