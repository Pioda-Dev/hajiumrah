create table public.hero_slides (
  id uuid primary key default gen_random_uuid(),
  judul text,
  subjudul text,
  image_url text not null,
  urutan integer not null default 0,
  aktif boolean not null default true,
  created_at timestamptz not null default now()
);

grant select on public.hero_slides to anon, authenticated;
grant insert, update, delete on public.hero_slides to authenticated;
grant all on public.hero_slides to service_role;

alter table public.hero_slides enable row level security;

create policy "hero_slides_public_read" on public.hero_slides
  for select to anon, authenticated
  using (aktif = true or public.is_staff(auth.uid()));

create policy "hero_slides_staff_insert" on public.hero_slides
  for insert to authenticated
  with check (public.is_staff(auth.uid()));

create policy "hero_slides_staff_update" on public.hero_slides
  for update to authenticated
  using (public.is_staff(auth.uid()))
  with check (public.is_staff(auth.uid()));

create policy "hero_slides_staff_delete" on public.hero_slides
  for delete to authenticated
  using (public.is_staff(auth.uid()));

create policy "hero_objects_public_read" on storage.objects
  for select
  using (bucket_id = 'hero');

create policy "hero_objects_staff_insert" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'hero' and public.is_staff(auth.uid()));

create policy "hero_objects_staff_update" on storage.objects
  for update to authenticated
  using (bucket_id = 'hero' and public.is_staff(auth.uid()))
  with check (bucket_id = 'hero' and public.is_staff(auth.uid()));

create policy "hero_objects_staff_delete" on storage.objects
  for delete to authenticated
  using (bucket_id = 'hero' and public.is_staff(auth.uid()));