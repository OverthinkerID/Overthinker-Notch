use std::process::Command;

use serde::{Deserialize, Serialize};

use crate::galat::GalatAplikasi;
use crate::platform::{deteksi_kapabilitas_os, LaporanKapabilitas};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct StatusIntegrasiOs {
    pub sumber_data: String,
    pub sistem_operasi: String,
    pub auto_start_aktif: bool,
    pub jalur_auto_start: String,
    pub mendukung_tray_menu: bool,
    pub mendukung_pintasan_global: bool,
    pub kapabilitas: Vec<LaporanKapabilitas>,
    pub catatan: String,
}

#[cfg(target_os = "macos")]
fn jalur_plist_macos() -> Option<std::path::PathBuf> {
    let home = std::env::var_os("HOME")?;
    Some(
        std::path::PathBuf::from(home)
            .join("Library")
            .join("LaunchAgents")
            .join("com.overthinker.notch.plist"),
    )
}

#[cfg(target_os = "windows")]
fn cek_registry_startup_windows() -> bool {
    Command::new("reg")
        .args([
            "query",
            r"HKCU\Software\Microsoft\Windows\CurrentVersion\Run",
            "/v",
            "OverthinkerNotch",
        ])
        .output()
        .map(|o| o.status.success())
        .unwrap_or(false)
}

#[tauri::command]
pub fn ambil_status_integrasi_os() -> Result<StatusIntegrasiOs, GalatAplikasi> {
    #[cfg(target_os = "macos")]
    {
        let plist = jalur_plist_macos();
        let auto_start_aktif = plist.as_ref().map(|p| p.exists()).unwrap_or(false);
        let jalur_auto_start = plist
            .map(|p| p.to_string_lossy().to_string())
            .unwrap_or_else(|| "~/Library/LaunchAgents/com.overthinker.notch.plist".to_string());

        return Ok(StatusIntegrasiOs {
            sumber_data: "tauri_os_nyata".to_string(),
            sistem_operasi: "macOS".to_string(),
            auto_start_aktif,
            jalur_auto_start,
            mendukung_tray_menu: true,
            mendukung_pintasan_global: true,
            kapabilitas: deteksi_kapabilitas_os(),
            catatan: "Integrasi macOS aktif: LaunchAgent auto-start, deep-link System Settings, dan AppleScript media bridge.".to_string(),
        });
    }

    #[cfg(target_os = "windows")]
    {
        return Ok(StatusIntegrasiOs {
            sumber_data: "tauri_os_nyata".to_string(),
            sistem_operasi: "Windows".to_string(),
            auto_start_aktif: cek_registry_startup_windows(),
            jalur_auto_start: r"HKCU\Software\Microsoft\Windows\CurrentVersion\Run\OverthinkerNotch".to_string(),
            mendukung_tray_menu: true,
            mendukung_pintasan_global: true,
            kapabilitas: deteksi_kapabilitas_os(),
            catatan: "Integrasi Windows aktif: Registry Startup, ms-settings deep-link, dan CIM/WMI telemetry.".to_string(),
        });
    }

    #[cfg(not(any(target_os = "macos", target_os = "windows")))]
    {
        Ok(StatusIntegrasiOs {
            sumber_data: "tauri_os_nyata".to_string(),
            sistem_operasi: std::env::consts::OS.to_string(),
            auto_start_aktif: false,
            jalur_auto_start: "Tidak didukung di OS ini".to_string(),
            mendukung_tray_menu: false,
            mendukung_pintasan_global: false,
            kapabilitas: deteksi_kapabilitas_os(),
            catatan: "Target integrasi desktop utama adalah macOS dan Windows.".to_string(),
        })
    }
}

#[tauri::command]
pub fn atur_auto_start_os(aktif: bool) -> Result<StatusIntegrasiOs, GalatAplikasi> {
    #[cfg(target_os = "macos")]
    {
        let plist = jalur_plist_macos().ok_or_else(|| {
            GalatAplikasi::KesalahanInternal("Gagal menemukan folder HOME macOS.".to_string())
        })?;
        if aktif {
            if let Some(induk) = plist.parent() {
                std::fs::create_dir_all(induk).map_err(|e| {
                    GalatAplikasi::KesalahanInternal(format!("Gagal buat LaunchAgents: {e}"))
                })?;
            }
            let exe = std::env::current_exe()
                .map(|p| p.to_string_lossy().to_string())
                .unwrap_or_else(|_| "/Applications/Overthinker Notch.app/Contents/MacOS/overthinker-notch".to_string());
            let isi = format!(
                r#"<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key>
  <string>com.overthinker.notch</string>
  <key>ProgramArguments</key>
  <array>
    <string>{exe}</string>
  </array>
  <key>RunAtLoad</key>
  <true/>
</dict>
</plist>
"#
            );
            std::fs::write(&plist, isi).map_err(|e| {
                GalatAplikasi::KesalahanInternal(format!("Gagal menulis LaunchAgent plist: {e}"))
            })?;
        } else if plist.exists() {
            std::fs::remove_file(&plist).map_err(|e| {
                GalatAplikasi::KesalahanInternal(format!("Gagal menghapus LaunchAgent plist: {e}"))
            })?;
        }
        return ambil_status_integrasi_os();
    }

    #[cfg(target_os = "windows")]
    {
        if aktif {
            let exe = std::env::current_exe()
                .map(|p| p.to_string_lossy().to_string())
                .unwrap_or_else(|_| "OverthinkerNotch.exe".to_string());
            Command::new("reg")
                .args([
                    "add",
                    r"HKCU\Software\Microsoft\Windows\CurrentVersion\Run",
                    "/v",
                    "OverthinkerNotch",
                    "/t",
                    "REG_SZ",
                    "/d",
                    &exe,
                    "/f",
                ])
                .output()
                .map_err(|e| {
                    GalatAplikasi::KesalahanInternal(format!("Gagal mengatur startup Windows: {e}"))
                })?;
        } else {
            let _ = Command::new("reg")
                .args([
                    "delete",
                    r"HKCU\Software\Microsoft\Windows\CurrentVersion\Run",
                    "/v",
                    "OverthinkerNotch",
                    "/f",
                ])
                .output();
        }
        return ambil_status_integrasi_os();
    }

    #[cfg(not(any(target_os = "macos", target_os = "windows")))]
    {
        let _ = aktif;
        Err(GalatAplikasi::TidakDidukungOs(
            "Launch at Startup hanya didukung di macOS dan Windows.".to_string(),
        ))
    }
}

#[tauri::command]
pub fn buka_pengaturan_izin_os(bagian: String) -> Result<(), GalatAplikasi> {
    #[cfg(target_os = "macos")]
    {
        let url = match bagian.as_str() {
            "accessibility" => "x-apple.systempreferences:com.apple.preference.security?Privacy_Accessibility",
            "screen_recording" => "x-apple.systempreferences:com.apple.preference.security?Privacy_ScreenCapture",
            "microphone" => "x-apple.systempreferences:com.apple.preference.security?Privacy_Microphone",
            _ => "x-apple.systempreferences:com.apple.preference.security",
        };
        Command::new("open").arg(url).spawn().map_err(|e| {
            GalatAplikasi::KesalahanInternal(format!("Gagal membuka System Settings macOS: {e}"))
        })?;
        return Ok(());
    }

    #[cfg(target_os = "windows")]
    {
        let uri = match bagian.as_str() {
            "microphone" => "ms-settings:privacy-microphone",
            "notifications" => "ms-settings:notifications",
            _ => "ms-settings:privacy",
        };
        Command::new("cmd").args(["/C", "start", uri]).spawn().map_err(|e| {
            GalatAplikasi::KesalahanInternal(format!("Gagal membuka Windows Settings: {e}"))
        })?;
        return Ok(());
    }

    #[cfg(not(any(target_os = "macos", target_os = "windows")))]
    {
        let _ = bagian;
        Err(GalatAplikasi::TidakDidukungOs(
            "Buka pengaturan izin OS hanya didukung di macOS dan Windows.".to_string(),
        ))
    }
}
