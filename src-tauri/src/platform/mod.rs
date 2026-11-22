use serde::Serialize;

#[derive(Debug, Clone, Serialize, PartialEq, Eq)]
#[serde(rename_all = "snake_case")]
pub enum StatusKapabilitas {
    Didukung,
    PerluIzin,
    PenyediaBelumDikonfigurasi,
    TidakDidukungOs,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct LaporanKapabilitas {
    pub nama_fitur: String,
    pub status: StatusKapabilitas,
    pub keterangan: String,
}

pub fn deteksi_kapabilitas_os() -> Vec<LaporanKapabilitas> {
    #[cfg(target_os = "macos")]
    {
        vec![
            LaporanKapabilitas {
                nama_fitur: "Notch Adaptif".to_string(),
                status: StatusKapabilitas::Didukung,
                keterangan: "Siap diintegrasikan dengan deteksi area aman layar macOS (Fase 3)."
                    .to_string(),
            },
            LaporanKapabilitas {
                nama_fitur: "Tangkapan Audio Sistem (ScreenCaptureKit)".to_string(),
                status: StatusKapabilitas::PerluIzin,
                keterangan: "Memerlukan izin Perekaman Layar & Audio Sistem macOS (Fase 10 & 16)."
                    .to_string(),
            },
            LaporanKapabilitas {
                nama_fitur: "Pengenalan Lagu & Lirik Terotorisasi".to_string(),
                status: StatusKapabilitas::PenyediaBelumDikonfigurasi,
                keterangan: "Antarmuka penyedia resmi akan dikonfigurasi di Fase 10 & 11."
                    .to_string(),
            },
        ]
    }

    #[cfg(target_os = "windows")]
    {
        vec![
            LaporanKapabilitas {
                nama_fitur: "Pulau Melayang (Win32)".to_string(),
                status: StatusKapabilitas::Didukung,
                keterangan: "Mode pulau melayang multi-monitor disiapkan di Fase 3.".to_string(),
            },
            LaporanKapabilitas {
                nama_fitur: "Tangkapan Audio Sistem (WASAPI Loopback)".to_string(),
                status: StatusKapabilitas::Didukung,
                keterangan: "Adapter WASAPI Loopback akan diaktifkan di Fase 10 & 16.".to_string(),
            },
            LaporanKapabilitas {
                nama_fitur: "Pengenalan Lagu & Lirik Terotorisasi".to_string(),
                status: StatusKapabilitas::PenyediaBelumDikonfigurasi,
                keterangan: "Antarmuka penyedia resmi akan dikonfigurasi di Fase 10 & 11."
                    .to_string(),
            },
        ]
    }

    #[cfg(not(any(target_os = "macos", target_os = "windows")))]
    {
        vec![LaporanKapabilitas {
            nama_fitur: "Integrasi OS Native".to_string(),
            status: StatusKapabilitas::TidakDidukungOs,
            keterangan: "Target utama adalah macOS dan Windows; fitur native OS tidak tersedia di sistem ini."
                .to_string(),
        }]
    }
}
