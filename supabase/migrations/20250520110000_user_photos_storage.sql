-- Supabase Storage para fotos de perfil (Virtual Try-On)

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'user-photos',
  'user-photos',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "user_photos_insert_own" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'user-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "user_photos_select_public" on storage.objects
  for select to anon, authenticated
  using (bucket_id = 'user-photos');

create policy "user_photos_update_own" on storage.objects
  for update to authenticated
  using (
    bucket_id = 'user-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "user_photos_delete_own" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'user-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
