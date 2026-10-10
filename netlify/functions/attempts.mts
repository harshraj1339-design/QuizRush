import { createHash } from 'node:crypto'
import { desc, eq } from 'drizzle-orm'
import { getDatabase } from '../../db/index.js'
import { quizAttempts } from '../../db/schema.js'
import { questionBank } from '../../src/data/questionBank.js'
import { calculateResult } from '../../src/services/quiz.js'
import type { Question, QuizSession } from '../../src/types.js'

export default async (request: Request) => {
  const headers = { 'Cache-Control': 'no-store' }
  const respond = (body: unknown, status = 200) => Response.json(body, { status, headers })
  const deviceToken = request.headers.get('x-quizrush-device')
  if (!deviceToken || !/^[a-f0-9-]{73}$/.test(deviceToken)) return respond({ error: 'A valid anonymous device key is required.' }, 400)
  const deviceHash = createHash('sha256').update(deviceToken).digest('hex')
  try {
    const database = getDatabase()
    if (request.method === 'GET') {
      const rows = await database.select({ result: quizAttempts.result }).from(quizAttempts).where(eq(quizAttempts.deviceHash, deviceHash)).orderBy(desc(quizAttempts.completedAt)).limit(200)
      return respond(rows.map(row => row.result))
    }
    if (request.method !== 'POST') return respond({ error: 'Method not allowed.' }, 405)
    const rawText = await request.text()
    if (rawText.length > 40000) return respond({ error: 'Attempt exceeds the size limit.' }, 413)
    let input: unknown
    try { input = JSON.parse(rawText) } catch { return respond({ error: 'Invalid JSON.' }, 400) }
    if (!input || typeof input !== 'object') return respond({ error: 'Invalid attempt.' }, 400)
    const raw = input as Record<string, unknown>
    if (typeof raw.id !== 'string' || !/^[a-f0-9-]{36}$/.test(raw.id) || !Array.isArray(raw.questionIds) || raw.questionIds.length !== 25 || new Set(raw.questionIds).size !== 25
      || !Array.isArray(raw.units) || raw.units.length < 1 || raw.units.length > 6 || raw.units.some(unit => !Number.isInteger(unit) || Number(unit) < 1 || Number(unit) > 6)
      || typeof raw.startedAt !== 'number' || !Number.isFinite(raw.startedAt) || raw.startedAt > Date.now() + 60000 || raw.startedAt < 0
      || typeof raw.durationMinutes !== 'number' || !Number.isInteger(raw.durationMinutes) || raw.durationMinutes < 1 || raw.durationMinutes > 120
      || typeof raw.completedAt !== 'string' || !Number.isFinite(Date.parse(raw.completedAt)) || Date.parse(raw.completedAt) < raw.startedAt || Date.parse(raw.completedAt) > Date.now() + 60000
      || !raw.answers || typeof raw.answers !== 'object' || Array.isArray(raw.answers)) return respond({ error: 'Invalid attempt configuration.' }, 400)
    const units = raw.units as number[]
    const questions: Question[] = []
    const answers: Record<string, string> = {}
    for (const id of raw.questionIds) {
      const question = questionBank.find(item => item.id === id && item.courseCode === raw.courseCode && units.includes(item.unitNumber))
      if (!question) return respond({ error: 'A question is not in the selected subject and units.' }, 400)
      questions.push(question)
      const answer = (raw.answers as Record<string, unknown>)[question.id]
      if (answer !== undefined) {
        if (typeof answer !== 'string' || !question.options.some(option => option.id === answer)) return respond({ error: 'Invalid answer option.' }, 400)
        answers[question.id] = answer
      }
    }
    const session: Omit<QuizSession, 'registration'> = {
      id: raw.id, courseCode: questions[0].courseCode, units, questions, answers,
      currentIndex: 0, startedAt: raw.startedAt, durationMinutes: raw.durationMinutes,
    }
    const { registration: omitted, ...result } = calculateResult({ ...session, registration: '' }, Date.parse(raw.completedAt))
    void omitted
    await database.insert(quizAttempts).values({ id: result.id, deviceHash, courseCode: result.courseCode, result, completedAt: new Date(result.completedAt) }).onConflictDoNothing()
    return respond({ id: result.id }, 201)
  } catch {
    return respond({ error: 'Anonymous history storage is temporarily unavailable. Your browser copy is still available.' }, 503)
  }
}
