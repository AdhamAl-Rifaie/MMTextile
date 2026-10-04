create extension if not exists pgcrypto;

create table if not exists public.mmtextile_requests (
  id uuid primary key default gen_random_uuid(),
  user_id text not null default 'local-admin',
  customer_name text not null,
  fabric_type text not null,
  created_at timestamptz not null default now()
);

alter table public.mmtextile_requests enable row level security;

drop policy if exists "Server key manages MMTextile requests"
on public.mmtextile_requests;

create policy "Server key manages MMTextile requests"
on public.mmtextile_requests
for all
using (false)
with check (false);

create table if not exists public.mmtextile_products (
  id text primary key,
  user_id text not null default 'local-admin',
  name text not null,
  category text not null default 'Home Towels',
  subcategory text not null default '',
  material text not null default 'Cotton 100%',
  size text not null default 'Custom size',
  shape text not null default 'Rectangle',
  weight text not null default 'Custom GSM',
  color text not null default '#d7ad47',
  note text not null default '',
  image_url text,
  variants jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz
);

alter table public.mmtextile_products enable row level security;

drop policy if exists "Anyone can read MMTextile products"
on public.mmtextile_products;

create policy "Anyone can read MMTextile products"
on public.mmtextile_products
for select
to anon, authenticated
using (true);

insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do update set public = excluded.public;

drop policy if exists "Anyone can read MMTextile product images"
on storage.objects;

create policy "Anyone can read MMTextile product images"
on storage.objects
for select
to anon, authenticated
using (bucket_id = 'product-images');
