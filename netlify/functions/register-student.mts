import { randomUUID } from 'node:crypto'
import { getDatabase } from '../../db/index.js'
import { students } from '../../db/schema.js'

export default async (request: Request) => {
  const headers = { 'Cache-Control': 'no-store' }
  const respond = (body: unknown, status = 200) => Response.json(body, { status, headers })
  if (request.method !== 'POST') return respond({ error: 'Method not allowed.' }, 405)

  let input: unknown
  try {
    const raw = await request.text()
    if (raw.length > 5000) return respond({ error: 'Request is too large.' }, 413)
    input = JSON.parse(raw)
  } catch {
    return respond({ error: 'Invalid JSON.' }, 400)
  }
  if (!input || typeof input !== 'object') return respond({ error: 'Invalid registration.' }, 400)

  const raw = input as Record<string, unknown>
  const name = typeof raw.name === 'string' ? raw.name.trim().replace(/\\s+/g, ' ') : ''
  const registrationId = typeof raw.registrationId === 'string' ? raw.registrationId.trim().toUpperCase() : ''
  if (name.length < 2 || name.length > 100 || !/^[\\p{L}][\\p{L} .'-]{1,99}$/u.test(name)) {
    return respond({ error: 'Enter a valid full name (2–100 characters).' }, 400)
  }
  if (registrationId.length < 3 || registrationId.length > 40 || !/^[A-Z0-9][A-Z0-9/-]*$/.test(registrationId)) {
    return respond({ error: 'Enter a valid registration ID (3–40 letters, numbers, hyphens, or slashes).' }, 400)
  }
  if (raw.semester !== 3 && raw.semester !== '3') return respond({ error: 'QuizRush currently supports Semester 3 only.' }, 400)

  try {
    const database = getDatabase()
    const [student] = await database.insert(students).values({
      id: randomUUID(),
      name,
      registrationId,
      semester: '3',
    }).returning({
      id: students.id,
      name: students.name,
      registrationId: students.registrationId,
      semester: students.semester,
      createdAt: students.createdAt,
    })
    return respond({ student }, 201)
  } catch (error) {
    const message = error instanceof Error ? error.message : ''
    if (/unique|duplicate/i.test(message)) return respond({ error: 'This registration ID is already registered. If this is your ID, contact the administrator.' }, 409)
    return respond({ error: 'Registration storage is unavailable. Please try again later.' }, 503)
  }
}
