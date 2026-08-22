import { Request, Response, NextFunction } from 'express'
import { redis } from '../lib/redis'

/**
 * TTL-based response cache middleware backed by Redis.
 *
 * Cache key = full request URL (path + query string), so
 * /api/events?status=upcoming and /api/events?status=past are distinct.
 *
 * Graceful degradation: if Redis is unavailable for any reason, the request
 * proceeds normally against the database — no error is surfaced to the client.
 */
export function cacheMiddleware(ttlSeconds = 60) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // Only cache GET requests
    if (req.method !== 'GET' || !redis) {
      return next()
    }

    const key = `cache:${req.originalUrl}`

    // ── Cache read ──────────────────────────────────────────────────────────
    try {
      const hit = await redis.get(key)
      if (hit !== null) {
        res.setHeader('X-Cache', 'HIT')
        res.json(JSON.parse(hit))
        return
      }
    } catch (err) {
      console.warn('[redis] cache read failed, falling back to DB:', (err as Error).message)
      return next()
    }

    // ── Cache write — intercept res.json ────────────────────────────────────
    const originalJson = res.json.bind(res)
    res.json = (body: unknown): Response => {
      // Only cache successful responses
      if (res.statusCode >= 200 && res.statusCode < 300) {
        redis
          .set(key, JSON.stringify(body), 'EX', ttlSeconds)
          .catch((err: Error) => {
            console.warn('[redis] cache write failed:', err.message)
          })
      }
      res.setHeader('X-Cache', 'MISS')
      return originalJson(body)
    }

    next()
  }
}
