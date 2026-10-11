-- QuizRush student registry. Apply through Supabase SQL Editor or Supabase CLI.
create extension if not exists pgcrypto;

create table if not exists public.students (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(trim(name)) between 2 and 100),
  registration_id text not null unique check (char_length(trim(registration_id)) between 3 and 40),
  semester smallint not null default 3 check (semester = 3),
  created_at timestamptz not null default now()
);

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.students enable row level security;
alter table public.admin_users enable row level security;

-- Public visitors may register a name and ID, but cannot read the student directory.
-- Registration ID is not identity verification and must not be treated as a login credential.
create policy "Anyone can register a student profile"
  on public.students for insert to anon, authenticated
  with check (
    char_length(trim(name)) between 2 and 100
    and char_length(trim(registration_id)) between 3 and 40
    and semester = 3
  );

create policy "Admins can read student directory"
  on public.students for select to authenticated
  using (
    exists (select 1 from public.admin_users au where au.user_id = (select auth.uid()))
  );

create policy "Admins can read their own admin record"
  on public.admin_users for select to authenticated
  using (user_id = (select auth.uid()));

grant insert on public.students to anon, authenticated;
grant select on public.students to authenticated;
grant select on public.admin_users to authenticated;

create index if not exists students_created_at_idx on public.students (created_at desc);
