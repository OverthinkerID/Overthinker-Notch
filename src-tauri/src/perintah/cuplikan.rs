use chrono::Utc;
use serde::{Deserialize, Serialize};
use sqlx::Row;
use tauri::State;
use uuid::Uuid;

use crate::db::StateDatabase;
use crate::galat::GalatAplikasi;

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct VersiCuplikan {
    pub id: String,
    pub snippet_id: String,
    pub nomor_versi: i64,
    pub kode: String,
    pub catatan_perubahan: String,
    pub dibuat_pada: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CuplikanKodeItem {
    pub id: String,
    pub project_id: Option<String>,
    pub judul: String,
    pub bahasa: String,
    pub kategori: String,
    pub kode: String,
    pub deskripsi: String,
    pub daftar_tag: Vec<String>,
    pub favorit: bool,
    pub riwayat_versi: Vec<VersiCuplikan>,
    pub dibuat_pada: String,
    pub diperbarui_pada: String,
}

#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PermintaanSimpanCuplikan {
    pub id: Option<String>,
    pub project_id: Option<String>,
    pub judul: String,
    pub bahasa: String,
    pub kategori: String,
    pub kode: String,
    pub deskripsi: String,
    pub daftar_tag: Vec<String>,
    pub favorit: bool,
    pub catatan_perubahan: Option<String>,
}

async fn ambil_versi_untuk_snippet(
    pool: &sqlx::SqlitePool,
    snippet_id: &str,
) -> Result<Vec<VersiCuplikan>, GalatAplikasi> {
    let baris = sqlx::query(
        "SELECT id, snippet_id, nomor_versi, kode, catatan_perubahan, dibuat_pada
         FROM snippet_versions
         WHERE snippet_id = ?
         ORDER BY nomor_versi DESC;",
    )
    .bind(snippet_id)
    .fetch_all(pool)
    .await
    .map_err(|e| GalatAplikasi::KesalahanInternal(format!("Gagal membaca versi snippet: {e}")))?;

    Ok(baris
        .into_iter()
        .map(|r| VersiCuplikan {
            id: r.get("id"),
            snippet_id: r.get("snippet_id"),
            nomor_versi: r.get("nomor_versi"),
            kode: r.get("kode"),
            catatan_perubahan: r.get("catatan_perubahan"),
            dibuat_pada: r.get("dibuat_pada"),
        })
        .collect())
}

#[tauri::command]
pub async fn daftar_cuplikan(
    db: State<'_, StateDatabase>,
) -> Result<Vec<CuplikanKodeItem>, GalatAplikasi> {
    let baris = sqlx::query(
        "SELECT id, project_id, judul, bahasa, kategori, kode, deskripsi, tags_json, favorit, dibuat_pada, diperbarui_pada
         FROM snippets
         ORDER BY favorit DESC, diperbarui_pada DESC;",
    )
    .fetch_all(&db.pool)
    .await
    .map_err(|e| GalatAplikasi::KesalahanInternal(format!("Gagal memuat snippet: {e}")))?;

    let mut hasil = Vec::with_capacity(baris.len());
    for r in baris {
        let id: String = r.get("id");
        let tags_json: String = r.get("tags_json");
        let daftar_tag: Vec<String> = serde_json::from_str(&tags_json).unwrap_or_default();
        let riwayat_versi = ambil_versi_untuk_snippet(&db.pool, &id).await?;

        hasil.push(CuplikanKodeItem {
            id,
            project_id: r.get("project_id"),
            judul: r.get("judul"),
            bahasa: r.get("bahasa"),
            kategori: r.get("kategori"),
            kode: r.get("kode"),
            deskripsi: r.get("deskripsi"),
            daftar_tag,
            favorit: r.get::<i64, _>("favorit") == 1,
            riwayat_versi,
            dibuat_pada: r.get("dibuat_pada"),
            diperbarui_pada: r.get("diperbarui_pada"),
        });
    }

    Ok(hasil)
}

#[tauri::command]
pub async fn simpan_cuplikan(
    db: State<'_, StateDatabase>,
    permintaan: PermintaanSimpanCuplikan,
) -> Result<CuplikanKodeItem, GalatAplikasi> {
    let judul_bersih = permintaan.judul.trim();
    if judul_bersih.is_empty() {
        return Err(GalatAplikasi::MasukanTidakValid(
            "Judul snippet nggak boleh kosong.".to_string(),
        ));
    }

    let sekarang = Utc::now().to_rfc3339();
    let id = permintaan
        .id
        .filter(|v| !v.trim().is_empty())
        .unwrap_or_else(|| Uuid::new_v4().to_string());

    let dibuat_pada_lama: Option<String> =
        sqlx::query_scalar("SELECT dibuat_pada FROM snippets WHERE id = ?;")
            .bind(&id)
            .fetch_optional(&db.pool)
            .await
            .map_err(|e| GalatAplikasi::KesalahanInternal(format!("Gagal cek snippet: {e}")))?;

    let dibuat_pada = dibuat_pada_lama.unwrap_or_else(|| sekarang.clone());
    let tags_json = serde_json::to_string(&permintaan.daftar_tag).unwrap_or_else(|_| "[]".into());

    sqlx::query(
        "INSERT INTO snippets (id, project_id, judul, bahasa, kategori, kode, deskripsi, tags_json, favorit, dibuat_pada, diperbarui_pada)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT(id) DO UPDATE SET
            project_id = excluded.project_id,
            judul = excluded.judul,
            bahasa = excluded.bahasa,
            kategori = excluded.kategori,
            kode = excluded.kode,
            deskripsi = excluded.deskripsi,
            tags_json = excluded.tags_json,
            favorit = excluded.favorit,
            diperbarui_pada = excluded.diperbarui_pada;",
    )
    .bind(&id)
    .bind(&permintaan.project_id)
    .bind(judul_bersih)
    .bind(permintaan.bahasa.trim())
    .bind(permintaan.kategori.trim())
    .bind(&permintaan.kode)
    .bind(permintaan.deskripsi.trim())
    .bind(&tags_json)
    .bind(if permintaan.favorit { 1_i64 } else { 0_i64 })
    .bind(&dibuat_pada)
    .bind(&sekarang)
    .execute(&db.pool)
    .await
    .map_err(|e| GalatAplikasi::KesalahanInternal(format!("Gagal menyimpan snippet: {e}")))?;

    // Catat versi baru jika kode berubah atau belum ada versi sama sekali
    let versi_terakhir: Option<(i64, String)> = sqlx::query_as(
        "SELECT nomor_versi, kode FROM snippet_versions WHERE snippet_id = ? ORDER BY nomor_versi DESC LIMIT 1;",
    )
    .bind(&id)
    .fetch_optional(&db.pool)
    .await
    .map_err(|e| GalatAplikasi::KesalahanInternal(format!("Gagal cek versi terakhir: {e}")))?;

    let perlu_versi_baru = match &versi_terakhir {
        Some((_, kode_lama)) => kode_lama != &permintaan.kode,
        None => true,
    };

    if perlu_versi_baru {
        let nomor_baru = versi_terakhir.map(|(n, _)| n + 1).unwrap_or(1);
        let catatan = permintaan
            .catatan_perubahan
            .filter(|c| !c.trim().is_empty())
            .unwrap_or_else(|| format!("Versi {nomor_baru}"));

        sqlx::query(
            "INSERT INTO snippet_versions (id, snippet_id, nomor_versi, kode, catatan_perubahan, dibuat_pada)
             VALUES (?, ?, ?, ?, ?, ?);",
        )
        .bind(Uuid::new_v4().to_string())
        .bind(&id)
        .bind(nomor_baru)
        .bind(&permintaan.kode)
        .bind(catatan)
        .bind(&sekarang)
        .execute(&db.pool)
        .await
        .map_err(|e| GalatAplikasi::KesalahanInternal(format!("Gagal mencatat versi snippet: {e}")))?;
    }

    let riwayat_versi = ambil_versi_untuk_snippet(&db.pool, &id).await?;

    Ok(CuplikanKodeItem {
        id,
        project_id: permintaan.project_id,
        judul: judul_bersih.to_string(),
        bahasa: permintaan.bahasa.trim().to_string(),
        kategori: permintaan.kategori.trim().to_string(),
        kode: permintaan.kode,
        deskripsi: permintaan.deskripsi.trim().to_string(),
        daftar_tag: permintaan.daftar_tag,
        favorit: permintaan.favorit,
        riwayat_versi,
        dibuat_pada,
        diperbarui_pada: sekarang,
    })
}

#[tauri::command]
pub async fn hapus_cuplikan(
    db: State<'_, StateDatabase>,
    id: String,
) -> Result<(), GalatAplikasi> {
    sqlx::query("DELETE FROM snippets WHERE id = ?;")
        .bind(id.trim())
        .execute(&db.pool)
        .await
        .map_err(|e| GalatAplikasi::KesalahanInternal(format!("Gagal menghapus snippet: {e}")))?;
    Ok(())
}
