import type { Attempt, QuizSession, Student } from '../types'
import { calculateResult, isQuizSession } from './quiz'

const prefix = 'quizrush:v1:'

export function readStorage<Value>(key: string, fallback: Value): Value {
  try {
    const stored = localStorage.getItem(prefix + key)
    return stored ? JSON.parse(stored) as Value : fallback
  } catch { return fallback }
}

export function writeStorage(key: string, value: unknown): boolean {
  try {
    if (value === null) localStorage.removeItem(prefix + key)
    else localStorage.setItem(prefix + key, JSON.stringify(value))
    return true
  } catch {
    window.dispatchEvent(new CustomEvent('quizrush-storage-error'))
    return false
  }
}

export function getStudent(): Student | null {
  const student = readStorage<Student | null>('student', null)
  if (!student || typeof student.name !== 'string' || !student.name.trim() || typeof student.registration !== 'string' || !student.registration.trim() || student.semester !== 3) return null
  return student
}

export function getActiveSession(registration: string): QuizSession | null {
  const session = readStorage<unknown>('active', null)
  return isQuizSession(session) && session.registration === registration ? session : null
}

export function getCachedAttempts(): Attempt[] {
  const cached = readStorage<unknown>('attempts', [])
  if (!Array.isArray(cached)) return []
  return cached.filter((attempt): attempt is Attempt => isQuizSession(attempt) && typeof (attempt as Attempt).completedAt === 'string' && Number.isFinite(Date.parse((attempt as Attempt).completedAt)))
    .map(attempt => ({ ...calculateResult(attempt, Date.parse(attempt.completedAt)), synced: attempt.synced }))
}

export function getDeviceToken(registration: string) {
  const value = readStorage<unknown>('devices', {})
  const tokens: Record<string, string> = Object.assign(Object.create(null), value && typeof value === 'object' && !Array.isArray(value) ? value : {})
  if (typeof tokens[registration] !== 'string' || !/^[a-f0-9-]{73}$/.test(tokens[registration])) {
    tokens[registration] = `${crypto.randomUUID()}-${crypto.randomUUID()}`
    writeStorage('devices', tokens)
  }
  return tokens[registration]
}

export async function fetchAttempts(registration: string): Promise<Attempt[]> {
  const response = await fetch('/.netlify/functions/attempts', { headers: { 'x-quizrush-device': getDeviceToken(registration) } })
  if (!response.ok) throw new Error('History is available from this browser. Anonymous server storage is currently unavailable.')
  const payload: unknown = await response.json()
  if (!Array.isArray(payload)) throw new Error('History could not be loaded. Your browser copy is still available.')
  return payload.map(item => ({ ...item, registration, synced: true })).filter((item): item is Attempt => isQuizSession(item) && 'completedAt' in item && typeof item.completedAt === 'string' && Number.isFinite(Date.parse(item.completedAt)))
    .map(item => ({ ...calculateResult(item, Date.parse(item.completedAt)), synced: true }))
}

export async function persistAttempt(attempt: Attempt): Promise<void> {
  const response = await fetch('/.netlify/functions/attempts', {
    method: 'POST', headers: { 'Content-Type': 'application/json', 'x-quizrush-device': getDeviceToken(attempt.registration) },
    body: JSON.stringify({
      id: attempt.id, courseCode: attempt.courseCode, units: attempt.units,
      questionIds: attempt.questions.map(question => question.id), answers: attempt.answers,
      startedAt: attempt.startedAt, durationMinutes: attempt.durationMinutes, completedAt: attempt.completedAt,
    }),
  })
  if (!response.ok) throw new Error('Saved in this browser. Anonymous server storage is unavailable; retry from Quiz History.')
}

export function mergeAttempts(first: Attempt[], second: Attempt[]): Attempt[] {
  const attemptsById = new Map(first.map(attempt => [attempt.id, attempt]))
  for (const attempt of second) {
    const previous = attemptsById.get(attempt.id)
    attemptsById.set(attempt.id, { ...previous, ...attempt, synced: !!(previous?.synced || attempt.synced) })
  }
  return [...attemptsById.values()].sort((left, right) => Date.parse(right.completedAt) - Date.parse(left.completedAt)).slice(0, 500)
}
