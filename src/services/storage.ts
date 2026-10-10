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

export async function fetchAttempts(_registration: string): Promise<Attempt[]> {
  // Quiz history currently remains local to this browser until authenticated student accounts are implemented.
  return []
}

export async function persistAttempt(_attempt: Attempt): Promise<void> {
  // Intentionally local-only: registration ID is not an authentication credential.
}

export function mergeAttempts(first: Attempt[], second: Attempt[]): Attempt[] {
  const attemptsById = new Map(first.map(attempt => [attempt.id, attempt]))
  for (const attempt of second) {
    const previous = attemptsById.get(attempt.id)
    attemptsById.set(attempt.id, { ...previous, ...attempt, synced: !!(previous?.synced || attempt.synced) })
  }
  return [...attemptsById.values()].sort((left, right) => Date.parse(right.completedAt) - Date.parse(left.completedAt)).slice(0, 500)
}
