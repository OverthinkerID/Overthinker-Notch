use chrono::Utc;
use serde::{Deserialize, Serialize};
use sqlx::Row;
use tauri::State;
use uuid::Uuid;

use crate::db::StateDatabase;
use crate::galat::GalatAplikasi;

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct WorkspaceItem {
    pub id: String,
    pub nama: String,
    pub deskripsi: String,
    pub ikon: String,
    pub warna: String,
    pub dibuat_pada: String,
    pub diperbarui_pada: String,
}

#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PermintaanSimpanWorkspace {
    pub id: Option<String>,
    pub nama: String,
    pub deskripsi: String,
    pub ikon: String,
    pub warna: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ProjectItem {
    pub id: String,
    pub workspace_id: String,
    pub nama: String,
    pub deskripsi: String,
    pub status: String,
    pub warna: String,
    pub progres_persen: i64,
    pub diarsipkan: bool,
    pub dibuat_pada: String,
    pub diperbarui_pada: String,
}

#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PermintaanSimpanProyek {
    pub id: Option<String>,
    pub workspace_id: String,
    pub nama: String,
    pub deskripsi: String,
    pub status: String,
    pub warna: String,
    pub progres_persen: Option<i64>,
    pub diarsipkan: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct TaskItem {
    pub id: String,
    pub project_id: String,
    pub judul: String,
    pub deskripsi: String,
    pub status: String,
    pub prioritas: String,
    pub tenggat_pada: Option<String>,
    pub selesai_pada: Option<String>,
    pub urutan: i64,
    pub dibuat_pada: String,
    pub diperbarui_pada: String,
}

#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PermintaanSimpanTugas {
    pub id: Option<String>,
    pub project_id: String,
    pub judul: String,
    pub deskripsi: String,
    pub status: String,
    pub prioritas: String,
    pub tenggat_pada: Option<String>,
    pub urutan: Option<i64>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct RingkasanAsetProyek {
    pub project_id: String,
    pub jumlah_catatan: i64,
    pub jumlah_berkas: i64,
    pub jumlah_cuplikan: i64,
    pub jumlah_prompt: i64,
    pub jumlah_sesi_fokus: i64,
}

async fn hitung_ulang_progres_proyek(
    pool: &sqlx::SqlitePool,
    project_id: &str,
) -> Result<(), GalatAplikasi> {
    let total: i64 = sqlx::query_scalar("SELECT COUNT(*) FROM tasks WHERE project_id = ?;")
        .bind(project_id)
        .fetch_one(pool)
        .await
        .map_err(|e| GalatAplikasi::KesalahanInternal(format!("Gagal hitung tugas: {e}")))?;

    if total == 0 {
        return Ok(());
    }

    let selesai: i64 = sqlx::query_scalar(
        "SELECT COUNT(*) FROM tasks WHERE project_id = ? AND status = 'selesai';",
    )
    .bind(project_id)
    .fetch_one(pool)
    .await
    .map_err(|e| GalatAplikasi::KesalahanInternal(format!("Gagal hitung tugas selesai: {e}")))?;

    let persen = ((selesai * 100) / total).clamp(0, 100);
    let sekarang = Utc::now().to_rfc3339();

    sqlx::query("UPDATE projects SET progres_persen = ?, diperbarui_pada = ? WHERE id = ?;")
        .bind(persen)
        .bind(sekarang)
        .bind(project_id)
        .execute(pool)
        .await
        .map_err(|e| GalatAplikasi::KesalahanInternal(format!("Gagal update progres proyek: {e}")))?;

    Ok(())
}

#[tauri::command]
pub async fn daftar_workspace(
    db: State<'_, StateDatabase>,
) -> Result<Vec<WorkspaceItem>, GalatAplikasi> {
    let baris = sqlx::query(
        "SELECT id, nama, deskripsi, ikon, warna, dibuat_pada, diperbarui_pada
         FROM workspaces
         ORDER BY dibuat_pada ASC;",
    )
    .fetch_all(&db.pool)
    .await
    .map_err(|e| GalatAplikasi::KesalahanInternal(format!("Gagal memuat workspace: {e}")))?;

    Ok(baris
        .into_iter()
        .map(|r| WorkspaceItem {
            id: r.get("id"),
            nama: r.get("nama"),
            deskripsi: r.get("deskripsi"),
            ikon: r.get("ikon"),
            warna: r.get("warna"),
            dibuat_pada: r.get("dibuat_pada"),
            diperbarui_pada: r.get("diperbarui_pada"),
        })
        .collect())
}

#[tauri::command]
pub async fn simpan_workspace(
    db: State<'_, StateDatabase>,
    permintaan: PermintaanSimpanWorkspace,
) -> Result<WorkspaceItem, GalatAplikasi> {
    let nama_bersih = permintaan.nama.trim();
    if nama_bersih.is_empty() {
        return Err(GalatAplikasi::MasukanTidakValid(
            "Nama workspace nggak boleh kosong.".to_string(),
        ));
    }

    let sekarang = Utc::now().to_rfc3339();
    let id = permintaan
        .id
        .filter(|v| !v.trim().is_empty())
        .unwrap_or_else(|| Uuid::new_v4().to_string());

    let dibuat_pada: String =
        sqlx::query_scalar("SELECT dibuat_pada FROM workspaces WHERE id = ?;")
            .bind(&id)
            .fetch_optional(&db.pool)
            .await
            .map_err(|e| GalatAplikasi::KesalahanInternal(format!("Gagal cek workspace: {e}")))?
            .unwrap_or_else(|| sekarang.clone());

    let ikon = if permintaan.ikon.trim().is_empty() {
        "layers".to_string()
    } else {
        permintaan.ikon.trim().to_string()
    };
    let warna = if permintaan.warna.trim().is_empty() {
        "#55A7FF".to_string()
    } else {
        permintaan.warna.trim().to_string()
    };

    sqlx::query(
        "INSERT INTO workspaces (id, nama, deskripsi, ikon, warna, dibuat_pada, diperbarui_pada)
         VALUES (?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT(id) DO UPDATE SET
            nama = excluded.nama,
            deskripsi = excluded.deskripsi,
            ikon = excluded.ikon,
            warna = excluded.warna,
            diperbarui_pada = excluded.diperbarui_pada;",
    )
    .bind(&id)
    .bind(nama_bersih)
    .bind(permintaan.deskripsi.trim())
    .bind(&ikon)
    .bind(&warna)
    .bind(&dibuat_pada)
    .bind(&sekarang)
    .execute(&db.pool)
    .await
    .map_err(|e| GalatAplikasi::KesalahanInternal(format!("Gagal menyimpan workspace: {e}")))?;

    Ok(WorkspaceItem {
        id,
        nama: nama_bersih.to_string(),
        deskripsi: permintaan.deskripsi.trim().to_string(),
        ikon,
        warna,
        dibuat_pada,
        diperbarui_pada: sekarang,
    })
}

#[tauri::command]
pub async fn hapus_workspace(
    db: State<'_, StateDatabase>,
    id: String,
) -> Result<(), GalatAplikasi> {
    sqlx::query("DELETE FROM workspaces WHERE id = ?;")
        .bind(id.trim())
        .execute(&db.pool)
        .await
        .map_err(|e| GalatAplikasi::KesalahanInternal(format!("Gagal menghapus workspace: {e}")))?;
    Ok(())
}

#[tauri::command]
pub async fn daftar_proyek(
    db: State<'_, StateDatabase>,
) -> Result<Vec<ProjectItem>, GalatAplikasi> {
    let baris = sqlx::query(
        "SELECT id, workspace_id, nama, deskripsi, status, warna, progres_persen, diarsipkan, dibuat_pada, diperbarui_pada
         FROM projects
         ORDER BY diarsipkan ASC, diperbarui_pada DESC;",
    )
    .fetch_all(&db.pool)
    .await
    .map_err(|e| GalatAplikasi::KesalahanInternal(format!("Gagal memuat proyek: {e}")))?;

    Ok(baris
        .into_iter()
        .map(|r| ProjectItem {
            id: r.get("id"),
            workspace_id: r.get("workspace_id"),
            nama: r.get("nama"),
            deskripsi: r.get("deskripsi"),
            status: r.get("status"),
            warna: r.get("warna"),
            progres_persen: r.get("progres_persen"),
            diarsipkan: r.get::<i64, _>("diarsipkan") == 1,
            dibuat_pada: r.get("dibuat_pada"),
            diperbarui_pada: r.get("diperbarui_pada"),
        })
        .collect())
}

#[tauri::command]
pub async fn simpan_proyek(
    db: State<'_, StateDatabase>,
    permintaan: PermintaanSimpanProyek,
) -> Result<ProjectItem, GalatAplikasi> {
    let nama_bersih = permintaan.nama.trim();
    if nama_bersih.is_empty() {
        return Err(GalatAplikasi::MasukanTidakValid(
            "Nama proyek nggak boleh kosong.".to_string(),
        ));
    }

    let status = match permintaan.status.as_str() {
        "aktif" | "dijeda" | "selesai" | "arsip" => permintaan.status.clone(),
        _ => "aktif".to_string(),
    };

    let sekarang = Utc::now().to_rfc3339();
    let id = permintaan
        .id
        .filter(|v| !v.trim().is_empty())
        .unwrap_or_else(|| Uuid::new_v4().to_string());

    let dibuat_pada: String =
        sqlx::query_scalar("SELECT dibuat_pada FROM projects WHERE id = ?;")
            .bind(&id)
            .fetch_optional(&db.pool)
            .await
            .map_err(|e| GalatAplikasi::KesalahanInternal(format!("Gagal cek proyek: {e}")))?
            .unwrap_or_else(|| sekarang.clone());

    let progres = permintaan.progres_persen.unwrap_or(0).clamp(0, 100);
    let warna = if permintaan.warna.trim().is_empty() {
        "#55A7FF".to_string()
    } else {
        permintaan.warna.trim().to_string()
    };

    sqlx::query(
        "INSERT INTO projects (id, workspace_id, nama, deskripsi, status, warna, progres_persen, diarsipkan, dibuat_pada, diperbarui_pada)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT(id) DO UPDATE SET
            workspace_id = excluded.workspace_id,
            nama = excluded.nama,
            deskripsi = excluded.deskripsi,
            status = excluded.status,
            warna = excluded.warna,
            progres_persen = excluded.progres_persen,
            diarsipkan = excluded.diarsipkan,
            diperbarui_pada = excluded.diperbarui_pada;",
    )
    .bind(&id)
    .bind(permintaan.workspace_id.trim())
    .bind(nama_bersih)
    .bind(permintaan.deskripsi.trim())
    .bind(&status)
    .bind(&warna)
    .bind(progres)
    .bind(if permintaan.diarsipkan { 1_i64 } else { 0_i64 })
    .bind(&dibuat_pada)
    .bind(&sekarang)
    .execute(&db.pool)
    .await
    .map_err(|e| GalatAplikasi::KesalahanInternal(format!("Gagal menyimpan proyek: {e}")))?;

    Ok(ProjectItem {
        id,
        workspace_id: permintaan.workspace_id.trim().to_string(),
        nama: nama_bersih.to_string(),
        deskripsi: permintaan.deskripsi.trim().to_string(),
        status,
        warna,
        progres_persen: progres,
        diarsipkan: permintaan.diarsipkan,
        dibuat_pada,
        diperbarui_pada: sekarang,
    })
}

#[tauri::command]
pub async fn hapus_proyek(
    db: State<'_, StateDatabase>,
    id: String,
) -> Result<(), GalatAplikasi> {
    sqlx::query("DELETE FROM projects WHERE id = ?;")
        .bind(id.trim())
        .execute(&db.pool)
        .await
        .map_err(|e| GalatAplikasi::KesalahanInternal(format!("Gagal menghapus proyek: {e}")))?;
    Ok(())
}

#[tauri::command]
pub async fn daftar_tugas(
    db: State<'_, StateDatabase>,
    project_id: Option<String>,
) -> Result<Vec<TaskItem>, GalatAplikasi> {
    let baris = match project_id {
        Some(pid) if !pid.trim().is_empty() => {
            sqlx::query(
                "SELECT id, project_id, judul, deskripsi, status, prioritas, tenggat_pada, selesai_pada, urutan, dibuat_pada, diperbarui_pada
                 FROM tasks
                 WHERE project_id = ?
                 ORDER BY urutan ASC, dibuat_pada DESC;",
            )
            .bind(pid.trim())
            .fetch_all(&db.pool)
            .await
        }
        _ => {
            sqlx::query(
                "SELECT id, project_id, judul, deskripsi, status, prioritas, tenggat_pada, selesai_pada, urutan, dibuat_pada, diperbarui_pada
                 FROM tasks
                 ORDER BY urutan ASC, dibuat_pada DESC;",
            )
            .fetch_all(&db.pool)
            .await
        }
    }
    .map_err(|e| GalatAplikasi::KesalahanInternal(format!("Gagal memuat tugas: {e}")))?;

    Ok(baris
        .into_iter()
        .map(|r| TaskItem {
            id: r.get("id"),
            project_id: r.get("project_id"),
            judul: r.get("judul"),
            deskripsi: r.get("deskripsi"),
            status: r.get("status"),
            prioritas: r.get("prioritas"),
            tenggat_pada: r.get("tenggat_pada"),
            selesai_pada: r.get("selesai_pada"),
            urutan: r.get("urutan"),
            dibuat_pada: r.get("dibuat_pada"),
            diperbarui_pada: r.get("diperbarui_pada"),
        })
        .collect())
}

#[tauri::command]
pub async fn simpan_tugas(
    db: State<'_, StateDatabase>,
    permintaan: PermintaanSimpanTugas,
) -> Result<TaskItem, GalatAplikasi> {
    let judul_bersih = permintaan.judul.trim();
    if judul_bersih.is_empty() {
        return Err(GalatAplikasi::MasukanTidakValid(
            "Judul tugas nggak boleh kosong.".to_string(),
        ));
    }

    let status = match permintaan.status.as_str() {
        "todo" | "proses" | "selesai" => permintaan.status.clone(),
        _ => "todo".to_string(),
    };
    let prioritas = match permintaan.prioritas.as_str() {
        "rendah" | "sedang" | "tinggi" | "kritis" => permintaan.prioritas.clone(),
        _ => "sedang".to_string(),
    };

    let sekarang = Utc::now().to_rfc3339();
    let id = permintaan
        .id
        .filter(|v| !v.trim().is_empty())
        .unwrap_or_else(|| Uuid::new_v4().to_string());

    let dibuat_pada: String = sqlx::query_scalar("SELECT dibuat_pada FROM tasks WHERE id = ?;")
        .bind(&id)
        .fetch_optional(&db.pool)
        .await
        .map_err(|e| GalatAplikasi::KesalahanInternal(format!("Gagal cek tugas: {e}")))?
        .unwrap_or_else(|| sekarang.clone());

    let selesai_pada = if status == "selesai" {
        Some(sekarang.clone())
    } else {
        None
    };
    let urutan = permintaan.urutan.unwrap_or(0);

    sqlx::query(
        "INSERT INTO tasks (id, project_id, judul, deskripsi, status, prioritas, tenggat_pada, selesai_pada, urutan, dibuat_pada, diperbarui_pada)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT(id) DO UPDATE SET
            project_id = excluded.project_id,
            judul = excluded.judul,
            deskripsi = excluded.deskripsi,
            status = excluded.status,
            prioritas = excluded.prioritas,
            tenggat_pada = excluded.tenggat_pada,
            selesai_pada = excluded.selesai_pada,
            urutan = excluded.urutan,
            diperbarui_pada = excluded.diperbarui_pada;",
    )
    .bind(&id)
    .bind(permintaan.project_id.trim())
    .bind(judul_bersih)
    .bind(permintaan.deskripsi.trim())
    .bind(&status)
    .bind(&prioritas)
    .bind(&permintaan.tenggat_pada)
    .bind(&selesai_pada)
    .bind(urutan)
    .bind(&dibuat_pada)
    .bind(&sekarang)
    .execute(&db.pool)
    .await
    .map_err(|e| GalatAplikasi::KesalahanInternal(format!("Gagal menyimpan tugas: {e}")))?;

    hitung_ulang_progres_proyek(&db.pool, permintaan.project_id.trim()).await?;

    Ok(TaskItem {
        id,
        project_id: permintaan.project_id.trim().to_string(),
        judul: judul_bersih.to_string(),
        deskripsi: permintaan.deskripsi.trim().to_string(),
        status,
        prioritas,
        tenggat_pada: permintaan.tenggat_pada,
        selesai_pada,
        urutan,
        dibuat_pada,
        diperbarui_pada: sekarang,
    })
}

#[tauri::command]
pub async fn hapus_tugas(
    db: State<'_, StateDatabase>,
    id: String,
) -> Result<(), GalatAplikasi> {
    let project_id: Option<String> =
        sqlx::query_scalar("SELECT project_id FROM tasks WHERE id = ?;")
            .bind(id.trim())
            .fetch_optional(&db.pool)
            .await
            .map_err(|e| GalatAplikasi::KesalahanInternal(format!("Gagal cek tugas: {e}")))?;

    sqlx::query("DELETE FROM tasks WHERE id = ?;")
        .bind(id.trim())
        .execute(&db.pool)
        .await
        .map_err(|e| GalatAplikasi::KesalahanInternal(format!("Gagal menghapus tugas: {e}")))?;

    if let Some(pid) = project_id {
        hitung_ulang_progres_proyek(&db.pool, &pid).await?;
    }

    Ok(())
}

#[tauri::command]
pub async fn ambil_ringkasan_aset_proyek(
    db: State<'_, StateDatabase>,
    project_id: String,
) -> Result<RingkasanAsetProyek, GalatAplikasi> {
    let pid = project_id.trim().to_string();

    let jumlah_catatan: i64 =
        sqlx::query_scalar("SELECT COUNT(*) FROM notes WHERE project_id = ? AND diarsipkan = 0;")
            .bind(&pid)
            .fetch_one(&db.pool)
            .await
            .unwrap_or(0);

    let jumlah_berkas: i64 =
        sqlx::query_scalar("SELECT COUNT(*) FROM files WHERE project_id = ? AND dihapus_pada IS NULL;")
            .bind(&pid)
            .fetch_one(&db.pool)
            .await
            .unwrap_or(0);

    let jumlah_cuplikan: i64 =
        sqlx::query_scalar("SELECT COUNT(*) FROM snippets WHERE project_id = ?;")
            .bind(&pid)
            .fetch_one(&db.pool)
            .await
            .unwrap_or(0);

    let jumlah_prompt: i64 =
        sqlx::query_scalar("SELECT COUNT(*) FROM prompts WHERE project_id = ?;")
            .bind(&pid)
            .fetch_one(&db.pool)
            .await
            .unwrap_or(0);

    let jumlah_sesi_fokus: i64 =
        sqlx::query_scalar("SELECT COUNT(*) FROM focus_sessions WHERE project_id = ?;")
            .bind(&pid)
            .fetch_one(&db.pool)
            .await
            .unwrap_or(0);

    Ok(RingkasanAsetProyek {
        project_id: pid,
        jumlah_catatan,
        jumlah_berkas,
        jumlah_cuplikan,
        jumlah_prompt,
        jumlah_sesi_fokus,
    })
}
