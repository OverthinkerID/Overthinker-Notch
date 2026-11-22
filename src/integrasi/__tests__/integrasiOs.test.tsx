import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { invoke } from "@tauri-apps/api/core";
import { gunakanTokoIntegrasiOs, PanelIntegrasiOs } from "@/integrasi";

vi.mock("@tauri-apps/api/core", () => ({
  invoke: vi.fn(),
}));

describe("Fase 16 — macOS & Windows Integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    delete (window as unknown as Record<string, unknown>).__TAURI_INTERNALS__;
    gunakanTokoIntegrasiOs.setState({
      status: null,
      sedangMemuat: false,
      pesanStatus: null,
      pesanGalat: null,
    });
  });

  it("melaporkan keterbatasan browser secara jujur tanpa mengklaim LaunchAgent atau Registry aktif", async () => {
    render(<PanelIntegrasiOs />);

    await waitFor(() => {
      expect(screen.getByText(/Mode: Browser Terbatas/i)).toBeInTheDocument();
    });

    expect(
      screen.getByText(/Launch at Startup \(LaunchAgent \/ Registry\)/i)
    ).toBeInTheDocument();
  });

  it("mengaktifkan Launch at Startup dan membuka pengaturan izin OS saat di runtime Tauri native", async () => {
    (window as unknown as Record<string, unknown>).__TAURI_INTERNALS__ = {};
    vi.mocked(invoke)
      .mockResolvedValueOnce({
        sumberData: "tauri_os_nyata",
        sistemOperasi: "macOS",
        autoStartAktif: false,
        jalurAutoStart: "/Users/test/Library/LaunchAgents/com.overthinker.notch.plist",
        mendukungTrayMenu: true,
        mendukungPintasanGlobal: true,
        kapabilitas: [
          {
            namaFitur: "Notch Adaptif & Multi-Monitor",
            status: "didukung",
            keterangan: "Aktif",
          },
        ],
        catatan: "Integrasi macOS aktif.",
      })
      .mockResolvedValueOnce({
        sumberData: "tauri_os_nyata",
        sistemOperasi: "macOS",
        autoStartAktif: true,
        jalurAutoStart: "/Users/test/Library/LaunchAgents/com.overthinker.notch.plist",
        mendukungTrayMenu: true,
        mendukungPintasanGlobal: true,
        kapabilitas: [
          {
            namaFitur: "Notch Adaptif & Multi-Monitor",
            status: "didukung",
            keterangan: "Aktif",
          },
        ],
        catatan: "Integrasi macOS aktif.",
      })
      .mockResolvedValueOnce(undefined);

    render(<PanelIntegrasiOs />);

    await waitFor(() => {
      expect(screen.getByText(/Runtime: macOS/i)).toBeInTheDocument();
    });

    fireEvent.click(
      screen.getByRole("switch", { name: /Jalankan otomatis saat login OS/i })
    );

    await waitFor(() => {
      expect(
        screen.getByText(/Launch at Startup diaktifkan/i)
      ).toBeInTheDocument();
    });

    fireEvent.click(
      screen.getByRole("button", { name: /Buka Izin Accessibility/i })
    );

    await waitFor(() => {
      expect(invoke).toHaveBeenCalledWith("buka_pengaturan_izin_os", {
        bagian: "accessibility",
      });
    });
  });
});
