-- Approximate active website time for QuizRush admin analytics.
-- Registration IDs are self-entered; this is not verified attendance.
create table if not exists public.student_activity_sessions (
  session_id text primary key,
  student_name text not null,
  registration_id text not null check (registration_id ~ '^[0-9]{8}$'),
  started_at timestamptz not null,
  last_seen_at timestamptz not null default now(),
  seconds_spent integer not null default 0 check (seconds_spent >= 0),
  updated_at timestamptz not null default now()
);
alter table public.student_activity_sessions enable row level security;
drop policy if exists "Visitors record activity" on public.student_activity_sessions;
create policy "Visitors record activity" on public.student_activity_sessions for insert to anon, authenticated with check (seconds_spent >= 0 and char_length(registration_id) = 8);
drop policy if exists "Visitors update activity" on public.student_activity_sessions;
create policy "Visitors update activity" on public.student_activity_sessions for update to anon, authenticated using (true) with check (seconds_spent >= 0 and char_length(registration_id) = 8);
drop policy if exists "Admins read activity" on public.student_activity_sessions;
create policy "Admins read activity" on public.student_activity_sessions for select to authenticated using (exists (select 1 from public.admin_users a where a.user_id = (select auth.uid())));
grant insert, update on public.student_activity_sessions to anon, authenticated;
grant select on public.student_activity_sessions to authenticated;
