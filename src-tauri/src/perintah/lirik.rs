use chrono::Utc;
use serde::{Deserialize, Serialize};
use sqlx::Row;
use tauri::State;
use uuid::Uuid;

use crate::db::StateDatabase;
use crate::galat::GalatAplikasi;

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct LirikTersimpanItem {
    pub id: String,
    pub judul_lagu: String,
    pub artis: String,
    pub penyedia: String,
    pub bahasa: String,
    pub teks_lirik: String,
    pub tersinkronisasi: bool,
    pub terjemahan: Option<String>,
    pub diperbarui_pada: String,
}

#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PermintaanSimpanLirik {
    pub id: Option<String>,
    pub judul_lagu: String,
    pub artis: String,
    pub penyedia: String,
    pub bahasa: String,
    pub teks_lirik: String,
    pub tersinkronisasi: bool,
    pub terjemahan: Option<String>,
}

fn mengandung_timestamp_lrc(teks: &str) -> bool {
    teks.lines().any(|baris| {
        let b = baris.trim();
        b.starts_with('[') && b.contains(':') && b.contains(']')
    })
}

#[tauri::command]
pub async fn daftar_cache_lirik(
    db: State<'_, StateDatabase>,
) -> Result<Vec<LirikTersimpanItem>, GalatAplikasi> {
    let baris = sqlx::query(
        "SELECT id, judul_lagu, artis, penyedia, bahasa, teks_lirik, tersinkronisasi, terjemahan, diperbarui_pada
         FROM lyrics_cache
         ORDER BY diperbarui_pada DESC
         LIMIT 100;",
    )
    .fetch_all(&db.pool)
    .await
    .map_err(|e| GalatAplikasi::KesalahanInternal(format!("Gagal memuat cache lirik: {e}")))?;

    Ok(baris
        .into_iter()
        .map(|r| LirikTersimpanItem {
            id: r.get("id"),
            judul_lagu: r.get("judul_lagu"),
            artis: r.get("artis"),
            penyedia: r.get("penyedia"),
            bahasa: r.get("bahasa"),
            teks_lirik: r.get("teks_lirik"),
            tersinkronisasi: r.get::<i64, _>("tersinkronisasi") == 1,
            terjemahan: r.get("terjemahan"),
            diperbarui_pada: r.get("diperbarui_pada"),
        })
        .collect())
}

#[tauri::command]
pub async fn simpan_cache_lirik(
    db: State<'_, StateDatabase>,
    permintaan: PermintaanSimpanLirik,
) -> Result<LirikTersimpanItem, GalatAplikasi> {
    if permintaan.judul_lagu.trim().is_empty() || permintaan.artis.trim().is_empty() {
        return Err(GalatAplikasi::MasukanTidakValid(
            "Judul lagu dan artis nggak boleh kosong.".to_string(),
        ));
    }
    if permintaan.teks_lirik.trim().is_empty() {
        return Err(GalatAplikasi::MasukanTidakValid(
            "Teks lirik nggak boleh kosong.".to_string(),
        ));
    }

    // Pastikan tidak pernah mengklaim lirik tersinkronisasi jika tidak ada timestamp LRC valid
    let sinkron_valid =
        permintaan.tersinkronisasi && mengandung_timestamp_lrc(&permintaan.teks_lirik);

    let id = permintaan
        .id
        .filter(|v| !v.trim().is_empty())
        .unwrap_or_else(|| Uuid::new_v4().to_string());
    let sekarang = Utc::now().to_rfc3339();
    let terjemahan_bersih = permintaan
        .terjemahan
        .map(|t| t.trim().to_string())
        .filter(|t| !t.is_empty());

    sqlx::query(
        "INSERT INTO lyrics_cache (id, judul_lagu, artis, penyedia, bahasa, teks_lirik, tersinkronisasi, terjemahan, diperbarui_pada)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT(id) DO UPDATE SET
            judul_lagu = excluded.judul_lagu,
            artis = excluded.artis,
            penyedia = excluded.penyedia,
            bahasa = excluded.bahasa,
            teks_lirik = excluded.teks_lirik,
            tersinkronisasi = excluded.tersinkronisasi,
            terjemahan = excluded.terjemahan,
            diperbarui_pada = excluded.diperbarui_pada;",
    )
    .bind(&id)
    .bind(permintaan.judul_lagu.trim())
    .bind(permintaan.artis.trim())
    .bind(permintaan.penyedia.trim())
    .bind(permintaan.bahasa.trim())
    .bind(&permintaan.teks_lirik)
    .bind(if sinkron_valid { 1_i64 } else { 0_i64 })
    .bind(&terjemahan_bersih)
    .bind(&sekarang)
    .execute(&db.pool)
    .await
    .map_err(|e| GalatAplikasi::KesalahanInternal(format!("Gagal menyimpan cache lirik: {e}")))?;

    Ok(LirikTersimpanItem {
        id,
        judul_lagu: permintaan.judul_lagu.trim().to_string(),
        artis: permintaan.artis.trim().to_string(),
        penyedia: permintaan.penyedia.trim().to_string(),
        bahasa: permintaan.bahasa.trim().to_string(),
        teks_lirik: permintaan.teks_lirik,
        tersinkronisasi: sinkron_valid,
        terjemahan: terjemahan_bersih,
        diperbarui_pada: sekarang,
    })
}

#[tauri::command]
pub async fn hapus_cache_lirik(
    db: State<'_, StateDatabase>,
    id: String,
) -> Result<(), GalatAplikasi> {
    sqlx::query("DELETE FROM lyrics_cache WHERE id = ?;")
        .bind(id.trim())
        .execute(&db.pool)
        .await
        .map_err(|e| GalatAplikasi::KesalahanInternal(format!("Gagal menghapus cache lirik: {e}")))?;
    Ok(())
}
