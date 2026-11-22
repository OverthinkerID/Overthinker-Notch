use std::process::Command;

use chrono::Utc;
use serde::{Deserialize, Serialize};
use sqlx::Row;
use tauri::State;
use uuid::Uuid;

use crate::db::StateDatabase;
use crate::galat::GalatAplikasi;
use crate::platform::{LaporanKapabilitas, StatusKapabilitas};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct InfoTrekAktif {
    pub sedang_memutar: bool,
    pub judul_lagu: Option<String>,
    pub artis: Option<String>,
    pub album: Option<String>,
    pub sumber_audio: String,
    pub durasi_detik: i64,
    pub posisi_detik: i64,
    pub url_artwork: Option<String>,
    pub kontrol_didukung: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct RiwayatMusikItem {
    pub id: String,
    pub judul_lagu: String,
    pub artis: String,
    pub album: String,
    pub sumber_audio: String,
    pub durasi_detik: i64,
    pub path_artwork_relatif: Option<String>,
    pub diputar_pada: String,
}

#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PermintaanSimpanRiwayatMusik {
    pub judul_lagu: String,
    pub artis: String,
    pub album: String,
    pub sumber_audio: String,
    pub durasi_detik: i64,
}

#[cfg(target_os = "macos")]
fn jalankan_applescript(skrip: &str) -> Option<String> {
    let output = Command::new("osascript").arg("-e").arg(skrip).output().ok()?;
    if !output.status.success() {
        return None;
    }
    Some(String::from_utf8_lossy(&output.stdout).trim().to_string())
}

#[cfg(target_os = "macos")]
fn cek_pemutar_macos(nama_app: &str) -> Option<InfoTrekAktif> {
    let cek_jalan = jalankan_applescript(&format!(
        "tell application \"System Events\" to (name of processes) contains \"{nama_app}\""
    ))?;
    if cek_jalan != "true" {
        return None;
    }

    let skrip = if nama_app == "Spotify" {
        r#"
        tell application "Spotify"
            set st to player state as string
            if st is "stopped" then
                return "STOPPED"
            end if
            set t to name of current track
            set a to artist of current track
            set al to album of current track
            set d to (duration of current track) / 1000
            set p to player position
            return st & "|||" & t & "|||" & a & "|||" & al & "|||" & (round d) & "|||" & (round p)
        end tell
        "#
    } else {
        r#"
        tell application "Music"
            set st to player state as string
            if st is "stopped" then
                return "STOPPED"
            end if
            set t to name of current track
            set a to artist of current track
            set al to album of current track
            set d to duration of current track
            set p to player position
            return st & "|||" & t & "|||" & a & "|||" & al & "|||" & (round d) & "|||" & (round p)
        end tell
        "#
    };

    let mentah = jalankan_applescript(skrip)?;
    if mentah == "STOPPED" {
        return None;
    }

    let bagian: Vec<&str> = mentah.split("|||").collect();
    if bagian.len() < 6 {
        return None;
    }

    Some(InfoTrekAktif {
        sedang_memutar: bagian[0] == "playing",
        judul_lagu: Some(bagian[1].to_string()),
        artis: Some(bagian[2].to_string()),
        album: Some(bagian[3].to_string()),
        sumber_audio: if nama_app == "Spotify" {
            "Spotify".to_string()
        } else {
            "Apple Music".to_string()
        },
        durasi_detik: bagian[4].parse::<i64>().unwrap_or(0).max(0),
        posisi_detik: bagian[5].parse::<i64>().unwrap_or(0).max(0),
        url_artwork: None,
        kontrol_didukung: true,
    })
}

#[tauri::command]
pub fn ambil_status_musik_os() -> Result<InfoTrekAktif, GalatAplikasi> {
    #[cfg(target_os = "macos")]
    {
        if let Some(spotify) = cek_pemutar_macos("Spotify") {
            return Ok(spotify);
        }
        if let Some(music) = cek_pemutar_macos("Music") {
            return Ok(music);
        }
        return Ok(InfoTrekAktif {
            sedang_memutar: false,
            judul_lagu: None,
            artis: None,
            album: None,
            sumber_audio: "Tidak ada pemutar aktif".to_string(),
            durasi_detik: 0,
            posisi_detik: 0,
            url_artwork: None,
            kontrol_didukung: false,
        });
    }

    #[cfg(not(target_os = "macos"))]
    {
        Ok(InfoTrekAktif {
            sedang_memutar: false,
            judul_lagu: None,
            artis: None,
            album: None,
            sumber_audio: "Menunggu adapter GSMTC/OS".to_string(),
            durasi_detik: 0,
            posisi_detik: 0,
            url_artwork: None,
            kontrol_didukung: false,
        })
    }
}

#[tauri::command]
pub fn kirim_kontrol_media(aksi: String) -> Result<InfoTrekAktif, GalatAplikasi> {
    if !matches!(aksi.as_str(), "play_pause" | "next" | "previous") {
        return Err(GalatAplikasi::MasukanTidakValid(
            "Aksi media harus play_pause, next, atau previous.".to_string(),
        ));
    }

    #[cfg(target_os = "macos")]
    {
        let target_app = if cek_pemutar_macos("Spotify").is_some() {
            Some("Spotify")
        } else if cek_pemutar_macos("Music").is_some() {
            Some("Music")
        } else {
            None
        };

        let app = target_app.ok_or_else(|| {
            GalatAplikasi::MasukanTidakValid(
                "Nggak ada aplikasi Spotify atau Apple Music yang lagi aktif.".to_string(),
            )
        })?;

        let perintah = match aksi.as_str() {
            "play_pause" => "playpause",
            "next" => "next track",
            "previous" => "previous track",
            _ => "playpause",
        };

        jalankan_applescript(&format!("tell application \"{app}\" to {perintah}"));
        return ambil_status_musik_os();
    }

    #[cfg(not(target_os = "macos"))]
    {
        Err(GalatAplikasi::TidakDidukungOs(
            "Kontrol media native untuk OS ini diselesaikan di Fase 16.".to_string(),
        ))
    }
}

#[tauri::command]
pub fn ambil_kapabilitas_musik() -> Vec<LaporanKapabilitas> {
    #[cfg(target_os = "macos")]
    {
        vec![
            LaporanKapabilitas {
                nama_fitur: "Apple Music & Spotify Bridge".to_string(),
                status: StatusKapabilitas::Didukung,
                keterangan: "Membaca metadata lagu & kontrol playback langsung lewat AppleScript saat aplikasi berjalan.".to_string(),
            },
            LaporanKapabilitas {
                nama_fitur: "System Audio Capture (ScreenCaptureKit)".to_string(),
                status: StatusKapabilitas::PerluIzin,
                keterangan: "Memerlukan izin Screen & System Audio Recording di macOS System Settings.".to_string(),
            },
            LaporanKapabilitas {
                nama_fitur: "Microphone Song Identification".to_string(),
                status: StatusKapabilitas::PerluIzin,
                keterangan: "Opsional: memerlukan izin mikrofon dan API key penyedia pengenal lagu resmi.".to_string(),
            },
            LaporanKapabilitas {
                nama_fitur: "Authorized Recognition Provider".to_string(),
                status: StatusKapabilitas::PenyediaBelumDikonfigurasi,
                keterangan: "Masukkan endpoint & token penyedia resmi (misal AudD/ACRCloud) di pengaturan lokal.".to_string(),
            },
        ]
    }

    #[cfg(target_os = "windows")]
    {
        vec![
            LaporanKapabilitas {
                nama_fitur: "Windows Media Session (GSMTC)".to_string(),
                status: StatusKapabilitas::Didukung,
                keterangan: "Adapter GSMTC disiapkan untuk Spotify, browser, dan pemutar media Windows.".to_string(),
            },
            LaporanKapabilitas {
                nama_fitur: "System Audio Capture (WASAPI Loopback)".to_string(),
                status: StatusKapabilitas::Didukung,
                keterangan: "WASAPI Loopback menangkap audio sistem tanpa perangkat tambahan.".to_string(),
            },
            LaporanKapabilitas {
                nama_fitur: "Authorized Recognition Provider".to_string(),
                status: StatusKapabilitas::PenyediaBelumDikonfigurasi,
                keterangan: "Masukkan endpoint & token penyedia resmi di pengaturan lokal.".to_string(),
            },
        ]
    }

    #[cfg(not(any(target_os = "macos", target_os = "windows")))]
    {
        vec![LaporanKapabilitas {
            nama_fitur: "Integrasi Media OS".to_string(),
            status: StatusKapabilitas::TidakDidukungOs,
            keterangan: "Target native adalah macOS dan Windows.".to_string(),
        }]
    }
}

#[tauri::command]
pub async fn daftar_riwayat_musik(
    db: State<'_, StateDatabase>,
) -> Result<Vec<RiwayatMusikItem>, GalatAplikasi> {
    let baris = sqlx::query(
        "SELECT id, judul_lagu, artis, album, sumber_audio, durasi_detik, path_artwork_relatif, diputar_pada
         FROM music_history
         ORDER BY diputar_pada DESC
         LIMIT 100;",
    )
    .fetch_all(&db.pool)
    .await
    .map_err(|e| GalatAplikasi::KesalahanInternal(format!("Gagal memuat riwayat musik: {e}")))?;

    Ok(baris
        .into_iter()
        .map(|r| RiwayatMusikItem {
            id: r.get("id"),
            judul_lagu: r.get("judul_lagu"),
            artis: r.get("artis"),
            album: r.get("album"),
            sumber_audio: r.get("sumber_audio"),
            durasi_detik: r.get("durasi_detik"),
            path_artwork_relatif: r.get("path_artwork_relatif"),
            diputar_pada: r.get("diputar_pada"),
        })
        .collect())
}

#[tauri::command]
pub async fn simpan_riwayat_musik(
    db: State<'_, StateDatabase>,
    permintaan: PermintaanSimpanRiwayatMusik,
) -> Result<RiwayatMusikItem, GalatAplikasi> {
    if permintaan.judul_lagu.trim().is_empty() || permintaan.artis.trim().is_empty() {
        return Err(GalatAplikasi::MasukanTidakValid(
            "Judul lagu dan artis nggak boleh kosong.".to_string(),
        ));
    }

    let id = Uuid::new_v4().to_string();
    let diputar_pada = Utc::now().to_rfc3339();

    sqlx::query(
        "INSERT INTO music_history (id, judul_lagu, artis, album, sumber_audio, durasi_detik, path_artwork_relatif, diputar_pada)
         VALUES (?, ?, ?, ?, ?, ?, NULL, ?);",
    )
    .bind(&id)
    .bind(permintaan.judul_lagu.trim())
    .bind(permintaan.artis.trim())
    .bind(permintaan.album.trim())
    .bind(permintaan.sumber_audio.trim())
    .bind(permintaan.durasi_detik.max(0))
    .bind(&diputar_pada)
    .execute(&db.pool)
    .await
    .map_err(|e| GalatAplikasi::KesalahanInternal(format!("Gagal menyimpan riwayat musik: {e}")))?;

    Ok(RiwayatMusikItem {
        id,
        judul_lagu: permintaan.judul_lagu.trim().to_string(),
        artis: permintaan.artis.trim().to_string(),
        album: permintaan.album.trim().to_string(),
        sumber_audio: permintaan.sumber_audio.trim().to_string(),
        durasi_detik: permintaan.durasi_detik.max(0),
        path_artwork_relatif: None,
        diputar_pada,
    })
}
