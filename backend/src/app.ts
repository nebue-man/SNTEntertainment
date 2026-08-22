import express from 'express'
import helmet from 'helmet'
import cors from 'cors'
import cookieParser from 'cookie-parser'

import { ticketRequestLimiter, loginLimiter } from './middleware/rateLimiter'
import { errorHandler } from './middleware/errorHandler'
import { cacheMiddleware } from './middleware/cache'

import publicEventsRouter from './routes/public/events'
import publicSettingsRouter from './routes/public/settings'
import publicTicketRequestsRouter from './routes/public/ticketRequests'
import publicHeroVideosRouter from './routes/public/heroVideos'
import adminRouter from './routes/admin'

const app = express()

// ── Security headers ──────────────────────────────────────────────────────────
// crossOriginResourcePolicy must be 'cross-origin' because the frontend and
// backend run on different origins (different ports locally, different subdomains
// in production). The Helmet default 'same-origin' would block the browser from
// loading videos/images served by this backend from the frontend's origin.
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}))

// ── CORS ──────────────────────────────────────────────────────────────────────
// FRONTEND_URL may be a comma-separated list of allowed origins (useful for
// local dev where the static-export preview server runs on a different port
// than the Next.js dev server). In production this should be a single origin.
const allowedOrigins = (process.env.FRONTEND_URL ?? '')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean)

app.use(
  cors({
    origin: (incoming, cb) => {
      // Allow requests with no Origin header (same-origin / server-to-server)
      if (!incoming) return cb(null, true)
      if (allowedOrigins.includes(incoming)) return cb(null, true)
      cb(new Error(`Origin ${incoming} not allowed by CORS`))
    },
    credentials: true,
  })
)

// ── Body parsing ──────────────────────────────────────────────────────────────
app.use(express.json())
app.use(cookieParser())

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => res.json({ status: 'ok' }))

// ── Public API ────────────────────────────────────────────────────────────────
const cache = cacheMiddleware(60)
app.use('/api/events', cache, publicEventsRouter)
app.use('/api/settings', cache, publicSettingsRouter)
app.use('/api/hero-videos', cache, publicHeroVideosRouter)
app.use(
  '/api/ticket-requests',
  ticketRequestLimiter,
  publicTicketRequestsRouter
)

// ── Admin API ─────────────────────────────────────────────────────────────────
// Login rate limit applied specifically to the login endpoint
app.use('/api/admin/auth/login', loginLimiter)
app.use('/api/admin', adminRouter)

// ── 404 ───────────────────────────────────────────────────────────────────────
app.use((_req, res) => res.status(404).json({ error: 'Not found' }))

// ── Centralized error handler ─────────────────────────────────────────────────
app.use(errorHandler)

export default app
