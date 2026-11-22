use chrono::Utc;
use serde::{Deserialize, Serialize};
use sqlx::Row;
use tauri::State;
use uuid::Uuid;

use crate::db::StateDatabase;
use crate::galat::GalatAplikasi;

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SesiFokusItem {
    pub id: String,
    pub project_id: Option<String>,
    pub mode_fokus: String,
    pub label: String,
    pub target_detik: i64,
    pub durasi_aktual_detik: i64,
    pub status: String,
    pub mulai_pada: String,
    pub selesai_pada: Option<String>,
}

#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PermintaanSimpanSesiFokus {
    pub id: Option<String>,
    pub project_id: Option<String>,
    pub mode_fokus: String,
    pub label: String,
    pub target_detik: i64,
    pub durasi_aktual_detik: i64,
    pub status: String,
    pub mulai_pada: String,
    pub selesai_pada: Option<String>,
}

#[tauri::command]
pub async fn daftar_sesi_fokus(
    db: State<'_, StateDatabase>,
) -> Result<Vec<SesiFokusItem>, GalatAplikasi> {
    let baris = sqlx::query(
        "SELECT id, project_id, mode_fokus, label, target_detik, durasi_aktual_detik, status, mulai_pada, selesai_pada
         FROM focus_sessions
         ORDER BY mulai_pada DESC
         LIMIT 200;",
    )
    .fetch_all(&db.pool)
    .await
    .map_err(|e| GalatAplikasi::KesalahanInternal(format!("Gagal memuat sesi fokus: {e}")))?;

    Ok(baris
        .into_iter()
        .map(|r| SesiFokusItem {
            id: r.get("id"),
            project_id: r.get("project_id"),
            mode_fokus: r.get("mode_fokus"),
            label: r.get("label"),
            target_detik: r.get("target_detik"),
            durasi_aktual_detik: r.get("durasi_aktual_detik"),
            status: r.get("status"),
            mulai_pada: r.get("mulai_pada"),
            selesai_pada: r.get("selesai_pada"),
        })
        .collect())
}

#[tauri::command]
pub async fn simpan_sesi_fokus(
    db: State<'_, StateDatabase>,
    permintaan: PermintaanSimpanSesiFokus,
) -> Result<SesiFokusItem, GalatAplikasi> {
    if !matches!(
        permintaan.mode_fokus.as_str(),
        "pomodoro" | "deep_work" | "kustom" | "stopwatch"
    ) {
        return Err(GalatAplikasi::MasukanTidakValid(
            "Mode fokus harus pomodoro, deep_work, kustom, atau stopwatch.".to_string(),
        ));
    }

    if !matches!(
        permintaan.status.as_str(),
        "berjalan" | "dijeda" | "selesai" | "dibatalkan"
    ) {
        return Err(GalatAplikasi::MasukanTidakValid(
            "Status sesi fokus nggak valid.".to_string(),
        ));
    }

    let id = permintaan
        .id
        .filter(|v| !v.trim().is_empty())
        .unwrap_or_else(|| Uuid::new_v4().to_string());
    let selesai_pada = permintaan.selesai_pada.or_else(|| {
        if permintaan.status == "selesai" {
            Some(Utc::now().to_rfc3339())
        } else {
            None
        }
    });

    sqlx::query(
        "INSERT INTO focus_sessions (id, project_id, mode_fokus, label, target_detik, durasi_aktual_detik, status, mulai_pada, selesai_pada)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT(id) DO UPDATE SET
            durasi_aktual_detik = excluded.durasi_aktual_detik,
            status = excluded.status,
            selesai_pada = excluded.selesai_pada;",
    )
    .bind(&id)
    .bind(&permintaan.project_id)
    .bind(&permintaan.mode_fokus)
    .bind(permintaan.label.trim())
    .bind(permintaan.target_detik.max(0))
    .bind(permintaan.durasi_aktual_detik.max(0))
    .bind(&permintaan.status)
    .bind(&permintaan.mulai_pada)
    .bind(&selesai_pada)
    .execute(&db.pool)
    .await
    .map_err(|e| GalatAplikasi::KesalahanInternal(format!("Gagal menyimpan sesi fokus: {e}")))?;

    Ok(SesiFokusItem {
        id,
        project_id: permintaan.project_id,
        mode_fokus: permintaan.mode_fokus,
        label: permintaan.label.trim().to_string(),
        target_detik: permintaan.target_detik.max(0),
        durasi_aktual_detik: permintaan.durasi_aktual_detik.max(0),
        status: permintaan.status,
        mulai_pada: permintaan.mulai_pada,
        selesai_pada,
    })
}
