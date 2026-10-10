import { createHmac, timingSafeEqual } from 'node:crypto'

const COOKIE = 'quizrush_admin'

export function isAdminSessionValid(request: Request, secret: string) {
  const cookie = request.headers.get('cookie') ?? ''
  const token = cookie.split(';').map(part => part.trim()).find(part => part.startsWith(COOKIE + '='))?.slice(COOKIE.length + 1)
  if (!token) return false
  const [payload, suppliedSignature] = token.split('.')
  if (!payload || !suppliedSignature) return false
  const expected = createHmac('sha256', secret).update(payload).digest('base64url')
  const left = Buffer.from(expected)
  const right = Buffer.from(suppliedSignature)
  if (left.length !== right.length || !timingSafeEqual(left, right)) return false
  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as { exp?: number; role?: string }
    return data.role === 'admin' && typeof data.exp === 'number' && data.exp > Date.now()
  } catch { return false }
}
