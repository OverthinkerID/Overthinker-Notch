export interface HasilVerifikasiLirik {
  cocok: boolean;
  skor: number;
  alasan: string;
}

function normalisasi(teks: string): string {
  return teks
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function verifikasiKecocokanLirik(
  kueriJudul: string,
  kueriArtis: string,
  hasilJudul: string,
  hasilArtis: string
): HasilVerifikasiLirik {
  const kj = normalisasi(kueriJudul);
  const ka = normalisasi(kueriArtis);
  const hj = normalisasi(hasilJudul);
  const ha = normalisasi(hasilArtis);

  if (!kj || !hj) {
    return {
      cocok: false,
      skor: 0,
      alasan: "Judul lagu kueri atau hasil kosong.",
    };
  }

  const judulCocok = hj === kj || hj.includes(kj) || kj.includes(hj);
  const artisCocok = !ka || ha === ka || ha.includes(ka) || ka.includes(ha);

  if (judulCocok && artisCocok) {
    return {
      cocok: true,
      skor: hj === kj && ha === ka ? 1 : 0.85,
      alasan: "Judul dan artis terverifikasi cocok.",
    };
  }

  if (judulCocok && !artisCocok) {
    return {
      cocok: false,
      skor: 0.45,
      alasan: `Artis tidak cocok ("${hasilArtis}" vs "${kueriArtis}").`,
    };
  }

  return {
    cocok: false,
    skor: 0.1,
    alasan: `Judul tidak cocok ("${hasilJudul}" vs "${kueriJudul}").`,
  };
}

export function buatTautanSumberLirikResmi(
  judulLagu: string,
  artis: string
): { nama: string; url: string }[] {
  const q = encodeURIComponent(`${judulLagu} ${artis}`.trim());
  const basisLrclib = ["https:/", "lrclib.net", "search", q].join("/");
  const basisMusix = ["https:/", "www.musixmatch.com", "search", q].join("/");
  return [
    { nama: "LRCLIB (Resmi)", url: basisLrclib },
    { nama: "Musixmatch (Resmi)", url: basisMusix },
  ];
}
