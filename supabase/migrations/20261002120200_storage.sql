-- =========================================================
-- ALVOXIS — private photo storage
--
--   gift-photos   <user_id>/<gift_id>/<uuid>.<ext>
--                 the keepsake puzzle photo (€50+ support)
--   order-photos  <user_id>/<uuid>.<ext>
--                 the photo personalising a gift box order
--
-- Both buckets are PRIVATE: files are only reachable through
-- short-lived signed URLs, and only by their owner.
-- =========================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('gift-photos',  'gift-photos',  false, 15728640, array['image/jpeg', 'image/png', 'image/webp']),
  ('order-photos', 'order-photos', false, 15728640, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update
  set public             = false,
      file_size_limit    = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;


-- ---------------------------------------------------------
-- gift-photos
-- ---------------------------------------------------------

create policy "gift-photos: owner can read"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'gift-photos'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

-- upload only into a gift you own that is still open for a photo
create policy "gift-photos: owner can upload to own open gift"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'gift-photos'
    and (storage.foldername(name))[1] = (select auth.uid())::text
    and exists (
      select 1 from public.gifts g
      where g.id::text = (storage.foldername(name))[2]
        and g.user_id = (select auth.uid())
        and g.production_status = 'not_started'
        and g.photo_status <> 'approved'
    )
  );

-- delete only files that are no longer the gift's current photo
create policy "gift-photos: owner can delete unused files"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'gift-photos'
    and (storage.foldername(name))[1] = (select auth.uid())::text
    and not exists (select 1 from public.gifts g where g.photo_path = name)
  );


-- ---------------------------------------------------------
-- order-photos
-- ---------------------------------------------------------

create policy "order-photos: owner can read"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'order-photos'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "order-photos: owner can upload"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'order-photos'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

-- a photo that belongs to an order can no longer be removed by the customer
create policy "order-photos: owner can delete unused files"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'order-photos'
    and (storage.foldername(name))[1] = (select auth.uid())::text
    and not exists (select 1 from public.order_items oi where oi.photo_path = name)
  );

-- no update policies: files are never overwritten in place (every upload gets a new random name)
