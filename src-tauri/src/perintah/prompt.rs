use chrono::Utc;
use serde::{Deserialize, Serialize};
use sqlx::Row;
use tauri::State;
use uuid::Uuid;

use crate::db::StateDatabase;
use crate::galat::GalatAplikasi;

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct VersiPrompt {
    pub id: String,
    pub prompt_id: String,
    pub nomor_versi: i64,
    pub template_prompt: String,
    pub catatan_perubahan: String,
    pub dibuat_pada: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PromptItem {
    pub id: String,
    pub project_id: Option<String>,
    pub judul: String,
    pub kategori: String,
    pub template_prompt: String,
    pub daftar_variabel: Vec<String>,
    pub daftar_tag: Vec<String>,
    pub favorit: bool,
    pub riwayat_versi: Vec<VersiPrompt>,
    pub dibuat_pada: String,
    pub diperbarui_pada: String,
}

#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PermintaanSimpanPrompt {
    pub id: Option<String>,
    pub project_id: Option<String>,
    pub judul: String,
    pub kategori: String,
    pub template_prompt: String,
    pub daftar_variabel: Vec<String>,
    pub daftar_tag: Vec<String>,
    pub favorit: bool,
    pub catatan_perubahan: Option<String>,
}

async fn ambil_versi_prompt(
    pool: &sqlx::SqlitePool,
    prompt_id: &str,
) -> Result<Vec<VersiPrompt>, GalatAplikasi> {
    let baris = sqlx::query(
        "SELECT id, prompt_id, nomor_versi, template_prompt, catatan_perubahan, dibuat_pada
         FROM prompt_versions
         WHERE prompt_id = ?
         ORDER BY nomor_versi DESC;",
    )
    .bind(prompt_id)
    .fetch_all(pool)
    .await
    .map_err(|e| GalatAplikasi::KesalahanInternal(format!("Gagal membaca versi prompt: {e}")))?;

    Ok(baris
        .into_iter()
        .map(|r| VersiPrompt {
            id: r.get("id"),
            prompt_id: r.get("prompt_id"),
            nomor_versi: r.get("nomor_versi"),
            template_prompt: r.get("template_prompt"),
            catatan_perubahan: r.get("catatan_perubahan"),
            dibuat_pada: r.get("dibuat_pada"),
        })
        .collect())
}

#[tauri::command]
pub async fn daftar_prompt(
    db: State<'_, StateDatabase>,
) -> Result<Vec<PromptItem>, GalatAplikasi> {
    let baris = sqlx::query(
        "SELECT id, project_id, judul, kategori, template_prompt, variabel_json, tags_json, favorit, dibuat_pada, diperbarui_pada
         FROM prompts
         ORDER BY favorit DESC, diperbarui_pada DESC;",
    )
    .fetch_all(&db.pool)
    .await
    .map_err(|e| GalatAplikasi::KesalahanInternal(format!("Gagal memuat prompt: {e}")))?;

    let mut hasil = Vec::with_capacity(baris.len());
    for r in baris {
        let id: String = r.get("id");
        let variabel_json: String = r.get("variabel_json");
        let tags_json: String = r.get("tags_json");
        let daftar_variabel: Vec<String> = serde_json::from_str(&variabel_json).unwrap_or_default();
        let daftar_tag: Vec<String> = serde_json::from_str(&tags_json).unwrap_or_default();
        let riwayat_versi = ambil_versi_prompt(&db.pool, &id).await?;

        hasil.push(PromptItem {
            id,
            project_id: r.get("project_id"),
            judul: r.get("judul"),
            kategori: r.get("kategori"),
            template_prompt: r.get("template_prompt"),
            daftar_variabel,
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
pub async fn simpan_prompt(
    db: State<'_, StateDatabase>,
    permintaan: PermintaanSimpanPrompt,
) -> Result<PromptItem, GalatAplikasi> {
    let judul_bersih = permintaan.judul.trim();
    if judul_bersih.is_empty() || permintaan.template_prompt.trim().is_empty() {
        return Err(GalatAplikasi::MasukanTidakValid(
            "Judul dan template prompt nggak boleh kosong.".to_string(),
        ));
    }

    let sekarang = Utc::now().to_rfc3339();
    let id = permintaan
        .id
        .filter(|v| !v.trim().is_empty())
        .unwrap_or_else(|| Uuid::new_v4().to_string());

    let dibuat_pada_lama: Option<String> =
        sqlx::query_scalar("SELECT dibuat_pada FROM prompts WHERE id = ?;")
            .bind(&id)
            .fetch_optional(&db.pool)
            .await
            .map_err(|e| GalatAplikasi::KesalahanInternal(format!("Gagal cek prompt: {e}")))?;

    let dibuat_pada = dibuat_pada_lama.unwrap_or_else(|| sekarang.clone());
    let variabel_json =
        serde_json::to_string(&permintaan.daftar_variabel).unwrap_or_else(|_| "[]".into());
    let tags_json = serde_json::to_string(&permintaan.daftar_tag).unwrap_or_else(|_| "[]".into());

    sqlx::query(
        "INSERT INTO prompts (id, project_id, judul, kategori, template_prompt, variabel_json, tags_json, favorit, dibuat_pada, diperbarui_pada)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT(id) DO UPDATE SET
            project_id = excluded.project_id,
            judul = excluded.judul,
            kategori = excluded.kategori,
            template_prompt = excluded.template_prompt,
            variabel_json = excluded.variabel_json,
            tags_json = excluded.tags_json,
            favorit = excluded.favorit,
            diperbarui_pada = excluded.diperbarui_pada;",
    )
    .bind(&id)
    .bind(&permintaan.project_id)
    .bind(judul_bersih)
    .bind(permintaan.kategori.trim())
    .bind(&permintaan.template_prompt)
    .bind(&variabel_json)
    .bind(&tags_json)
    .bind(if permintaan.favorit { 1_i64 } else { 0_i64 })
    .bind(&dibuat_pada)
    .bind(&sekarang)
    .execute(&db.pool)
    .await
    .map_err(|e| GalatAplikasi::KesalahanInternal(format!("Gagal menyimpan prompt: {e}")))?;

    let versi_terakhir: Option<(i64, String)> = sqlx::query_as(
        "SELECT nomor_versi, template_prompt FROM prompt_versions WHERE prompt_id = ? ORDER BY nomor_versi DESC LIMIT 1;",
    )
    .bind(&id)
    .fetch_optional(&db.pool)
    .await
    .map_err(|e| GalatAplikasi::KesalahanInternal(format!("Gagal cek versi prompt: {e}")))?;

    let perlu_versi_baru = match &versi_terakhir {
        Some((_, template_lama)) => template_lama != &permintaan.template_prompt,
        None => true,
    };

    if perlu_versi_baru {
        let nomor_baru = versi_terakhir.map(|(n, _)| n + 1).unwrap_or(1);
        let catatan = permintaan
            .catatan_perubahan
            .filter(|c| !c.trim().is_empty())
            .unwrap_or_else(|| format!("Versi {nomor_baru}"));

        sqlx::query(
            "INSERT INTO prompt_versions (id, prompt_id, nomor_versi, template_prompt, catatan_perubahan, dibuat_pada)
             VALUES (?, ?, ?, ?, ?, ?);",
        )
        .bind(Uuid::new_v4().to_string())
        .bind(&id)
        .bind(nomor_baru)
        .bind(&permintaan.template_prompt)
        .bind(catatan)
        .bind(&sekarang)
        .execute(&db.pool)
        .await
        .map_err(|e| GalatAplikasi::KesalahanInternal(format!("Gagal mencatat versi prompt: {e}")))?;
    }

    let riwayat_versi = ambil_versi_prompt(&db.pool, &id).await?;

    Ok(PromptItem {
        id,
        project_id: permintaan.project_id,
        judul: judul_bersih.to_string(),
        kategori: permintaan.kategori.trim().to_string(),
        template_prompt: permintaan.template_prompt,
        daftar_variabel: permintaan.daftar_variabel,
        daftar_tag: permintaan.daftar_tag,
        favorit: permintaan.favorit,
        riwayat_versi,
        dibuat_pada,
        diperbarui_pada: sekarang,
    })
}

#[tauri::command]
pub async fn hapus_prompt(
    db: State<'_, StateDatabase>,
    id: String,
) -> Result<(), GalatAplikasi> {
    sqlx::query("DELETE FROM prompts WHERE id = ?;")
        .bind(id.trim())
        .execute(&db.pool)
        .await
        .map_err(|e| GalatAplikasi::KesalahanInternal(format!("Gagal menghapus prompt: {e}")))?;
    Ok(())
}
