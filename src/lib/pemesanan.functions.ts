import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const schema = z.object({
  paket_id: z.string().uuid(),
  nama: z.string().min(3).max(120),
  telepon: z.string().min(6).max(30),
  alamat: z.string().max(300).optional().default(""),
  nik: z.string().max(30).optional().default(""),
  metode: z.enum(["Transfer BCA", "Transfer Mandiri", "Transfer BSI", "Tunai"]),
  jenis_bayar: z.enum(["DP", "Lunas"]),
});

const invoiceNo = () => {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return `INV/${String(d.getFullYear()).slice(2)}${p(d.getMonth() + 1)}${p(d.getDate())}/${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}`;
};

export const buatPemesanan = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => schema.parse(input))
  .handler(async ({ data, context }) => {
    const email = (context.claims as { email?: string } | null)?.email ?? null;
    if (!email) throw new Error("Akun Anda tidak memiliki email terverifikasi.");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const db = supabaseAdmin as any;

    const { data: paket, error: paketErr } = await db
      .from("paket")
      .select("id, nama, harga, tersisa")
      .eq("id", data.paket_id)
      .maybeSingle();
    if (paketErr) throw paketErr;
    if (!paket) throw new Error("Paket tidak ditemukan.");
    if (Number(paket.tersisa ?? 0) <= 0) throw new Error("Kuota paket ini sudah penuh.");

    // Jamaah: pakai data yang sudah ada untuk email ini, atau buat baru.
    const { data: jamaahAda } = await db
      .from("jamaah")
      .select("id")
      .ilike("email", email)
      .maybeSingle();

    let jamaahId: string;
    if (jamaahAda?.id) {
      jamaahId = jamaahAda.id as string;
      const { error } = await db
        .from("jamaah")
        .update({
          nama: data.nama,
          telepon: data.telepon,
          alamat: data.alamat || null,
          nik: data.nik || null,
          paket_id: paket.id,
          status: "Booking",
        })
        .eq("id", jamaahId);
      if (error) throw error;
    } else {
      const { data: baru, error } = await db
        .from("jamaah")
        .insert({
          nama: data.nama,
          email,
          telepon: data.telepon,
          alamat: data.alamat || null,
          nik: data.nik || null,
          paket_id: paket.id,
          status: "Booking",
        })
        .select("id")
        .single();
      if (error) throw error;
      jamaahId = baru.id as string;
    }

    const total = Number(paket.harga ?? 0);
    const dibayar = data.jenis_bayar === "Lunas" ? total : Math.round(total * 0.3);
    const invoice = invoiceNo();
    const status = data.jenis_bayar === "Lunas" ? "Konfirmasi" : "Booking";

    const { error: pesanErr } = await db.from("pemesanan").insert({
      invoice,
      jamaah_id: jamaahId,
      paket_id: paket.id,
      total,
      status,
    });
    if (pesanErr) throw pesanErr;

    const { error: bayarErr } = await db.from("pembayaran").insert({
      invoice,
      jamaah_id: jamaahId,
      total,
      dibayar,
      metode: data.metode,
      status: data.jenis_bayar === "Lunas" ? "Lunas" : "DP",
    });
    if (bayarErr) throw bayarErr;

    await db.from("dokumen").insert({ jamaah_id: jamaahId }).select("id");

    await db
      .from("paket")
      .update({ tersisa: Math.max(0, Number(paket.tersisa ?? 0) - 1) })
      .eq("id", paket.id);

    await db.from("keuangan").insert({
      keterangan: `Pembayaran ${data.jenis_bayar} umroh ${paket.nama} — ${data.nama} (${invoice})`,
      kategori: "Pemesanan",
      jenis: "Pemasukan",
      nominal: dibayar,
    });

    if (data.jenis_bayar === "Lunas") {
      await db.from("jamaah").update({ status: "Konfirmasi" }).eq("id", jamaahId);
    }

    return { invoice, total, dibayar, status, paket_nama: paket.nama as string };
  });
