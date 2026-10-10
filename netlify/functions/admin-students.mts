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
  const escapedSearch = search?.replace(/[\\%_]/g, '\\$&')
  try {
    const database = getDatabase()
    const columns = {
      id: students.id,
      name: students.name,
      registrationId: students.registrationId,
      semester: students.semester,
      createdAt: students.createdAt,
    }
    const rows = escapedSearch
      ? await database.select(columns).from(students)
          .where(or(
            ilike(students.name, `%${escapedSearch}%`),
            ilike(students.registrationId, `%${escapedSearch}%`),
          ))
          .orderBy(asc(students.name)).limit(500)
      : await database.select(columns).from(students).orderBy(asc(students.name)).limit(500)
    return respond({ students: rows, limit: 500 })
  } catch {
    return respond({ error: 'Student directory is temporarily unavailable.' }, 503)
  }
}
