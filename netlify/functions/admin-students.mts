import { asc, ilike, or } from 'drizzle-orm'
import { getDatabase } from '../../db/index.js'
import { students } from '../../db/schema.js'
import { isAdminSessionValid } from './shared/admin-session.js'

export default async (request: Request) => {
  const headers = { 'Cache-Control': 'no-store' }
  const respond = (body: unknown, status = 200) => Response.json(body, { status, headers })
  if (request.method !== 'GET') return respond({ error: 'Method not allowed.' }, 405)
  const secret = process.env.ADMIN_SESSION_SECRET
  if (!secret || secret.length < 32) return respond({ error: 'Admin access is not configured.' }, 503)
  if (!isAdminSessionValid(request, secret)) return respond({ error: 'Admin authentication required.' }, 401)

  const search = new URL(request.url).searchParams.get('search')?.trim().slice(0, 100)
  try {
    const database = getDatabase()
    const query = database.select({
      id: students.id,
      name: students.name,
      registrationId: students.registrationId,
      semester: students.semester,
      createdAt: students.createdAt,
    }).from(students)
    const rows = await (search
      ? query.where(or(ilike(students.name, `%${search.replace(/[%_\\\\]/g, '\\\\$&')}%`), ilike(students.registrationId, `%${search.replace(/[%_\\\\]/g, '\\\\$&')}%`)))
      : query).orderBy(asc(students.name)).limit(500)
    return respond({ students: rows, limit: 500 })
  } catch {
    return respond({ error: 'Student directory is temporarily unavailable.' }, 503)
  }
}
