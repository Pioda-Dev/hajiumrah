import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Plus, Pencil, Trash2, Loader2, ArrowUp, ArrowDown, Upload, Images,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { PageHeader } from "@/components/app-shell";
import { useDeleteRow, useRows, useSaveRow, type Row } from "@/lib/crud";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

const db = supabase as any;

export const Route = createFileRoute("/_authenticated/hero")({
  head: () => ({
    meta: [{ title: "Hero Slider — Admin Umroh Travel" }],
  }),
  component: HeroSliderAdmin,
});

const isUrl = (v: string) => /^https?:\/\//.test(v);

function SlideImage({ src, className }: { src: string; className?: string }) {
  const [url, setUrl] = useState(isUrl(src) ? src : "");
  useEffect(() => {
    if (isUrl(src) || !src) {
      setUrl(isUrl(src) ? src : "");
      return;
    }
    let alive = true;
    db.storage
      .from("hero")
      .createSignedUrl(src, 60 * 60 * 24 * 7)
      .then((res: any) => {
        if (alive && res.data?.signedUrl) setUrl(res.data.signedUrl);
      });
    return () => {
      alive = false;
    };
  }, [src]);
  if (!url) return <div className={cn("animate-pulse bg-muted", className)} />;
  return <img src={url} alt="Gambar slide" className={className} loading="lazy" />;
}

function HeroSliderAdmin() {
  const { data = [], isLoading } = useRows("hero_slides", { orderBy: "urutan", ascending: true });
  const save = useSaveRow("hero_slides");
  const remove = useDeleteRow("hero_slides");
  const qc = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Row | null>(null);
  const [form, setForm] = useState<Row>({ judul: "", subjudul: "", image_url: "", urutan: 1, aktif: true });
  const [uploading, setUploading] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const nextUrutan = () => (data.length ? Math.max(...data.map((r) => Number(r.urutan ?? 0))) : 0) + 1;

  const openCreate = () => {
    setEditing(null);
    setForm({ judul: "", subjudul: "", image_url: "", urutan: nextUrutan(), aktif: true });
    setOpen(true);
  };

  const openEdit = (row: Row) => {
    setEditing(row);
    setForm({
      judul: row.judul ?? "",
      subjudul: row.subjudul ?? "",
      image_url: row.image_url ?? "",
      urutan: Number(row.urutan ?? 0),
      aktif: row.aktif ?? true,
    });
    setOpen(true);
  };

  const submit = () => {
    if (!form.image_url) {
      toast.error("Gambar wajib diisi — unggah file atau tempel URL gambar.");
      return;
    }
    save.mutate(
      {
        id: editing?.id,
        values: {
          judul: form.judul || null,
          subjudul: form.subjudul || null,
          image_url: form.image_url,
          urutan: Number(form.urutan) || 0,
          aktif: !!form.aktif,
        },
      },
      { onSuccess: () => setOpen(false) },
    );
  };

  const upload = async (file: File) => {
    setUploading(true);
    try {
      const path = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "-")}`;
      const { error } = await db.storage.from("hero").upload(path, file, { contentType: file.type || undefined });
      if (error) throw error;
      setForm((f: Row) => ({ ...f, image_url: path }));
      toast.success("Gambar berhasil diunggah");
    } catch (e: any) {
      toast.error(e?.message ?? "Gagal mengunggah gambar");
    } finally {
      setUploading(false);
    }
  };

  const move = async (index: number, dir: -1 | 1) => {
    const target = index + dir;
    if (target < 0 || target >= data.length) return;
    const a = data[index];
    const b = data[target];
    const ua = Number(a.urutan ?? index);
    const ub = Number(b.urutan ?? target);
    const updates =
      ua === ub
        ? [
            { id: a.id, urutan: ua + dir },
            { id: b.id, urutan: ub },
          ]
        : [
            { id: a.id, urutan: ub },
            { id: b.id, urutan: ua },
          ];
    await Promise.all(updates.map((u) => db.from("hero_slides").update({ urutan: u.urutan }).eq("id", u.id)));
    qc.invalidateQueries({ queryKey: ["hero_slides"] });
  };

  const confirmDelete = async () => {
    const row = data.find((r) => r.id === deleteId);
    if (row && row.image_url && !isUrl(row.image_url)) {
      try {
        await db.storage.from("hero").remove([row.image_url]);
      } catch {
        // best effort
      }
    }
    if (deleteId) remove.mutate(deleteId);
    setDeleteId(null);
  };

  return (
    <>
      <PageHeader
        title="Hero Slider"
        description="Kelola gambar slider di halaman beranda — unggah gambar atau gunakan URL, atur urutan, dan aktif/nonaktifkan."
        action={<Button className="gap-2" onClick={openCreate}><Plus className="h-4 w-4" /> Tambah Slide</Button>}
      />

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {isLoading &&
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-64 animate-pulse rounded-2xl bg-muted" />
          ))}

        {!isLoading && data.length === 0 && (
          <Card className="col-span-full border-none shadow-sm">
            <CardContent className="flex flex-col items-center gap-3 py-14 text-center">
              <Images className="h-10 w-10 text-muted-foreground" />
              <div>
                <p className="font-semibold">Belum ada slide</p>
                <p className="text-sm text-muted-foreground">Tambahkan slide pertama agar beranda menampilkan slider.</p>
              </div>
              <Button className="gap-2" onClick={openCreate}><Plus className="h-4 w-4" /> Tambah Slide</Button>
            </CardContent>
          </Card>
        )}

        {data.map((row, i) => (
          <Card key={row.id} className="overflow-hidden border-none shadow-sm">
            <div className="relative aspect-video">
              <SlideImage src={row.image_url ?? ""} className="h-full w-full object-cover" />
              <div className="absolute right-2 top-2 flex items-center gap-1.5">
                <Badge variant="secondary" className="border-none bg-black/50 text-white">#{Number(row.urutan ?? 0)}</Badge>
                <Badge className={cn("border-none", row.aktif ? "bg-emerald-500 text-white" : "bg-muted text-foreground/70")}>
                  {row.aktif ? "Tampil" : "Nonaktif"}
                </Badge>
              </div>
            </div>
            <CardContent className="p-4">
              <div className="truncate font-semibold">{row.judul || "Tanpa judul"}</div>
              <div className="line-clamp-2 min-h-[2rem] text-xs text-muted-foreground">{row.subjudul || "—"}</div>
              <div className="mt-1 truncate text-[11px] text-muted-foreground">
                {isUrl(row.image_url) ? "URL eksternal" : "Diunggah ke penyimpanan"}
              </div>
              <div className="mt-3 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1">
                  <Button variant="outline" size="icon" disabled={i === 0} onClick={() => move(i, -1)} title="Naik">
                    <ArrowUp className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" disabled={i === data.length - 1} onClick={() => move(i, 1)} title="Turun">
                    <ArrowDown className="h-4 w-4" />
                  </Button>
                </div>
                <Switch checked={!!row.aktif} onCheckedChange={() => save.mutate({ id: row.id, values: { aktif: !row.aktif } })} />
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" onClick={() => openEdit(row)} title="Ubah">
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => setDeleteId(row.id)} title="Hapus">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "Ubah Slide" : "Tambah Slide"}</DialogTitle>
            <DialogDescription>Unggah gambar dari perangkat atau tempel URL gambar.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Gambar</Label>
              {form.image_url ? (
                <div className="overflow-hidden rounded-xl border">
                  <SlideImage src={form.image_url} className="aspect-video w-full object-cover" />
                </div>
              ) : (
                <div className="grid aspect-video place-items-center rounded-xl border border-dashed bg-muted/40 text-sm text-muted-foreground">
                  <div className="flex flex-col items-center gap-2">
                    <Images className="h-8 w-8" />
                    Belum ada gambar
                  </div>
                </div>
              )}
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) upload(f);
                  e.target.value = "";
                }}
              />
              <Button variant="outline" className="gap-2" disabled={uploading} onClick={() => fileRef.current?.click()}>
                {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                Unggah Gambar
              </Button>
            </div>

            <div className="space-y-2">
              <Label htmlFor="image_url">URL Gambar</Label>
              <Input
                id="image_url"
                placeholder="https://contoh.com/gambar.jpg"
                value={form.image_url ?? ""}
                onChange={(e) => setForm({ ...form, image_url: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">Tempel URL gambar, atau unggah langsung dari perangkat di atas.</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="judul">Judul (opsional)</Label>
                <Input id="judul" placeholder="Musim Ibadah 2026" value={form.judul ?? ""} onChange={(e) => setForm({ ...form, judul: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="urutan">Urutan</Label>
                <Input id="urutan" type="number" value={form.urutan ?? ""} onChange={(e) => setForm({ ...form, urutan: e.target.value })} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="subjudul">Deskripsi singkat (opsional)</Label>
              <Textarea id="subjudul" placeholder="Teks kecil di pojok slide..." value={form.subjudul ?? ""} onChange={(e) => setForm({ ...form, subjudul: e.target.value })} />
            </div>

            <div className="flex items-center justify-between rounded-xl border p-3">
              <div>
                <div className="text-sm font-medium">Tampilkan di beranda</div>
                <div className="text-xs text-muted-foreground">Slide nonaktif tidak muncul di slider.</div>
              </div>
              <Switch checked={!!form.aktif} onCheckedChange={(v) => setForm({ ...form, aktif: v })} />
            </div>
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
            <AlertDialogTitle>Hapus slide ini?</AlertDialogTitle>
            <AlertDialogDescription>Tindakan ini tidak dapat dibatalkan. Gambar yang diunggah juga ikut dihapus.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => confirmDelete()}
            >
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
