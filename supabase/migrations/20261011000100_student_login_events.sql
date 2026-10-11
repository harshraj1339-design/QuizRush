-- Log each successful QuizRush onboarding/login submission, including returning students.
create table if not exists public.student_login_events (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(trim(name)) between 2 and 100),
  registration_id text not null check (registration_id ~ '^[0-9]{8}$'),
  logged_in_at timestamptz not null default now()
);

alter table public.student_login_events enable row level security;

create policy "Visitors can record a login event"
  on public.student_login_events for insert to anon, authenticated
  with check (
    char_length(trim(name)) between 2 and 100
    and registration_id ~ '^[0-9]{8}$'
  );

create policy "Admins can read login events"
  on public.student_login_events for select to authenticated
  using (
    exists (select 1 from public.admin_users au where au.user_id = (select auth.uid()))
  );

grant insert on public.student_login_events to anon, authenticated;
grant select on public.student_login_events to authenticated;
create index if not exists student_login_events_logged_in_at_idx
  on public.student_login_events (logged_in_at desc);
