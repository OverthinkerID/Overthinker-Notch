import type {
  BahasaCuplikan,
  CuplikanKodeItem,
} from "@/cuplikan/tipe/tipeCuplikan";

export function deteksiBahasaKode(kode: string): BahasaCuplikan {
  const isi = kode.trim();
  if (!isi) return "typescript";

  // PHP
  if (/<\?php\b/i.test(isi)) return "php";

  // Bash / Shell
  if (/^#!\/bin\/(ba)?sh/m.test(isi) || /\b(echo|grep|chmod|export)\s+/.test(isi) && /\$\{?[A-Za-z_]/.test(isi)) {
    return "shell";
  }

  // JSON
  if (
    (isi.startsWith("{") && isi.endsWith("}")) ||
    (isi.startsWith("[") && isi.endsWith("]"))
  ) {
    try {
      JSON.parse(isi);
      return "json";
    } catch {
      // Lanjut cek bahasa lain
    }
  }

  // SQL
  if (
    /\b(SELECT\s+.+\s+FROM|CREATE\s+TABLE|INSERT\s+INTO|UPDATE\s+\w+\s+SET|DELETE\s+FROM)\b/i.test(
      isi
    )
  ) {
    return "sql";
  }

  // HTML
  if (/<!DOCTYPE\s+html>|<html\b|<div\b|<section\b|<body\b/i.test(isi)) {
    return "html";
  }

  // Rust
  if (/\b(fn\s+\w+\s*\(|let\s+mut\b|pub\s+struct\b|impl\s+\w+|println!)/.test(isi)) {
    return "rust";
  }

  // C#
  if (/\busing\s+System;|namespace\s+\w+|Console\.WriteLine\b/.test(isi)) {
    return "csharp";
  }

  // C++
  if (/#include\s*<|std::(cout|vector|string)\b|int\s+main\s*\(/.test(isi)) {
    return "cpp";
  }

  // Java
  if (/\bpublic\s+class\s+\w+|System\.out\.println\b|public\s+static\s+void\s+main\b/.test(isi)) {
    return "java";
  }

  // Python
  if (/^\s*(def\s+\w+\s*\(|from\s+\w+\s+import\b|import\s+\w+\s*$|if\s+__name__\s*==)/m.test(isi)) {
    return "python";
  }

  // CSS
  if (
    /[.#]?[\w-]+\s*\{[^}]*:\s*[^;]+;[^}]*\}/.test(isi) &&
    !/\b(const|let|var|function|return|interface|type|export|class)\b/.test(isi)
  ) {
    return "css";
  }

  // YAML
  if (
    /^[a-zA-Z0-9_-]+:\s*(\S.*)?$/m.test(isi) &&
    !/[;{}]/.test(isi) &&
    isi.includes("\n")
  ) {
    return "yaml";
  }

  // TypeScript vs JavaScript
  if (
    /\b(interface\s+\w+|type\s+\w+\s*=|:\s*(string|number|boolean|unknown|Record<|Promise<))/.test(
      isi
    )
  ) {
    return "typescript";
  }

  if (/\b(const|let|var|function|=>|console\.log)\b/.test(isi)) {
    return "javascript";
  }

  return "typescript";
}

export function buatEksporJsonCuplikan(daftar: CuplikanKodeItem[]): string {
  return JSON.stringify(
    {
      aplikasi: "Overthinker Notch",
      modul: "code_snippet_vault",
      dieksporPada: new Date().toISOString(),
      totalCuplikan: daftar.length,
      cuplikan: daftar,
    },
    null,
    2
  );
}
