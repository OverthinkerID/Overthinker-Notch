-- Overthinker Notch — Migrasi 0001: Skema Inti 18 Tabel SQLite
-- Konvensi: UUID TEXT PRIMARY KEY, Foreign Keys aktif, file biner disimpan di filesystem vault.

PRAGMA foreign_keys = ON;

-- 1. workspaces
CREATE TABLE IF NOT EXISTS workspaces (
    id TEXT PRIMARY KEY NOT NULL,
    nama TEXT NOT NULL,
    deskripsi TEXT NOT NULL DEFAULT '',
    ikon TEXT NOT NULL DEFAULT 'layers',
    warna TEXT NOT NULL DEFAULT '#55A7FF',
    dibuat_pada TEXT NOT NULL,
    diperbarui_pada TEXT NOT NULL
);

-- 2. projects
CREATE TABLE IF NOT EXISTS projects (
    id TEXT PRIMARY KEY NOT NULL,
    workspace_id TEXT NOT NULL,
    nama TEXT NOT NULL,
    deskripsi TEXT NOT NULL DEFAULT '',
    status TEXT NOT NULL DEFAULT 'aktif' CHECK (status IN ('aktif', 'dijeda', 'selesai', 'arsip')),
    warna TEXT NOT NULL DEFAULT '#55A7FF',
    progres_persen INTEGER NOT NULL DEFAULT 0 CHECK (progres_persen BETWEEN 0 AND 100),
    diarsipkan INTEGER NOT NULL DEFAULT 0 CHECK (diarsipkan IN (0, 1)),
    dibuat_pada TEXT NOT NULL,
    diperbarui_pada TEXT NOT NULL,
    FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE
);

-- 3. tasks
CREATE TABLE IF NOT EXISTS tasks (
    id TEXT PRIMARY KEY NOT NULL,
    project_id TEXT NOT NULL,
    judul TEXT NOT NULL,
    deskripsi TEXT NOT NULL DEFAULT '',
    status TEXT NOT NULL DEFAULT 'todo' CHECK (status IN ('todo', 'proses', 'selesai')),
    prioritas TEXT NOT NULL DEFAULT 'sedang' CHECK (prioritas IN ('rendah', 'sedang', 'tinggi', 'kritis')),
    tenggat_pada TEXT,
    selesai_pada TEXT,
    urutan INTEGER NOT NULL DEFAULT 0,
    dibuat_pada TEXT NOT NULL,
    diperbarui_pada TEXT NOT NULL,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

-- 4. notes
CREATE TABLE IF NOT EXISTS notes (
    id TEXT PRIMARY KEY NOT NULL,
    project_id TEXT,
    judul TEXT NOT NULL,
    konten_markdown TEXT NOT NULL DEFAULT '',
    format_konten TEXT NOT NULL DEFAULT 'markdown' CHECK (format_konten IN ('markdown', 'rich_text', 'checklist')),
    disematkan INTEGER NOT NULL DEFAULT 0 CHECK (disematkan IN (0, 1)),
    diarsipkan INTEGER NOT NULL DEFAULT 0 CHECK (diarsipkan IN (0, 1)),
    dibuat_pada TEXT NOT NULL,
    diperbarui_pada TEXT NOT NULL,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL
);

-- 5. tags
CREATE TABLE IF NOT EXISTS tags (
    id TEXT PRIMARY KEY NOT NULL,
    nama TEXT NOT NULL UNIQUE,
    warna TEXT NOT NULL DEFAULT '#A879FF',
    dibuat_pada TEXT NOT NULL
);

-- 6. note_tags
CREATE TABLE IF NOT EXISTS note_tags (
    note_id TEXT NOT NULL,
    tag_id TEXT NOT NULL,
    PRIMARY KEY (note_id, tag_id),
    FOREIGN KEY (note_id) REFERENCES notes(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);

-- 7. files (metadata saja; file fisik disimpan di folder vault lokal)
CREATE TABLE IF NOT EXISTS files (
    id TEXT PRIMARY KEY NOT NULL,
    project_id TEXT,
    nama_asli TEXT NOT NULL,
    nama_tampil TEXT NOT NULL,
    path_relatif_vault TEXT NOT NULL UNIQUE,
    tipe_mime TEXT NOT NULL DEFAULT 'application/octet-stream',
    ukuran_byte INTEGER NOT NULL DEFAULT 0 CHECK (ukuran_byte >= 0),
    checksum_sha256 TEXT NOT NULL DEFAULT '',
    kedaluwarsa_pada TEXT,
    dihapus_pada TEXT,
    dibuat_pada TEXT NOT NULL,
    diperbarui_pada TEXT NOT NULL,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL
);

-- 8. snippets
CREATE TABLE IF NOT EXISTS snippets (
    id TEXT PRIMARY KEY NOT NULL,
    project_id TEXT,
    judul TEXT NOT NULL,
    bahasa TEXT NOT NULL DEFAULT 'typescript',
    kategori TEXT NOT NULL DEFAULT 'umum',
    kode TEXT NOT NULL DEFAULT '',
    deskripsi TEXT NOT NULL DEFAULT '',
    tags_json TEXT NOT NULL DEFAULT '[]',
    favorit INTEGER NOT NULL DEFAULT 0 CHECK (favorit IN (0, 1)),
    dibuat_pada TEXT NOT NULL,
    diperbarui_pada TEXT NOT NULL,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL
);

-- 9. snippet_versions
CREATE TABLE IF NOT EXISTS snippet_versions (
    id TEXT PRIMARY KEY NOT NULL,
    snippet_id TEXT NOT NULL,
    nomor_versi INTEGER NOT NULL CHECK (nomor_versi >= 1),
    kode TEXT NOT NULL,
    catatan_perubahan TEXT NOT NULL DEFAULT '',
    dibuat_pada TEXT NOT NULL,
    FOREIGN KEY (snippet_id) REFERENCES snippets(id) ON DELETE CASCADE,
    UNIQUE (snippet_id, nomor_versi)
);

-- 10. prompts
CREATE TABLE IF NOT EXISTS prompts (
    id TEXT PRIMARY KEY NOT NULL,
    project_id TEXT,
    judul TEXT NOT NULL,
    kategori TEXT NOT NULL DEFAULT 'umum',
    template_prompt TEXT NOT NULL,
    variabel_json TEXT NOT NULL DEFAULT '[]',
    tags_json TEXT NOT NULL DEFAULT '[]',
    favorit INTEGER NOT NULL DEFAULT 0 CHECK (favorit IN (0, 1)),
    dibuat_pada TEXT NOT NULL,
    diperbarui_pada TEXT NOT NULL,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL
);

-- 11. prompt_versions
CREATE TABLE IF NOT EXISTS prompt_versions (
    id TEXT PRIMARY KEY NOT NULL,
    prompt_id TEXT NOT NULL,
    nomor_versi INTEGER NOT NULL CHECK (nomor_versi >= 1),
    template_prompt TEXT NOT NULL,
    catatan_perubahan TEXT NOT NULL DEFAULT '',
    dibuat_pada TEXT NOT NULL,
    FOREIGN KEY (prompt_id) REFERENCES prompts(id) ON DELETE CASCADE,
    UNIQUE (prompt_id, nomor_versi)
);

-- 12. clipboard_items (gambar disimpan di filesystem vault lewat path_aset_relatif)
CREATE TABLE IF NOT EXISTS clipboard_items (
    id TEXT PRIMARY KEY NOT NULL,
    tipe_konten TEXT NOT NULL CHECK (tipe_konten IN ('teks', 'kode', 'url', 'gambar')),
    konten_teks TEXT,
    path_aset_relatif TEXT,
    aplikasi_sumber TEXT NOT NULL DEFAULT '',
    disematkan INTEGER NOT NULL DEFAULT 0 CHECK (disematkan IN (0, 1)),
    hash_konten TEXT NOT NULL,
    kedaluwarsa_pada TEXT,
    dibuat_pada TEXT NOT NULL
);

-- 13. music_history
CREATE TABLE IF NOT EXISTS music_history (
    id TEXT PRIMARY KEY NOT NULL,
    judul_lagu TEXT NOT NULL,
    artis TEXT NOT NULL,
    album TEXT NOT NULL DEFAULT '',
    sumber_audio TEXT NOT NULL DEFAULT 'tidak_diketahui',
    durasi_detik INTEGER NOT NULL DEFAULT 0 CHECK (durasi_detik >= 0),
    path_artwork_relatif TEXT,
    diputar_pada TEXT NOT NULL
);

-- 14. lyrics_cache (tersinkronisasi wajib 0 jika hanya plain lyrics)
CREATE TABLE IF NOT EXISTS lyrics_cache (
    id TEXT PRIMARY KEY NOT NULL,
    judul_lagu TEXT NOT NULL,
    artis TEXT NOT NULL,
    penyedia TEXT NOT NULL,
    bahasa TEXT NOT NULL DEFAULT 'id',
    teks_lirik TEXT NOT NULL,
    tersinkronisasi INTEGER NOT NULL DEFAULT 0 CHECK (tersinkronisasi IN (0, 1)),
    terjemahan TEXT,
    diperbarui_pada TEXT NOT NULL
);

-- 15. focus_sessions
CREATE TABLE IF NOT EXISTS focus_sessions (
    id TEXT PRIMARY KEY NOT NULL,
    project_id TEXT,
    mode_fokus TEXT NOT NULL CHECK (mode_fokus IN ('pomodoro', 'deep_work', 'kustom', 'stopwatch')),
    label TEXT NOT NULL DEFAULT '',
    target_detik INTEGER NOT NULL DEFAULT 1500 CHECK (target_detik >= 0),
    durasi_aktual_detik INTEGER NOT NULL DEFAULT 0 CHECK (durasi_aktual_detik >= 0),
    status TEXT NOT NULL DEFAULT 'selesai' CHECK (status IN ('berjalan', 'dijeda', 'selesai', 'dibatalkan')),
    mulai_pada TEXT NOT NULL,
    selesai_pada TEXT,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL
);

-- 16. app_settings
CREATE TABLE IF NOT EXISTS app_settings (
    kunci TEXT PRIMARY KEY NOT NULL,
    nilai_json TEXT NOT NULL,
    diperbarui_pada TEXT NOT NULL
);

-- 17. activity_logs
CREATE TABLE IF NOT EXISTS activity_logs (
    id TEXT PRIMARY KEY NOT NULL,
    project_id TEXT,
    modul TEXT NOT NULL,
    aksi TEXT NOT NULL,
    entitas_id TEXT,
    ringkasan TEXT NOT NULL,
    dibuat_pada TEXT NOT NULL,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL
);

-- 18. backups
CREATE TABLE IF NOT EXISTS backups (
    id TEXT PRIMARY KEY NOT NULL,
    jenis_backup TEXT NOT NULL CHECK (jenis_backup IN ('otomatis', 'manual', 'pra_restore')),
    path_berkas TEXT NOT NULL,
    ukuran_byte INTEGER NOT NULL DEFAULT 0 CHECK (ukuran_byte >= 0),
    checksum_sha256 TEXT NOT NULL DEFAULT '',
    status_integritas TEXT NOT NULL DEFAULT 'terverifikasi' CHECK (status_integritas IN ('terverifikasi', 'gagal', 'belum_dicek')),
    catatan TEXT NOT NULL DEFAULT '',
    dibuat_pada TEXT NOT NULL
);

-- Indeks Performa Query Utama
CREATE INDEX IF NOT EXISTS idx_projects_workspace ON projects(workspace_id);
CREATE INDEX IF NOT EXISTS idx_tasks_project ON tasks(project_id, status);
CREATE INDEX IF NOT EXISTS idx_notes_project ON notes(project_id, disematkan, diarsipkan);
CREATE INDEX IF NOT EXISTS idx_files_project ON files(project_id, dihapus_pada, kedaluwarsa_pada);
CREATE INDEX IF NOT EXISTS idx_snippets_bahasa ON snippets(bahasa, kategori, favorit);
CREATE INDEX IF NOT EXISTS idx_prompts_kategori ON prompts(kategori, favorit);
CREATE INDEX IF NOT EXISTS idx_clipboard_waktu ON clipboard_items(disematkan, dibuat_pada DESC);
CREATE INDEX IF NOT EXISTS idx_music_waktu ON music_history(diputar_pada DESC);
CREATE INDEX IF NOT EXISTS idx_focus_waktu ON focus_sessions(mulai_pada DESC);
CREATE INDEX IF NOT EXISTS idx_activity_project ON activity_logs(project_id, dibuat_pada DESC);
CREATE INDEX IF NOT EXISTS idx_backups_waktu ON backups(dibuat_pada DESC);
