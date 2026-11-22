use serde::{Deserialize, Serialize};
use tauri::{LogicalPosition, LogicalSize, Position, Size, WebviewWindow};

use crate::galat::GalatAplikasi;

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct InfoMonitor {
    pub id_monitor: String,
    pub nama: String,
    pub lebar_logis: f64,
    pub tinggi_logis: f64,
    pub posisi_x: f64,
    pub posisi_y: f64,
    pub faktor_skala: f64,
    pub utama: bool,
    pub dukungan_notch: bool,
    pub tinggi_area_aman_atas: f64,
}

#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PermintaanGeometriJendela {
    pub lebar: f64,
    pub tinggi: f64,
    pub posisi_x: f64,
    pub posisi_y: f64,
    pub selalu_di_atas: bool,
}

pub fn validasi_geometri_jendela(
    permintaan: &PermintaanGeometriJendela,
) -> Result<(), GalatAplikasi> {
    if !permintaan.lebar.is_finite()
        || !permintaan.tinggi.is_finite()
        || !permintaan.posisi_x.is_finite()
        || !permintaan.posisi_y.is_finite()
    {
        return Err(GalatAplikasi::MasukanTidakValid(
            "Nilai geometri jendela harus berupa angka valid.".to_string(),
        ));
    }

    if permintaan.lebar < 220.0 || permintaan.lebar > 3840.0 {
        return Err(GalatAplikasi::MasukanTidakValid(
            "Lebar jendela harus berada di antara 220px dan 3840px.".to_string(),
        ));
    }

    if permintaan.tinggi < 44.0 || permintaan.tinggi > 2160.0 {
        return Err(GalatAplikasi::MasukanTidakValid(
            "Tinggi jendela harus berada di antara 44px dan 2160px.".to_string(),
        ));
    }

    Ok(())
}

pub fn deteksi_dukungan_notch_layar(
    lebar_logis: f64,
    tinggi_logis: f64,
    faktor_skala: f64,
) -> (bool, f64) {
    #[cfg(target_os = "macos")]
    {
        let rasio = if tinggi_logis > 0.0 {
            lebar_logis / tinggi_logis
        } else {
            0.0
        };
        let layar_retina_macbook_notch =
            faktor_skala >= 2.0 && lebar_logis >= 1470.0 && rasio >= 1.50 && rasio <= 1.58;
        if layar_retina_macbook_notch {
            return (true, 38.0);
        }
        (false, 28.0)
    }

    #[cfg(not(target_os = "macos"))]
    {
        let _ = (lebar_logis, tinggi_logis, faktor_skala);
        (false, 0.0)
    }
}

#[tauri::command]
pub fn ambil_daftar_monitor(jendela: WebviewWindow) -> Result<Vec<InfoMonitor>, GalatAplikasi> {
    let daftar = jendela
        .available_monitors()
        .map_err(|e| GalatAplikasi::KesalahanInternal(format!("Gagal membaca monitor: {e}")))?;

    let monitor_aktif = jendela.current_monitor().ok().flatten();
    let mut hasil = Vec::with_capacity(daftar.len());

    for (indeks, monitor) in daftar.into_iter().enumerate() {
        let skala = monitor.scale_factor();
        let ukuran = monitor.size();
        let posisi = monitor.position();

        let lebar_logis = (ukuran.width as f64) / skala;
        let tinggi_logis = (ukuran.height as f64) / skala;
        let posisi_x = (posisi.x as f64) / skala;
        let posisi_y = (posisi.y as f64) / skala;

        let nama = monitor
            .name()
            .cloned()
            .unwrap_or_else(|| format!("Layar {}", indeks + 1));

        let utama = monitor_aktif
            .as_ref()
            .map(|m| m.position() == monitor.position() && m.size() == monitor.size())
            .unwrap_or(indeks == 0);

        let (dukungan_notch, tinggi_area_aman_atas) =
            deteksi_dukungan_notch_layar(lebar_logis, tinggi_logis, skala);

        hasil.push(InfoMonitor {
            id_monitor: format!("monitor-{indeks}"),
            nama,
            lebar_logis,
            tinggi_logis,
            posisi_x,
            posisi_y,
            faktor_skala: skala,
            utama,
            dukungan_notch,
            tinggi_area_aman_atas,
        });
    }

    Ok(hasil)
}

#[tauri::command]
pub fn terapkan_geometri_jendela(
    jendela: WebviewWindow,
    permintaan: PermintaanGeometriJendela,
) -> Result<(), GalatAplikasi> {
    validasi_geometri_jendela(&permintaan)?;

    jendela
        .set_size(Size::Logical(LogicalSize::new(
            permintaan.lebar,
            permintaan.tinggi,
        )))
        .map_err(|e| GalatAplikasi::KesalahanInternal(format!("Gagal mengatur ukuran: {e}")))?;

    jendela
        .set_position(Position::Logical(LogicalPosition::new(
            permintaan.posisi_x,
            permintaan.posisi_y,
        )))
        .map_err(|e| GalatAplikasi::KesalahanInternal(format!("Gagal mengatur posisi: {e}")))?;

    jendela
        .set_always_on_top(permintaan.selalu_di_atas)
        .map_err(|e| {
            GalatAplikasi::KesalahanInternal(format!("Gagal mengatur selalu di atas: {e}"))
        })?;

    Ok(())
}

#[cfg(test)]
mod pengujian {
    use super::*;

    #[test]
    fn uji_validasi_geometri_valid() {
        let req = PermintaanGeometriJendela {
            lebar: 640.0,
            tinggi: 420.0,
            posisi_x: 120.0,
            posisi_y: 40.0,
            selalu_di_atas: true,
        };
        assert!(validasi_geometri_jendela(&req).is_ok());
    }

    #[test]
    fn uji_validasi_geometri_ditolak_jika_terlalu_kecil() {
        let req = PermintaanGeometriJendela {
            lebar: 100.0,
            tinggi: 30.0,
            posisi_x: 0.0,
            posisi_y: 0.0,
            selalu_di_atas: false,
        };
        assert!(validasi_geometri_jendela(&req).is_err());
    }
}
