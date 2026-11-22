use std::fs;
use std::path::{Path, PathBuf};
use std::process::Command;

use chrono::Utc;
use serde::{Deserialize, Serialize};
use sqlx::Row;
use tauri::State;
use uuid::Uuid;

use crate::db::{hitung_sha256_berkas, StateDatabase};
use crate::galat::GalatAplikasi;

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct BerkasItem {
    pub id: String,
    pub project_id: Option<String>,
    pub nama_asli: String,
    pub nama_tampil: String,
    pub path_relatif_vault: String,
    pub tipe_mime: String,
    pub ukuran_byte: i64,
    pub checksum_sha256: String,
    pub kedaluwarsa_pada: Option<String>,
    pub dihapus_pada: Option<String>,
    pub dibuat_pada: String,
    pub diperbarui_pada: String,
}

#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PermintaanImporBerkas {
    pub daftar_path_sumber: Vec<String>,
    pub project_id: Option<String>,
    pub kedaluwarsa_pada: Option<String>,
}

fn sanitasi_nama_berkas(nama: &str) -> String {
    let bersih: String = nama
        .chars()
        .map(|c| {
            if c.is_ascii_alphanumeric() || matches!(c, '.' | '-' | '_') {
                c
            } else {
                '_'
            }
        })
        .collect();
    if bersih.is_empty() {
        "berkas".to_string()
    } else {
        bersih
    }
}

fn selesaikan_path_vault_aman(dir_vault: &Path, path_relatif: &str) -> Result<PathBuf, GalatAplikasi> {
    if path_relatif.contains("..") || Path::new(path_relatif).is_absolute() {
        return Err(GalatAplikasi::MasukanTidakValid(
            "Path berkas vault nggak valid.".to_string(),
        ));
    }
    let tujuan = dir_vault.join(path_relatif);
    Ok(tujuan)
}

#[tauri::command]
pub async fn daftar_berkas(
    db: State<'_, StateDatabase>,
) -> Result<Vec<BerkasItem>, GalatAplikasi> {
    let baris = sqlx::query(
        "SELECT id, project_id, nama_asli, nama_tampil, path_relatif_vault, tipe_mime, ukuran_byte, checksum_sha256, kedaluwarsa_pada, dihapus_pada, dibuat_pada, diperbarui_pada
         FROM files
         ORDER BY dibuat_pada DESC;",
    )
    .fetch_all(&db.pool)
    .await
    .map_err(|e| GalatAplikasi::KesalahanInternal(format!("Gagal memuat daftar berkas: {e}")))?;

    Ok(baris
        .into_iter()
        .map(|r| BerkasItem {
            id: r.get("id"),
            project_id: r.get("project_id"),
            nama_asli: r.get("nama_asli"),
            nama_tampil: r.get("nama_tampil"),
            path_relatif_vault: r.get("path_relatif_vault"),
            tipe_mime: r.get("tipe_mime"),
            ukuran_byte: r.get("ukuran_byte"),
            checksum_sha256: r.get("checksum_sha256"),
            kedaluwarsa_pada: r.get("kedaluwarsa_pada"),
            dihapus_pada: r.get("dihapus_pada"),
            dibuat_pada: r.get("dibuat_pada"),
            diperbarui_pada: r.get("diperbarui_pada"),
        })
        .collect())
}

/// Menyalin berkas ke folder vault internal tanpa pernah mengubah atau menghapus file asli pengguna.
#[tauri::command]
pub async fn impor_berkas_sementara(
    db: State<'_, StateDatabase>,
    permintaan: PermintaanImporBerkas,
) -> Result<Vec<BerkasItem>, GalatAplikasi> {
    if permintaan.daftar_path_sumber.is_empty() {
        return Err(GalatAplikasi::MasukanTidakValid(
            "Minimal pilih satu file buat diimpor.".to_string(),
        ));
    }

    let mut hasil = Vec::new();
    for sumber_str in permintaan.daftar_path_sumber {
        let sumber = Path::new(sumber_str.trim());
        if !sumber.is_file() {
            return Err(GalatAplikasi::MasukanTidakValid(format!(
                "File sumber nggak ditemukan: {}",
                sumber.display()
            )));
        }

        let nama_asli = sumber
            .file_name()
            .and_then(|n| n.to_str())
            .unwrap_or("berkas")
            .to_string();
        let id = Uuid::new_v4().to_string();
        let path_relatif_vault = format!("{}_{}", &id[..8], sanitasi_nama_berkas(&nama_asli));
        let path_tujuan = selesaikan_path_vault_aman(&db.dir_vault, &path_relatif_vault)?;

        // Salin (COPY) ke vault; file asli pengguna tetap utuh.
        fs::copy(sumber, &path_tujuan)
            .map_err(|e| GalatAplikasi::KesalahanInternal(format!("Gagal menyalin file ke vault: {e}")))?;

        let ukuran_byte = fs::metadata(&path_tujuan)
            .map(|m| m.len() as i64)
            .unwrap_or(0);
        let checksum_sha256 = hitung_sha256_berkas(&path_tujuan)?;
        let sekarang = Utc::now().to_rfc3339();
        let tipe_mime = "application/octet-stream".to_string();

        sqlx::query(
            "INSERT INTO files (id, project_id, nama_asli, nama_tampil, path_relatif_vault, tipe_mime, ukuran_byte, checksum_sha256, kedaluwarsa_pada, dihapus_pada, dibuat_pada, diperbarui_pada)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NULL, ?, ?);",
        )
        .bind(&id)
        .bind(&permintaan.project_id)
        .bind(&nama_asli)
        .bind(&nama_asli)
        .bind(&path_relatif_vault)
        .bind(&tipe_mime)
        .bind(ukuran_byte)
        .bind(&checksum_sha256)
        .bind(&permintaan.kedaluwarsa_pada)
        .bind(&sekarang)
        .bind(&sekarang)
        .execute(&db.pool)
        .await
        .map_err(|e| GalatAplikasi::KesalahanInternal(format!("Gagal mencatat metadata file: {e}")))?;

        hasil.push(BerkasItem {
            id,
            project_id: permintaan.project_id.clone(),
            nama_asli: nama_asli.clone(),
            nama_tampil: nama_asli,
            path_relatif_vault,
            tipe_mime,
            ukuran_byte,
            checksum_sha256,
            kedaluwarsa_pada: permintaan.kedaluwarsa_pada.clone(),
            dihapus_pada: None,
            dibuat_pada: sekarang.clone(),
            diperbarui_pada: sekarang,
        });
    }

    Ok(hasil)
}

#[tauri::command]
pub async fn ubah_nama_berkas(
    db: State<'_, StateDatabase>,
    id: String,
    nama_tampil_baru: String,
) -> Result<(), GalatAplikasi> {
    let bersih = nama_tampil_baru.trim();
    if bersih.is_empty() {
        return Err(GalatAplikasi::MasukanTidakValid(
            "Nama file nggak boleh kosong.".to_string(),
        ));
    }
    let sekarang = Utc::now().to_rfc3339();
    sqlx::query("UPDATE files SET nama_tampil = ?, diperbarui_pada = ? WHERE id = ?;")
        .bind(bersih)
        .bind(&sekarang)
        .bind(id.trim())
        .execute(&db.pool)
        .await
        .map_err(|e| GalatAplikasi::KesalahanInternal(format!("Gagal rename file: {e}")))?;
    Ok(())
}

#[tauri::command]
pub async fn hapus_sementara_berkas(
    db: State<'_, StateDatabase>,
    id: String,
) -> Result<(), GalatAplikasi> {
    let sekarang = Utc::now().to_rfc3339();
    sqlx::query("UPDATE files SET dihapus_pada = ?, diperbarui_pada = ? WHERE id = ?;")
        .bind(&sekarang)
        .bind(&sekarang)
        .bind(id.trim())
        .execute(&db.pool)
        .await
        .map_err(|e| GalatAplikasi::KesalahanInternal(format!("Gagal memindahkan ke recovery: {e}")))?;
    Ok(())
}

#[tauri::command]
pub async fn pulihkan_berkas(
    db: State<'_, StateDatabase>,
    id: String,
) -> Result<(), GalatAplikasi> {
    let sekarang = Utc::now().to_rfc3339();
    sqlx::query("UPDATE files SET dihapus_pada = NULL, diperbarui_pada = ? WHERE id = ?;")
        .bind(&sekarang)
        .bind(id.trim())
        .execute(&db.pool)
        .await
        .map_err(|e| GalatAplikasi::KesalahanInternal(format!("Gagal memulihkan file: {e}")))?;
    Ok(())
}

/// Menghapus salinan di vault internal saja; tidak pernah menyentuh file asli pengguna.
#[tauri::command]
pub async fn hapus_permanen_berkas(
    db: State<'_, StateDatabase>,
    id: String,
) -> Result<(), GalatAplikasi> {
    let path_relatif: Option<String> =
        sqlx::query_scalar("SELECT path_relatif_vault FROM files WHERE id = ?;")
            .bind(id.trim())
            .fetch_optional(&db.pool)
            .await
            .map_err(|e| GalatAplikasi::KesalahanInternal(format!("Gagal baca file: {e}")))?;

    if let Some(rel) = path_relatif {
        let path_vault = selesaikan_path_vault_aman(&db.dir_vault, &rel)?;
        if path_vault.exists() {
            let _ = fs::remove_file(&path_vault);
        }
    }

    sqlx::query("DELETE FROM files WHERE id = ?;")
        .bind(id.trim())
        .execute(&db.pool)
        .await
        .map_err(|e| GalatAplikasi::KesalahanInternal(format!("Gagal hapus permanen file: {e}")))?;
    Ok(())
}

#[tauri::command]
pub async fn tampilkan_berkas_di_folder(
    db: State<'_, StateDatabase>,
    id: String,
) -> Result<(), GalatAplikasi> {
    let path_relatif: Option<String> =
        sqlx::query_scalar("SELECT path_relatif_vault FROM files WHERE id = ?;")
            .bind(id.trim())
            .fetch_optional(&db.pool)
            .await
            .map_err(|e| GalatAplikasi::KesalahanInternal(format!("Gagal baca file: {e}")))?;

    let rel = path_relatif.ok_or_else(|| {
        GalatAplikasi::MasukanTidakValid("File nggak ditemukan di database.".to_string())
    })?;
    let path_vault = selesaikan_path_vault_aman(&db.dir_vault, &rel)?;

    #[cfg(target_os = "macos")]
    {
        Command::new("open")
            .arg("-R")
            .arg(&path_vault)
            .spawn()
            .map_err(|e| GalatAplikasi::KesalahanInternal(format!("Gagal buka Finder: {e}")))?;
        Ok(())
    }

    #[cfg(target_os = "windows")]
    {
        Command::new("explorer")
            .arg(format!("/select,{}", path_vault.display()))
            .spawn()
            .map_err(|e| GalatAplikasi::KesalahanInternal(format!("Gagal buka Explorer: {e}")))?;
        Ok(())
    }

    #[cfg(not(any(target_os = "macos", target_os = "windows")))]
    {
        let _ = path_vault;
        Err(GalatAplikasi::TidakDidukungOs(
            "Reveal in folder hanya didukung di macOS dan Windows.".to_string(),
        ))
    }
}
