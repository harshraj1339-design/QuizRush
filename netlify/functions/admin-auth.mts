import { createHmac, timingSafeEqual } from 'node:crypto'

const COOKIE = 'quizrush_admin'
const MAX_AGE_SECONDS = 60 * 60 * 8

function signature(payload: string, secret: string) {
  return createHmac('sha256', secret).update(payload).digest('base64url')
}
function safeEqual(a: string, b: string) {
  const left = Buffer.from(a)
  const right = Buffer.from(b)
  return left.length === right.length && timingSafeEqual(left, right)
}
function validSession(request: Request, secret: string) {
  const cookie = request.headers.get('cookie') ?? ''
  const token = cookie.split(';').map(part => part.trim()).find(part => part.startsWith(COOKIE + '='))?.slice(COOKIE.length + 1)
  if (!token) return false
  const [payload, suppliedSignature] = token.split('.')
  if (!payload || !suppliedSignature || !safeEqual(signature(payload, secret), suppliedSignature)) return false
  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as { exp?: number; role?: string }
    return data.role === 'admin' && typeof data.exp === 'number' && data.exp > Date.now()
  } catch { return false }
}

export default async (request: Request) => {
  const headers = { 'Cache-Control': 'no-store' }
  const respond = (body: unknown, status = 200, extra: Record<string, string> = {}) =>
    Response.json(body, { status, headers: { ...headers, ...extra } })
  const password = process.env.ADMIN_PASSWORD
  const secret = process.env.ADMIN_SESSION_SECRET
  if (!password || password.length < 12 || !secret || secret.length < 32) {
    return respond({ error: 'Admin access is not configured. Set ADMIN_PASSWORD (12+ characters) and ADMIN_SESSION_SECRET (32+ characters) in Netlify environment variables.' }, 503)
  }

  if (request.method === 'GET') return respond({ authenticated: validSession(request, secret) })
  if (request.method === 'DELETE') {
    return respond({ authenticated: false }, 200, {
      'Set-Cookie': `${COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0`,
    })
  }
  if (request.method !== 'POST') return respond({ error: 'Method not allowed.' }, 405)

  let input: unknown
  try {
    const raw = await request.text()
    if (raw.length > 3000) return respond({ error: 'Request is too large.' }, 413)
    input = JSON.parse(raw)
  } catch { return respond({ error: 'Invalid JSON.' }, 400) }
  const supplied = input && typeof input === 'object' ? (input as Record<string, unknown>).password : undefined
  if (typeof supplied !== 'string' || supplied.length > 300 || !safeEqual(supplied, password)) {
    return respond({ error: 'Invalid admin password.' }, 401)
  }

  const payload = Buffer.from(JSON.stringify({ role: 'admin', exp: Date.now() + MAX_AGE_SECONDS * 1000 })).toString('base64url')
  const token = `${payload}.${signature(payload, secret)}`
  return respond({ authenticated: true }, 200, {
    'Set-Cookie': `${COOKIE}=${token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${MAX_AGE_SECONDS}`,
  })
}
