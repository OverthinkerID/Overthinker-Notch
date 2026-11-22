pub mod db;
pub mod galat;
pub mod perintah;
pub mod platform;

use tauri::Manager;

use perintah::berkas::{
    daftar_berkas, hapus_permanen_berkas, hapus_sementara_berkas, impor_berkas_sementara,
    pulihkan_berkas, tampilkan_berkas_di_folder, ubah_nama_berkas,
};
use perintah::catatan::{daftar_catatan, hapus_catatan, simpan_catatan};
use perintah::cuplikan::{daftar_cuplikan, hapus_cuplikan, simpan_cuplikan};
use perintah::database::{
    ambil_retensi_database, ambil_ringkasan_database, bersihkan_retensi_database,
    buat_backup_database, daftar_backup_database, periksa_integritas_database,
    simpan_retensi_database,
};
use perintah::fokus::{daftar_sesi_fokus, simpan_sesi_fokus};
use perintah::jendela::{ambil_daftar_monitor, terapkan_geometri_jendela};
use perintah::lirik::{daftar_cache_lirik, hapus_cache_lirik, simpan_cache_lirik};
use perintah::monitor_sistem::ambil_telemetri_sistem;
use perintah::musik::{
    ambil_kapabilitas_musik, ambil_status_musik_os, daftar_riwayat_musik, kirim_kontrol_media,
    simpan_riwayat_musik,
};
use perintah::papanklip::{
    bersihkan_papanklip_non_pin, daftar_papanklip, hapus_item_papanklip, simpan_item_papanklip,
    ubah_pin_papanklip,
};
use perintah::prompt::{daftar_prompt, hapus_prompt, simpan_prompt};
use perintah::proyek::{
    ambil_ringkasan_aset_proyek, daftar_proyek, daftar_tugas, daftar_workspace, hapus_proyek,
    hapus_tugas, hapus_workspace, simpan_proyek, simpan_tugas, simpan_workspace,
};
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
            bersihkan_retensi_database,
            daftar_catatan,
            simpan_catatan,
            hapus_catatan,
            daftar_berkas,
            impor_berkas_sementara,
            ubah_nama_berkas,
            hapus_sementara_berkas,
            pulihkan_berkas,
            hapus_permanen_berkas,
            tampilkan_berkas_di_folder,
            daftar_cuplikan,
            simpan_cuplikan,
            hapus_cuplikan,
            daftar_papanklip,
            simpan_item_papanklip,
            ubah_pin_papanklip,
            hapus_item_papanklip,
            bersihkan_papanklip_non_pin,
            daftar_sesi_fokus,
            simpan_sesi_fokus,
            ambil_status_musik_os,
            kirim_kontrol_media,
            ambil_kapabilitas_musik,
            daftar_riwayat_musik,
            simpan_riwayat_musik,
            daftar_cache_lirik,
            simpan_cache_lirik,
            hapus_cache_lirik,
            daftar_prompt,
            simpan_prompt,
            hapus_prompt,
            daftar_workspace,
            simpan_workspace,
            hapus_workspace,
            daftar_proyek,
            simpan_proyek,
            hapus_proyek,
            daftar_tugas,
            simpan_tugas,
            hapus_tugas,
            ambil_ringkasan_aset_proyek,
            ambil_telemetri_sistem
        ])
        .run(tauri::generate_context!())
        .expect("Gagal menjalankan aplikasi Overthinker Notch");
}
