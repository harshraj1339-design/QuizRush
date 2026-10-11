import { supabase } from '../lib/supabase'

const sessionKey = 'quizrush:activity-session'

function getSessionId() {
  try {
    let id = sessionStorage.getItem(sessionKey)
    if (!id) {
      id = typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : String(Date.now()) + '-' + Math.random().toString(36).slice(2)
      sessionStorage.setItem(sessionKey, id)
    }
    return id
  } catch { return String(Date.now()) + '-' + Math.random().toString(36).slice(2) }
}

export async function recordStudentActivity(student: { name: string; registration: string }, startedAt: number, secondsSpent: number) {
  const { error } = await supabase.from('student_activity_sessions').upsert({
    session_id: getSessionId(), student_name: student.name, registration_id: student.registration,
    started_at: new Date(startedAt).toISOString(), last_seen_at: new Date().toISOString(),
    seconds_spent: Math.max(0, Math.floor(secondsSpent)),
  }, { onConflict: 'session_id' })
  if (error) throw error
}
