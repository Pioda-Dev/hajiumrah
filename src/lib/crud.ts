import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export type Row = Record<string, any>;

// The generic CRUD layer intentionally works over table names as strings, so we
// loosen the generated typings here.
const db = supabase as any;

export function useRows(table: string, opts?: { select?: string; orderBy?: string; ascending?: boolean }) {
  const select = opts?.select ?? "*";
  const orderBy = opts?.orderBy ?? "created_at";
  const ascending = opts?.ascending ?? false;
  return useQuery({
    queryKey: [table, select, orderBy, ascending],
    queryFn: async (): Promise<Row[]> => {
      const { data, error } = await db.from(table).select(select).order(orderBy, { ascending });
      if (error) throw error;
      return (data ?? []) as Row[];
    },
    placeholderData: (prev) => prev,
  });
}

export function useSaveRow(table: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, values }: { id?: string; values: Row }) => {
      if (id) {
        const { error } = await db.from(table).update(values).eq("id", id);
        if (error) throw error;
      } else {
        const { error } = await db.from(table).insert(values);
        if (error) throw error;
      }
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: [table] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success(vars.id ? "Data berhasil diperbarui" : "Data berhasil ditambahkan");
    },
    onError: (e: any) => toast.error(e?.message ?? "Gagal menyimpan data"),
  });
}

export function useDeleteRow(table: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await db.from(table).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [table] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Data berhasil dihapus");
    },
    onError: (e: any) => toast.error(e?.message ?? "Gagal menghapus data"),
  });
}

export const rupiah = (v: number | string | null | undefined) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(Number(v ?? 0));

export const shortRupiah = (v: number) => {
  const n = Number(v ?? 0);
  if (n >= 1_000_000_000) return `Rp ${(n / 1_000_000_000).toFixed(2)} M`;
  if (n >= 1_000_000) return `Rp ${(n / 1_000_000).toFixed(1)} Jt`;
  return rupiah(n);
};

export const tanggalID = (v: string | null | undefined) =>
  v ? new Date(v).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }) : "-";
