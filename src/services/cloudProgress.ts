import type { Attempt, QuizSession, Student } from '../types'
import { supabase } from '../lib/supabase'

type CloudProgress = { active_session: QuizSession | null; question_usage: Record<string, string[]>; bookmarked_questions: string[] }

export async function fetchCloudStudent(userId: string): Promise<Student | null> {
  const { data, error } = await supabase.from('student_profiles').select('user_id,email,name,registration_id,semester').eq('user_id', userId).maybeSingle()
  if (error) throw error
  if (!data) return null
  return { userId: data.user_id, email: data.email, name: data.name, registration: data.registration_id, semester: 3 }
}

export async function fetchCloudAttempts(userId: string): Promise<Attempt[]> {
  const { data, error } = await supabase.from('quiz_attempts').select('payload').eq('user_id', userId).order('completed_at', { ascending: false }).limit(500)
  if (error) throw error
  return (data ?? []).map(row => row.payload as Attempt)
}

export async function saveCloudAttempt(userId: string, attempt: Attempt): Promise<void> {
  const { error } = await supabase.from('quiz_attempts').upsert({
    user_id: userId, id: attempt.id, payload: attempt, completed_at: attempt.completedAt, updated_at: new Date().toISOString(),
  }, { onConflict: 'user_id,id' })
  if (error) throw error
}

export async function fetchCloudProgress(userId: string): Promise<CloudProgress> {
  const { data, error } = await supabase.from('quiz_progress').select('active_session,question_usage,bookmarked_questions').eq('user_id', userId).maybeSingle()
  if (error) throw error
  return {
    active_session: (data?.active_session as QuizSession | null) ?? null,
    question_usage: (data?.question_usage as Record<string, string[]>) ?? {},
    bookmarked_questions: (data?.bookmarked_questions as string[]) ?? [],
  }
}

export async function saveCloudProgress(userId: string, values: Partial<CloudProgress>): Promise<void> {
  const current = await fetchCloudProgress(userId)
  const { error } = await supabase.from('quiz_progress').upsert({
    user_id: userId,
    active_session: values.active_session === undefined ? current.active_session : values.active_session,
    question_usage: values.question_usage ?? current.question_usage,
    bookmarked_questions: values.bookmarked_questions ?? current.bookmarked_questions,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'user_id' })
  if (error) throw error
}
