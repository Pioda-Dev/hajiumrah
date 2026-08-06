import { createFileRoute } from "@tanstack/react-router";
import { CrudView } from "@/components/crud-view";
import { rupiah } from "@/lib/crud";

export const Route = createFileRoute("/_authenticated/paket")({
  head: () => ({
    meta: [
      { title: "Paket Umroh — Umroh Travel Management" },
      { name: "description", content: "Kelola paket umroh: harga, durasi, kuota, hotel, dan maskapai penerbangan." },
      { property: "og:title", content: "Paket Umroh — Umroh Travel Management" },
      { property: "og:description", content: "Atur daftar paket umroh yang Anda tawarkan." },
    ],
  }),
  component: () => (
    <CrudView
      table="paket"
      title="Paket Umroh"
      description="Daftar paket beserta harga, kuota, dan fasilitas."
      searchFields={["nama", "hotel", "maskapai"]}
      fields={[
        { name: "nama", label: "Nama Paket", required: true },
        { name: "harga", label: "Harga", type: "number", render: (r) => rupiah(r.harga) },
        { name: "durasi", label: "Durasi (hari)", type: "number", defaultValue: 9 },
        { name: "kuota", label: "Kuota", type: "number" },
        { name: "tersisa", label: "Tersisa", type: "number" },
        { name: "hotel", label: "Hotel", type: "select", options: ["Bintang 3", "Bintang 4", "Bintang 5"], defaultValue: "Bintang 3" },
        { name: "maskapai", label: "Maskapai" },
      ]}
    />
  ),
});
