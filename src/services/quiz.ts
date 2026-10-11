import type { Attempt, CourseCode, Question, QuizSession } from '../types'
import { questionBank } from '../data/questionBank'
import { subjects } from '../data/subjects'
import { getUsedQuestionIds } from './questionUsage'

export const QUIZ_LENGTH = 25

export function validateQuestionBank(bank: Question[]): string[] {
  const errors: string[] = []
  const seenIds = new Set<string>()
  for (const question of bank) {
    if (!question || typeof question !== 'object') { errors.push('A question is missing or is not an object.'); continue }
    if (typeof question.id !== 'string' || !question.id.trim() || seenIds.has(question.id)) errors.push(`Missing or duplicate question ID: ${question.id}`)
    seenIds.add(question.id)
    if (typeof question.text !== 'string' || !question.text.trim()) errors.push(`Missing question text: ${question.id}`)
    if (!subjects.some(subject => subject.code === question.courseCode && subject.units.some(unit => unit.number === question.unitNumber))) errors.push(`Invalid subject/unit: ${question.id}`)
    if (typeof question.topic !== 'string' || !question.topic.trim() || typeof question.explanation !== 'string' || !question.explanation.trim()) errors.push(`Missing topic or explanation: ${question.id}`)
    if (!['easy', 'medium', 'hard'].includes(question.difficulty) || !['conceptual', 'scenario-based', 'calculation-based'].includes(question.style)) errors.push(`Invalid metadata: ${question.id}`)
    if (!Array.isArray(question.options) || question.options.length !== 4 || new Set(question.options.map(option => option?.id)).size !== 4 || question.options.some(option => !option || typeof option.id !== 'string' || !option.id || typeof option.text !== 'string' || !option.text.trim())) errors.push(`Invalid options: ${question.id}`)
    if (typeof question.correctOptionId !== 'string' || !question.correctOptionId || !Array.isArray(question.options) || !question.options.some(option => option?.id === question.correctOptionId)) errors.push(`Invalid correct option: ${question.id}`)
  }
  return errors
}

export const bankErrors = validateQuestionBank(questionBank)
export const getQuestions = (code: CourseCode, units?: number[]) => questionBank.filter(question => question && typeof question === 'object' && question.courseCode === code && (!units || units.includes(question.unitNumber)))

export function shuffle<Item>(items: Item[]): Item[] {
  const shuffled = [...items]
  for (let index = shuffled.length - 1; index > 0; index--) {
    const randomIndex = Math.floor(Math.random() * (index + 1))
    ;[shuffled[index], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[index]]
  }
  return shuffled
}

/**
 * Choose 25 questions as evenly as possible across the selected units.
 * For example, 3 units contribute 9, 8, and 8 questions; 6 units contribute
 * 5, 4, 4, 4, 4, and 4. If a unit cannot fill its share, its remaining
 * places are redistributed to other selected units with available questions.
 */
function chooseBalancedQuestions(questions: Question[], units: number[], count: number): Question[] {
  const pools = new Map(units.map(unit => [unit, shuffle(questions.filter(question => question.unitNumber === unit))]))
  const selected: Question[] = []
  const used = new Set<string>()

  while (selected.length < count) {
    let addedThisRound = false
    for (const unit of units) {
      if (selected.length >= count) break
      const pool = pools.get(unit) ?? []
      const next = pool.find(question => !used.has(question.id))
      if (!next) continue
      selected.push(next)
      used.add(next.id)
      addedThisRound = true
    }
    if (!addedThisRound) break
  }

  return shuffle(selected)
}

export function createQuiz(courseCode: CourseCode, units: number[], durationMinutes: number, registration: string): QuizSession {
  if (bankErrors.length) throw new Error('The question bank failed validation. Please contact the administrator.')
  if (!units.length || new Set(units).size !== units.length || units.some(unit => !Number.isInteger(unit) || unit < 1 || unit > 6)) throw new Error('Choose valid, distinct units before starting your quiz.')
  if (!Number.isInteger(durationMinutes) || durationMinutes < 1 || durationMinutes > 120) throw new Error('Choose a time limit between 1 and 120 minutes.')
  const eligible = getQuestions(courseCode, units)
  if (eligible.length < QUIZ_LENGTH) throw new Error(`This selection currently has ${eligible.length} questions. At least ${QUIZ_LENGTH} are needed to start a quiz.`)

  const usedIds = getUsedQuestionIds(registration, courseCode, units)
  const unused = eligible.filter(question => !usedIds.has(question.id))
  // Prefer never-used questions. Only mix in used questions when fewer than 25
  // unused questions remain across the selected units.
  const selectionPool = unused.length >= QUIZ_LENGTH ? unused : [...unused, ...shuffle(eligible.filter(question => usedIds.has(question.id)))]
  const questions = chooseBalancedQuestions(selectionPool, units, QUIZ_LENGTH)
  if (questions.length !== QUIZ_LENGTH) throw new Error('There are not enough distinct questions across the selected units to build a quiz.')

  return {
    id: crypto.randomUUID(), courseCode, units: [...units].sort((first, second) => first - second),
    questions: questions.map(question => ({ ...question, options: shuffle(question.options) as Question['options'] })),
    answers: {}, currentIndex: 0, startedAt: Date.now(), durationMinutes, registration,
  }
}

export function calculateResult(session: QuizSession, now = Date.now()): Attempt {
  const correct = session.questions.filter(question => session.answers[question.id] === question.correctOptionId).length
  const answered = session.questions.filter(question => question.options.some(option => option.id === session.answers[question.id])).length
  return {
    ...session, completedAt: new Date(now).toISOString(), correct, incorrect: answered - correct,
    unanswered: session.questions.length - answered, score: correct,
    accuracy: Math.round(correct / session.questions.length * 100),
    timeTaken: Math.max(0, Math.min(Math.floor((now - session.startedAt) / 1000), session.durationMinutes * 60)),
  }
}

export function formatTime(seconds: number) {
  const safeSeconds = Math.max(0, Math.floor(seconds))
  return `${String(Math.floor(safeSeconds / 60)).padStart(2, '0')}:${String(safeSeconds % 60).padStart(2, '0')}`
}

export function isQuizSession(value: unknown): value is QuizSession {
  if (!value || typeof value !== 'object') return false
  const session = value as QuizSession
  return typeof session.id === 'string' && subjects.some(subject => subject.code === session.courseCode)
    && Array.isArray(session.units) && session.units.length > 0 && session.units.every(unit => Number.isInteger(unit) && unit >= 1 && unit <= 6)
    && Array.isArray(session.questions) && session.questions.length === 25 && validateQuestionBank(session.questions).length === 0
    && session.questions.every(question => question.courseCode === session.courseCode && session.units.includes(question.unitNumber))
    && !!session.answers && typeof session.answers === 'object' && !Array.isArray(session.answers)
    && Object.entries(session.answers).every(([id, answer]) => session.questions.some(question => question.id === id && question.options.some(option => option.id === answer)))
    && Number.isFinite(session.startedAt) && Number.isInteger(session.durationMinutes) && session.durationMinutes >= 1 && session.durationMinutes <= 120
    && Number.isInteger(session.currentIndex) && session.currentIndex >= 0 && session.currentIndex < 25
    && typeof session.registration === 'string'
}
