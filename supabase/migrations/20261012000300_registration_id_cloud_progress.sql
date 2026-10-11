-- Registration-ID-only cloud progress for QuizRush.
-- WARNING: registration IDs are identifiers, not authentication. Anyone who knows an ID
-- can read or overwrite that student's data through these public RPCs.
create table if not exists public.registration_student_data (
  registration_id text primary key check (registration_id ~ '^[0-9]{8}$'),
  student_name text not null check (char_length(trim(student_name)) between 2 and 80),
  attempts jsonb not null default '[]'::jsonb,
  active_session jsonb,
  question_usage jsonb not null default '{}'::jsonb,
  bookmarked_questions jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);
alter table public.registration_student_data enable row level security;
revoke all on public.registration_student_data from anon, authenticated;
grant select, insert, update, delete on public.registration_student_data to service_role;

create or replace function public.get_registration_student_data(p_registration_id text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare result jsonb;
begin
  if p_registration_id !~ '^[0-9]{8}$' then
    raise exception 'Invalid registration ID';
  end if;
  select jsonb_build_object(
    'registration_id', registration_id,
    'student_name', student_name,
    'attempts', attempts,
    'active_session', active_session,
    'question_usage', question_usage,
    'bookmarked_questions', bookmarked_questions,
    'updated_at', updated_at
  ) into result
  from public.registration_student_data
  where registration_id = p_registration_id;
  return result;
end;
$$;

create or replace function public.save_registration_student_data(
  p_registration_id text,
  p_student_name text,
  p_attempts jsonb default null,
  p_active_session jsonb default null,
  p_question_usage jsonb default null,
  p_bookmarked_questions jsonb default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare result jsonb;
begin
  if p_registration_id !~ '^[0-9]{8}$' then
    raise exception 'Invalid registration ID';
  end if;
  if char_length(trim(coalesce(p_student_name, ''))) not between 2 and 80 then
    raise exception 'Invalid student name';
  end if;

  insert into public.registration_student_data (
    registration_id, student_name, attempts, active_session, question_usage, bookmarked_questions, updated_at
  ) values (
    p_registration_id, trim(p_student_name),
    coalesce(p_attempts, '[]'::jsonb),
    p_active_session,
    coalesce(p_question_usage, '{}'::jsonb),
    coalesce(p_bookmarked_questions, '[]'::jsonb),
    now()
  )
  on conflict (registration_id) do update set
    student_name = excluded.student_name,
    attempts = coalesce(p_attempts, registration_student_data.attempts),
    active_session = case when p_active_session is null then registration_student_data.active_session else p_active_session end,
    question_usage = coalesce(p_question_usage, registration_student_data.question_usage),
    bookmarked_questions = coalesce(p_bookmarked_questions, registration_student_data.bookmarked_questions),
    updated_at = now();

  select jsonb_build_object(
    'registration_id', registration_id,
    'student_name', student_name,
    'attempts', attempts,
    'active_session', active_session,
    'question_usage', question_usage,
    'bookmarked_questions', bookmarked_questions,
    'updated_at', updated_at
  ) into result from public.registration_student_data where registration_id = p_registration_id;
  return result;
end;
$$;

revoke all on function public.get_registration_student_data(text) from public;
revoke all on function public.save_registration_student_data(text, text, jsonb, jsonb, jsonb, jsonb) from public;
grant execute on function public.get_registration_student_data(text) to anon, authenticated;
grant execute on function public.save_registration_student_data(text, text, jsonb, jsonb, jsonb, jsonb) to anon, authenticated;
