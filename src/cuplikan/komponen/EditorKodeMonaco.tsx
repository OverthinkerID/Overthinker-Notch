import { useEffect, useState } from "react";
import type { ComponentType } from "react";
import { gunakanTokoTema } from "@/sistem-desain";
import type { BahasaCuplikan } from "@/cuplikan/tipe/tipeCuplikan";

interface PropertiEditorKodeMonaco {
  nilai: string;
  bahasa: BahasaCuplikan;
  saatBerubah: (kodeBaru: string) => void;
  tinggi?: string;
}

interface PropertiMonacoRingkas {
  height: string;
  language: string;
  theme: string;
  value: string;
  onChange?: (value: string | undefined) => void;
  options?: Record<string, unknown>;
}

function apakahLingkunganJsdom(): boolean {
  if (typeof navigator === "undefined") return true;
  return /jsdom/i.test(navigator.userAgent);
}

export function EditorKodeMonaco({
  nilai,
  bahasa,
  saatBerubah,
  tinggi = "300px",
}: PropertiEditorKodeMonaco) {
  const modeTema = gunakanTokoTema((s) => s.mode);
  const [KomponenMonaco, aturKomponenMonaco] =
    useState<ComponentType<PropertiMonacoRingkas> | null>(null);

  useEffect(() => {
    if (apakahLingkunganJsdom()) {
      return;
    }

    let aktif = true;
    void Promise.all([
      import("monaco-editor"),
      import("@monaco-editor/react"),
    ])
      .then(([monaco, monacoReact]) => {
        // Konfigurasi loader agar memakai bundle monaco-editor lokal (tanpa CDN)
        monacoReact.loader.config({ monaco });
        if (aktif) {
          aturKomponenMonaco(
            () => monacoReact.default as ComponentType<PropertiMonacoRingkas>
          );
        }
      })
      .catch(() => {
        // Fallback ke textarea lokal jika WebView belum siap
      });

    return () => {
      aktif = false;
    };
  }, []);

  if (!KomponenMonaco) {
    return (
      <textarea
        aria-label="Editor Kode Snippet"
        value={nilai}
        onChange={(e) => saatBerubah(e.target.value)}
        placeholder="// Tulis atau paste kode kamu di sini..."
        style={{ height: tinggi }}
        className="w-full rounded-xl border border-[var(--warna-batas-kuat)] bg-[#0D111C] p-3 font-kode text-xs text-[#E2E8F0] focus:outline-none focus:ring-2 focus:ring-[var(--aksen-biru-elektrik)]/60 resize-y"
      />
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-[var(--warna-batas-kuat)]">
      <KomponenMonaco
        height={tinggi}
        language={bahasa}
        theme={modeTema === "gelap" ? "vs-dark" : "light"}
        value={nilai}
        onChange={(v) => saatBerubah(v ?? "")}
        options={{
          minimap: { enabled: false },
          fontSize: 13,
          lineNumbers: "on",
          scrollBeyondLastLine: false,
          automaticLayout: true,
          tabSize: 2,
          wordWrap: "on",
        }}
      />
    </div>
  );
}
