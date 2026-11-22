import type { TipeKontenPapanklip } from "@/papanklip/tipe/tipePapanklip";

export const APLIKASI_DIKECUALIKAN_BAWAAN: readonly string[] = [
  "1Password",
  "Bitwarden",
  "Keychain Access",
  "KeePassXC",
] as const;

export function deteksiTipeKontenPapanklip(teks: string): TipeKontenPapanklip {
  const bersih = teks.trim();
  if (/^https?:\/\/\S+$/i.test(bersih)) {
    return "url";
  }

  const ciriKode =
    /\b(const|let|var|function|import|export|interface|class|def|fn|pub|SELECT|CREATE TABLE|return)\b|[{}();]=>|<\?php|<!DOCTYPE/i;
  if (ciriKode.test(bersih) && (bersih.includes("\n") || /[{}();=<>]/.test(bersih))) {
    return "kode";
  }

  return "teks";
}

export function periksaDataSensitif(teks: string): {
  sensitif: boolean;
  alasan: string | null;
} {
  const polaList: readonly { regex: RegExp; alasan: string }[] = [
    {
      regex: /-----BEGIN [A-Z ]*PRIVATE KEY-----/,
      alasan: "Private Key terdeteksi — diblokir otomatis demi keamanan.",
    },
    {
      regex: /\bsk-[A-Za-z0-9_-]{20,}\b/,
      alasan: "API Key (sk-...) terdeteksi — nggak disimpan ke riwayat.",
    },
    {
      regex: /\b(ghp_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{20,})\b/,
      alasan: "GitHub Token terdeteksi — diblokir oleh filter sensitif.",
    },
    {
      regex: /\bAKIA[0-9A-Z]{16}\b/,
      alasan: "AWS Access Key terdeteksi — diblokir oleh filter sensitif.",
    },
    {
      regex: /\bAIza[0-9A-Za-z_-]{35}\b/,
      alasan: "Google API Key terdeteksi — diblokir oleh filter sensitif.",
    },
    {
      regex: /\bBearer\s+[A-Za-z0-9\-._~+/]+=*/i,
      alasan: "Authorization Bearer Token terdeteksi — diblokir otomatis.",
    },
    {
      regex: /\b(password|passwd|secret_key|api_secret)\s*[:=]\s*\S{4,}/i,
      alasan: "Pola kredensial/password terdeteksi — diblokir otomatis.",
    },
  ];

  for (const item of polaList) {
    if (item.regex.test(teks)) {
      return { sensitif: true, alasan: item.alasan };
    }
  }

  return { sensitif: false, alasan: null };
}

export function apakahAplikasiDikecualikan(
  aplikasiSumber: string,
  daftarDikecualikan: readonly string[]
): boolean {
  const bersih = aplikasiSumber.trim().toLowerCase();
  if (!bersih) return false;
  return daftarDikecualikan.some((app) => app.trim().toLowerCase() === bersih);
}

export function hitungHashRingan(teks: string): string {
  let hash = 2166136261;
  for (let i = 0; i < teks.length; i += 1) {
    hash ^= teks.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16);
}
