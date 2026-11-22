import { beforeEach, describe, expect, it } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import {
  MASCOT_CHARACTERS,
  MascotController,
  MascotEventBus,
  PanelPengaturanMaskotNotch,
  RiveMascotCanvas,
  useMascotStore,
} from "@/features/mascot";
import { MATRIKS_ADAPTER_MUSIK } from "@/musik";
import { verifikasiKecocokanLirik } from "@/lirik";
import { NavigasiHorizontalNotch } from "@/notch/komponen/NavigasiHorizontalNotch";
import { gunakanTokoMenuNotch } from "@/notch/toko/tokoMenuNotch";
import { gunakanTokoNotch } from "@/notch/toko/tokoNotch";

describe("Master Feature — Adaptive Mascot & Smart Notch", () => {
  beforeEach(() => {
    window.localStorage.clear();
    MascotEventBus.bersihkanSemua();
    MascotController.hancurkan();
  });

  it("mendukung navigasi horizontal Prev/Next, arrow-key, dynamic registration, dan tidak bentrok dengan input teks", () => {
    const dipilih: string[] = [];
    gunakanTokoMenuNotch.getState().daftarkanMenu({
      id: "menu_kustom",
      label: "Kustom",
      urutan: 99,
    });
    const daftar = gunakanTokoMenuNotch.getState().daftarMenu;
    expect(daftar.some((m) => m.id === "menu_kustom")).toBe(true);

    render(
      <div>
        <input aria-label="Input editor" />
        <NavigasiHorizontalNotch
          daftarMenu={daftar}
          menuAktifId="mesin_notch"
          saatPilihMenu={(id) => dipilih.push(id)}
        />
      </div>
    );

    fireEvent.click(screen.getByRole("button", { name: /Menu Berikutnya/i }));
    expect(dipilih[0]).toBe("musik");

    fireEvent.click(screen.getByRole("button", { name: /Menu Sebelumnya/i }));
    expect(dipilih[1]).toBe(daftar[daftar.length - 1]!.id);

    // ArrowRight di window berpindah menu
    fireEvent.keyDown(window, { key: "ArrowRight" });
    expect(dipilih[2]).toBe("musik");

    // ArrowRight di dalam input TIDAK memicu perpindahan menu
    const input = screen.getByLabelText("Input editor");
    fireEvent.keyDown(input, { key: "ArrowRight" });
    expect(dipilih).toHaveLength(3);
  });

  it("mendukung 3 karakter adaptif resmi tanpa menghapus riwayat musik/lirik saat ganti karakter", () => {
    expect(MASCOT_CHARACTERS).toEqual([
      "overthinker_robot",
      "hush_puppy",
      "little_companion",
    ]);

    window.localStorage.setItem(
      "overthinker_notch_music_history",
      JSON.stringify([{ id: "m1", judulLagu: "Lagu Penting" }])
    );

    render(<PanelPengaturanMaskotNotch />);

    fireEvent.click(screen.getByTestId("pilih-karakter-hush_puppy"));
    expect(useMascotStore.getState().pengaturan.selectedCharacter).toBe(
      "hush_puppy"
    );

    fireEvent.click(screen.getByTestId("pilih-karakter-little_companion"));
    expect(useMascotStore.getState().pengaturan.selectedCharacter).toBe(
      "little_companion"
    );

    // Pastikan data musik tidak terhapus
    expect(
      window.localStorage.getItem("overthinker_notch_music_history")
    ).toContain("Lagu Penting");

    // Pastikan ketiga karakter menggunakan palet warna resmi
    for (const id of MASCOT_CHARACTERS) {
      const { container } = render(
        <RiveMascotCanvas ukuranPx={48} karakterOverride={id} />
      );
      expect(container.innerHTML).toContain("#F1E4D0");
      expect(container.innerHTML).toContain("#344C3D");
    }
  });

  it("mendukung state reading_lyrics, searching_lyrics, Smart Music 4 adapter, dan verifikasi kecocokan lirik", () => {
    MascotController.inisialisasi();
    MascotEventBus.pancarkan("lyrics:searching", { kueri: "Senja" });
    expect(useMascotStore.getState().stateAktif).toBe("searching_lyrics");

    MascotEventBus.pancarkan("lyrics:reading", { barisAktif: "Baris satu" });
    expect(useMascotStore.getState().stateAktif).toBe("reading_lyrics");

    // 4 provider musik dengan 6 kapabilitas terpisah
    expect(MATRIKS_ADAPTER_MUSIK.map((p) => p.id)).toEqual([
      "spotify",
      "youtube_music",
      "apple_music",
      "desktop_audio",
    ]);

    // Verifikasi kecocokan lirik mencegah lirik salah
    expect(
      verifikasiKecocokanLirik("Fix You", "Coldplay", "Fix You", "Coldplay")
        .cocok
    ).toBe(true);
    expect(
      verifikasiKecocokanLirik("Fix You", "Coldplay", "Fix You", "Artis Lain")
        .cocok
    ).toBe(false);
  });

  it("mengatur mode ukuran Notch (Mini, Compact, Expanded, Custom) & ukuran maskot secara persisten", async () => {
    render(<PanelPengaturanMaskotNotch />);

    fireEvent.click(screen.getByRole("button", { name: /^mini$/i }));
    expect(gunakanTokoNotch.getState().ukuranAdaptif.modeUkuran).toBe("mini");
    expect(gunakanTokoNotch.getState().statusAktif).toBe("siaga");

    fireEvent.click(screen.getByRole("button", { name: /^expanded$/i }));
    expect(gunakanTokoNotch.getState().ukuranAdaptif.modeUkuran).toBe(
      "expanded"
    );
    expect(gunakanTokoNotch.getState().statusAktif).toBe("diperluas");

    fireEvent.change(screen.getByLabelText(/Lebar Kustom/i), {
      target: { value: "840" },
    });
    await waitFor(() => {
      expect(gunakanTokoNotch.getState().ukuranAdaptif.lebarKustom).toBe(840);
      expect(
        window.localStorage.getItem("overthinker_notch_preferensi_jendela")
      ).toContain('"lebarKustom":840');
    });
  });
});
