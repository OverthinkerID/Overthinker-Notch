import type { CatatanItem, ItemChecklist } from "@/catatan/tipe/tipeCatatan";

export function normalisasiTag(tagMentah: string): string {
  return tagMentah.trim().replace(/^#+/, "").toLowerCase().replace(/\s+/g, "-");
}

export function uraiChecklist(konten: string): ItemChecklist[] {
  const baris = konten.split("\n");
  const hasil: ItemChecklist[] = [];

  baris.forEach((isi, indeksBaris) => {
    const cocok = isi.match(/^\s*[-*]\s+\[([ xX])\]\s*(.*)$/);
    if (cocok) {
      hasil.push({
        indeksBaris,
        selesai: cocok[1]!.toLowerCase() === "x",
        teks: cocok[2] ?? "",
      });
    }
  });

  return hasil;
}

export function ubahStatusBarisChecklist(
  konten: string,
  indeksBaris: number
): string {
  const baris = konten.split("\n");
  const target = baris[indeksBaris];
  if (target === undefined) {
    return konten;
  }

  baris[indeksBaris] = target.replace(
    /^(\s*[-*]\s+\[)([ xX])(\]\s*.*)$/,
    (_semua, awal: string, status: string, akhir: string) =>
      `${awal}${status.toLowerCase() === "x" ? " " : "x"}${akhir}`
  );

  return baris.join("\n");
}

export function tambahItemChecklist(konten: string, teksItem: string): string {
  const bersih = teksItem.trim();
  if (!bersih) {
    return konten;
  }
  const barisBaru = `- [ ] ${bersih}`;
  return konten.trim().length === 0 ? barisBaru : `${konten.trimEnd()}\n${barisBaru}`;
}

export function buatKontenEksporMarkdown(catatan: CatatanItem): string {
  const tagLine =
    catatan.daftarTag.length > 0
      ? `tags: [${catatan.daftarTag.map((t) => `"${t}"`).join(", ")}]`
      : "tags: []";

  return [
    "---",
    `id: "${catatan.id}"`,
    `judul: "${catatan.judul.replace(/"/g, '\\"')}"`,
    `format: "${catatan.formatKonten}"`,
    tagLine,
    `disematkan: ${catatan.disematkan}`,
    `diarsipkan: ${catatan.diarsipkan}`,
    `diperbarui: "${catatan.diperbaruiPada}"`,
    "---",
    "",
    `# ${catatan.judul}`,
    "",
    catatan.kontenMarkdown,
    "",
  ].join("\n");
}

export function buatKontenEksporJson(daftarCatatan: CatatanItem[]): string {
  return JSON.stringify(
    {
      aplikasi: "Overthinker Notch",
      modul: "quick_notes",
      dieksporPada: new Date().toISOString(),
      totalCatatan: daftarCatatan.length,
      catatan: daftarCatatan,
    },
    null,
    2
  );
}

export function unduhBerkasTeks(
  namaBerkas: string,
  isi: string,
  tipeMime: string
): void {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return;
  }
  const blob = new Blob([isi], { type: tipeMime });
  const url = URL.createObjectURL(blob);
  const tautan = document.createElement("a");
  tautan.href = url;
  tautan.download = namaBerkas;
  document.body.appendChild(tautan);
  tautan.click();
  document.body.removeChild(tautan);
  URL.revokeObjectURL(url);
}
