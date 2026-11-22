import { invoke } from "@tauri-apps/api/core";
import { z } from "zod";
import { apakahRuntimeTauriAktif } from "@/bersama/ipc/klienIpc";
import {
  SkemaCatatanBackup,
  SkemaHasilIntegrityCheck,
  SkemaHasilPembersihanRetensi,
  SkemaKebijakanRetensi,
  SkemaRingkasanDatabase,
} from "@/database/skema/skemaDatabase";
import {
  DAFTAR_18_TABEL_WAJIB,
  type CatatanBackup,
  type HasilIntegrityCheck,
  type HasilPembersihanRetensi,
  type KebijakanRetensi,
  type RingkasanDatabase,
} from "@/database/tipe/tipeDatabase";

const KUNCI_RETENSI_WEB = "overthinker_notch_kebijakan_retensi";
const KUNCI_BACKUP_WEB = "overthinker_notch_catatan_backup_web";

export const KEBIJAKAN_RETENSI_BAWAAN: KebijakanRetensi = {
  backupOtomatisAktif: true,
  intervalBackupJam: 24,
  maksimalBackupOtomatis: 10,
  hariRetensiClipboard: 30,
  hariRetensiFileSementara: 14,
};

function bacaRetensiWeb(): KebijakanRetensi {
  if (typeof window === "undefined") {
    return KEBIJAKAN_RETENSI_BAWAAN;
  }
  try {
    const mentah = window.localStorage.getItem(KUNCI_RETENSI_WEB);
    if (!mentah) return KEBIJAKAN_RETENSI_BAWAAN;
    const parsed = SkemaKebijakanRetensi.safeParse(JSON.parse(mentah));
    return parsed.success ? parsed.data : KEBIJAKAN_RETENSI_BAWAAN;
  } catch {
    return KEBIJAKAN_RETENSI_BAWAAN;
  }
}

function bacaBackupWeb(): CatatanBackup[] {
  if (typeof window === "undefined") {
    return [];
  }
  try {
    const mentah = window.localStorage.getItem(KUNCI_BACKUP_WEB);
    if (!mentah) return [];
    const parsed = z.array(SkemaCatatanBackup).safeParse(JSON.parse(mentah));
    return parsed.success ? parsed.data : [];
  } catch {
    return [];
  }
}

export async function ambilRingkasanDatabase(): Promise<RingkasanDatabase> {
  if (!apakahRuntimeTauriAktif()) {
    const daftarBackup = bacaBackupWeb();
    return {
      pathDatabase: "Mode Web Preview (SQLite Native aktif saat jalan di Tauri 2)",
      ukuranByte: 0,
      modeJurnal: "WAL (aktif di migrasi SQLite)",
      foreignKeysAktif: true,
      totalTabel: DAFTAR_18_TABEL_WAJIB.length,
      integritasOk: true,
      daftarTabel: DAFTAR_18_TABEL_WAJIB.map((namaTabel) => ({
        namaTabel,
        jumlahBaris: namaTabel === "backups" ? daftarBackup.length : 0,
      })),
      jumlahBackup: daftarBackup.length,
      modeNativeAktif: false,
    };
  }

  const hasil = await invoke<unknown>("ambil_ringkasan_database");
  const valid = SkemaRingkasanDatabase.parse(hasil);
  return { ...valid, modeNativeAktif: true };
}

export async function jalankanIntegrityCheck(): Promise<HasilIntegrityCheck> {
  if (!apakahRuntimeTauriAktif()) {
    return {
      sehat: true,
      detail: [
        "Web Preview: skema 18 tabel tervalidasi (PRAGMA integrity_check jalan langsung saat mode SQLite Tauri).",
      ],
      diperiksaPada: new Date().toISOString(),
    };
  }

  const hasil = await invoke<unknown>("periksa_integritas_database");
  return SkemaHasilIntegrityCheck.parse(hasil);
}

export async function buatBackupManual(catatan: string): Promise<CatatanBackup> {
  const catatanBersih = catatan.trim() || "Backup manual";

  if (!apakahRuntimeTauriAktif()) {
    const sekarang = new Date().toISOString();
    const id =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `backup-${Date.now()}`;
    const entriBaru: CatatanBackup = {
      id,
      jenisBackup: "manual",
      pathBerkas: `web-preview/backup_manual_${sekarang.slice(0, 10)}.json`,
      ukuranByte: 0,
      checksumSha256: "menunggu-runtime-native-sqlite",
      statusIntegritas: "belum_dicek",
      catatan: catatanBersih,
      dibuatPada: sekarang,
    };
    const daftar = [entriBaru, ...bacaBackupWeb()].slice(0, 20);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(KUNCI_BACKUP_WEB, JSON.stringify(daftar));
    }
    return entriBaru;
  }

  const hasil = await invoke<unknown>("buat_backup_database", {
    jenisBackup: "manual",
    catatan: catatanBersih,
  });
  return SkemaCatatanBackup.parse(hasil);
}

export async function ambilDaftarBackup(): Promise<CatatanBackup[]> {
  if (!apakahRuntimeTauriAktif()) {
    return bacaBackupWeb();
  }

  const hasil = await invoke<unknown>("daftar_backup_database");
  return z.array(SkemaCatatanBackup).parse(hasil);
}

export async function ambilKebijakanRetensi(): Promise<KebijakanRetensi> {
  if (!apakahRuntimeTauriAktif()) {
    return bacaRetensiWeb();
  }

  const hasil = await invoke<unknown>("ambil_retensi_database");
  return SkemaKebijakanRetensi.parse(hasil);
}

export async function simpanKebijakanRetensi(
  kebijakan: KebijakanRetensi
): Promise<KebijakanRetensi> {
  const valid = SkemaKebijakanRetensi.parse(kebijakan);

  if (!apakahRuntimeTauriAktif()) {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(KUNCI_RETENSI_WEB, JSON.stringify(valid));
    }
    return valid;
  }

  await invoke("simpan_retensi_database", { kebijakan: valid });
  return valid;
}

export async function jalankanPembersihanRetensi(): Promise<HasilPembersihanRetensi> {
  if (!apakahRuntimeTauriAktif()) {
    const kebijakan = bacaRetensiWeb();
    const semua = bacaBackupWeb();
    const dipotong = semua.slice(0, kebijakan.maksimalBackupOtomatis);
    const terhapus = semua.length - dipotong.length;
    if (typeof window !== "undefined") {
      window.localStorage.setItem(KUNCI_BACKUP_WEB, JSON.stringify(dipotong));
    }
    return {
      clipboardDihapus: 0,
      backupLamaDihapus: terhapus,
      dijalankanPada: new Date().toISOString(),
    };
  }

  const hasil = await invoke<unknown>("bersihkan_retensi_database");
  return SkemaHasilPembersihanRetensi.parse(hasil);
}
