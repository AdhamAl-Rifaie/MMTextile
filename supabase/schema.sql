create extension if not exists pgcrypto;

create table if not exists public.mmtextile_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  customer_name text not null,
  fabric_type text not null,
  created_at timestamptz not null default now()
);

alter table public.mmtextile_requests enable row level security;

drop policy if exists "Users can insert their own MMTextile requests"
on public.mmtextile_requests;

create policy "Users can insert their own MMTextile requests"
on public.mmtextile_requests
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Users can read their own MMTextile requests"
on public.mmtextile_requests;

create policy "Users can read their own MMTextile requests"
on public.mmtextile_requests
for select
to authenticated
using (auth.uid() = user_id);

create table if not exists public.mmtextile_products (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  category text not null default 'Home Towels',
  subcategory text not null default '',
  size text not null,
  shape text not null default 'Rectangle',
  weight text not null,
  color text not null default '#d7ad47',
  note text not null default '',
  created_at timestamptz not null default now()
);

alter table public.mmtextile_products enable row level security;

drop policy if exists "Anyone can read MMTextile products"
on public.mmtextile_products;

create policy "Anyone can read MMTextile products"
on public.mmtextile_products
for select
to anon, authenticated
using (true);

drop policy if exists "Authenticated users can insert MMTextile products"
on public.mmtextile_products;

create policy "Authenticated users can insert MMTextile products"
on public.mmtextile_products
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Users can update their own MMTextile products"
on public.mmtextile_products;

create policy "Users can update their own MMTextile products"
on public.mmtextile_products
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own MMTextile products"
on public.mmtextile_products;

create policy "Users can delete their own MMTextile products"
on public.mmtextile_products
for delete
to authenticated
using (auth.uid() = user_id);
