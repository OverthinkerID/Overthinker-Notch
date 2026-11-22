pub mod db;
pub mod galat;
pub mod perintah;
pub mod platform;

use tauri::Manager;

use perintah::database::{
    ambil_retensi_database, ambil_ringkasan_database, bersihkan_retensi_database,
    buat_backup_database, daftar_backup_database, periksa_integritas_database,
    simpan_retensi_database,
};
use perintah::jendela::{ambil_daftar_monitor, terapkan_geometri_jendela};
use perintah::sistem::{ambil_info_runtime, periksa_kesehatan_aplikasi};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn jalankan_aplikasi() {
    tauri::Builder::default()
        .setup(|app| {
            let dir_data = app.path().app_data_dir()?;
            let state_db = tauri::async_runtime::block_on(db::inisialisasi_database(&dir_data))
                .map_err(|e| std::io::Error::new(std::io::ErrorKind::Other, e.to_string()))?;
            app.manage(state_db);
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            ambil_info_runtime,
            periksa_kesehatan_aplikasi,
            ambil_daftar_monitor,
            terapkan_geometri_jendela,
            ambil_ringkasan_database,
            periksa_integritas_database,
            buat_backup_database,
            daftar_backup_database,
            ambil_retensi_database,
            simpan_retensi_database,
            bersihkan_retensi_database
        ])
        .run(tauri::generate_context!())
        .expect("Gagal menjalankan aplikasi Overthinker Notch");
}
