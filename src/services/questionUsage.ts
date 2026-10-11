import type { CourseCode, QuizSession } from '../types'
import { readStorage, writeStorage } from './storage'

type UsageRecord = Record<string, string[]>
const storageKey = 'question-usage'

function scopeKey(registration: string, courseCode: CourseCode, unitNumber: number) {
  return [registration.trim().toUpperCase(), courseCode, unitNumber].join(':')
}

function readUsage(): UsageRecord {
  return readStorage<UsageRecord>(storageKey, {})
}

export function getUsedQuestionIds(registration: string, courseCode: CourseCode, units: number[]): Set<string> {
  const usage = readUsage()
  return new Set(units.flatMap(unit => usage[scopeKey(registration, courseCode, unit)] || []))
}

/** Called only after a quiz is submitted, never when it is merely opened. */
export function markQuestionsUsed(session: QuizSession): void {
  const usage = readUsage()
  for (const unit of session.units) {
    const key = scopeKey(session.registration, session.courseCode, unit)
    const ids = new Set(usage[key] || [])
    session.questions.filter(question => question.unitNumber === unit).forEach(question => ids.add(question.id))
    usage[key] = [...ids]
  }
  writeStorage(storageKey, usage)
}
