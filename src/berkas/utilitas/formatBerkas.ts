import type {
  KategoriPreviewBerkas,
  OpsiKedaluwarsa,
} from "@/berkas/tipe/tipeBerkas";

export function formatUkuranBerkas(byte: number): string {
  if (byte < 1024) return `${byte} B`;
  const kb = byte / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  const mb = kb / 1024;
  if (mb < 1024) return `${mb.toFixed(1)} MB`;
  return `${(mb / 1024).toFixed(2)} GB`;
}

export function hitungTanggalKedaluwarsa(
  opsi: OpsiKedaluwarsa,
  mulaiDari: Date = new Date()
): string | null {
  if (opsi === "tanpa_batas") return null;
  const jamMap: Record<Exclude<OpsiKedaluwarsa, "tanpa_batas">, number> = {
    "24_jam": 24,
    "7_hari": 24 * 7,
    "14_hari": 24 * 14,
    "30_hari": 24 * 30,
  };
  const hasil = new Date(mulaiDari.getTime() + jamMap[opsi] * 3600 * 1000);
  return hasil.toISOString();
}

export function apakahBerkasKedaluwarsa(
  kedaluwarsaPada: string | null,
  sekarang: Date = new Date()
): boolean {
  if (!kedaluwarsaPada) return false;
  const waktu = Date.parse(kedaluwarsaPada);
  if (Number.isNaN(waktu)) return false;
  return waktu <= sekarang.getTime();
}

export function deteksiKategoriPreview(
  nama: string,
  tipeMime: string
): KategoriPreviewBerkas {
  if (tipeMime.startsWith("image/")) {
    return "gambar";
  }
  const ekstensiTeks = /\.(txt|md|json|ts|tsx|js|jsx|css|html|rs|py|sql|yaml|yml|sh|csv|log|xml)$/i;
  if (tipeMime.startsWith("text/") || tipeMime.includes("json") || ekstensiTeks.test(nama)) {
    return "teks";
  }
  return "biner";
}

export function bacaFileSebagaiTeks(file: File): Promise<string> {
  if (typeof file.text === "function") {
    return file.text();
  }
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(new Error("Gagal membaca isi file teks."));
    reader.readAsText(file);
  });
}

export function bacaFileSebagaiDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(new Error("Gagal membaca preview gambar."));
    reader.readAsDataURL(file);
  });
}
