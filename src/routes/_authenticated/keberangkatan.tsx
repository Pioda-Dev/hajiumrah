import { createFileRoute } from "@tanstack/react-router";
import { CrudView, StatusBadge } from "@/components/crud-view";
import { tanggalID } from "@/lib/crud";

export const Route = createFileRoute("/_authenticated/keberangkatan")({
  head: () => ({
    meta: [
      { title: "Keberangkatan — Umroh Travel Management" },
      { name: "description", content: "Jadwal keberangkatan umroh: kode grup, tanggal, rute, maskapai, dan jumlah jamaah." },
      { property: "og:title", content: "Keberangkatan — Umroh Travel Management" },
      { property: "og:description", content: "Pantau dan kelola jadwal keberangkatan jamaah umroh." },
    ],
  }),
  component: () => (
    <CrudView
      table="keberangkatan"
      title="Keberangkatan"
      description="Jadwal grup keberangkatan jamaah umroh."
      orderBy="tanggal"
      searchFields={["kode", "rute", "maskapai", "status"]}
      fields={[
        { name: "kode", label: "Kode Grup", placeholder: "KB-001", required: true },
        { name: "tanggal", label: "Tanggal", type: "date", render: (r) => tanggalID(r.tanggal) },
        { name: "rute", label: "Rute", placeholder: "CGK – JED" },
        { name: "maskapai", label: "Maskapai" },
        { name: "jumlah_jamaah", label: "Jumlah Jamaah", type: "number" },
        { name: "status", label: "Status", type: "select", options: ["Menunggu", "Terkonfirmasi", "Selesai", "Batal"], defaultValue: "Menunggu", render: (r) => <StatusBadge value={r.status} /> },
      ]}
    />
  ),
});
