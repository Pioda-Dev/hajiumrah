import { useMemo, useState } from "react";
import { Plus, Pencil, Trash2, Search, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageHeader } from "@/components/app-shell";
import { useDeleteRow, useRows, useSaveRow, type Row } from "@/lib/crud";
import { cn } from "@/lib/utils";

export type FieldType = "text" | "number" | "date" | "textarea" | "select" | "ref" | "email";

export type Field = {
  name: string;
  label: string;
  type?: FieldType;
  options?: string[];
  ref?: { table: string; labelField: string };
  placeholder?: string;
  required?: boolean;
  hideInTable?: boolean;
  hideInForm?: boolean;
  defaultValue?: string | number;
  render?: (row: Row) => React.ReactNode;
};

const toneFor = (value: string) => {
  const v = (value ?? "").toLowerCase();
  if (["lunas", "selesai", "terkonfirmasi", "aktif", "terbit", "masuk"].includes(v)) return "bg-emerald-100 text-emerald-700";
  if (["konfirmasi", "cicilan", "proses"].includes(v)) return "bg-blue-100 text-blue-700";
  if (["booking", "menunggu", "dp"].includes(v)) return "bg-amber-100 text-amber-700";
  if (["berangkat"].includes(v)) return "bg-violet-100 text-violet-700";
  if (["belum", "batal", "segera expired", "keluar"].includes(v)) return "bg-rose-100 text-rose-700";
  return "bg-muted text-foreground/70";
};

export function StatusBadge({ value }: { value: string }) {
  return <Badge variant="secondary" className={cn("border-none font-medium", toneFor(value))}>{value || "-"}</Badge>;
}

function RefSelect({ field, value, onChange }: { field: Field; value: string; onChange: (v: string) => void }) {
  const { data = [] } = useRows(field.ref!.table, { select: `id, ${field.ref!.labelField}`, orderBy: field.ref!.labelField, ascending: true });
  return (
    <Select value={value || ""} onValueChange={onChange}>
      <SelectTrigger><SelectValue placeholder={`Pilih ${field.label}`} /></SelectTrigger>
      <SelectContent>
        {data.map((r) => (
          <SelectItem key={r.id} value={r.id}>{r[field.ref!.labelField]}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function CrudView({
  table, title, description, fields, orderBy, select, searchFields,
}: {
  table: string;
  title: string;
  description?: string;
  fields: Field[];
  orderBy?: string;
  select?: string;
  searchFields?: string[];
}) {
  const { data = [], isLoading } = useRows(table, { select, orderBy });
  const save = useSaveRow(table);
  const remove = useDeleteRow(table);

  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Row | null>(null);
  const [form, setForm] = useState<Row>({});
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const refMaps = fields.filter((f) => f.type === "ref");

  const filtered = useMemo(() => {
    if (!query.trim()) return data;
    const keys = searchFields ?? fields.filter((f) => !f.type || f.type === "text").map((f) => f.name);
    const q = query.toLowerCase();
    return data.filter((r) => keys.some((k) => String(r[k] ?? "").toLowerCase().includes(q)));
  }, [data, query, searchFields, fields]);

  const openCreate = () => {
    const init: Row = {};
    fields.forEach((f) => { if (f.defaultValue !== undefined) init[f.name] = f.defaultValue; });
    setEditing(null); setForm(init); setOpen(true);
  };
  const openEdit = (row: Row) => {
    const init: Row = {};
    fields.forEach((f) => { init[f.name] = row[f.name] ?? ""; });
    setEditing(row); setForm(init); setOpen(true);
  };

  const submit = () => {
    const values: Row = {};
    fields.filter((f) => !f.hideInForm).forEach((f) => {
      const v = form[f.name];
      if (f.type === "number") values[f.name] = v === "" || v === undefined ? 0 : Number(v);
      else values[f.name] = v === "" || v === undefined ? null : v;
    });
    save.mutate({ id: editing?.id, values }, { onSuccess: () => setOpen(false) });
  };

  const tableFields = fields.filter((f) => !f.hideInTable);

  return (
    <>
      <PageHeader
        title={title}
        description={description}
        action={<Button className="gap-2" onClick={openCreate}><Plus className="h-4 w-4" /> Tambah</Button>}
      />

      <Card className="border-none shadow-sm">
        <CardContent className="p-4 md:p-5">
          <div className="relative mb-4 max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Cari data..." className="pl-9" />
          </div>

          <div className="-mx-4 overflow-x-auto md:mx-0">
            <Table>
              <TableHeader>
                <TableRow>
                  {tableFields.map((f) => <TableHead key={f.name} className="whitespace-nowrap">{f.label}</TableHead>)}
                  <TableHead className="w-24 text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading && (
                  <TableRow><TableCell colSpan={tableFields.length + 1} className="py-10 text-center text-muted-foreground">
                    <Loader2 className="mx-auto h-5 w-5 animate-spin" />
                  </TableCell></TableRow>
                )}
                {!isLoading && filtered.length === 0 && (
                  <TableRow><TableCell colSpan={tableFields.length + 1} className="py-10 text-center text-sm text-muted-foreground">
                    Belum ada data. Klik "Tambah" untuk membuat data baru.
                  </TableCell></TableRow>
                )}
                {filtered.map((row) => (
                  <TableRow key={row.id}>
                    {tableFields.map((f) => (
                      <TableCell key={f.name} className="whitespace-nowrap">
                        {f.render
                          ? f.render(row)
                          : f.type === "select"
                            ? <StatusBadge value={row[f.name]} />
                            : String(row[f.name] ?? "-")}
                      </TableCell>
                    ))}
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(row)} title="Ubah">
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => setDeleteId(row.id)} title="Hapus"
                          className="text-destructive hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? `Ubah ${title}` : `Tambah ${title}`}</DialogTitle>
            <DialogDescription>Lengkapi data di bawah lalu simpan.</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 sm:grid-cols-2">
            {fields.filter((f) => !f.hideInForm).map((f) => (
              <div key={f.name} className={cn("space-y-2", (f.type === "textarea") && "sm:col-span-2")}>
                <Label htmlFor={f.name}>{f.label}</Label>
                {f.type === "textarea" ? (
                  <Textarea id={f.name} value={form[f.name] ?? ""} onChange={(e) => setForm({ ...form, [f.name]: e.target.value })} />
                ) : f.type === "select" ? (
                  <Select value={form[f.name] ?? ""} onValueChange={(v) => setForm({ ...form, [f.name]: v })}>
                    <SelectTrigger><SelectValue placeholder={`Pilih ${f.label}`} /></SelectTrigger>
                    <SelectContent>
                      {(f.options ?? []).map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                    </SelectContent>
                  </Select>
                ) : f.type === "ref" ? (
                  <RefSelect field={f} value={form[f.name] ?? ""} onChange={(v) => setForm({ ...form, [f.name]: v })} />
                ) : (
                  <Input
                    id={f.name}
                    type={f.type === "number" ? "number" : f.type === "date" ? "date" : f.type === "email" ? "email" : "text"}
                    placeholder={f.placeholder}
                    value={form[f.name] ?? ""}
                    onChange={(e) => setForm({ ...form, [f.name]: e.target.value })}
                  />
                )}
              </div>
            ))}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Batal</Button>
            <Button onClick={submit} disabled={save.isPending}>
              {save.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Simpan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus data ini?</AlertDialogTitle>
            <AlertDialogDescription>Tindakan ini tidak dapat dibatalkan.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => { if (deleteId) remove.mutate(deleteId); setDeleteId(null); }}
            >
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {refMaps.length === 0 ? null : null}
    </>
  );
}
