import express from 'express'
import helmet from 'helmet'
import cors from 'cors'
import cookieParser from 'cookie-parser'

import { ticketRequestLimiter, loginLimiter } from './middleware/rateLimiter'
import { errorHandler } from './middleware/errorHandler'

import publicEventsRouter from './routes/public/events'
import publicSettingsRouter from './routes/public/settings'
import publicTicketRequestsRouter from './routes/public/ticketRequests'
import publicHeroVideosRouter from './routes/public/heroVideos'
import adminRouter from './routes/admin'

const app = express()

// ── Security headers ──────────────────────────────────────────────────────────
app.use(helmet())

// ── CORS ──────────────────────────────────────────────────────────────────────
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
)

// ── Body parsing ──────────────────────────────────────────────────────────────
app.use(express.json())
app.use(cookieParser())

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => res.json({ status: 'ok' }))

// ── Public API ────────────────────────────────────────────────────────────────
app.use('/api/events', publicEventsRouter)
app.use('/api/settings', publicSettingsRouter)
app.use('/api/hero-videos', publicHeroVideosRouter)
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
