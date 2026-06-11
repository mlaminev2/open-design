interface RateLimitEntry {
  count: number
  resetAt: number
}

// In-memory store (single instance). For multi-instance deploys, use Redis.
const store = new Map<string, RateLimitEntry>()

const GC_INTERVAL = 60_000
setInterval(() => {
  const now = Date.now()
  store.forEach((entry, key) => {
    if (entry.resetAt <= now) store.delete(key)
  })
}, GC_INTERVAL).unref?.()

export interface RateLimitOptions {
  /** Max requests allowed in the window */
  limit: number
  /** Window duration in seconds */
  windowSec: number
}

export interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetAt: number
}

export function rateLimit(key: string, opts: RateLimitOptions): RateLimitResult {
  const now = Date.now()
  const windowMs = opts.windowSec * 1000
  const entry = store.get(key)

  if (!entry || entry.resetAt <= now) {
    store.set(key, { count: 1, resetAt: now + windowMs })
    return { allowed: true, remaining: opts.limit - 1, resetAt: now + windowMs }
  }

  if (entry.count >= opts.limit) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt }
  }

  entry.count++
  return { allowed: true, remaining: opts.limit - entry.count, resetAt: entry.resetAt }
}

/** Extract a stable identifier from a request for rate-limiting */
export function getClientKey(request: Request, suffix: string): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const ip = forwarded ? forwarded.split(',')[0].trim() : 'unknown'
  return `${suffix}:${ip}`
}
