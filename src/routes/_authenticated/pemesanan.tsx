import { createFileRoute } from "@tanstack/react-router";
import { CrudView, StatusBadge } from "@/components/crud-view";
import { rupiah, tanggalID } from "@/lib/crud";

export const Route = createFileRoute("/_authenticated/pemesanan")({
  head: () => ({
    meta: [
      { title: "Pemesanan — Umroh Travel Management" },
      { name: "description", content: "Kelola pemesanan paket umroh: buat invoice, ubah status, dan pantau nilai transaksi." },
      { property: "og:title", content: "Pemesanan — Umroh Travel Management" },
      { property: "og:description", content: "Kelola seluruh pemesanan paket umroh jamaah Anda." },
    ],
  }),
  component: () => (
    <CrudView
      table="pemesanan"
      title="Pemesanan"
      description="Daftar pemesanan paket umroh beserta statusnya."
      select="*, jamaah:jamaah_id(nama), paket:paket_id(nama)"
      searchFields={["invoice", "status"]}
      fields={[
        { name: "invoice", label: "No. Invoice", placeholder: "INV/250523/0012", required: true },
        { name: "jamaah_id", label: "Jamaah", type: "ref", ref: { table: "jamaah", labelField: "nama" }, render: (r) => r.jamaah?.nama ?? "-" },
        { name: "paket_id", label: "Paket", type: "ref", ref: { table: "paket", labelField: "nama" }, render: (r) => r.paket?.nama ?? "-" },
        { name: "tanggal", label: "Tanggal", type: "date", render: (r) => tanggalID(r.tanggal) },
        { name: "total", label: "Total", type: "number", render: (r) => rupiah(r.total) },
        { name: "status", label: "Status", type: "select", options: ["Booking", "Konfirmasi", "Berangkat", "Selesai", "Batal"], defaultValue: "Booking", render: (r) => <StatusBadge value={r.status} /> },
      ]}
    />
  ),
});
