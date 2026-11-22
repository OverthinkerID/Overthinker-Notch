// @vitest-environment node
import { describe, expect, it, afterEach } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { DAFTAR_18_TABEL_WAJIB } from "@/database/tipe/tipeDatabase";

const PATH_MIGRASI = path.resolve(
  process.cwd(),
  "src-tauri/migrations/0001_inisialisasi_skema.sql"
);

function jalankanSqlite(dbPath: string, sql: string): string {
  return execFileSync("sqlite3", [dbPath], {
    input: `${sql}\n`,
    encoding: "utf-8",
  }).trim();
}

describe("Verifikasi Nyata Migrasi SQLite 18 Tabel (Fase 4)", () => {
  const folderSementara: string[] = [];

  function buatFolderUji(): string {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "overthinker-notch-db-"));
    folderSementara.push(dir);
    return dir;
  }

  afterEach(() => {
    for (const dir of folderSementara.splice(0)) {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });

  it("menjalankan migrasi 0001 dan membentuk seluruh 18 tabel wajib", () => {
    const dir = buatFolderUji();
    const dbPath = path.join(dir, "uji.db");
    const sqlMigrasi = fs.readFileSync(PATH_MIGRASI, "utf-8");

    jalankanSqlite(dbPath, sqlMigrasi);

    const hasilTabel = jalankanSqlite(
      dbPath,
      "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name;"
    )
      .split("\n")
      .filter(Boolean);

    for (const tabelWajib of DAFTAR_18_TABEL_WAJIB) {
      expect(hasilTabel).toContain(tabelWajib);
    }
    expect(hasilTabel).toHaveLength(18);
  });

  it("menegakkan foreign keys, menyimpan data relasional, dan lulus PRAGMA integrity_check", () => {
    const dir = buatFolderUji();
    const dbPath = path.join(dir, "relasi.db");
    jalankanSqlite(dbPath, fs.readFileSync(PATH_MIGRASI, "utf-8"));

    // Foreign key harus menolak task yang merujuk project_id tidak ada
    expect(() =>
      jalankanSqlite(
        dbPath,
        `PRAGMA foreign_keys = ON;
         INSERT INTO tasks (id, project_id, judul, dibuat_pada, diperbarui_pada)
         VALUES ('t-1', 'project-tidak-ada', 'Task Ilegal', '2026-11-22T10:00:00Z', '2026-11-22T10:00:00Z');`
      )
    ).toThrow();

    // Insert relasional valid: workspace -> project -> task + note + tag + note_tag
    jalankanSqlite(
      dbPath,
      `PRAGMA foreign_keys = ON;
       INSERT INTO workspaces (id, nama, dibuat_pada, diperbarui_pada)
       VALUES ('ws-1', 'Utama', '2026-11-22T10:00:00Z', '2026-11-22T10:00:00Z');
       INSERT INTO projects (id, workspace_id, nama, dibuat_pada, diperbarui_pada)
       VALUES ('prj-1', 'ws-1', 'Overthinker Notch', '2026-11-22T10:00:00Z', '2026-11-22T10:00:00Z');
       INSERT INTO tasks (id, project_id, judul, dibuat_pada, diperbarui_pada)
       VALUES ('tsk-1', 'prj-1', 'Selesaikan Fase 4', '2026-11-22T10:00:00Z', '2026-11-22T10:00:00Z');
       INSERT INTO notes (id, project_id, judul, konten_markdown, dibuat_pada, diperbarui_pada)
       VALUES ('nt-1', 'prj-1', 'Catatan Skema', '# SQLite OK', '2026-11-22T10:00:00Z', '2026-11-22T10:00:00Z');
       INSERT INTO tags (id, nama, dibuat_pada) VALUES ('tg-1', 'database', '2026-11-22T10:00:00Z');
       INSERT INTO note_tags (note_id, tag_id) VALUES ('nt-1', 'tg-1');`
    );

    const integritas = jalankanSqlite(dbPath, "PRAGMA integrity_check;");
    expect(integritas).toBe("ok");

    const jumlahJoin = jalankanSqlite(
      dbPath,
      `SELECT COUNT(*) FROM tasks t
       JOIN projects p ON p.id = t.project_id
       JOIN workspaces w ON w.id = p.workspace_id
       WHERE w.id = 'ws-1';`
    );
    expect(jumlahJoin).toBe("1");
  });

  it("membuat backup atomik VACUUM INTO yang utuh setelah dibuka kembali", () => {
    const dir = buatFolderUji();
    const dbPath = path.join(dir, "sumber.db");
    const backupPath = path.join(dir, "backup_snapshot.db");

    jalankanSqlite(dbPath, fs.readFileSync(PATH_MIGRASI, "utf-8"));
    jalankanSqlite(
      dbPath,
      `INSERT INTO app_settings (kunci, nilai_json, diperbarui_pada)
       VALUES ('kebijakan_retensi', '{"hariRetensiClipboard":45}', '2026-11-22T10:00:00Z');
       VACUUM INTO '${backupPath}';`
    );

    expect(fs.existsSync(backupPath)).toBe(true);
    expect(jalankanSqlite(backupPath, "PRAGMA integrity_check;")).toBe("ok");
    const nilaiDipulihkan = jalankanSqlite(
      backupPath,
      "SELECT nilai_json FROM app_settings WHERE kunci = 'kebijakan_retensi';"
    );
    expect(nilaiDipulihkan).toBe('{"hariRetensiClipboard":45}');
  });
});
