import { createFileRoute } from "@tanstack/react-router";
import { CrudView, StatusBadge } from "@/components/crud-view";
import { rupiah, tanggalID } from "@/lib/crud";

export const Route = createFileRoute("/_authenticated/keuangan")({
  head: () => ({
    meta: [
      { title: "Keuangan — Umroh Travel Management" },
      { name: "description", content: "Catat arus kas travel umroh: pemasukan, pengeluaran, dan kategori transaksi." },
      { property: "og:title", content: "Keuangan — Umroh Travel Management" },
      { property: "og:description", content: "Pantau pemasukan dan pengeluaran operasional travel umroh." },
    ],
  }),
  component: () => (
    <CrudView
      table="keuangan"
      title="Keuangan"
      description="Buku kas pemasukan dan pengeluaran operasional."
      orderBy="tanggal"
      searchFields={["keterangan", "kategori", "jenis"]}
      fields={[
        { name: "tanggal", label: "Tanggal", type: "date", render: (r) => tanggalID(r.tanggal) },
        { name: "keterangan", label: "Keterangan", required: true },
        { name: "kategori", label: "Kategori", type: "select", options: ["Pembayaran Jamaah", "Tiket & Visa", "Hotel", "Katering", "Transportasi", "Operasional", "Marketing", "Lainnya"], defaultValue: "Operasional" },
        { name: "jenis", label: "Jenis", type: "select", options: ["Pemasukan", "Pengeluaran"], defaultValue: "Pemasukan", render: (r) => <StatusBadge value={r.jenis} /> },
        { name: "nominal", label: "Nominal", type: "number", render: (r) => rupiah(r.nominal) },
      ]}
    />
  ),
});
