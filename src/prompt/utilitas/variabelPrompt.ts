import type { PromptItem } from "@/prompt/tipe/tipePrompt";

const POLA_VARIABEL = /\{\{\s*([a-zA-Z0-9_.-]+)\s*\}\}/g;

export function ekstrakVariabelPrompt(templatePrompt: string): string[] {
  const hasil: string[] = [];
  const sudahAda = new Set<string>();

  for (const cocok of templatePrompt.matchAll(POLA_VARIABEL)) {
    const nama = (cocok[1] ?? "").trim();
    if (nama && !sudahAda.has(nama)) {
      sudahAda.add(nama);
      hasil.push(nama);
    }
  }

  return hasil;
}

export function terapkanVariabelPrompt(
  templatePrompt: string,
  nilaiVariabel: Record<string, string>
): string {
  return templatePrompt.replace(
    POLA_VARIABEL,
    (asli, namaVariabel: string) => {
      const nilai = nilaiVariabel[namaVariabel.trim()];
      return nilai !== undefined && nilai.length > 0 ? nilai : asli;
    }
  );
}

export function buatEksporJsonPrompt(daftar: PromptItem[]): string {
  return JSON.stringify(
    {
      aplikasi: "Overthinker Notch",
      modul: "ai_prompt_library",
      dieksporPada: new Date().toISOString(),
      totalPrompt: daftar.length,
      prompts: daftar,
    },
    null,
    2
  );
}
