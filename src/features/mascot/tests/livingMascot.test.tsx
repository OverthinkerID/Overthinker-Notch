import { beforeEach, describe, expect, it } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import {
  CompactMascot,
  ExpandedMascot,
  MASCOT_ANIMATION_STATES,
  MascotAnimationService,
  MascotController,
  MascotEventBus,
  MascotStateMachine,
  useMascotStore,
} from "@/features/mascot";
import { gunakanTokoNotch } from "@/notch/toko/tokoNotch";

describe("Overthinker Living Mascot", () => {
  beforeEach(() => {
    window.localStorage.clear();
    MascotEventBus.bersihkanSemua();
    MascotController.hancurkan();
    useMascotStore.setState({
      stateAktif: "idle",
      sedangBerkedip: false,
      mataVektor: { x: 0, y: 0 },
      mulutTerbuka: 0,
      statusSingkat: "Siaga",
      panelTerbuka: false,
    });
  });

  it("mendukung seluruh 15 animation states secara deterministik", () => {
    expect(MASCOT_ANIMATION_STATES).toHaveLength(15);
    const mesin = new MascotStateMachine();
    for (const st of MASCOT_ANIMATION_STATES) {
      mesin.aturStateLangsung(st);
      expect(mesin.ambilStateAktif()).toBe(st);
    }
  });

  it("membatasi pergerakan eye tracking agar tidak menyebabkan distorsi karakter", () => {
    const ekstremKananBawah = MascotAnimationService.hitungVektorMataTerbatas(
      5000,
      5000,
      100,
      100
    );
    expect(ekstremKananBawah).toEqual({ x: 1, y: 1 });

    const ekstremKiriAtas = MascotAnimationService.hitungVektorMataTerbatas(
      -5000,
      -5000,
      100,
      100
    );
    expect(ekstremKiriAtas).toEqual({ x: -1, y: -1 });
  });

  it("bereaksi terhadap event aplikasi: focus, music, notification, error, dan workspace", () => {
    MascotController.inisialisasi();

    MascotEventBus.pancarkan("workspace:changed", { ruang: "kode" });
    expect(useMascotStore.getState().stateAktif).toBe("focused");

    MascotEventBus.pancarkan("focus:completed", { durasiDetik: 1500 });
    expect(useMascotStore.getState().stateAktif).toBe("celebrating");

    MascotEventBus.pancarkan("music:started", { judulLagu: "Lofi Beats" });
    expect(useMascotStore.getState().stateAktif).toBe("music_reaction");

    MascotController.perbaruiReaksiMusik(true, 1.5);
    expect(useMascotStore.getState().audioTelemetri.aktif).toBe(true);

    MascotEventBus.pancarkan("notification:received", { pesan: "Tes" });
    expect(useMascotStore.getState().stateAktif).toBe("surprised");

    MascotEventBus.pancarkan("error:occurred", { pesan: "Gagal" });
    expect(useMascotStore.getState().stateAktif).toBe("confused");
  });

  it("menangani hover, click, double-click, dan context menu pada CompactMascot", async () => {
    MascotController.inisialisasi();
    render(<CompactMascot />);

    const tombol = screen.getByTestId("compact-mascot-button");
    fireEvent.mouseEnter(tombol.parentElement!);
    expect(useMascotStore.getState().stateAktif).toBe("look_cursor");

    fireEvent.click(tombol);
    expect(useMascotStore.getState().panelTerbuka).toBe(true);
    expect(useMascotStore.getState().stateAktif).toBe("happy");

    fireEvent.doubleClick(tombol);
    expect(useMascotStore.getState().stateAktif).toBe("surprised");

    fireEvent.contextMenu(tombol.parentElement!);
    expect(screen.getByRole("menu")).toBeInTheDocument();
  });

  it("menyimpan personality preset & pengaturan ExpandedMascot ke localStorage serta mendukung multi-monitor Notch", async () => {
    render(<ExpandedMascot />);

    fireEvent.click(screen.getByRole("button", { name: /Pengaturan/i }));
    fireEvent.click(screen.getByRole("button", { name: "playful" }));

    await waitFor(() => {
      const mentah = window.localStorage.getItem(
        "overthinker_notch_mascot_settings_v1"
      );
      expect(mentah).toContain('"personalityPreset":"playful"');
    });

    // Uji minimize / restore & multi-monitor tetap kompatibel
    gunakanTokoNotch.getState().ubahStatusNotch("siaga");
    expect(gunakanTokoNotch.getState().statusAktif).toBe("siaga");
    gunakanTokoNotch.getState().bukaTutupNotch();
    expect(gunakanTokoNotch.getState().statusAktif).toBe("diperluas");
  });
});
