use std::fs;
use std::path::{Path, PathBuf};
use std::str::FromStr;

use chrono::{Duration, Utc};
use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};
use sqlx::sqlite::{SqliteConnectOptions, SqliteJournalMode, SqlitePoolOptions, SqliteSynchronous};
use sqlx::{Row, SqlitePool};
use uuid::Uuid;

use crate::galat::GalatAplikasi;

pub const DAFTAR_TABEL_WAJIB: [&str; 18] = [
    "workspaces",
    "projects",
    "tasks",
    "notes",
    "tags",
    "note_tags",
    "files",
    "snippets",
    "snippet_versions",
    "prompts",
    "prompt_versions",
    "clipboard_items",
    "music_history",
    "lyrics_cache",
    "focus_sessions",
    "app_settings",
    "activity_logs",
    "backups",
];

#[derive(Debug, Clone)]
pub struct StateDatabase {
    pub pool: SqlitePool,
    pub path_database: PathBuf,
    pub dir_backup: PathBuf,
    pub dir_vault: PathBuf,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct KebijakanRetensi {
    pub backup_otomatis_aktif: bool,
    pub interval_backup_jam: u32,
    pub maksimal_backup_otomatis: u32,
    pub hari_retensi_clipboard: u32,
    pub hari_retensi_file_sementara: u32,
}

impl Default for KebijakanRetensi {
    fn default() -> Self {
        Self {
            backup_otomatis_aktif: true,
            interval_backup_jam: 24,
            maksimal_backup_otomatis: 10,
            hari_retensi_clipboard: 30,
            hari_retensi_file_sementara: 14,
        }
    }
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct InfoTabelDatabase {
    pub nama_tabel: String,
    pub jumlah_baris: i64,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct RingkasanDatabase {
    pub path_database: String,
    pub ukuran_byte: u64,
    pub mode_jurnal: String,
    pub foreign_keys_aktif: bool,
    pub total_tabel: usize,
    pub integritas_ok: bool,
    pub daftar_tabel: Vec<InfoTabelDatabase>,
    pub jumlah_backup: i64,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct HasilIntegrityCheck {
    pub sehat: bool,
    pub detail: Vec<String>,
    pub diperiksa_pada: String,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct CatatanBackup {
    pub id: String,
    pub jenis_backup: String,
    pub path_berkas: String,
    pub ukuran_byte: i64,
    pub checksum_sha256: String,
    pub status_integritas: String,
    pub catatan: String,
    pub dibuat_pada: String,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct HasilPembersihanRetensi {
    pub clipboard_dihapus: u64,
    pub backup_lama_dihapus: u64,
    pub dijalankan_pada: String,
}

pub fn hitung_sha256_berkas(path: &Path) -> Result<String, GalatAplikasi> {
    let data = fs::read(path)
        .map_err(|e| GalatAplikasi::KesalahanInternal(format!("Gagal membaca berkas: {e}")))?;
    let mut hasher = Sha256::new();
    hasher.update(&data);
    Ok(format!("{:x}", hasher.finalize()))
}

pub async fn inisialisasi_database(dir_data_aplikasi: &Path) -> Result<StateDatabase, GalatAplikasi> {
    let dir_backup = dir_data_aplikasi.join("backups");
    let dir_vault = dir_data_aplikasi.join("vault");

    fs::create_dir_all(dir_data_aplikasi).map_err(|e| {
        GalatAplikasi::KesalahanInternal(format!("Gagal membuat folder data aplikasi: {e}"))
    })?;
    fs::create_dir_all(&dir_backup).map_err(|e| {
        GalatAplikasi::KesalahanInternal(format!("Gagal membuat folder backup: {e}"))
    })?;
    fs::create_dir_all(&dir_vault).map_err(|e| {
        GalatAplikasi::KesalahanInternal(format!("Gagal membuat folder vault: {e}"))
    })?;

    let path_database = dir_data_aplikasi.join("overthinker_notch.db");
    let url = format!("sqlite://{}", path_database.to_string_lossy());

    let opsi = SqliteConnectOptions::from_str(&url)
        .map_err(|e| GalatAplikasi::KesalahanInternal(format!("URL SQLite tidak valid: {e}")))?
        .create_if_missing(true)
        .foreign_keys(true)
        .journal_mode(SqliteJournalMode::Wal)
        .synchronous(SqliteSynchronous::Normal)
        .busy_timeout(std::time::Duration::from_secs(5));

    let pool = SqlitePoolOptions::new()
        .max_connections(5)
        .connect_with(opsi)
        .await
        .map_err(|e| GalatAplikasi::KesalahanInternal(format!("Gagal koneksi SQLite: {e}")))?;

    sqlx::migrate!("./migrations")
        .run(&pool)
        .await
        .map_err(|e| GalatAplikasi::KesalahanInternal(format!("Gagal menjalankan migrasi SQLite: {e}")))?;

    Ok(StateDatabase {
        pool,
        path_database,
        dir_backup,
        dir_vault,
    })
}

pub async fn periksa_integritas(pool: &SqlitePool) -> Result<HasilIntegrityCheck, GalatAplikasi> {
    let baris = sqlx::query("PRAGMA integrity_check;")
        .fetch_all(pool)
        .await
        .map_err(|e| GalatAplikasi::KesalahanInternal(format!("Gagal integrity_check: {e}")))?;

    let detail: Vec<String> = baris
        .into_iter()
        .filter_map(|r| r.try_get::<String, _>(0).ok())
        .collect();

    let sehat = detail.len() == 1 && detail[0].eq_ignore_ascii_case("ok");

    Ok(HasilIntegrityCheck {
        sehat,
        detail,
        diperiksa_pada: Utc::now().to_rfc3339(),
    })
}

pub async fn ambil_ringkasan(state: &StateDatabase) -> Result<RingkasanDatabase, GalatAplikasi> {
    let ukuran_byte = fs::metadata(&state.path_database)
        .map(|m| m.len())
        .unwrap_or(0);

    let mode_jurnal: String = sqlx::query_scalar("PRAGMA journal_mode;")
        .fetch_one(&state.pool)
        .await
        .unwrap_or_else(|_| "unknown".to_string());

    let fk_val: i64 = sqlx::query_scalar("PRAGMA foreign_keys;")
        .fetch_one(&state.pool)
        .await
        .unwrap_or(0);

    let mut daftar_tabel = Vec::with_capacity(DAFTAR_TABEL_WAJIB.len());
    for nama in DAFTAR_TABEL_WAJIB {
        let query = format!("SELECT COUNT(*) FROM {nama};");
        let jumlah: i64 = sqlx::query_scalar(&query)
            .fetch_one(&state.pool)
            .await
            .unwrap_or(0);
        daftar_tabel.push(InfoTabelDatabase {
            nama_tabel: nama.to_string(),
            jumlah_baris: jumlah,
        });
    }

    let cek = periksa_integritas(&state.pool).await?;
    let jumlah_backup: i64 = sqlx::query_scalar("SELECT COUNT(*) FROM backups;")
        .fetch_one(&state.pool)
        .await
        .unwrap_or(0);

    Ok(RingkasanDatabase {
        path_database: state.path_database.to_string_lossy().to_string(),
        ukuran_byte,
        mode_jurnal,
        foreign_keys_aktif: fk_val == 1,
        total_tabel: daftar_tabel.len(),
        integritas_ok: cek.sehat,
        daftar_tabel,
        jumlah_backup,
    })
}

pub async fn buat_backup(
    state: &StateDatabase,
    jenis_backup: &str,
    catatan: &str,
) -> Result<CatatanBackup, GalatAplikasi> {
    if !matches!(jenis_backup, "otomatis" | "manual" | "pra_restore") {
        return Err(GalatAplikasi::MasukanTidakValid(
            "Jenis backup harus 'otomatis', 'manual', atau 'pra_restore'.".to_string(),
        ));
    }

    let id = Uuid::new_v4().to_string();
    let cap_waktu = Utc::now().format("%Y%m%d_%H%M%S").to_string();
    let nama_berkas = format!("backup_{jenis_backup}_{cap_waktu}_{}.db", &id[..8]);
    let path_tujuan = state.dir_backup.join(nama_berkas);
    let path_str = path_tujuan.to_string_lossy().to_string();

    sqlx::query("VACUUM INTO ?;")
        .bind(&path_str)
        .execute(&state.pool)
        .await
        .map_err(|e| GalatAplikasi::KesalahanInternal(format!("Gagal membuat snapshot backup: {e}")))?;

    let ukuran_byte = fs::metadata(&path_tujuan)
        .map(|m| m.len() as i64)
        .unwrap_or(0);
    let checksum_sha256 = hitung_sha256_berkas(&path_tujuan)?;
    let dibuat_pada = Utc::now().to_rfc3339();

    sqlx::query(
        "INSERT INTO backups (id, jenis_backup, path_berkas, ukuran_byte, checksum_sha256, status_integritas, catatan, dibuat_pada)
         VALUES (?, ?, ?, ?, ?, 'terverifikasi', ?, ?);"
    )
    .bind(&id)
    .bind(jenis_backup)
    .bind(&path_str)
    .bind(ukuran_byte)
    .bind(&checksum_sha256)
    .bind(catatan)
    .bind(&dibuat_pada)
    .execute(&state.pool)
    .await
    .map_err(|e| GalatAplikasi::KesalahanInternal(format!("Gagal mencatat metadata backup: {e}")))?;

    Ok(CatatanBackup {
        id,
        jenis_backup: jenis_backup.to_string(),
        path_berkas: path_str,
        ukuran_byte,
        checksum_sha256,
        status_integritas: "terverifikasi".to_string(),
        catatan: catatan.to_string(),
        dibuat_pada,
    })
}

pub async fn ambil_daftar_backup(pool: &SqlitePool) -> Result<Vec<CatatanBackup>, GalatAplikasi> {
    let baris = sqlx::query(
        "SELECT id, jenis_backup, path_berkas, ukuran_byte, checksum_sha256, status_integritas, catatan, dibuat_pada
         FROM backups ORDER BY dibuat_pada DESC LIMIT 50;"
    )
    .fetch_all(pool)
    .await
    .map_err(|e| GalatAplikasi::KesalahanInternal(format!("Gagal memuat daftar backup: {e}")))?;

    Ok(baris
        .into_iter()
        .map(|r| CatatanBackup {
            id: r.get("id"),
            jenis_backup: r.get("jenis_backup"),
            path_berkas: r.get("path_berkas"),
            ukuran_byte: r.get("ukuran_byte"),
            checksum_sha256: r.get("checksum_sha256"),
            status_integritas: r.get("status_integritas"),
            catatan: r.get("catatan"),
            dibuat_pada: r.get("dibuat_pada"),
        })
        .collect())
}

pub async fn simpan_kebijakan_retensi(
    pool: &SqlitePool,
    kebijakan: &KebijakanRetensi,
) -> Result<(), GalatAplikasi> {
    if kebijakan.interval_backup_jam == 0 || kebijakan.maksimal_backup_otomatis == 0 {
        return Err(GalatAplikasi::MasukanTidakValid(
            "Interval backup dan batas maksimal backup otomatis harus lebih dari 0.".to_string(),
        ));
    }

    let nilai_json = serde_json::to_string(kebijakan)
        .map_err(|e| GalatAplikasi::KesalahanInternal(format!("Gagal serialisasi kebijakan: {e}")))?;
    let sekarang = Utc::now().to_rfc3339();

    sqlx::query(
        "INSERT INTO app_settings (kunci, nilai_json, diperbarui_pada)
         VALUES ('kebijakan_retensi', ?, ?)
         ON CONFLICT(kunci) DO UPDATE SET nilai_json = excluded.nilai_json, diperbarui_pada = excluded.diperbarui_pada;"
    )
    .bind(nilai_json)
    .bind(sekarang)
    .execute(pool)
    .await
    .map_err(|e| GalatAplikasi::KesalahanInternal(format!("Gagal menyimpan kebijakan retensi: {e}")))?;

    Ok(())
}

pub async fn ambil_kebijakan_retensi(pool: &SqlitePool) -> Result<KebijakanRetensi, GalatAplikasi> {
    let baris: Option<String> = sqlx::query_scalar(
        "SELECT nilai_json FROM app_settings WHERE kunci = 'kebijakan_retensi';"
    )
    .fetch_optional(pool)
    .await
    .map_err(|e| GalatAplikasi::KesalahanInternal(format!("Gagal membaca kebijakan retensi: {e}")))?;

    match baris {
        Some(json) => Ok(serde_json::from_str(&json).unwrap_or_default()),
        None => Ok(KebijakanRetensi::default()),
    }
}

pub async fn jalankan_pembersihan_retensi(
    state: &StateDatabase,
) -> Result<HasilPembersihanRetensi, GalatAplikasi> {
    let kebijakan = ambil_kebijakan_retensi(&state.pool).await?;
    let batas_clipboard = (Utc::now() - Duration::days(i64::from(kebijakan.hari_retensi_clipboard)))
        .to_rfc3339();

    let hasil_clip = sqlx::query(
        "DELETE FROM clipboard_items WHERE disematkan = 0 AND dibuat_pada < ?;"
    )
    .bind(&batas_clipboard)
    .execute(&state.pool)
    .await
    .map_err(|e| GalatAplikasi::KesalahanInternal(format!("Gagal membersihkan clipboard lama: {e}")))?;

    let backup_lama = sqlx::query(
        "SELECT id, path_berkas FROM backups
         WHERE jenis_backup = 'otomatis'
         ORDER BY dibuat_pada DESC
         LIMIT -1 OFFSET ?;"
    )
    .bind(i64::from(kebijakan.maksimal_backup_otomatis))
    .fetch_all(&state.pool)
    .await
    .map_err(|e| GalatAplikasi::KesalahanInternal(format!("Gagal membaca backup lama: {e}")))?;

    let mut backup_lama_dihapus: u64 = 0;
    for row in backup_lama {
        let id: String = row.get("id");
        let path_berkas: String = row.get("path_berkas");
        let _ = fs::remove_file(Path::new(&path_berkas));
        sqlx::query("DELETE FROM backups WHERE id = ?;")
            .bind(id)
            .execute(&state.pool)
            .await
            .map_err(|e| GalatAplikasi::KesalahanInternal(format!("Gagal hapus catatan backup: {e}")))?;
        backup_lama_dihapus += 1;
    }

    Ok(HasilPembersihanRetensi {
        clipboard_dihapus: hasil_clip.rows_affected(),
        backup_lama_dihapus,
        dijalankan_pada: Utc::now().to_rfc3339(),
    })
}
