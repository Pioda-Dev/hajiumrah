export const stats = [
  { label: "Total Jamaah", value: "1.248", delta: "+12% dari bulan lalu", icon: "users", tone: "green" },
  { label: "Pemesanan Aktif", value: "342", delta: "+8% dari bulan lalu", icon: "shopping", tone: "blue" },
  { label: "Keberangkatan Bulan Ini", value: "18", delta: "+2 dari bulan lalu", icon: "plane", tone: "sky" },
  { label: "Total Paket", value: "24", delta: "Paket tersedia", icon: "package", tone: "amber" },
  { label: "Pendapatan Bulan Ini", value: "Rp 2,45 M", delta: "+15% dari bulan lalu", icon: "money", tone: "emerald" },
];

export const revenueData = [
  { month: "Des 2024", value: 620 },
  { month: "Jan 2025", value: 1350 },
  { month: "Feb 2025", value: 1520 },
  { month: "Mar 2025", value: 1950 },
  { month: "Apr 2025", value: 1780 },
  { month: "Mei 2025", value: 2450 },
];

export const statusData = [
  { name: "Booking", value: 342, pct: 39, color: "#22c55e" },
  { name: "Konfirmasi", value: 289, pct: 33, color: "#3b82f6" },
  { name: "Berangkat", value: 182, pct: 21, color: "#f59e0b" },
  { name: "Selesai", value: 63, pct: 7, color: "#8b5cf6" },
];

export const jadwal = [
  { tanggal: "23 Mei 2025", rute: "GIA – JED", jamaah: 12 },
  { tanggal: "25 Mei 2025", rute: "CGK – JED", jamaah: 28 },
  { tanggal: "28 Mei 2025", rute: "KNO – JED", jamaah: 15 },
  { tanggal: "30 Mei 2025", rute: "SUB – JED", jamaah: 22 },
];

export const pemesananTerbaru = [
  { inisial: "AS", nama: "Ahmad Subagyo", paket: "Paket Hemat 9 Hari", inv: "INV/250523/0012", tanggal: "23 Mei 2025", status: "Booking" },
  { inisial: "NW", nama: "Novi Wisudawati", paket: "Paket Plus 12 Hari", inv: "INV/250523/0011", tanggal: "23 Mei 2025", status: "Konfirmasi" },
  { inisial: "MR", nama: "Muhammad Ridwan", paket: "Paket VIP 14 Hari", inv: "INV/250523/0010", tanggal: "23 Mei 2025", status: "Berangkat" },
  { inisial: "YS", nama: "Yuliana Saputri", paket: "Paket Hemat 9 Hari", inv: "INV/250523/0009", tanggal: "22 Mei 2025", status: "Selesai" },
];

export const pendapatanPaket = [
  { nama: "Paket VIP 14 Hari", nilai: 980, pct: 100 },
  { nama: "Paket Plus 12 Hari", nilai: 735, pct: 75 },
  { nama: "Paket Hemat 9 Hari", nilai: 490, pct: 50 },
  { nama: "Paket Promo 9 Hari", nilai: 245, pct: 25 },
];

export const pengingat = [
  { judul: "20 Passport Jamaah akan Expired", detail: "Cek daftar passport yang akan segera berakhir masa berlakunya.", waktu: "2 jam lalu", tone: "green" },
  { judul: "Pembayaran Belum Lunas", detail: "Terdapat 15 pemesanan dengan pembayaran belum lunas.", waktu: "5 jam lalu", tone: "amber" },
  { judul: "Konfirmasi Hotel", detail: "3 booking hotel menunggu konfirmasi voucher.", waktu: "1 hari lalu", tone: "blue" },
];

export const jamaahList = Array.from({ length: 12 }).map((_, i) => ({
  id: `JMH-${1000 + i}`,
  nama: ["Ahmad Subagyo","Novi Wisudawati","Muhammad Ridwan","Yuliana Saputri","Siti Aminah","Budi Santoso","Rina Marlina","Hasan Basri","Dewi Lestari","Fajar Nugroho","Kartika Sari","Agus Wijaya"][i],
  nik: `320101${(19700000 + i * 137).toString().slice(0,8)}`,
  telepon: `0812-3456-${1000 + i}`,
  paket: ["VIP 14 Hari","Plus 12 Hari","Hemat 9 Hari","Promo 9 Hari"][i % 4],
  status: ["Booking","Konfirmasi","Berangkat","Selesai"][i % 4],
}));

export const paketList = [
  { nama: "Paket VIP 14 Hari", harga: "Rp 65.000.000", durasi: 14, kuota: 25, tersisa: 4, hotel: "Bintang 5", maskapai: "Saudi Airlines" },
  { nama: "Paket Plus 12 Hari", harga: "Rp 52.000.000", durasi: 12, kuota: 30, tersisa: 8, hotel: "Bintang 4", maskapai: "Garuda Indonesia" },
  { nama: "Paket Hemat 9 Hari", harga: "Rp 35.000.000", durasi: 9, kuota: 40, tersisa: 12, hotel: "Bintang 3", maskapai: "Lion Air" },
  { nama: "Paket Promo 9 Hari", harga: "Rp 28.500.000", durasi: 9, kuota: 45, tersisa: 20, hotel: "Bintang 3", maskapai: "Citilink" },
];

export const pembayaranList = Array.from({ length: 10 }).map((_, i) => ({
  inv: `INV/250523/00${10 + i}`,
  jamaah: ["Ahmad Subagyo","Novi Wisudawati","Muhammad Ridwan","Yuliana Saputri","Siti Aminah","Budi Santoso","Rina Marlina","Hasan Basri","Dewi Lestari","Fajar Nugroho"][i],
  total: ["Rp 65.000.000","Rp 52.000.000","Rp 35.000.000","Rp 28.500.000"][i % 4],
  dibayar: ["Rp 65.000.000","Rp 30.000.000","Rp 35.000.000","Rp 10.000.000"][i % 4],
  metode: ["Transfer BCA","Transfer Mandiri","Kartu Kredit","Tunai"][i % 4],
  status: ["Lunas","Cicilan","Lunas","DP"][i % 4],
}));

export const dokumenList = [
  { jamaah: "Ahmad Subagyo", passport: "Aktif", visa: "Selesai", vaksin: "Selesai", tiket: "Terbit" },
  { jamaah: "Novi Wisudawati", passport: "Aktif", visa: "Proses", vaksin: "Selesai", tiket: "Belum" },
  { jamaah: "Muhammad Ridwan", passport: "Segera Expired", visa: "Selesai", vaksin: "Selesai", tiket: "Terbit" },
  { jamaah: "Yuliana Saputri", passport: "Aktif", visa: "Belum", vaksin: "Belum", tiket: "Belum" },
  { jamaah: "Siti Aminah", passport: "Aktif", visa: "Selesai", vaksin: "Selesai", tiket: "Terbit" },
];

export const keberangkatanList = [
  { kode: "KB-001", tanggal: "23 Mei 2025", rute: "GIA – JED", maskapai: "Garuda Indonesia", jamaah: 12, status: "Terkonfirmasi" },
  { kode: "KB-002", tanggal: "25 Mei 2025", rute: "CGK – JED", maskapai: "Saudi Airlines", jamaah: 28, status: "Terkonfirmasi" },
  { kode: "KB-003", tanggal: "28 Mei 2025", rute: "KNO – JED", maskapai: "Lion Air", jamaah: 15, status: "Menunggu" },
  { kode: "KB-004", tanggal: "30 Mei 2025", rute: "SUB – JED", maskapai: "Citilink", jamaah: 22, status: "Terkonfirmasi" },
];
