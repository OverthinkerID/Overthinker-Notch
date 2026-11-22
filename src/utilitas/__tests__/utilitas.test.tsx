import { describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import {
  bandingkanTeksBaris,
  buatDaftarUuid,
  buatKataSandiKripto,
  DAFTAR_12_UTILITAS,
  decodeBase64Utf8,
  decodeJwtLuring,
  encodeBase64Utf8,
  formatJsonLuring,
  hitungHashTeks,
  konversiSemuaCase,
  konversiTimestamp,
  konversiUrl,
  konversiWarnaHex,
  PanelUtilitas,
  ujiRegexLuring,
} from "@/utilitas";

describe("Fase 14 — Quick Tools (12 Utilitas Luring)", () => {
  it("menyediakan tepat 12 utilitas luring dan seluruh fungsi inti bekerja akurat", async () => {
    expect(DAFTAR_12_UTILITAS).toHaveLength(12);

    // 1. JSON
    const jsonMin = formatJsonLuring('{ "a": 1 }', "minify");
    expect(jsonMin).toEqual({ ok: true, hasil: '{"a":1}' });

    // 2. Base64 UTF-8
    const b64 = encodeBase64Utf8("Halo 🚀");
    expect(decodeBase64Utf8(b64)).toEqual({ ok: true, hasil: "Halo 🚀" });

    // 3. URL
    const urlEnc = konversiUrl("a b&c", "encode");
    expect(urlEnc).toEqual({ ok: true, hasil: "a%20b%26c" });
    expect(konversiUrl("a%20b%26c", "decode")).toEqual({
      ok: true,
      hasil: "a b&c",
    });

    // 4. UUID v4
    const uuids = buatDaftarUuid(3);
    expect(uuids).toHaveLength(3);
    expect(uuids[0]).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    );

    // 5. Hash SHA-256
    const sha256 = await hitungHashTeks("abc", "SHA-256");
    expect(sha256).toBe(
      "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad"
    );

    // 6. Regex
    const rx = ujiRegexLuring("\\d+", "g", "v12 dan v34");
    expect(rx.ok && rx.cocok.map((c) => c.teks)).toEqual(["12", "34"]);

    // 7. Timestamp
    const ts = konversiTimestamp("1700000000");
    expect(ts.ok && ts.iso).toBe("2023-11-14T22:13:20.000Z");

    // 8. JWT
    const header = btoa(JSON.stringify({ alg: "HS256" }));
    const payload = btoa(JSON.stringify({ sub: "user1", exp: 9999999999 }));
    const jwt = decodeJwtLuring(`${header}.${payload}.sig`);
    expect(jwt.ok && jwt.payload.sub).toBe("user1");
    expect(jwt.ok && jwt.kedaluwarsa).toBe(false);

    // 9. Case Converter
    expect(konversiSemuaCase("hello_world").camelCase).toBe("helloWorld");
    expect(konversiSemuaCase("hello_world")["kebab-case"]).toBe("hello-world");

    // 10. Color Converter
    expect(konversiWarnaHex("#55A7FF")).toEqual({
      ok: true,
      hex: "#55A7FF",
      rgb: "rgb(85, 167, 255)",
      hsl: "hsl(211, 100%, 67%)",
    });

    // 11. Diff Checker
    const diff = bandingkanTeksBaris("a\nb", "a\nc");
    expect(diff.map((d) => d.tipe)).toEqual(["sama", "hapus", "tambah"]);

    // 12. Password Generator
    const sandi = buatKataSandiKripto({
      panjang: 20,
      hurufBesar: true,
      hurufKecil: true,
      angka: true,
      simbol: false,
    });
    expect(sandi).toHaveLength(20);
  });

  it("merender PanelUtilitas, merapikan JSON, dan berpindah ke Color Converter & Password Generator", () => {
    render(<PanelUtilitas />);

    fireEvent.click(screen.getByRole("button", { name: /Rapikan JSON/i }));
    expect(screen.getByTestId("output-json-formatter")).toHaveTextContent(
      '"aplikasi": "Overthinker Notch"'
    );

    fireEvent.click(screen.getByRole("button", { name: /Color Converter/i }));
    expect(screen.getByText("rgb(85, 167, 255)")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Password Generator/i }));
    expect(screen.getByTestId("output-password").textContent?.length).toBe(16);
  });
});
