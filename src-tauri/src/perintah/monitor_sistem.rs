use std::process::Command;

use chrono::Utc;
use serde::{Deserialize, Serialize};

use crate::galat::GalatAplikasi;

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct TelemetriSistem {
    pub sumber_data: String,
    pub sistem_operasi: String,
    pub arsitektur: String,
    pub nama_host: String,
    pub model_cpu: Option<String>,
    pub jumlah_core_cpu: Option<i64>,
    pub penggunaan_cpu_persen: Option<f64>,
    pub ram_terpakai_mb: Option<i64>,
    pub ram_total_mb: Option<i64>,
    pub disk_terpakai_gb: Option<f64>,
    pub disk_total_gb: Option<f64>,
    pub persen_baterai: Option<i64>,
    pub sedang_mengisi_daya: Option<bool>,
    pub uptime_detik: Option<i64>,
    pub catatan_kejujuran: String,
    pub diambil_pada: String,
}

fn jalankan_perintah(program: &str, args: &[&str]) -> Option<String> {
    let out = Command::new(program).args(args).output().ok()?;
    if !out.status.success() {
        return None;
    }
    Some(String::from_utf8_lossy(&out.stdout).trim().to_string())
}

#[cfg(target_os = "macos")]
fn ambil_telemetri_macos() -> TelemetriSistem {
    let nama_host = jalankan_perintah("hostname", &[]).unwrap_or_else(|| "Mac".to_string());
    let model_cpu = jalankan_perintah("sysctl", &["-n", "machdep.cpu.brand_string"]);
    let jumlah_core_cpu = jalankan_perintah("sysctl", &["-n", "hw.logicalcpu"])
        .and_then(|s| s.parse::<i64>().ok());

    let ram_total_mb = jalankan_perintah("sysctl", &["-n", "hw.memsize"])
        .and_then(|s| s.parse::<i64>().ok())
        .map(|bytes| bytes / (1024 * 1024));

    // vm_stat untuk RAM terpakai (active + wired + compressor)
    let ram_terpakai_mb = jalankan_perintah("vm_stat", &[]).and_then(|teks| {
        let mut ukuran_halaman: i64 = 16384;
        if let Some(baris_pertama) = teks.lines().next() {
            if let Some(pos) = baris_pertama.find("page size of ") {
                let sisa = &baris_pertama[pos + 13..];
                if let Some(angka) = sisa.split_whitespace().next() {
                    if let Ok(v) = angka.parse::<i64>() {
                        ukuran_halaman = v;
                    }
                }
            }
        }
        let mut halaman_aktif = 0_i64;
        let mut halaman_wired = 0_i64;
        let mut halaman_kompresi = 0_i64;

        for baris in teks.lines() {
            let bagian: Vec<&str> = baris.split(':').collect();
            if bagian.len() != 2 {
                continue;
            }
            let nilai = bagian[1]
                .trim()
                .trim_end_matches('.')
                .parse::<i64>()
                .unwrap_or(0);
            if bagian[0].contains("Pages active") {
                halaman_aktif = nilai;
            } else if bagian[0].contains("Pages wired down") {
                halaman_wired = nilai;
            } else if bagian[0].contains("Pages occupied by compressor") {
                halaman_kompresi = nilai;
            }
        }
        let total_byte = (halaman_aktif + halaman_wired + halaman_kompresi) * ukuran_halaman;
        if total_byte > 0 {
            Some(total_byte / (1024 * 1024))
        } else {
            None
        }
    });

    // CPU usage dari top -l 1 -n 0
    let penggunaan_cpu_persen = jalankan_perintah("top", &["-l", "1", "-n", "0"]).and_then(|teks| {
        for baris in teks.lines() {
            if baris.starts_with("CPU usage:") {
                let mut user = 0.0_f64;
                let mut sys = 0.0_f64;
                for bagian in baris.split(',') {
                    if bagian.contains("% user") {
                        user = bagian
                            .split('%')
                            .next()
                            .and_then(|v| v.split_whitespace().last())
                            .and_then(|n| n.parse::<f64>().ok())
                            .unwrap_or(0.0);
                    } else if bagian.contains("% sys") {
                        sys = bagian
                            .split('%')
                            .next()
                            .and_then(|v| v.split_whitespace().last())
                            .and_then(|n| n.parse::<f64>().ok())
                            .unwrap_or(0.0);
                    }
                }
                return Some(((user + sys) * 10.0).round() / 10.0);
            }
        }
        None
    });

    // Disk dari df -k /
    let (disk_terpakai_gb, disk_total_gb) = jalankan_perintah("df", &["-k", "/"])
        .and_then(|teks| {
            let baris_data = teks.lines().nth(1)?;
            let kolom: Vec<&str> = baris_data.split_whitespace().collect();
            if kolom.len() < 4 {
                return None;
            }
            let total_kb = kolom[1].parse::<f64>().ok()?;
            let terpakai_kb = kolom[2].parse::<f64>().ok()?;
            Some((
                ((terpakai_kb / (1024.0 * 1024.0)) * 10.0).round() / 10.0,
                ((total_kb / (1024.0 * 1024.0)) * 10.0).round() / 10.0,
            ))
        })
        .map(|(u, t)| (Some(u), Some(t)))
        .unwrap_or((None, None));

    // Baterai dari pmset -g batt
    let (persen_baterai, sedang_mengisi_daya) = jalankan_perintah("pmset", &["-g", "batt"])
        .map(|teks| {
            let mengisi = teks.contains("AC Power") || teks.contains("charging");
            let persen = teks
                .lines()
                .find(|b| b.contains('%'))
                .and_then(|b| {
                    b.split('%')
                        .next()
                        .and_then(|kiri| kiri.split_whitespace().last())
                        .and_then(|angka| angka.parse::<i64>().ok())
                });
            (persen, if persen.is_some() { Some(mengisi) } else { None })
        })
        .unwrap_or((None, None));

    // Uptime dari sysctl kern.boottime
    let uptime_detik = jalankan_perintah("sysctl", &["-n", "kern.boottime"]).and_then(|teks| {
        let pos = teks.find("sec = ")?;
        let sisa = &teks[pos + 6..];
        let boot_sec = sisa.split(',').next()?.trim().parse::<i64>().ok()?;
        let sekarang = Utc::now().timestamp();
        Some((sekarang - boot_sec).max(0))
    });

    TelemetriSistem {
        sumber_data: "tauri_os_nyata".to_string(),
        sistem_operasi: "macOS".to_string(),
        arsitektur: std::env::consts::ARCH.to_string(),
        nama_host,
        model_cpu,
        jumlah_core_cpu,
        penggunaan_cpu_persen,
        ram_terpakai_mb,
        ram_total_mb,
        disk_terpakai_gb,
        disk_total_gb,
        persen_baterai,
        sedang_mengisi_daya,
        uptime_detik,
        catatan_kejujuran: "Data diambil langsung dari utilitas sistem macOS (sysctl, vm_stat, top, df, pmset).".to_string(),
        diambil_pada: Utc::now().to_rfc3339(),
    }
}

#[cfg(target_os = "windows")]
fn ambil_telemetri_windows() -> TelemetriSistem {
    let nama_host = jalankan_perintah("hostname", &[]).unwrap_or_else(|| "Windows".to_string());
    let skrip = r#"
      $cs = Get-CimInstance Win32_ComputerSystem;
      $os = Get-CimInstance Win32_OperatingSystem;
      $cpu = Get-CimInstance Win32_Processor | Select-Object -First 1;
      $disk = Get-CimInstance Win32_LogicalDisk -Filter "DeviceID='C:'" | Select-Object -First 1;
      $batt = Get-CimInstance Win32_Battery | Select-Object -First 1;
      $totalRamMb = [math]::Round($cs.TotalPhysicalMemory / 1MB);
      $freeRamMb = [math]::Round($os.FreePhysicalMemory / 1KB);
      $usedRamMb = $totalRamMb - $freeRamMb;
      $diskTotalGb = if ($disk) { [math]::Round($disk.Size / 1GB, 1) } else { $null };
      $diskUsedGb = if ($disk) { [math]::Round(($disk.Size - $disk.FreeSpace) / 1GB, 1) } else { $null };
      @{
        modelCpu = $cpu.Name;
        cores = $cpu.NumberOfLogicalProcessors;
        cpuLoad = $cpu.LoadPercentage;
        ramUsed = $usedRamMb;
        ramTotal = $totalRamMb;
        diskUsed = $diskUsedGb;
        diskTotal = $diskTotalGb;
        battPct = if ($batt) { $batt.EstimatedChargeRemaining } else { $null };
        battCharging = if ($batt) { $batt.BatteryStatus -eq 2 } else { $null }
      } | ConvertTo-Json -Compress
    "#;

    let json_opt = jalankan_perintah("powershell", &["-NoProfile", "-Command", skrip])
        .and_then(|s| serde_json::from_str::<serde_json::Value>(&s).ok());

    let (model_cpu, jumlah_core_cpu, penggunaan_cpu_persen, ram_terpakai_mb, ram_total_mb, disk_terpakai_gb, disk_total_gb, persen_baterai, sedang_mengisi_daya) =
        if let Some(v) = json_opt {
            (
                v.get("modelCpu").and_then(|x| x.as_str()).map(|s| s.to_string()),
                v.get("cores").and_then(|x| x.as_i64()),
                v.get("cpuLoad").and_then(|x| x.as_f64()),
                v.get("ramUsed").and_then(|x| x.as_i64()),
                v.get("ramTotal").and_then(|x| x.as_i64()),
                v.get("diskUsed").and_then(|x| x.as_f64()),
                v.get("diskTotal").and_then(|x| x.as_f64()),
                v.get("battPct").and_then(|x| x.as_i64()),
                v.get("battCharging").and_then(|x| x.as_bool()),
            )
        } else {
            (None, None, None, None, None, None, None, None, None)
        };

    TelemetriSistem {
        sumber_data: "tauri_os_nyata".to_string(),
        sistem_operasi: "Windows".to_string(),
        arsitektur: std::env::consts::ARCH.to_string(),
        nama_host,
        model_cpu,
        jumlah_core_cpu,
        penggunaan_cpu_persen,
        ram_terpakai_mb,
        ram_total_mb,
        disk_terpakai_gb,
        disk_total_gb,
        persen_baterai,
        sedang_mengisi_daya,
        uptime_detik: None,
        catatan_kejujuran: "Data diambil langsung dari CIM/WMI Windows PowerShell.".to_string(),
        diambil_pada: Utc::now().to_rfc3339(),
    }
}

#[tauri::command]
pub fn ambil_telemetri_sistem() -> Result<TelemetriSistem, GalatAplikasi> {
    #[cfg(target_os = "macos")]
    {
        return Ok(ambil_telemetri_macos());
    }

    #[cfg(target_os = "windows")]
    {
        return Ok(ambil_telemetri_windows());
    }

    #[cfg(not(any(target_os = "macos", target_os = "windows")))]
    {
        Ok(TelemetriSistem {
            sumber_data: "tauri_os_nyata".to_string(),
            sistem_operasi: std::env::consts::OS.to_string(),
            arsitektur: std::env::consts::ARCH.to_string(),
            nama_host: jalankan_perintah("hostname", &[]).unwrap_or_else(|| "Host".to_string()),
            model_cpu: None,
            jumlah_core_cpu: None,
            penggunaan_cpu_persen: None,
            ram_terpakai_mb: None,
            ram_total_mb: None,
            disk_terpakai_gb: None,
            disk_total_gb: None,
            persen_baterai: None,
            sedang_mengisi_daya: None,
            uptime_detik: None,
            catatan_kejujuran: "Target telemetri OS lengkap tersedia untuk macOS dan Windows.".to_string(),
            diambil_pada: Utc::now().to_rfc3339(),
        })
    }
}
