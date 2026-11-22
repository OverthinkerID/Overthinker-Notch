use serde::Serialize;
use thiserror::Error;

#[derive(Debug, Error, Serialize)]
#[serde(tag = "kode", content = "pesan")]
pub enum GalatAplikasi {
    #[error("Masukan tidak valid: {0}")]
    MasukanTidakValid(String),

    #[error("Fitur belum didukung pada sistem operasi ini: {0}")]
    TidakDidukungOs(String),

    #[error("Kesalahan internal aplikasi: {0}")]
    KesalahanInternal(String),
}
