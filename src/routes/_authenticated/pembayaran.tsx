import { createFileRoute } from "@tanstack/react-router";
import { CrudView, StatusBadge } from "@/components/crud-view";
import { rupiah, tanggalID } from "@/lib/crud";

export const Route = createFileRoute("/_authenticated/pembayaran")({
  head: () => ({
    meta: [
      { title: "Pembayaran — Umroh Travel Management" },
      { name: "description", content: "Catat dan pantau pembayaran jamaah: DP, cicilan, dan pelunasan paket umroh." },
      { property: "og:title", content: "Pembayaran — Umroh Travel Management" },
      { property: "og:description", content: "Kelola pembayaran dan status pelunasan jamaah umroh." },
    ],
  }),
  component: () => (
    <CrudView
      table="pembayaran"
      title="Pembayaran"
      description="Riwayat pembayaran jamaah beserta status pelunasan."
      select="*, jamaah:jamaah_id(nama)"
      searchFields={["invoice", "metode", "status"]}
      fields={[
        { name: "invoice", label: "No. Invoice", required: true },
        { name: "jamaah_id", label: "Jamaah", type: "ref", ref: { table: "jamaah", labelField: "nama" }, render: (r) => r.jamaah?.nama ?? "-" },
        { name: "total", label: "Total Tagihan", type: "number", render: (r) => rupiah(r.total) },
        { name: "dibayar", label: "Sudah Dibayar", type: "number", render: (r) => rupiah(r.dibayar) },
        { name: "metode", label: "Metode", type: "select", options: ["Transfer BCA", "Transfer Mandiri", "Transfer BNI", "Kartu Kredit", "Tunai"], defaultValue: "Transfer BCA" },
        { name: "status", label: "Status", type: "select", options: ["DP", "Cicilan", "Lunas"], defaultValue: "DP", render: (r) => <StatusBadge value={r.status} /> },
        { name: "tanggal", label: "Tanggal", type: "date", render: (r) => tanggalID(r.tanggal) },
      ]}
    />
  ),
});
