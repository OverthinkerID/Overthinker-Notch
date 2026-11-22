import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { invoke } from "@tauri-apps/api/core";
import { gunakanTokoMonitor, PanelMonitor } from "@/monitor";

vi.mock("@tauri-apps/api/core", () => ({
  invoke: vi.fn(),
}));

describe("Fase 15 — System Monitor (Data OS Nyata)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    delete (window as unknown as Record<string, unknown>).__TAURI_INTERNALS__;
    gunakanTokoMonitor.setState({
      telemetri: null,
      sedangMemuat: false,
      autoRefresh: false,
      pesanGalat: null,
    });
  });

  it("melaporkan keterbatasan mode browser secara jujur tanpa angka CPU/Disk palsu", async () => {
    render(<PanelMonitor />);

    await waitFor(() => {
      expect(screen.getByText(/Sumber: Browser Terbatas/i)).toBeInTheDocument();
    });

    expect(screen.getByTestId("nilai-cpu")).toHaveTextContent(
      "Nggak tersedia di browser"
    );
    expect(screen.getByTestId("nilai-disk")).toHaveTextContent(
      "Nggak tersedia di browser"
    );
    expect(screen.getByTestId("nilai-uptime")).toHaveTextContent(
      "Nggak tersedia di browser"
    );
  });

  it("menampilkan data telemetri OS nyata saat berjalan di runtime Tauri native", async () => {
    (window as unknown as Record<string, unknown>).__TAURI_INTERNALS__ = {};
    vi.mocked(invoke).mockResolvedValueOnce({
      sumberData: "tauri_os_nyata",
      sistemOperasi: "macOS",
      arsitektur: "aarch64",
      namaHost: "MacBook-Pro.local",
      modelCpu: "Apple M3 Pro",
      jumlahCoreCpu: 12,
      penggunaanCpuPersen: 18.4,
      ramTerpakaiMb: 12288,
      ramTotalMb: 36864,
      diskTerpakaiGb: 210.5,
      diskTotalGb: 512.0,
      persenBaterai: 87,
      sedangMengisiDaya: true,
      uptimeDetik: 7500,
      catatanKejujuran: "Data diambil langsung dari utilitas sistem macOS.",
      diambilPada: "2026-11-22T14:30:00.000Z",
    });

    render(<PanelMonitor />);

    await waitFor(() => {
      expect(screen.getByText(/Sumber: OS Native Tauri/i)).toBeInTheDocument();
    });

    expect(screen.getByTestId("nilai-cpu")).toHaveTextContent("18.4%");
    expect(screen.getByTestId("nilai-ram")).toHaveTextContent("12.0 / 36.0 GB");
    expect(screen.getByTestId("nilai-disk")).toHaveTextContent("210.5 / 512 GB");
    expect(screen.getByTestId("nilai-baterai")).toHaveTextContent("87%");
    expect(screen.getByTestId("nilai-uptime")).toHaveTextContent("2j 5m");
  });
});
