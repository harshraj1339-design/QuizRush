import type { Attempt, QuizSession, Student } from '../types'
import { supabase } from '../lib/supabase'

export type RegistrationCloudData = {
  registration_id: string
  student_name: string
  attempts: Attempt[]
  active_session: QuizSession | null
  question_usage: Record<string, string[]>
  bookmarked_questions: string[]
  updated_at?: string
}

export async function fetchRegistrationData(registration: string): Promise<RegistrationCloudData | null> {
  const { data, error } = await supabase.rpc('get_registration_student_data', { p_registration_id: registration })
  if (error) throw error
  return (data as RegistrationCloudData | null) ?? null
}

export async function saveRegistrationData(student: Student, values: Partial<RegistrationCloudData>): Promise<RegistrationCloudData> {
  const { data, error } = await supabase.rpc('save_registration_student_data', {
    p_registration_id: student.registration,
    p_student_name: student.name,
    p_attempts: values.attempts === undefined ? null : values.attempts,
    p_active_session: values.active_session === undefined ? null : values.active_session,
    p_question_usage: values.question_usage === undefined ? null : values.question_usage,
    p_bookmarked_questions: values.bookmarked_questions === undefined ? null : values.bookmarked_questions,
    p_clear_active: values.clear_active ?? false,
  })
  if (error) throw error
  return data as RegistrationCloudData
}
