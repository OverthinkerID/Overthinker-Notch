export type IdPenyediaMusik =
  | "spotify"
  | "youtube_music"
  | "apple_music"
  | "desktop_audio";

export type StatusDukunganKapabilitas =
  | "didukung"
  | "perlu_oauth"
  | "perlu_izin_os"
  | "terbatas_os"
  | "tidak_tersedia";

export interface MatriksKapabilitasMusik {
  id: IdPenyediaMusik;
  nama: string;
  deteksiSesi: StatusDukunganKapabilitas;
  metadataTrek: StatusDukunganKapabilitas;
  kontrolPlayback: StatusDukunganKapabilitas;
  tangkapanAudio: StatusDukunganKapabilitas;
  pengenalanLagu: StatusDukunganKapabilitas;
  pengambilanLirik: StatusDukunganKapabilitas;
  catatanTeknis: string;
}

export const MATRIKS_ADAPTER_MUSIK: readonly MatriksKapabilitasMusik[] = [
  {
    id: "spotify",
    nama: "Spotify",
    deteksiSesi: "didukung",
    metadataTrek: "didukung",
    kontrolPlayback: "didukung",
    tangkapanAudio: "perlu_izin_os",
    pengenalanLagu: "tidak_tersedia",
    pengambilanLirik: "tidak_tersedia",
    catatanTeknis:
      "macOS membaca sesi via AppleScript; Spotify Web API memerlukan OAuth PKCE & pembatasan endpoint lirik.",
  },
  {
    id: "youtube_music",
    nama: "YouTube Music",
    deteksiSesi: "terbatas_os",
    metadataTrek: "terbatas_os",
    kontrolPlayback: "terbatas_os",
    tangkapanAudio: "perlu_izin_os",
    pengenalanLagu: "tidak_tersedia",
    pengambilanLirik: "tidak_tersedia",
    catatanTeknis:
      "Mengandalkan Media Session OS/browser jika diekspos; tidak mengandalkan private API atau scraping.",
  },
  {
    id: "apple_music",
    nama: "Apple Music",
    deteksiSesi: "didukung",
    metadataTrek: "didukung",
    kontrolPlayback: "didukung",
    tangkapanAudio: "perlu_izin_os",
    pengenalanLagu: "tidak_tersedia",
    pengambilanLirik: "tidak_tersedia",
    catatanTeknis:
      "Bridge macOS AppleScript mendukung metadata & playback; MusicKit publik tidak mengekspos lirik tersinkronisasi penuh.",
  },
  {
    id: "desktop_audio",
    nama: "General Desktop Audio",
    deteksiSesi: "perlu_izin_os",
    metadataTrek: "tidak_tersedia",
    kontrolPlayback: "tidak_tersedia",
    tangkapanAudio: "perlu_izin_os",
    pengenalanLagu: "perlu_oauth",
    pengambilanLirik: "tidak_tersedia",
    catatanTeknis:
      "macOS memakai ScreenCaptureKit (perlu izin Screen & Audio Recording); Windows memakai WASAPI Loopback; pengenalan lagu butuh penyedia resmi.",
  },
];

export function ambilAdapterMusik(
  id: IdPenyediaMusik
): MatriksKapabilitasMusik {
  return (
    MATRIKS_ADAPTER_MUSIK.find((m) => m.id === id) ?? MATRIKS_ADAPTER_MUSIK[0]!
  );
}
