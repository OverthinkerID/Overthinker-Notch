import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  Code2,
  FileText,
  FolderKanban,
  FolderOpen,
  Layers,
  Plus,
  Save,
  Search,
  Sparkles,
  Timer,
  Trash2,
} from "lucide-react";
import {
  DeskripsiKartu,
  JudulKartu,
  Kartu,
  KepalaKartu,
  KolomMasukan,
  Lencana,
  PanelKaca,
  Tombol,
} from "@/sistem-desain";
import {
  PRIORITAS_TUGAS,
  STATUS_PROYEK,
  STATUS_TUGAS,
  WARNA_PROYEK_BAWAAN,
  type PrioritasTugas,
  type StatusProyek,
  type StatusTugas,
} from "@/proyek/tipe/tipeProyek";
import { gunakanTokoProyek } from "@/proyek/toko/tokoProyek";

const WARNA_PRIORITAS: Record<
  PrioritasTugas,
  "netral" | "biru" | "peringatan" | "bahaya"
> = {
  rendah: "netral",
  sedang: "biru",
  tinggi: "peringatan",
  kritis: "bahaya",
};

export function PanelProyek() {
  const daftarWorkspace = gunakanTokoProyek((s) => s.daftarWorkspace);
  const daftarProyek = gunakanTokoProyek((s) => s.daftarProyek);
  const daftarTugas = gunakanTokoProyek((s) => s.daftarTugas);
  const idWorkspaceTerpilih = gunakanTokoProyek((s) => s.idWorkspaceTerpilih);
  const idProyekTerpilih = gunakanTokoProyek((s) => s.idProyekTerpilih);
  const ringkasanAset = gunakanTokoProyek((s) => s.ringkasanAset);
  const kataCari = gunakanTokoProyek((s) => s.kataCari);
  const filterStatusProyek = gunakanTokoProyek((s) => s.filterStatusProyek);
  const pesanStatus = gunakanTokoProyek((s) => s.pesanStatus);
  const pesanGalat = gunakanTokoProyek((s) => s.pesanGalat);

  const muatSemua = gunakanTokoProyek((s) => s.muatSemua);
  const pilihWorkspace = gunakanTokoProyek((s) => s.pilihWorkspace);
  const pilihProyek = gunakanTokoProyek((s) => s.pilihProyek);
  const aturKataCari = gunakanTokoProyek((s) => s.aturKataCari);
  const aturFilterStatusProyek = gunakanTokoProyek(
    (s) => s.aturFilterStatusProyek
  );
  const simpanWorkspace = gunakanTokoProyek((s) => s.simpanWorkspace);
  const simpanProyek = gunakanTokoProyek((s) => s.simpanProyek);
  const hapusProyek = gunakanTokoProyek((s) => s.hapusProyek);
  const simpanTugas = gunakanTokoProyek((s) => s.simpanTugas);
  const hapusTugas = gunakanTokoProyek((s) => s.hapusTugas);

  // Form Workspace Baru
  const [namaWorkspaceBaru, aturNamaWorkspaceBaru] = useState("");

  // Form Project
  const [modeProyekBaru, aturModeProyekBaru] = useState(false);
  const [namaProyek, aturNamaProyek] = useState("");
  const [deskripsiProyek, aturDeskripsiProyek] = useState("");
  const [statusProyek, aturStatusProyek] = useState<StatusProyek>("aktif");
  const [warnaProyek, aturWarnaProyek] = useState<string>(
    WARNA_PROYEK_BAWAAN[0]
  );

  // Form Task Baru
  const [judulTugasBaru, aturJudulTugasBaru] = useState("");
  const [prioritasTugasBaru, aturPrioritasTugasBaru] =
    useState<PrioritasTugas>("sedang");

  useEffect(() => {
    void muatSemua();
  }, [muatSemua]);

  const proyekAktif = useMemo(
    () =>
      modeProyekBaru
        ? null
        : (daftarProyek.find((p) => p.id === idProyekTerpilih) ?? null),
    [daftarProyek, idProyekTerpilih, modeProyekBaru]
  );

  useEffect(() => {
    if (proyekAktif) {
      aturNamaProyek(proyekAktif.nama);
      aturDeskripsiProyek(proyekAktif.deskripsi);
      aturStatusProyek(proyekAktif.status);
      aturWarnaProyek(proyekAktif.warna);
    }
  }, [proyekAktif?.id, proyekAktif?.diperbaruiPada]);

  const daftarProyekTersaring = useMemo(() => {
    const q = kataCari.trim().toLowerCase();
    return daftarProyek.filter((p) => {
      if (idWorkspaceTerpilih && p.workspaceId !== idWorkspaceTerpilih) {
        return false;
      }
      if (filterStatusProyek !== "semua" && p.status !== filterStatusProyek) {
        return false;
      }
      if (!q) return true;
      return (
        p.nama.toLowerCase().includes(q) ||
        p.deskripsi.toLowerCase().includes(q)
      );
    });
  }, [daftarProyek, idWorkspaceTerpilih, filterStatusProyek, kataCari]);

  const tugasProyekAktif = useMemo(() => {
    if (!proyekAktif) return [];
    return daftarTugas.filter((t) => t.projectId === proyekAktif.id);
  }, [daftarTugas, proyekAktif]);

  async function tanganiBuatWorkspace(): Promise<void> {
    if (!namaWorkspaceBaru.trim()) return;
    const hasil = await simpanWorkspace({
      nama: namaWorkspaceBaru,
      deskripsi: "Workspace produktivitas lokal",
      ikon: "layers",
      warna: "#55A7FF",
    });
    if (hasil) {
      aturNamaWorkspaceBaru("");
    }
  }

  function mulaiProyekBaru(): void {
    aturModeProyekBaru(true);
    void pilihProyek(null);
    aturNamaProyek("");
    aturDeskripsiProyek("");
    aturStatusProyek("aktif");
    aturWarnaProyek(WARNA_PROYEK_BAWAAN[0]);
  }

  async function tanganiSimpanProyek(): Promise<void> {
    let wsId = idWorkspaceTerpilih ?? daftarWorkspace[0]?.id;
    if (!wsId) {
      const wsDefault = await simpanWorkspace({
        nama: "Workspace Utama",
        deskripsi: "Workspace bawaan Overthinker Notch",
      });
      if (!wsDefault) return;
      wsId = wsDefault.id;
    }

    const hasil = await simpanProyek({
      id: proyekAktif?.id,
      workspaceId: proyekAktif?.workspaceId ?? wsId,
      nama: namaProyek,
      deskripsi: deskripsiProyek,
      status: statusProyek,
      warna: warnaProyek,
      progresPersen: proyekAktif?.progresPersen ?? 0,
      diarsipkan: statusProyek === "arsip",
    });
    if (hasil) {
      aturModeProyekBaru(false);
    }
  }

  async function tanganiTambahTugas(): Promise<void> {
    if (!proyekAktif || !judulTugasBaru.trim()) return;
    const hasil = await simpanTugas({
      projectId: proyekAktif.id,
      judul: judulTugasBaru,
      status: "todo",
      prioritas: prioritasTugasBaru,
    });
    if (hasil) {
      aturJudulTugasBaru("");
    }
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

      {/* Header & Workspace Switcher */}
      <Kartu elevasi="angkat" kilau="biru">
        <KepalaKartu>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <FolderKanban className="h-4 w-4 text-[var(--aksen-biru-elektrik)]" />
              <JudulKartu>Project Workspace</JudulKartu>
            </div>
            <Tombol
              varian="utama"
              ukuran="kecil"
              ikonKiri={<Plus className="h-3.5 w-3.5" />}
              onClick={mulaiProyekBaru}
            >
              Project Baru
            </Tombol>
          </div>
          <DeskripsiKartu>
            Organisir proyek berdasarkan workspace, pantau progres task, dan lihat seluruh catatan, berkas, snippet, prompt, dan sesi fokus yang terhubung.
          </DeskripsiKartu>
        </KepalaKartu>

        <div className="mt-3 flex flex-wrap items-center gap-2 pt-3 border-t border-[var(--warna-batas)]">
          <span className="flex items-center gap-1.5 text-xs font-medium text-[var(--warna-teks-sekunder)]">
            <Layers className="h-3.5 w-3.5" />
            Workspace:
          </span>
          {daftarWorkspace.map((ws) => (
            <Tombol
              key={ws.id}
              ukuran="kecil"
              varian={ws.id === idWorkspaceTerpilih ? "utama" : "kaca"}
              onClick={() => pilihWorkspace(ws.id)}
            >
              {ws.nama}
            </Tombol>
          ))}
          <div className="flex items-center gap-1.5 ml-auto">
            <input
              type="text"
              aria-label="Nama workspace baru"
              placeholder="Workspace baru..."
              value={namaWorkspaceBaru}
              onChange={(e) => aturNamaWorkspaceBaru(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  void tanganiBuatWorkspace();
                }
              }}
              className="h-8 rounded-lg border border-[var(--warna-batas-kuat)] bg-white/75 dark:bg-[#101521]/80 px-2.5 text-xs text-[var(--warna-teks-utama)]"
            />
            <Tombol
              ukuran="kecil"
              varian="kaca"
              onClick={() => void tanganiBuatWorkspace()}
            >
              Tambah Workspace
            </Tombol>
          </div>
        </div>
      </Kartu>

      <div className="grid gap-5 lg:grid-cols-12">
        {/* Sidebar Daftar Project */}
        <Kartu className="lg:col-span-4 space-y-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-[var(--warna-teks-redup)]" />
            <input
              type="search"
              aria-label="Cari project"
              placeholder="Cari nama atau deskripsi project..."
              value={kataCari}
              onChange={(e) => aturKataCari(e.target.value)}
              className="h-9 w-full rounded-xl border border-[var(--warna-batas-kuat)] bg-white/70 dark:bg-[#101521]/75 pl-9 pr-3 text-xs text-[var(--warna-teks-utama)] focus:outline-none focus:ring-2 focus:ring-[var(--aksen-biru-elektrik)]/60"
            />
          </div>

          <select
            aria-label="Filter status project"
            value={filterStatusProyek}
            onChange={(e) =>
              aturFilterStatusProyek(
                e.target.value as StatusProyek | "semua"
              )
            }
            className="h-8 w-full rounded-lg border border-[var(--warna-batas-kuat)] bg-white/80 dark:bg-[#101521] px-2 text-xs text-[var(--warna-teks-utama)]"
          >
            <option value="semua">Semua Status</option>
            {STATUS_PROYEK.map((st) => (
              <option key={st} value={st}>
                Status: {st}
              </option>
            ))}
          </select>

          <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
            {daftarProyekTersaring.length === 0 ? (
              <p className="rounded-xl border border-dashed border-[var(--warna-batas-kuat)] p-4 text-center text-xs text-[var(--warna-teks-redup)]">
                Belum ada project di workspace ini. Klik &ldquo;Project Baru&rdquo; buat mulai.
              </p>
            ) : (
              daftarProyekTersaring.map((prj) => {
                const terpilih = !modeProyekBaru && prj.id === idProyekTerpilih;
                return (
                  <button
                    key={prj.id}
                    type="button"
                    onClick={() => {
                      aturModeProyekBaru(false);
                      void pilihProyek(prj.id);
                    }}
                    className={`w-full rounded-xl border p-3 text-left transition cursor-pointer space-y-2 ${
                      terpilih
                        ? "border-[var(--aksen-biru-elektrik)] bg-[#55A7FF]/10"
                        : "border-[var(--warna-batas)] hover:border-[var(--warna-batas-kuat)]"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className="h-2.5 w-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: prj.warna }}
                        />
                        <span className="truncate text-xs font-semibold">
                          {prj.nama}
                        </span>
                      </div>
                      <Lencana varian="biru">{prj.status}</Lencana>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px] text-[var(--warna-teks-sekunder)]">
                        <span>Progres</span>
                        <span className="font-kode">{prj.progresPersen}%</span>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-black/10 dark:bg-white/10">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${prj.progresPersen}%`,
                            backgroundColor: prj.warna,
                          }}
                        />
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </Kartu>

        {/* Detail Project, Agregasi Aset & Task Board */}
        <Kartu elevasi="angkat" className="lg:col-span-8 space-y-4">
          <div className="grid gap-3 sm:grid-cols-12">
            <div className="sm:col-span-7">
              <KolomMasukan
                label="Nama Project"
                placeholder="Misal: Rilis Overthinker Notch v1.0"
                value={namaProyek}
                onChange={(e) => aturNamaProyek(e.target.value)}
              />
            </div>

            <div className="sm:col-span-3 space-y-1.5">
              <label
                htmlFor="pilih-status-proyek"
                className="block text-xs font-medium text-[var(--warna-teks-sekunder)]"
              >
                Status Project
              </label>
              <select
                id="pilih-status-proyek"
                value={statusProyek}
                onChange={(e) =>
                  aturStatusProyek(e.target.value as StatusProyek)
                }
                className="h-9 w-full rounded-xl border border-[var(--warna-batas-kuat)] bg-white/80 dark:bg-[#101521] px-2.5 text-xs text-[var(--warna-teks-utama)]"
              >
                {STATUS_PROYEK.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2 space-y-1.5">
              <span className="block text-xs font-medium text-[var(--warna-teks-sekunder)]">
                Warna
              </span>
              <div className="flex flex-wrap gap-1 pt-1">
                {WARNA_PROYEK_BAWAAN.map((w) => (
                  <button
                    key={w}
                    type="button"
                    aria-label={`Pilih warna ${w}`}
                    onClick={() => aturWarnaProyek(w)}
                    className={`h-5 w-5 rounded-full cursor-pointer transition ${
                      warnaProyek === w
                        ? "ring-2 ring-offset-2 ring-[var(--aksen-biru-elektrik)]"
                        : ""
                    }`}
                    style={{ backgroundColor: w }}
                  />
                ))}
              </div>
            </div>
          </div>

          <KolomMasukan
            label="Deskripsi Project"
            placeholder="Ringkasan target, ruang lingkup, atau catatan utama project..."
            value={deskripsiProyek}
            onChange={(e) => aturDeskripsiProyek(e.target.value)}
          />

          <div className="flex flex-wrap items-center justify-between gap-2">
            {proyekAktif ? (
              <Tombol
                ukuran="kecil"
                varian="bahaya"
                ikonKiri={<Trash2 className="h-3.5 w-3.5" />}
                onClick={() => void hapusProyek(proyekAktif.id)}
              >
                Hapus Project
              </Tombol>
            ) : (
              <span />
            )}

            <Tombol
              ukuran="kecil"
              varian="utama"
              ikonKiri={<Save className="h-3.5 w-3.5" />}
              onClick={() => void tanganiSimpanProyek()}
            >
              Simpan Project
            </Tombol>
          </div>

          {proyekAktif && (
            <>
              {/* Ringkasan Aset Terhubung */}
              <div className="rounded-xl border border-[var(--warna-batas)] p-3.5 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold">
                    Aset Terhubung ke Project Ini
                  </span>
                  <Lencana varian="teal">
                    Progres: {proyekAktif.progresPersen}%
                  </Lencana>
                </div>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
                  <div className="rounded-lg border border-[var(--warna-batas)] p-2 text-center">
                    <FileText className="mx-auto h-3.5 w-3.5 text-[var(--aksen-biru-elektrik)]" />
                    <p
                      data-testid="aset-jumlah-catatan"
                      className="mt-1 font-kode text-sm font-semibold"
                    >
                      {ringkasanAset?.jumlahCatatan ?? 0}
                    </p>
                    <span className="text-[11px] text-[var(--warna-teks-sekunder)]">
                      Notes
                    </span>
                  </div>
                  <div className="rounded-lg border border-[var(--warna-batas)] p-2 text-center">
                    <FolderOpen className="mx-auto h-3.5 w-3.5 text-[var(--aksen-ungu-neon)]" />
                    <p
                      data-testid="aset-jumlah-berkas"
                      className="mt-1 font-kode text-sm font-semibold"
                    >
                      {ringkasanAset?.jumlahBerkas ?? 0}
                    </p>
                    <span className="text-[11px] text-[var(--warna-teks-sekunder)]">
                      Temp Files
                    </span>
                  </div>
                  <div className="rounded-lg border border-[var(--warna-batas)] p-2 text-center">
                    <Code2 className="mx-auto h-3.5 w-3.5 text-[var(--aksen-teal-siber)]" />
                    <p
                      data-testid="aset-jumlah-cuplikan"
                      className="mt-1 font-kode text-sm font-semibold"
                    >
                      {ringkasanAset?.jumlahCuplikan ?? 0}
                    </p>
                    <span className="text-[11px] text-[var(--warna-teks-sekunder)]">
                      Snippets
                    </span>
                  </div>
                  <div className="rounded-lg border border-[var(--warna-batas)] p-2 text-center">
                    <Sparkles className="mx-auto h-3.5 w-3.5 text-[var(--aksen-biru-elektrik)]" />
                    <p
                      data-testid="aset-jumlah-prompt"
                      className="mt-1 font-kode text-sm font-semibold"
                    >
                      {ringkasanAset?.jumlahPrompt ?? 0}
                    </p>
                    <span className="text-[11px] text-[var(--warna-teks-sekunder)]">
                      AI Prompts
                    </span>
                  </div>
                  <div className="rounded-lg border border-[var(--warna-batas)] p-2 text-center">
                    <Timer className="mx-auto h-3.5 w-3.5 text-amber-400" />
                    <p
                      data-testid="aset-jumlah-fokus"
                      className="mt-1 font-kode text-sm font-semibold"
                    >
                      {ringkasanAset?.jumlahSesiFokus ?? 0}
                    </p>
                    <span className="text-[11px] text-[var(--warna-teks-sekunder)]">
                      Focus
                    </span>
                  </div>
                </div>
              </div>

              {/* Task Board */}
              <div className="rounded-xl border border-[var(--warna-batas)] p-3.5 space-y-3">
                <h4 className="text-xs font-semibold">
                  Daftar Task ({tugasProyekAktif.length})
                </h4>

                <div className="flex flex-wrap gap-2">
                  <div className="flex-1 min-w-[200px]">
                    <KolomMasukan
                      aria-label="Judul task baru"
                      placeholder="Tambah task baru (misal: Uji migrasi SQLite)..."
                      value={judulTugasBaru}
                      onChange={(e) => aturJudulTugasBaru(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          void tanganiTambahTugas();
                        }
                      }}
                    />
                  </div>
                  <select
                    aria-label="Prioritas task baru"
                    value={prioritasTugasBaru}
                    onChange={(e) =>
                      aturPrioritasTugasBaru(e.target.value as PrioritasTugas)
                    }
                    className="h-9 rounded-xl border border-[var(--warna-batas-kuat)] bg-white/80 dark:bg-[#101521] px-2.5 text-xs text-[var(--warna-teks-utama)]"
                  >
                    {PRIORITAS_TUGAS.map((pr) => (
                      <option key={pr} value={pr}>
                        Prioritas: {pr}
                      </option>
                    ))}
                  </select>
                  <Tombol
                    ukuran="sedang"
                    varian="utama"
                    ikonKiri={<Plus className="h-3.5 w-3.5" />}
                    onClick={() => void tanganiTambahTugas()}
                  >
                    Tambah Task
                  </Tombol>
                </div>

                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {tugasProyekAktif.length === 0 ? (
                    <p className="text-xs text-[var(--warna-teks-redup)] py-2">
                      Belum ada task untuk project ini.
                    </p>
                  ) : (
                    tugasProyekAktif.map((tugas) => (
                      <div
                        key={tugas.id}
                        className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-[var(--warna-batas)] px-3 py-2 text-xs"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <button
                            type="button"
                            aria-label={`Ubah status selesai ${tugas.judul}`}
                            onClick={() =>
                              void simpanTugas({
                                id: tugas.id,
                                projectId: tugas.projectId,
                                judul: tugas.judul,
                                deskripsi: tugas.deskripsi,
                                status:
                                  tugas.status === "selesai"
                                    ? "todo"
                                    : "selesai",
                                prioritas: tugas.prioritas,
                              })
                            }
                            className="cursor-pointer text-[var(--warna-teks-sekunder)] hover:text-[#66E5D2]"
                          >
                            <CheckCircle2
                              className={`h-4 w-4 ${
                                tugas.status === "selesai"
                                  ? "text-[#66E5D2] fill-[#66E5D2]/20"
                                  : ""
                              }`}
                            />
                          </button>
                          <span
                            className={`truncate font-medium ${
                              tugas.status === "selesai"
                                ? "line-through text-[var(--warna-teks-redup)]"
                                : ""
                            }`}
                          >
                            {tugas.judul}
                          </span>
                          <Lencana varian={WARNA_PRIORITAS[tugas.prioritas]}>
                            {tugas.prioritas}
                          </Lencana>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <select
                            aria-label={`Status task ${tugas.judul}`}
                            value={tugas.status}
                            onChange={(e) =>
                              void simpanTugas({
                                id: tugas.id,
                                projectId: tugas.projectId,
                                judul: tugas.judul,
                                deskripsi: tugas.deskripsi,
                                status: e.target.value as StatusTugas,
                                prioritas: tugas.prioritas,
                              })
                            }
                            className="h-7 rounded-lg border border-[var(--warna-batas-kuat)] bg-white/80 dark:bg-[#101521] px-2 text-[11px]"
                          >
                            {STATUS_TUGAS.map((st) => (
                              <option key={st} value={st}>
                                {st}
                              </option>
                            ))}
                          </select>
                          <button
                            type="button"
                            aria-label={`Hapus task ${tugas.judul}`}
                            onClick={() => void hapusTugas(tugas.id)}
                            className="p-1 text-[var(--warna-teks-redup)] hover:text-red-400 cursor-pointer"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          )}
        </Kartu>
      </div>
    </div>
  );
}
