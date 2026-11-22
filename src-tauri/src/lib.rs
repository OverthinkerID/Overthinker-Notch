pub mod galat;
pub mod perintah;
pub mod platform;

use perintah::jendela::{ambil_daftar_monitor, terapkan_geometri_jendela};
use perintah::sistem::{ambil_info_runtime, periksa_kesehatan_aplikasi};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn jalankan_aplikasi() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            ambil_info_runtime,
            periksa_kesehatan_aplikasi,
            ambil_daftar_monitor,
            terapkan_geometri_jendela
        ])
        .run(tauri::generate_context!())
        .expect("Gagal menjalankan aplikasi Overthinker Notch");
}
