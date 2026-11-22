import { useEffect, useState } from "react";
import {
  ArchiveRestore,
  Database,
  HardDriveDownload,
  RefreshCw,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import {
  DeskripsiKartu,
  IsiKartu,
  JudulKartu,
  Kartu,
  KepalaKartu,
  KolomMasukan,
  Lencana,
  PanelKaca,
  Sakelar,
  Tombol,
} from "@/sistem-desain";
import { gunakanTokoDatabase } from "@/database/toko/tokoDatabase";
import type { KebijakanRetensi } from "@/database/tipe/tipeDatabase";

export function PanelDatabase() {
  const ringkasan = gunakanTokoDatabase((s) => s.ringkasan);
  const hasilIntegrity = gunakanTokoDatabase((s) => s.hasilIntegrity);
  const daftarBackup = gunakanTokoDatabase((s) => s.daftarBackup);
  const kebijakanRetensi = gunakanTokoDatabase((s) => s.kebijakanRetensi);
  const sedangMemuat = gunakanTokoDatabase((s) => s.sedangMemuat);
  const pesanStatus = gunakanTokoDatabase((s) => s.pesanStatus);
  const pesanGalat = gunakanTokoDatabase((s) => s.pesanGalat);

  const muatSemuaDataDatabase = gunakanTokoDatabase(
    (s) => s.muatSemuaDataDatabase
  );
  const cekIntegritas = gunakanTokoDatabase((s) => s.cekIntegritas);
  const tambahBackupManual = gunakanTokoDatabase((s) => s.tambahBackupManual);
  const perbaruiKebijakanRetensi = gunakanTokoDatabase(
    (s) => s.perbaruiKebijakanRetensi
  );
  const bersihkanDataKedaluwarsa = gunakanTokoDatabase(
    (s) => s.bersihkanDataKedaluwarsa
  );

  const [catatanBackup, aturCatatanBackup] = useState("");
  const [formRetensi, aturFormRetensi] =
    useState<KebijakanRetensi>(kebijakanRetensi);

  useEffect(() => {
    void muatSemuaDataDatabase();
  }, [muatSemuaDataDatabase]);

  useEffect(() => {
    aturFormRetensi(kebijakanRetensi);
  }, [kebijakanRetensi]);

  async function tanganiBuatBackup(): Promise<void> {
    await tambahBackupManual(catatanBackup);
    aturCatatanBackup("");
  }

  return (
    <div className="space-y-5">
      {pesanGalat && (
        <PanelKaca className="p-3 border-[var(--aksen-bahaya)]/40 text-xs text-[var(--aksen-bahaya)]">
          {pesanGalat}
        </PanelKaca>
      )}

      {pesanStatus && (
        <PanelKaca className="p-3 border-[#66E5D2]/40 text-xs text-[#0F766E] dark:text-[#66E5D2]">
          {pesanStatus}
        </PanelKaca>
      )}

      {/* Ringkasan & Status SQLite */}
      <Kartu elevasi="angkat" kilau="biru">
        <KepalaKartu>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 text-[var(--aksen-biru-elektrik)]" />
              <JudulKartu>Database SQLite & Persistensi (18 Tabel)</JudulKartu>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Tombol
                varian="kaca"
                ukuran="kecil"
                sedangMemuat={sedangMemuat}
                ikonKiri={<ShieldCheck className="h-3.5 w-3.5" />}
                onClick={() => void cekIntegritas()}
              >
                Integrity Check
              </Tombol>
              <Tombol
                varian="kaca"
                ukuran="kecil"
                sedangMemuat={sedangMemuat}
                ikonKiri={<RefreshCw className="h-3.5 w-3.5" />}
                onClick={() => void muatSemuaDataDatabase()}
              >
                Refresh
              </Tombol>
            </div>
          </div>
          <DeskripsiKartu>
            {ringkasan?.pathDatabase ?? "Memuat informasi database lokal..."}
          </DeskripsiKartu>
        </KepalaKartu>

        <IsiKartu className="space-y-4">
          {ringkasan && (
            <>
              <div className="flex flex-wrap gap-2">
                <Lencana varian={ringkasan.modeNativeAktif ? "teal" : "peringatan"}>
                  {ringkasan.modeNativeAktif
                    ? "SQLite Native Aktif"
                    : "Mode Pratinjau Web"}
                </Lencana>
                <Lencana varian="biru">Total Tabel: {ringkasan.totalTabel}</Lencana>
                <Lencana varian="ungu">Jurnal: {ringkasan.modeJurnal}</Lencana>
                <Lencana varian={ringkasan.foreignKeysAktif ? "teal" : "bahaya"}>
                  Foreign Keys: {ringkasan.foreignKeysAktif ? "ON" : "OFF"}
                </Lencana>
              </div>

              {hasilIntegrity && (
                <div className="rounded-xl border border-[var(--warna-batas)] p-3 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">Hasil Integrity Check</span>
                    <Lencana varian={hasilIntegrity.sehat ? "teal" : "bahaya"}>
                      {hasilIntegrity.sehat ? "Sehat (OK)" : "Bermasalah"}
                    </Lencana>
                  </div>
                  <p className="text-[var(--warna-teks-sekunder)]">
                    {hasilIntegrity.detail.join(" • ")}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
                {ringkasan.daftarTabel.map((tabel) => (
                  <div
                    key={tabel.namaTabel}
                    className="rounded-xl border border-[var(--warna-batas)] bg-black/[0.02] dark:bg-white/[0.02] px-3 py-2"
                  >
                    <p className="truncate font-kode text-[11px] font-medium text-[var(--warna-teks-utama)]">
                      {tabel.namaTabel}
                    </p>
                    <p className="text-[11px] text-[var(--warna-teks-sekunder)]">
                      {tabel.jumlahBaris} baris
                    </p>
                  </div>
                ))}
              </div>
            </>
          )}
        </IsiKartu>
      </Kartu>

      {/* Backup & Kebijakan Retensi */}
      <div className="grid gap-5 lg:grid-cols-2">
        <Kartu>
          <KepalaKartu>
            <div className="flex items-center gap-2">
              <HardDriveDownload className="h-4 w-4 text-[var(--aksen-teal-siber)]" />
              <JudulKartu>Backup & Restore</JudulKartu>
            </div>
            <DeskripsiKartu>
              Snapshot atomik SQLite via VACUUM INTO + verifikasi checksum SHA-256.
            </DeskripsiKartu>
          </KepalaKartu>

          <IsiKartu className="space-y-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
              <div className="flex-1">
                <KolomMasukan
                  label="Catatan Backup Manual"
                  placeholder="Contoh: Sebelum migrasi atau perubahan besar"
                  value={catatanBackup}
                  onChange={(e) => aturCatatanBackup(e.target.value)}
                />
              </div>
              <Tombol
                varian="utama"
                sedangMemuat={sedangMemuat}
                onClick={() => void tanganiBuatBackup()}
              >
                Buat Backup
              </Tombol>
            </div>

            <div className="space-y-2 pt-2 border-t border-[var(--warna-batas)]">
              <span className="block text-xs font-medium text-[var(--warna-teks-sekunder)]">
                Riwayat Backup ({daftarBackup.length})
              </span>
              {daftarBackup.length === 0 ? (
                <p className="text-xs text-[var(--warna-teks-redup)]">
                  Belum ada catatan backup. Klik "Buat Backup" untuk membuat snapshot pertama.
                </p>
              ) : (
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {daftarBackup.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between gap-2 rounded-xl border border-[var(--warna-batas)] p-2.5 text-xs"
                    >
                      <div className="min-w-0">
                        <p className="font-medium truncate">{item.catatan}</p>
                        <p className="font-kode text-[11px] text-[var(--warna-teks-redup)] truncate">
                          {item.pathBerkas}
                        </p>
                      </div>
                      <Lencana
                        varian={
                          item.statusIntegritas === "terverifikasi"
                            ? "teal"
                            : "netral"
                        }
                      >
                        {item.jenisBackup}
                      </Lencana>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </IsiKartu>
        </Kartu>

        <Kartu>
          <KepalaKartu>
            <div className="flex items-center gap-2">
              <ArchiveRestore className="h-4 w-4 text-[var(--aksen-ungu-neon)]" />
              <JudulKartu>Kebijakan Retensi Data</JudulKartu>
            </div>
            <DeskripsiKartu>
              Atur backup otomatis dan masa simpan data agar penyimpanan lokal tetap rapi.
            </DeskripsiKartu>
          </KepalaKartu>

          <IsiKartu className="space-y-3.5">
            <Sakelar
              aktif={formRetensi.backupOtomatisAktif}
              saatBerubah={(nilai) =>
                aturFormRetensi((prev) => ({
                  ...prev,
                  backupOtomatisAktif: nilai,
                }))
              }
              label="Backup Otomatis"
              deskripsi="Membuat snapshot database berkala sesuai interval jam."
            />

            <div className="grid grid-cols-2 gap-3">
              <KolomMasukan
                label="Interval Backup (Jam)"
                type="number"
                min={1}
                max={168}
                value={formRetensi.intervalBackupJam || ""}
                onChange={(e) =>
                  aturFormRetensi((prev) => ({
                    ...prev,
                    intervalBackupJam: Number(e.target.value) || 0,
                  }))
                }
              />
              <KolomMasukan
                label="Maks. Backup Otomatis"
                type="number"
                min={1}
                max={100}
                value={formRetensi.maksimalBackupOtomatis || ""}
                onChange={(e) =>
                  aturFormRetensi((prev) => ({
                    ...prev,
                    maksimalBackupOtomatis: Number(e.target.value) || 0,
                  }))
                }
              />
              <KolomMasukan
                label="Retensi Clipboard (Hari)"
                type="number"
                min={1}
                max={365}
                value={formRetensi.hariRetensiClipboard || ""}
                onChange={(e) =>
                  aturFormRetensi((prev) => ({
                    ...prev,
                    hariRetensiClipboard: Number(e.target.value) || 0,
                  }))
                }
              />
              <KolomMasukan
                label="Retensi File Sementara (Hari)"
                type="number"
                min={1}
                max={365}
                value={formRetensi.hariRetensiFileSementara || ""}
                onChange={(e) =>
                  aturFormRetensi((prev) => ({
                    ...prev,
                    hariRetensiFileSementara: Number(e.target.value) || 0,
                  }))
                }
              />
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              <Tombol
                varian="sekunder"
                sedangMemuat={sedangMemuat}
                onClick={() =>
                  void perbaruiKebijakanRetensi({
                    ...formRetensi,
                    intervalBackupJam: Math.max(1, formRetensi.intervalBackupJam),
                    maksimalBackupOtomatis: Math.max(
                      1,
                      formRetensi.maksimalBackupOtomatis
                    ),
                    hariRetensiClipboard: Math.max(
                      1,
                      formRetensi.hariRetensiClipboard
                    ),
                    hariRetensiFileSementara: Math.max(
                      1,
                      formRetensi.hariRetensiFileSementara
                    ),
                  })
                }
              >
                Simpan Kebijakan
              </Tombol>
              <Tombol
                varian="kaca"
                sedangMemuat={sedangMemuat}
                ikonKiri={<Trash2 className="h-3.5 w-3.5" />}
                onClick={() => void bersihkanDataKedaluwarsa()}
              >
                Jalankan Pembersihan
              </Tombol>
            </div>
          </IsiKartu>
        </Kartu>
      </div>
    </div>
  );
}
