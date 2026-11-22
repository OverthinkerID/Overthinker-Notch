use chrono::{Duration, Utc};
use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};
use sqlx::Row;
use tauri::State;
use uuid::Uuid;

use crate::db::StateDatabase;
use crate::galat::GalatAplikasi;

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ItemPapanklip {
    pub id: String,
    pub tipe_konten: String,
    pub konten_teks: Option<String>,
    pub path_aset_relatif: Option<String>,
    pub aplikasi_sumber: String,
    pub disematkan: bool,
    pub hash_konten: String,
    pub kedaluwarsa_pada: Option<String>,
    pub dibuat_pada: String,
}

#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PermintaanSimpanPapanklip {
    pub tipe_konten: String,
    pub konten_teks: Option<String>,
    pub path_aset_relatif: Option<String>,
    pub aplikasi_sumber: String,
    pub filter_sensitif_aktif: bool,
    pub aplikasi_dikecualikan: Vec<String>,
    pub hari_retensi: u32,
}

fn hitung_hash_teks(teks: &str) -> String {
    let mut hasher = Sha256::new();
    hasher.update(teks.as_bytes());
    format!("{:x}", hasher.finalize())
}

fn deteksi_sensitif_rust(teks: &str) -> Option<&'static str> {
    if teks.contains("-----BEGIN ") && teks.contains("PRIVATE KEY-----") {
        return Some("Private key terdeteksi dan diblokir.");
    }
    if teks.contains("sk-") && teks.len() >= 24 {
        return Some("Pola API key (sk-...) terdeteksi dan diblokir.");
    }
    if teks.contains("ghp_") || teks.contains("github_pat_") {
        return Some("Token GitHub terdeteksi dan diblokir.");
    }
    if teks.contains("AKIA") && teks.len() >= 20 {
        return Some("Kunci AWS terdeteksi dan diblokir.");
    }
    None
}

#[tauri::command]
pub async fn daftar_papanklip(
    db: State<'_, StateDatabase>,
) -> Result<Vec<ItemPapanklip>, GalatAplikasi> {
    let baris = sqlx::query(
        "SELECT id, tipe_konten, konten_teks, path_aset_relatif, aplikasi_sumber, disematkan, hash_konten, kedaluwarsa_pada, dibuat_pada
         FROM clipboard_items
         ORDER BY disematkan DESC, dibuat_pada DESC
         LIMIT 200;",
    )
    .fetch_all(&db.pool)
    .await
    .map_err(|e| GalatAplikasi::KesalahanInternal(format!("Gagal memuat riwayat clipboard: {e}")))?;

    Ok(baris
        .into_iter()
        .map(|r| ItemPapanklip {
            id: r.get("id"),
            tipe_konten: r.get("tipe_konten"),
            konten_teks: r.get("konten_teks"),
            path_aset_relatif: r.get("path_aset_relatif"),
            aplikasi_sumber: r.get("aplikasi_sumber"),
            disematkan: r.get::<i64, _>("disematkan") == 1,
            hash_konten: r.get("hash_konten"),
            kedaluwarsa_pada: r.get("kedaluwarsa_pada"),
            dibuat_pada: r.get("dibuat_pada"),
        })
        .collect())
}

#[tauri::command]
pub async fn simpan_item_papanklip(
    db: State<'_, StateDatabase>,
    permintaan: PermintaanSimpanPapanklip,
) -> Result<ItemPapanklip, GalatAplikasi> {
    if !matches!(
        permintaan.tipe_konten.as_str(),
        "teks" | "kode" | "url" | "gambar"
    ) {
        return Err(GalatAplikasi::MasukanTidakValid(
            "Tipe konten clipboard harus teks, kode, url, atau gambar.".to_string(),
        ));
    }

    let app_lower = permintaan.aplikasi_sumber.trim().to_lowercase();
    if !app_lower.is_empty()
        && permintaan
            .aplikasi_dikecualikan
            .iter()
            .any(|a| a.trim().to_lowercase() == app_lower)
    {
        return Err(GalatAplikasi::MasukanTidakValid(format!(
            "Clipboard dari aplikasi '{}' dilewati karena masuk daftar pengecualian.",
            permintaan.aplikasi_sumber
        )));
    }

    if permintaan.filter_sensitif_aktif {
        if let Some(teks) = &permintaan.konten_teks {
            if let Some(alasan) = deteksi_sensitif_rust(teks) {
                return Err(GalatAplikasi::MasukanTidakValid(alasan.to_string()));
            }
        }
    }

    let sumber_hash = permintaan
        .konten_teks
        .as_deref()
        .or(permintaan.path_aset_relatif.as_deref())
        .unwrap_or("");
    let hash_konten = hitung_hash_teks(sumber_hash);
    let sekarang = Utc::now();
    let dibuat_pada = sekarang.to_rfc3339();
    let kedaluwarsa_pada = Some(
        (sekarang + Duration::days(i64::from(permintaan.hari_retensi.max(1)))).to_rfc3339(),
    );
    let id = Uuid::new_v4().to_string();

    sqlx::query(
        "INSERT INTO clipboard_items (id, tipe_konten, konten_teks, path_aset_relatif, aplikasi_sumber, disematkan, hash_konten, kedaluwarsa_pada, dibuat_pada)
         VALUES (?, ?, ?, ?, ?, 0, ?, ?, ?);",
    )
    .bind(&id)
    .bind(&permintaan.tipe_konten)
    .bind(&permintaan.konten_teks)
    .bind(&permintaan.path_aset_relatif)
    .bind(permintaan.aplikasi_sumber.trim())
    .bind(&hash_konten)
    .bind(&kedaluwarsa_pada)
    .bind(&dibuat_pada)
    .execute(&db.pool)
    .await
    .map_err(|e| GalatAplikasi::KesalahanInternal(format!("Gagal menyimpan clipboard: {e}")))?;

    Ok(ItemPapanklip {
        id,
        tipe_konten: permintaan.tipe_konten,
        konten_teks: permintaan.konten_teks,
        path_aset_relatif: permintaan.path_aset_relatif,
        aplikasi_sumber: permintaan.aplikasi_sumber.trim().to_string(),
        disematkan: false,
        hash_konten,
        kedaluwarsa_pada,
        dibuat_pada,
    })
}

#[tauri::command]
pub async fn ubah_pin_papanklip(
    db: State<'_, StateDatabase>,
    id: String,
    disematkan: bool,
) -> Result<(), GalatAplikasi> {
    sqlx::query("UPDATE clipboard_items SET disematkan = ? WHERE id = ?;")
        .bind(if disematkan { 1_i64 } else { 0_i64 })
        .bind(id.trim())
        .execute(&db.pool)
        .await
        .map_err(|e| GalatAplikasi::KesalahanInternal(format!("Gagal mengubah pin clipboard: {e}")))?;
    Ok(())
}

#[tauri::command]
pub async fn hapus_item_papanklip(
    db: State<'_, StateDatabase>,
    id: String,
) -> Result<(), GalatAplikasi> {
    sqlx::query("DELETE FROM clipboard_items WHERE id = ?;")
        .bind(id.trim())
        .execute(&db.pool)
        .await
        .map_err(|e| GalatAplikasi::KesalahanInternal(format!("Gagal menghapus clipboard: {e}")))?;
    Ok(())
}

#[tauri::command]
pub async fn bersihkan_papanklip_non_pin(
    db: State<'_, StateDatabase>,
) -> Result<u64, GalatAplikasi> {
    let hasil = sqlx::query("DELETE FROM clipboard_items WHERE disematkan = 0;")
        .execute(&db.pool)
        .await
        .map_err(|e| GalatAplikasi::KesalahanInternal(format!("Gagal membersihkan clipboard: {e}")))?;
    Ok(hasil.rows_affected())
}
