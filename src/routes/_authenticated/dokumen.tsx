import { createFileRoute } from "@tanstack/react-router";
import { CrudView, StatusBadge } from "@/components/crud-view";
import { tanggalID } from "@/lib/crud";

export const Route = createFileRoute("/_authenticated/dokumen")({
  head: () => ({
    meta: [
      { title: "Dokumen — Umroh Travel Management" },
      { name: "description", content: "Pantau kelengkapan dokumen jamaah: paspor, visa, vaksin, dan tiket penerbangan." },
      { property: "og:title", content: "Dokumen — Umroh Travel Management" },
      { property: "og:description", content: "Kelola status dokumen perjalanan setiap jamaah umroh." },
    ],
  }),
  component: () => (
    <CrudView
      table="dokumen"
      title="Dokumen"
      description="Checklist kelengkapan dokumen perjalanan jamaah."
      select="*, jamaah:jamaah_id(nama)"
      searchFields={["no_passport", "status_passport", "visa", "vaksin", "tiket"]}
      fields={[
        { name: "jamaah_id", label: "Jamaah", type: "ref", ref: { table: "jamaah", labelField: "nama" }, render: (r) => r.jamaah?.nama ?? "-" },
        { name: "no_passport", label: "No. Paspor" },
        { name: "expired_passport", label: "Masa Berlaku", type: "date", render: (r) => tanggalID(r.expired_passport) },
        { name: "status_passport", label: "Paspor", type: "select", options: ["Aktif", "Segera Expired", "Expired", "Belum Ada"], defaultValue: "Belum Ada", render: (r) => <StatusBadge value={r.status_passport} /> },
        { name: "visa", label: "Visa", type: "select", options: ["Belum", "Proses", "Selesai"], defaultValue: "Belum", render: (r) => <StatusBadge value={r.visa} /> },
        { name: "vaksin", label: "Vaksin", type: "select", options: ["Belum", "Proses", "Selesai"], defaultValue: "Belum", render: (r) => <StatusBadge value={r.vaksin} /> },
        { name: "tiket", label: "Tiket", type: "select", options: ["Belum", "Terbit"], defaultValue: "Belum", render: (r) => <StatusBadge value={r.tiket} /> },
      ]}
    />
  ),
});
