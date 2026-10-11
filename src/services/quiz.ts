import type { Attempt, CourseCode, Question, QuizSession } from '../types'
import { questionBank } from '../data/questionBank'
import { subjects } from '../data/subjects'
import { getUsedQuestionIds } from './questionUsage'

export const QUIZ_LENGTH = 25

export function validateQuestionBank(bank: Question[]): string[] {
  const errors: string[] = []
  const seenIds = new Set<string>()
  const seenTexts = new Set<string>()
  for (const question of bank) {
    if (!question || typeof question !== 'object') { errors.push('A question is missing or is not an object.'); continue }
    if (typeof question.id !== 'string' || !question.id.trim() || seenIds.has(question.id)) errors.push(`Missing or duplicate question ID: ${question.id}`)
    seenIds.add(question.id)
    const normalizedText = typeof question.text === 'string' ? question.text.trim().toLowerCase() : ''
    if (!normalizedText || seenTexts.has(`${question.courseCode}:${normalizedText}`)) errors.push(`Missing or duplicate question text: ${question.id}`)
    seenTexts.add(`${question.courseCode}:${normalizedText}`)
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

export function createQuiz(courseCode: CourseCode, units: number[], durationMinutes: number, registration: string): QuizSession {
  if (!units.length || new Set(units).size !== units.length || units.some(unit => !Number.isInteger(unit) || unit < 1 || unit > 6)) throw new Error('Choose valid, distinct units before starting your quiz.')
  if (!Number.isInteger(durationMinutes) || durationMinutes < 1 || durationMinutes > 120) throw new Error('Choose a time limit between 1 and 120 minutes.')
  const eligible = getQuestions(courseCode, units)
  if (eligible.length < QUIZ_LENGTH) throw new Error(`This selection currently has ${eligible.length} questions. At least ${QUIZ_LENGTH} are needed to start a quiz.`)

  // Exclude malformed questions from the selected units, while allowing valid
  // questions to be used even if other rows in that bank need review.
  const seenIds = new Set<string>()
  const seenTexts = new Set<string>()
  const validEligible = eligible.filter(question => {
    const textKey = `${question.courseCode}:${typeof question.text === 'string' ? question.text.trim().toLowerCase() : ''}`
    const duplicate = seenIds.has(question.id) || seenTexts.has(textKey)
    const invalid = validateQuestionBank([question]).length > 0
    seenIds.add(question.id)
    seenTexts.add(textKey)
    if (duplicate || invalid) {
      console.warn('Skipping invalid question:', question.id, { duplicate, invalid })
      return false
    }
    return true
  })

  if (validEligible.length < QUIZ_LENGTH) {
    throw new Error(`Only ${validEligible.length} valid questions are available in the selected units; at least ${QUIZ_LENGTH} are needed.`)
  }

  const usedIds = getUsedQuestionIds(registration, courseCode, units)
  const unused = validEligible.filter(question => !usedIds.has(question.id))
  const selectionPool = unused.length >= QUIZ_LENGTH ? unused : [...unused, ...shuffle(validEligible.filter(question => usedIds.has(question.id)))]
  return {
    id: crypto.randomUUID(), courseCode, units: [...units].sort((first, second) => first - second),
    questions: shuffle(selectionPool).slice(0, QUIZ_LENGTH).map(question => ({ ...question, options: shuffle(question.options) as Question['options'] })),
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
