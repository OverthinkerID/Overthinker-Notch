use chrono::Utc;
use serde::Serialize;

use crate::galat::GalatAplikasi;
use crate::platform::{deteksi_kapabilitas_os, LaporanKapabilitas};

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct InfoRuntimeSistem {
    pub nama_aplikasi: String,
    pub versi_aplikasi: String,
    pub sistem_operasi: String,
    pub arsitektur_cpu: String,
    pub waktu_server_utc: String,
    pub mode_runtime: String,
    pub kapabilitas: Vec<LaporanKapabilitas>,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct StatusKesehatan {
    pub sehat: bool,
    pub pesan: String,
    pub waktu_periksa_utc: String,
}

#[tauri::command]
pub fn ambil_info_runtime() -> Result<InfoRuntimeSistem, GalatAplikasi> {
    Ok(InfoRuntimeSistem {
        nama_aplikasi: "Overthinker Notch".to_string(),
        versi_aplikasi: env!("CARGO_PKG_VERSION").to_string(),
        sistem_operasi: std::env::consts::OS.to_string(),
        arsitektur_cpu: std::env::consts::ARCH.to_string(),
        waktu_server_utc: Utc::now().to_rfc3339(),
        mode_runtime: "Tauri 2 Native (Rust)".to_string(),
        kapabilitas: deteksi_kapabilitas_os(),
    })
}

#[tauri::command]
pub fn periksa_kesehatan_aplikasi() -> Result<StatusKesehatan, GalatAplikasi> {
    Ok(StatusKesehatan {
        sehat: true,
        pesan: "Inti Rust Overthinker Notch aktif dan berjalan normal.".to_string(),
        waktu_periksa_utc: Utc::now().to_rfc3339(),
    })
}

#[cfg(test)]
mod pengujian {
    use super::*;

    #[test]
    fn uji_ambil_info_runtime_berhasil() {
        let hasil = ambil_info_runtime().expect("harus mengembalikan info runtime");
        assert_eq!(hasil.nama_aplikasi, "Overthinker Notch");
        assert!(!hasil.sistem_operasi.is_empty());
        assert!(!hasil.arsitektur_cpu.is_empty());
        assert!(!hasil.kapabilitas.is_empty());
    }

    #[test]
    fn uji_periksa_kesehatan_aplikasi_berhasil() {
        let hasil = periksa_kesehatan_aplikasi().expect("harus mengembalikan status sehat");
        assert!(hasil.sehat);
        assert!(hasil.pesan.contains("Overthinker Notch"));
    }
}
