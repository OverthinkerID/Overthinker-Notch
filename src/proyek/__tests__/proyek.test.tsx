import { beforeEach, describe, expect, it } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { gunakanTokoProyek, PanelProyek } from "@/proyek";

describe("Fase 13 — Project Workspace", () => {
  beforeEach(() => {
    window.localStorage.clear();
    gunakanTokoProyek.setState({
      daftarWorkspace: [],
      daftarProyek: [],
      daftarTugas: [],
      idWorkspaceTerpilih: null,
      idProyekTerpilih: null,
      ringkasanAset: null,
      kataCari: "",
      filterStatusProyek: "semua",
      pesanStatus: null,
      pesanGalat: null,
    });
  });

  it("membuat workspace, project baru, dan mendukung pencarian serta filter status", async () => {
    render(<PanelProyek />);

    fireEvent.change(screen.getByLabelText("Nama workspace baru"), {
      target: { value: "Overthinker Studio" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Tambah Workspace/i }));

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: "Overthinker Studio" })
      ).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText("Nama Project"), {
      target: { value: "Notch Desktop v1" },
    });
    fireEvent.change(screen.getByLabelText("Deskripsi Project"), {
      target: { value: "Rilis aplikasi desktop lintas OS" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Simpan Project/i }));

    await waitFor(() => {
      expect(screen.getByText("Notch Desktop v1")).toBeInTheDocument();
    });

    // Uji pencarian
    fireEvent.change(screen.getByLabelText("Cari project"), {
      target: { value: "tidak ada" },
    });
    expect(screen.queryByText("Notch Desktop v1")).not.toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Cari project"), {
      target: { value: "Desktop" },
    });
    expect(screen.getByText("Notch Desktop v1")).toBeInTheDocument();
  });

  it("menghitung progres project otomatis saat task ditambahkan dan diselesaikan", async () => {
    const ws = await gunakanTokoProyek.getState().simpanWorkspace({
      nama: "Dev",
      deskripsi: "",
    });
    await gunakanTokoProyek.getState().simpanProyek({
      workspaceId: ws!.id,
      nama: "Backend Rust",
      deskripsi: "Migrasi SQLx",
      status: "aktif",
      warna: "#55A7FF",
    });

    render(<PanelProyek />);

    await waitFor(() => {
      expect(screen.getByLabelText("Judul task baru")).toBeInTheDocument();
    });

    // Tambah 2 task
    fireEvent.change(screen.getByLabelText("Judul task baru"), {
      target: { value: "Buat skema" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Tambah Task/i }));

    await waitFor(() => {
      expect(screen.getByText("Buat skema")).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText("Judul task baru"), {
      target: { value: "Tulis unit test" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Tambah Task/i }));

    await waitFor(() => {
      expect(screen.getByText("Tulis unit test")).toBeInTheDocument();
      expect(screen.getByText(/Progres: 0%/i)).toBeInTheDocument();
    });

    // Selesaikan 1 dari 2 task -> 50%
    fireEvent.click(
      screen.getByRole("button", { name: "Ubah status selesai Buat skema" })
    );

    await waitFor(() => {
      expect(screen.getByText(/Progres: 50%/i)).toBeInTheDocument();
    });
  });

  it("mengagregasi jumlah notes, files, snippets, prompts, dan focus sessions yang tertaut ke project", async () => {
    const ws = await gunakanTokoProyek.getState().simpanWorkspace({
      nama: "Riset",
      deskripsi: "",
    });
    const prj = await gunakanTokoProyek.getState().simpanProyek({
      workspaceId: ws!.id,
      nama: "AI Tools",
      deskripsi: "",
      status: "aktif",
      warna: "#A879FF",
    });

    const pid = prj!.id;
    window.localStorage.setItem(
      "overthinker_notch_quick_notes",
      JSON.stringify([
        { id: "n1", projectId: pid, diarsipkan: false },
        { id: "n2", projectId: "lain", diarsipkan: false },
      ])
    );
    window.localStorage.setItem(
      "overthinker_notch_temp_files",
      JSON.stringify([{ id: "f1", projectId: pid, dihapusPada: null }])
    );
    window.localStorage.setItem(
      "overthinker_notch_code_snippets",
      JSON.stringify([
        { id: "s1", projectId: pid },
        { id: "s2", projectId: pid },
      ])
    );
    window.localStorage.setItem(
      "overthinker_notch_ai_prompts",
      JSON.stringify([{ id: "p1", projectId: pid }])
    );
    window.localStorage.setItem(
      "overthinker_notch_focus_sessions",
      JSON.stringify([
        { id: "fs1", projectId: pid },
        { id: "fs2", projectId: pid },
        { id: "fs3", projectId: pid },
      ])
    );

    render(<PanelProyek />);

    await waitFor(() => {
      expect(screen.getByTestId("aset-jumlah-catatan")).toHaveTextContent("1");
      expect(screen.getByTestId("aset-jumlah-berkas")).toHaveTextContent("1");
      expect(screen.getByTestId("aset-jumlah-cuplikan")).toHaveTextContent("2");
      expect(screen.getByTestId("aset-jumlah-prompt")).toHaveTextContent("1");
      expect(screen.getByTestId("aset-jumlah-fokus")).toHaveTextContent("3");
    });
  });
});
