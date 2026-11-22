import { beforeEach, describe, expect, it } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { RuangKerjaNotch } from "@/notch/komponen/RuangKerjaNotch";

describe("Fase 17 — QA Integrasi Lintas Modul Overthinker Notch", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("menavigasi seluruh 15 tab ruang kerja utama tanpa error runtime", async () => {
    render(<RuangKerjaNotch />);

    expect(
      screen.getByText(/Mode Tampilan & Multi-Monitor/i)
    ).toBeInTheDocument();

    const daftarTab = [
      { label: "Projects", cek: /Project Workspace/i },
      { label: "Music", cek: /Music Engine/i },
      { label: "Lyrics", cek: /Lyrics Engine/i },
      { label: "Quick Notes", cek: /Quick Notes/i },
      { label: "Temp Files", cek: /Temporary File Storage/i },
      { label: "Code Snippets", cek: /Code Snippet Vault/i },
      { label: "AI Prompts", cek: /AI Prompt Library/i },
      { label: "Quick Tools", cek: /Quick Tools \(12 Utilitas Luring\)/i },
      { label: "System Monitor", cek: /System Monitor \(Data OS Nyata\)/i },
      { label: "OS Integration", cek: /macOS & Windows Integration/i },
      { label: "Clipboard", cek: /Clipboard Manager/i },
      { label: "Focus Mode", cek: /Focus Engine/i },
      { label: "Database & Backup", cek: /Database SQLite/i },
      { label: "Design System", cek: /Palet Warna Utama/i },
    ];

    for (const tab of daftarTab) {
      fireEvent.click(screen.getByRole("tab", { name: tab.label }));
      await waitFor(() => {
        expect(screen.getAllByText(tab.cek).length).toBeGreaterThan(0);
      });
    }

    // Kembali ke Mesin Notch
    fireEvent.click(screen.getByRole("tab", { name: "Mesin Notch" }));
    expect(
      screen.getByText(/Mode Tampilan & Multi-Monitor/i)
    ).toBeInTheDocument();
  });

  it("mendukung alur lintas fitur: ganti tema Dark/Light dan gunakan Quick Tools JSON Formatter", () => {
    render(<RuangKerjaNotch />);

    const tombolTema = screen.getByRole("button", {
      name: /Ganti ke (Light|Dark) Mode/i,
    });
    fireEvent.click(tombolTema);
    expect(
      window.localStorage.getItem("overthinker_notch_mode_tema")
    ).toBeTruthy();

    fireEvent.click(screen.getByRole("tab", { name: "Quick Tools" }));
    fireEvent.click(screen.getByRole("button", { name: /Rapikan JSON/i }));
    expect(screen.getByTestId("output-json-formatter")).toHaveTextContent(
      '"aplikasi": "Overthinker Notch"'
    );
  });
});
