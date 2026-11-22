use tauri::State;

use crate::db::{
    ambil_daftar_backup, ambil_kebijakan_retensi, ambil_ringkasan, buat_backup,
    jalankan_pembersihan_retensi, periksa_integritas, simpan_kebijakan_retensi, CatatanBackup,
    HasilIntegrityCheck, HasilPembersihanRetensi, KebijakanRetensi, RingkasanDatabase,
    StateDatabase,
};
use crate::galat::GalatAplikasi;

#[tauri::command]
pub async fn ambil_ringkasan_database(
    db: State<'_, StateDatabase>,
) -> Result<RingkasanDatabase, GalatAplikasi> {
    ambil_ringkasan(&db).await
}

#[tauri::command]
pub async fn periksa_integritas_database(
    db: State<'_, StateDatabase>,
) -> Result<HasilIntegrityCheck, GalatAplikasi> {
    periksa_integritas(&db.pool).await
}

#[tauri::command]
pub async fn buat_backup_database(
    db: State<'_, StateDatabase>,
    jenis_backup: String,
    catatan: String,
) -> Result<CatatanBackup, GalatAplikasi> {
    buat_backup(&db, &jenis_backup, catatan.trim()).await
}

#[tauri::command]
pub async fn daftar_backup_database(
    db: State<'_, StateDatabase>,
) -> Result<Vec<CatatanBackup>, GalatAplikasi> {
    ambil_daftar_backup(&db.pool).await
}

#[tauri::command]
pub async fn ambil_retensi_database(
    db: State<'_, StateDatabase>,
) -> Result<KebijakanRetensi, GalatAplikasi> {
    ambil_kebijakan_retensi(&db.pool).await
}

#[tauri::command]
pub async fn simpan_retensi_database(
    db: State<'_, StateDatabase>,
    kebijakan: KebijakanRetensi,
) -> Result<(), GalatAplikasi> {
    simpan_kebijakan_retensi(&db.pool, &kebijakan).await
}

#[tauri::command]
pub async fn bersihkan_retensi_database(
    db: State<'_, StateDatabase>,
) -> Result<HasilPembersihanRetensi, GalatAplikasi> {
    jalankan_pembersihan_retensi(&db).await
}
