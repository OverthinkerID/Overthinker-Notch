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
  PALET_MASCOT_RESMI,
  RiveMascotCanvas,
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

  it("mendukung seluruh 18 animation states termasuk reading_lyrics, searching_lyrics, dan minimized secara deterministik", () => {
    expect(MASCOT_ANIMATION_STATES).toHaveLength(18);
    expect(MASCOT_ANIMATION_STATES).toContain("minimized");
    expect(MASCOT_ANIMATION_STATES).toContain("reading_lyrics");
    expect(MASCOT_ANIMATION_STATES).toContain("searching_lyrics");
    const mesin = new MascotStateMachine();
    for (const st of MASCOT_ANIMATION_STATES) {
      mesin.aturStateLangsung(st);
      expect(mesin.ambilStateAktif()).toBe(st);
    }
  });

  it("mematuhi Final Color Identity resmi (Panna Cotta, Ivy Lacquer, Marinara Red) pada fallback karakter", () => {
    expect(PALET_MASCOT_RESMI.pannaCotta).toBe("#F1E4D0");
    expect(PALET_MASCOT_RESMI.ivyLacquer).toBe("#344C3D");
    expect(PALET_MASCOT_RESMI.marinaraRed).toBe("#A83235");

    const { container } = render(<RiveMascotCanvas ukuranPx={64} />);
    const html = container.innerHTML;
    expect(html).toContain("#F1E4D0");
    expect(html).toContain("#344C3D");
    expect(html).toContain("#A83235");
    expect(html).not.toContain("#55A7FF");
    expect(html).not.toContain("#A879FF");
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

  it("bereaksi terhadap event aplikasi: focus, music, notification, error, minimized, dan workspace", () => {
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

    MascotEventBus.pancarkan("notch:minimized");
    expect(useMascotStore.getState().stateAktif).toBe("minimized");
  });

  it("menangani hover, single-click panel asisten, double-click buka dashboard, dan context menu pada CompactMascot", async () => {
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
    expect(gunakanTokoNotch.getState().statusAktif).toBe("dasbor");

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

    gunakanTokoNotch.getState().ubahStatusNotch("diperluas");
    gunakanTokoNotch.getState().ubahStatusNotch("siaga");
    expect(gunakanTokoNotch.getState().statusAktif).toBe("siaga");
    gunakanTokoNotch.getState().bukaTutupNotch();
    expect(gunakanTokoNotch.getState().statusAktif).toBe("diperluas");
  });
});
