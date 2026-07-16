import { Router } from 'express'
import { requireAuth } from '../../middleware/auth'
import authRouter from './auth'
import eventsRouter from './events'
import phasesRouter from './phases'
import mediaRouter from './media'
import artistsRouter from './artists'
import ticketRequestsRouter from './ticketRequests'
import settingsRouter from './settings'
import heroVideosRouter from './heroVideos'
import uploadSignatureRouter from './uploadSignature'

const router = Router()

// Auth routes — login/logout don't require requireAuth (login sets it)
router.use('/auth', authRouter)

// All routes below require a valid admin session
router.use(requireAuth)

router.use('/events', eventsRouter)
router.use('/events/:eventId/phases', phasesRouter)
router.use('/events/:eventId/media', mediaRouter)
router.use('/events/:eventId/artists', artistsRouter)
router.use('/ticket-requests', ticketRequestsRouter)
router.use('/settings', settingsRouter)
router.use('/hero-videos', heroVideosRouter)
router.use('/upload-signature', uploadSignatureRouter)

export default router
