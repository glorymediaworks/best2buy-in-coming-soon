create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique not null,
  category text not null default 'Best2Buy product',
  description text not null default '',
  price_label text not null default 'Ask for price',
  product_url text not null default '',
  image_url text not null default '',
  published boolean not null default true,
  created_at timestamptz not null default now()
);
alter table public.products enable row level security;
drop policy if exists "Published products are public" on public.products;
create policy "Published products are public" on public.products for select using (published = true or auth.role() = 'authenticated');
drop policy if exists "Signed-in admins can add products" on public.products;
create policy "Signed-in admins can add products" on public.products for insert to authenticated with check (true);
drop policy if exists "Signed-in admins can edit products" on public.products;
create policy "Signed-in admins can edit products" on public.products for update to authenticated using (true) with check (true);
drop policy if exists "Signed-in admins can remove products" on public.products;
create policy "Signed-in admins can remove products" on public.products for delete to authenticated using (true);
insert into storage.buckets (id,name,public) values ('product-images','product-images',true) on conflict (id) do update set public=true;
drop policy if exists "Public can view product images" on storage.objects;
create policy "Public can view product images" on storage.objects for select using (bucket_id='product-images');
drop policy if exists "Signed-in admins can upload product images" on storage.objects;
create policy "Signed-in admins can upload product images" on storage.objects for insert to authenticated with check (bucket_id='product-images');
drop policy if exists "Signed-in admins can edit product images" on storage.objects;
create policy "Signed-in admins can edit product images" on storage.objects for update to authenticated using (bucket_id='product-images') with check (bucket_id='product-images');
drop policy if exists "Signed-in admins can delete product images" on storage.objects;
create policy "Signed-in admins can delete product images" on storage.objects for delete to authenticated using (bucket_id='product-images');
