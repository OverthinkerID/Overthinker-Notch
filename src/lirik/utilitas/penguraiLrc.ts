import type {
  BarisLirikTerjadwal,
  JendelaLirikAktif,
} from "@/lirik/tipe/tipeLirik";

const POLA_BARIS_LRC = /^\[(\d{1,3}):(\d{2})(?:[.:](\d{1,3}))?\]\s*(.*)$/;

export function uraiLirikLrc(teksLirik: string): {
  tersinkronisasi: boolean;
  barisTerjadwal: BarisLirikTerjadwal[];
  barisPolos: string[];
} {
  const semuaBaris = teksLirik.split(/\r?\n/);
  const terjadwal: BarisLirikTerjadwal[] = [];

  for (const baris of semuaBaris) {
    const bersih = baris.trim();
    if (!bersih) continue;

    const cocok = bersih.match(POLA_BARIS_LRC);
    if (cocok) {
      const menit = Number(cocok[1]);
      const detik = Number(cocok[2]);
      const fraksiStr = cocok[3] ?? "0";
      const fraksi =
        fraksiStr.length === 3
          ? Number(fraksiStr) / 1000
          : Number(fraksiStr) / 100;
      const waktuDetik = menit * 60 + detik + fraksi;
      const teks = (cocok[4] ?? "").trim();
      if (teks) {
        terjadwal.push({ waktuDetik, teks });
      }
    }
  }

  if (terjadwal.length > 0) {
    terjadwal.sort((a, b) => a.waktuDetik - b.waktuDetik);
    return {
      tersinkronisasi: true,
      barisTerjadwal: terjadwal,
      barisPolos: terjadwal.map((b) => b.teks),
    };
  }

  // Tidak ada timestamp LRC yang valid -> WAJIB ditandai sebagai plain lyrics (tersinkronisasi = false)
  return {
    tersinkronisasi: false,
    barisTerjadwal: [],
    barisPolos: semuaBaris.map((b) => b.trim()).filter(Boolean),
  };
}

export function ambilJendelaLirik(
  barisTerjadwal: BarisLirikTerjadwal[],
  posisiDetik: number
): JendelaLirikAktif {
  if (barisTerjadwal.length === 0) {
    return {
      indeksAktif: -1,
      barisSebelumnya: null,
      barisAktif: null,
      barisBerikutnya: null,
    };
  }

  let indeksAktif = -1;
  for (let i = 0; i < barisTerjadwal.length; i += 1) {
    if (barisTerjadwal[i]!.waktuDetik <= posisiDetik) {
      indeksAktif = i;
    } else {
      break;
    }
  }

  if (indeksAktif < 0) {
    return {
      indeksAktif: -1,
      barisSebelumnya: null,
      barisAktif: null,
      barisBerikutnya: barisTerjadwal[0] ?? null,
    };
  }

  return {
    indeksAktif,
    barisSebelumnya: indeksAktif > 0 ? (barisTerjadwal[indeksAktif - 1] ?? null) : null,
    barisAktif: barisTerjadwal[indeksAktif] ?? null,
    barisBerikutnya: barisTerjadwal[indeksAktif + 1] ?? null,
  };
}
