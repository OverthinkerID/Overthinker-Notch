import { z } from "zod";

export const SkemaInfoTabelDatabase = z.object({
  namaTabel: z.string(),
  jumlahBaris: z.number().int().min(0),
});

export const SkemaRingkasanDatabase = z.object({
  pathDatabase: z.string(),
  ukuranByte: z.number().min(0),
  modeJurnal: z.string(),
  foreignKeysAktif: z.boolean(),
  totalTabel: z.number().int().min(0),
  integritasOk: z.boolean(),
  daftarTabel: z.array(SkemaInfoTabelDatabase),
  jumlahBackup: z.number().int().min(0),
});

export const SkemaHasilIntegrityCheck = z.object({
  sehat: z.boolean(),
  detail: z.array(z.string()),
  diperiksaPada: z.string(),
});

export const SkemaCatatanBackup = z.object({
  id: z.string(),
  jenisBackup: z.enum(["otomatis", "manual", "pra_restore"]),
  pathBerkas: z.string(),
  ukuranByte: z.number().min(0),
  checksumSha256: z.string(),
  statusIntegritas: z.enum(["terverifikasi", "gagal", "belum_dicek"]),
  catatan: z.string(),
  dibuatPada: z.string(),
});

export const SkemaKebijakanRetensi = z.object({
  backupOtomatisAktif: z.boolean(),
  intervalBackupJam: z.number().int().min(1).max(168),
  maksimalBackupOtomatis: z.number().int().min(1).max(100),
  hariRetensiClipboard: z.number().int().min(1).max(365),
  hariRetensiFileSementara: z.number().int().min(1).max(365),
});

export const SkemaHasilPembersihanRetensi = z.object({
  clipboardDihapus: z.number().int().min(0),
  backupLamaDihapus: z.number().int().min(0),
  dijalankanPada: z.string(),
});
