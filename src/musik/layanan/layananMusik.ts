import { invoke } from "@tauri-apps/api/core";
import { z } from "zod";
import {
  apakahRuntimeTauriAktif,
  SkemaLaporanKapabilitas,
  type LaporanKapabilitas,
} from "@/bersama/ipc/klienIpc";
import {
  SkemaInfoTrekAktif,
  SkemaKonfigurasiPengenalLagu,
  SkemaRiwayatMusikItem,
} from "@/musik/skema/skemaMusik";
import type {
  AksiKontrolMedia,
  InfoTrekAktif,
  KonfigurasiPengenalLagu,
  RiwayatMusikItem,
} from "@/musik/tipe/tipeMusik";

const KUNCI_RIWAYAT_MUSIK_WEB = "overthinker_notch_music_history";
const KUNCI_KONFIG_PENGENAL = "overthinker_notch_music_recognizer_config";

export const KONFIG_PENGENAL_BAWAAN: KonfigurasiPengenalLagu = {
  jenisPenyedia: "belum_diatur",
  endpointUrl: "",
  apiTokenTersimpan: false,
};

export function ambilKonfigPengenalLagu(): KonfigurasiPengenalLagu {
  if (typeof window === "undefined") return KONFIG_PENGENAL_BAWAAN;
  try {
    const mentah = window.localStorage.getItem(KUNCI_KONFIG_PENGENAL);
    if (!mentah) return KONFIG_PENGENAL_BAWAAN;
    const parsed = SkemaKonfigurasiPengenalLagu.safeParse(JSON.parse(mentah));
    return parsed.success ? parsed.data : KONFIG_PENGENAL_BAWAAN;
  } catch {
    return KONFIG_PENGENAL_BAWAAN;
  }
}

export function simpanKonfigPengenalLagu(
  konfig: KonfigurasiPengenalLagu
): KonfigurasiPengenalLagu {
  const valid = SkemaKonfigurasiPengenalLagu.parse(konfig);
  if (typeof window !== "undefined") {
    window.localStorage.setItem(KUNCI_KONFIG_PENGENAL, JSON.stringify(valid));
  }
  return valid;
}

export async function ambilStatusMusikAktif(): Promise<InfoTrekAktif> {
  if (!apakahRuntimeTauriAktif()) {
    return {
      sedangMemutar: false,
      judulLagu: null,
      artis: null,
      album: null,
      sumberAudio: "Web Preview (Adapter OS belum aktif)",
      durasiDetik: 0,
      posisiDetik: 0,
      urlArtwork: null,
      kontrolDidukung: false,
    };
  }

  const hasil = await invoke<unknown>("ambil_status_musik_os");
  return SkemaInfoTrekAktif.parse(hasil);
}

export async function kirimKontrolMediaLayanan(
  aksi: AksiKontrolMedia
): Promise<InfoTrekAktif> {
  if (!apakahRuntimeTauriAktif()) {
    throw new Error(
      "Kontrol media OS (Apple Music / Spotify / GSMTC) cuma aktif saat jalan di aplikasi desktop Tauri 2."
    );
  }
  const hasil = await invoke<unknown>("kirim_kontrol_media", { aksi });
  return SkemaInfoTrekAktif.parse(hasil);
}

export async function ambilKapabilitasMusikLayanan(): Promise<
  LaporanKapabilitas[]
> {
  if (!apakahRuntimeTauriAktif()) {
    return [
      {
        namaFitur: "Deteksi Media OS (Apple Music / Spotify / GSMTC)",
        status: "tidak_didukung_os",
        keterangan:
          "Jalankan lewat `npm run tauri dev` buat membaca playback musik OS secara nyata.",
      },
      {
        namaFitur: "System Audio Capture (ScreenCaptureKit / WASAPI)",
        status: "perlu_izin",
        keterangan:
          "Membutuhkan runtime desktop native dan izin akses audio sistem OS.",
      },
      {
        namaFitur: "Authorized Song Recognition Provider",
        status: "penyedia_belum_dikonfigurasi",
        keterangan:
          "Wajib memakai penyedia resmi dengan kredensial milik pengguna sendiri.",
      },
    ];
  }

  const hasil = await invoke<unknown>("ambil_kapabilitas_musik");
  return z.array(SkemaLaporanKapabilitas).parse(hasil);
}

export async function ambilRiwayatMusikLayanan(): Promise<RiwayatMusikItem[]> {
  if (!apakahRuntimeTauriAktif()) {
    if (typeof window === "undefined") return [];
    try {
      const mentah = window.localStorage.getItem(KUNCI_RIWAYAT_MUSIK_WEB);
      if (!mentah) return [];
      const parsed = z
        .array(SkemaRiwayatMusikItem)
        .safeParse(JSON.parse(mentah));
      return parsed.success ? parsed.data : [];
    } catch {
      return [];
    }
  }

  const hasil = await invoke<unknown>("daftar_riwayat_musik");
  return z.array(SkemaRiwayatMusikItem).parse(hasil);
}

export async function simpanRiwayatMusikLayanan(masukan: {
  judulLagu: string;
  artis: string;
  album: string;
  sumberAudio: string;
  durasiDetik: number;
}): Promise<RiwayatMusikItem> {
  if (!masukan.judulLagu.trim() || !masukan.artis.trim()) {
    throw new Error("Judul lagu dan artis nggak boleh kosong.");
  }

  if (!apakahRuntimeTauriAktif()) {
    const id =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `music-${Date.now()}`;
    const baru: RiwayatMusikItem = {
      id,
      judulLagu: masukan.judulLagu.trim(),
      artis: masukan.artis.trim(),
      album: masukan.album.trim(),
      sumberAudio: masukan.sumberAudio.trim() || "Manual",
      durasiDetik: Math.max(0, masukan.durasiDetik),
      pathArtworkRelatif: null,
      diputarPada: new Date().toISOString(),
    };
    const lama = await ambilRiwayatMusikLayanan();
    const gabungan = [baru, ...lama].slice(0, 100);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(
        KUNCI_RIWAYAT_MUSIK_WEB,
        JSON.stringify(gabungan)
      );
    }
    return baru;
  }

  const hasil = await invoke<unknown>("simpan_riwayat_musik", {
    permintaan: masukan,
  });
  return SkemaRiwayatMusikItem.parse(hasil);
}

export async function identifikasiLewatMikrofonLayanan(
  konfig: KonfigurasiPengenalLagu
): Promise<{ berhasil: boolean; pesan: string }> {
  if (konfig.jenisPenyedia === "belum_diatur" || !konfig.apiTokenTersimpan) {
    return {
      berhasil: false,
      pesan:
        "Penyedia pengenal lagu resmi belum dikonfigurasi. Aplikasi nggak akan mensimulasikan hasil pengenalan lagu palsu.",
    };
  }

  if (
    typeof navigator === "undefined" ||
    !navigator.mediaDevices?.getUserMedia
  ) {
    return {
      berhasil: false,
      pesan: "Akses mikrofon nggak tersedia di environment ini.",
    };
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    stream.getTracks().forEach((t) => t.stop());
    return {
      berhasil: true,
      pesan: `Izin mikrofon aktif dan siap kirim sampel audio ke penyedia ${konfig.jenisPenyedia}.`,
    };
  } catch (galat) {
    return {
      berhasil: false,
      pesan:
        galat instanceof Error
          ? `Izin mikrofon ditolak atau gagal: ${galat.message}`
          : "Gagal mengakses mikrofon.",
    };
  }
}
