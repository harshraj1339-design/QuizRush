-- Authenticated, owner-scoped progress storage for QuizRush.
-- Apply this migration in the Supabase SQL Editor before deploying the frontend.

create table if not exists public.student_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  name text not null check (char_length(trim(name)) between 2 and 80),
  registration_id text not null unique check (registration_id ~ '^[0-9]{8}$'),
  semester smallint not null default 3 check (semester = 3),
  updated_at timestamptz not null default now()
);

create table if not exists public.quiz_attempts (
  id text not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  payload jsonb not null,
  completed_at timestamptz not null,
  updated_at timestamptz not null default now(),
  primary key (user_id, id)
);

create table if not exists public.quiz_progress (
  user_id uuid primary key references auth.users(id) on delete cascade,
  active_session jsonb,
  question_usage jsonb not null default '{}'::jsonb,
  bookmarked_questions jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.student_profiles enable row level security;
alter table public.quiz_attempts enable row level security;
alter table public.quiz_progress enable row level security;

create policy "Students read own profile" on public.student_profiles
  for select to authenticated using (user_id = (select auth.uid()));
create policy "Students create own profile" on public.student_profiles
  for insert to authenticated with check (user_id = (select auth.uid()));
create policy "Students update own profile" on public.student_profiles
  for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

create policy "Students manage own attempts" on public.quiz_attempts
  for all to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "Students manage own progress" on public.quiz_progress
  for all to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

grant select, insert, update on public.student_profiles to authenticated;
grant select, insert, update, delete on public.quiz_attempts to authenticated;
grant select, insert, update, delete on public.quiz_progress to authenticated;
