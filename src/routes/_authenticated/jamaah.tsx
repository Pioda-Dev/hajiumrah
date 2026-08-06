import { createFileRoute } from "@tanstack/react-router";
import { CrudView, StatusBadge } from "@/components/crud-view";

export const Route = createFileRoute("/_authenticated/jamaah")({
  head: () => ({
    meta: [
      { title: "Data Jamaah — Umroh Travel Management" },
      { name: "description", content: "Kelola data jamaah umroh: identitas, kontak, paket yang diambil, dan status perjalanan." },
      { property: "og:title", content: "Data Jamaah — Umroh Travel Management" },
      { property: "og:description", content: "Tambah, ubah, dan hapus data jamaah umroh dengan mudah." },
    ],
  }),
  component: () => (
    <CrudView
      table="jamaah"
      title="Jamaah"
      description="Database jamaah beserta paket dan status keberangkatan."
      select="*, paket:paket_id(nama)"
      searchFields={["nama", "nik", "telepon", "email", "status"]}
      fields={[
        { name: "nama", label: "Nama Lengkap", required: true },
        { name: "nik", label: "NIK" },
        { name: "telepon", label: "Telepon" },
        { name: "email", label: "Email", type: "email" },
        { name: "paket_id", label: "Paket", type: "ref", ref: { table: "paket", labelField: "nama" }, render: (r) => r.paket?.nama ?? "-" },
        { name: "status", label: "Status", type: "select", options: ["Booking", "Konfirmasi", "Berangkat", "Selesai"], defaultValue: "Booking", render: (r) => <StatusBadge value={r.status} /> },
        { name: "alamat", label: "Alamat", type: "textarea", hideInTable: true },
      ]}
    />
  ),
});
