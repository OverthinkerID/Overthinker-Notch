use chrono::Utc;
use serde::{Deserialize, Serialize};
use sqlx::Row;
use tauri::State;
use uuid::Uuid;

use crate::db::StateDatabase;
use crate::galat::GalatAplikasi;

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CatatanItem {
    pub id: String,
    pub project_id: Option<String>,
    pub judul: String,
    pub konten_markdown: String,
    pub format_konten: String,
    pub disematkan: bool,
    pub diarsipkan: bool,
    pub daftar_tag: Vec<String>,
    pub dibuat_pada: String,
    pub diperbarui_pada: String,
}

#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PermintaanSimpanCatatan {
    pub id: Option<String>,
    pub project_id: Option<String>,
    pub judul: String,
    pub konten_markdown: String,
    pub format_konten: String,
    pub disematkan: bool,
    pub diarsipkan: bool,
    pub daftar_tag: Vec<String>,
}

fn validasi_format_konten(format: &str) -> Result<(), GalatAplikasi> {
    if matches!(format, "markdown" | "rich_text" | "checklist") {
        Ok(())
    } else {
        Err(GalatAplikasi::MasukanTidakValid(
            "Format catatan harus markdown, rich_text, atau checklist.".to_string(),
        ))
    }
}

async fn ambil_tag_catatan(
    pool: &sqlx::SqlitePool,
    note_id: &str,
) -> Result<Vec<String>, GalatAplikasi> {
    let baris = sqlx::query(
        "SELECT t.nama FROM tags t
         JOIN note_tags nt ON nt.tag_id = t.id
         WHERE nt.note_id = ?
         ORDER BY t.nama ASC;",
    )
    .bind(note_id)
    .fetch_all(pool)
    .await
    .map_err(|e| GalatAplikasi::KesalahanInternal(format!("Gagal membaca tag catatan: {e}")))?;

    Ok(baris.into_iter().map(|r| r.get::<String, _>("nama")).collect())
}

#[tauri::command]
pub async fn daftar_catatan(
    db: State<'_, StateDatabase>,
) -> Result<Vec<CatatanItem>, GalatAplikasi> {
    let baris = sqlx::query(
        "SELECT id, project_id, judul, konten_markdown, format_konten, disematkan, diarsipkan, dibuat_pada, diperbarui_pada
         FROM notes
         ORDER BY disematkan DESC, diperbarui_pada DESC;",
    )
    .fetch_all(&db.pool)
    .await
    .map_err(|e| GalatAplikasi::KesalahanInternal(format!("Gagal memuat catatan: {e}")))?;

    let mut hasil = Vec::with_capacity(baris.len());
    for r in baris {
        let id: String = r.get("id");
        let daftar_tag = ambil_tag_catatan(&db.pool, &id).await?;
        hasil.push(CatatanItem {
            id,
            project_id: r.get("project_id"),
            judul: r.get("judul"),
            konten_markdown: r.get("konten_markdown"),
            format_konten: r.get("format_konten"),
            disematkan: r.get::<i64, _>("disematkan") == 1,
            diarsipkan: r.get::<i64, _>("diarsipkan") == 1,
            daftar_tag,
            dibuat_pada: r.get("dibuat_pada"),
            diperbarui_pada: r.get("diperbarui_pada"),
        });
    }

    Ok(hasil)
}

#[tauri::command]
pub async fn simpan_catatan(
    db: State<'_, StateDatabase>,
    permintaan: PermintaanSimpanCatatan,
) -> Result<CatatanItem, GalatAplikasi> {
    validasi_format_konten(&permintaan.format_konten)?;
    let judul_bersih = permintaan.judul.trim();
    if judul_bersih.is_empty() && permintaan.konten_markdown.trim().is_empty() {
        return Err(GalatAplikasi::MasukanTidakValid(
            "Judul atau isi catatan nggak boleh kosong semua.".to_string(),
        ));
    }

    let judul_final = if judul_bersih.is_empty() {
        "Catatan Tanpa Judul".to_string()
    } else {
        judul_bersih.to_string()
    };

    let sekarang = Utc::now().to_rfc3339();
    let id = permintaan
        .id
        .filter(|v| !v.trim().is_empty())
        .unwrap_or_else(|| Uuid::new_v4().to_string());

    let dibuat_pada_lama: Option<String> =
        sqlx::query_scalar("SELECT dibuat_pada FROM notes WHERE id = ?;")
            .bind(&id)
            .fetch_optional(&db.pool)
            .await
            .map_err(|e| GalatAplikasi::KesalahanInternal(format!("Gagal cek catatan: {e}")))?;

    let dibuat_pada = dibuat_pada_lama.unwrap_or_else(|| sekarang.clone());

    sqlx::query(
        "INSERT INTO notes (id, project_id, judul, konten_markdown, format_konten, disematkan, diarsipkan, dibuat_pada, diperbarui_pada)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT(id) DO UPDATE SET
            project_id = excluded.project_id,
            judul = excluded.judul,
            konten_markdown = excluded.konten_markdown,
            format_konten = excluded.format_konten,
            disematkan = excluded.disematkan,
            diarsipkan = excluded.diarsipkan,
            diperbarui_pada = excluded.diperbarui_pada;",
    )
    .bind(&id)
    .bind(&permintaan.project_id)
    .bind(&judul_final)
    .bind(&permintaan.konten_markdown)
    .bind(&permintaan.format_konten)
    .bind(if permintaan.disematkan { 1_i64 } else { 0_i64 })
    .bind(if permintaan.diarsipkan { 1_i64 } else { 0_i64 })
    .bind(&dibuat_pada)
    .bind(&sekarang)
    .execute(&db.pool)
    .await
    .map_err(|e| GalatAplikasi::KesalahanInternal(format!("Gagal menyimpan catatan: {e}")))?;

    // Sinkronisasi relasi tags & note_tags
    sqlx::query("DELETE FROM note_tags WHERE note_id = ?;")
        .bind(&id)
        .execute(&db.pool)
        .await
        .map_err(|e| GalatAplikasi::KesalahanInternal(format!("Gagal reset tag catatan: {e}")))?;

    let mut tag_bersih: Vec<String> = Vec::new();
    for tag_mentah in permintaan.daftar_tag {
        let nama_tag = tag_mentah.trim().trim_start_matches('#').to_lowercase();
        if nama_tag.is_empty() || tag_bersih.contains(&nama_tag) {
            continue;
        }
        let tag_id_existing: Option<String> =
            sqlx::query_scalar("SELECT id FROM tags WHERE nama = ?;")
                .bind(&nama_tag)
                .fetch_optional(&db.pool)
                .await
                .map_err(|e| GalatAplikasi::KesalahanInternal(format!("Gagal cek tag: {e}")))?;

        let tag_id = match tag_id_existing {
            Some(existing) => existing,
            None => {
                let baru = Uuid::new_v4().to_string();
                sqlx::query("INSERT INTO tags (id, nama, dibuat_pada) VALUES (?, ?, ?);")
                    .bind(&baru)
                    .bind(&nama_tag)
                    .bind(&sekarang)
                    .execute(&db.pool)
                    .await
                    .map_err(|e| {
                        GalatAplikasi::KesalahanInternal(format!("Gagal membuat tag: {e}"))
                    })?;
                baru
            }
        };

        sqlx::query("INSERT OR IGNORE INTO note_tags (note_id, tag_id) VALUES (?, ?);")
            .bind(&id)
            .bind(&tag_id)
            .execute(&db.pool)
            .await
            .map_err(|e| GalatAplikasi::KesalahanInternal(format!("Gagal tautkan tag: {e}")))?;

        tag_bersih.push(nama_tag);
    }

    Ok(CatatanItem {
        id,
        project_id: permintaan.project_id,
        judul: judul_final,
        konten_markdown: permintaan.konten_markdown,
        format_konten: permintaan.format_konten,
        disematkan: permintaan.disematkan,
        diarsipkan: permintaan.diarsipkan,
        daftar_tag: tag_bersih,
        dibuat_pada,
        diperbarui_pada: sekarang,
    })
}

#[tauri::command]
pub async fn hapus_catatan(
    db: State<'_, StateDatabase>,
    id: String,
) -> Result<(), GalatAplikasi> {
    if id.trim().is_empty() {
        return Err(GalatAplikasi::MasukanTidakValid(
            "ID catatan nggak valid.".to_string(),
        ));
    }

    sqlx::query("DELETE FROM notes WHERE id = ?;")
        .bind(id.trim())
        .execute(&db.pool)
        .await
        .map_err(|e| GalatAplikasi::KesalahanInternal(format!("Gagal menghapus catatan: {e}")))?;

    Ok(())
}
