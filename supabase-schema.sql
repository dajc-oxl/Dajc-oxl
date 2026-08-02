-- ============================================================
-- DAJC OXL — Schema da base de dados
-- Cola este ficheiro inteiro no Supabase: SQL Editor > New query > Run
-- ============================================================

-- Perfis de utilizador (estende auth.users com dados próprios)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  email text not null,
  kyc_status text not null default 'pending', -- pending | approved | rejected
  bi_photo_url text,
  selfie_photo_url text,
  is_admin boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Perfis são visíveis para todos" on public.profiles
  for select using (true);

create policy "Utilizador cria o próprio perfil" on public.profiles
  for insert with check (auth.uid() = id);

create policy "Utilizador edita o próprio perfil" on public.profiles
  for update using (auth.uid() = id);

-- Anúncios
create table if not exists public.listings (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  description text,
  price numeric not null,
  category text not null,
  location text not null,
  photo_url text,
  status text not null default 'active', -- active | sold | removed
  created_at timestamptz not null default now()
);

alter table public.listings enable row level security;

create policy "Anúncios ativos são visíveis para todos" on public.listings
  for select using (true);

create policy "Só utilizadores com KYC aprovado podem publicar" on public.listings
  for insert with check (
    auth.uid() = seller_id
    and exists (select 1 from public.profiles p where p.id = auth.uid() and p.kyc_status = 'approved')
  );

create policy "Vendedor edita os próprios anúncios" on public.listings
  for update using (auth.uid() = seller_id);

create policy "Vendedor apaga os próprios anúncios" on public.listings
  for delete using (auth.uid() = seller_id);

-- Administradores podem gerir tudo (anúncios e KYC)
create policy "Admins gerem anúncios" on public.listings
  for all using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true)
  );

create policy "Admins gerem perfis" on public.profiles
  for update using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true)
  );

-- ============================================================
-- Storage: bucket para fotos (anúncios, BI, selfies)
-- ============================================================
insert into storage.buckets (id, name, public)
values ('dajc-oxl-photos', 'dajc-oxl-photos', true)
on conflict (id) do nothing;

create policy "Fotos públicas para leitura" on storage.objects
  for select using (bucket_id = 'dajc-oxl-photos');

create policy "Utilizadores autenticados podem enviar fotos" on storage.objects
  for insert with check (bucket_id = 'dajc-oxl-photos' and auth.role() = 'authenticated');

-- ============================================================
-- Para te tornares administrador depois de criares a tua conta:
-- 1. Regista-te normalmente no site
-- 2. Vem aqui ao SQL Editor e corre (troca o e-mail pelo teu):
--
-- update public.profiles set is_admin = true where email = 'o-teu-email@exemplo.com';
-- ============================================================
