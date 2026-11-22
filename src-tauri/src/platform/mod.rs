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
                nama_fitur: "Notch Adaptif & Multi-Monitor".to_string(),
                status: StatusKapabilitas::Didukung,
                keterangan: "Deteksi area aman layar macOS dan posisi pulau melayang aktif."
                    .to_string(),
            },
            LaporanKapabilitas {
                nama_fitur: "Launch at Startup (LaunchAgents)".to_string(),
                status: StatusKapabilitas::Didukung,
                keterangan: "Tersedia via ~/Library/LaunchAgents/com.overthinker.notch.plist."
                    .to_string(),
            },
            LaporanKapabilitas {
                nama_fitur: "Tangkapan Audio Sistem (ScreenCaptureKit)".to_string(),
                status: StatusKapabilitas::PerluIzin,
                keterangan: "Memerlukan izin Perekaman Layar & Audio Sistem di macOS System Settings."
                    .to_string(),
            },
            LaporanKapabilitas {
                nama_fitur: "Aksesibilitas & Global Shortcuts".to_string(),
                status: StatusKapabilitas::PerluIzin,
                keterangan: "Izin Accessibility macOS diperlukan untuk shortcut global saat aplikasi di background."
                    .to_string(),
            },
        ]
    }

    #[cfg(target_os = "windows")]
    {
        vec![
            LaporanKapabilitas {
                nama_fitur: "Floating Island (Win32)".to_string(),
                status: StatusKapabilitas::Didukung,
                keterangan: "Mode pulau melayang multi-monitor Windows aktif.".to_string(),
            },
            LaporanKapabilitas {
                nama_fitur: "Launch at Startup (HKCU Run Registry)".to_string(),
                status: StatusKapabilitas::Didukung,
                keterangan: "Tersedia via Registry Run key pengguna aktif.".to_string(),
            },
            LaporanKapabilitas {
                nama_fitur: "Tangkapan Audio Sistem (WASAPI Loopback)".to_string(),
                status: StatusKapabilitas::Didukung,
                keterangan: "Adapter WASAPI Loopback didukung di Windows.".to_string(),
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
