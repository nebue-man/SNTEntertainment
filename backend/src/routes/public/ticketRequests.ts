import { Router, Request, Response, NextFunction } from 'express'
import multer from 'multer'
import { prisma } from '../../lib/prisma'
import { uploadBuffer, deleteAsset } from '../../lib/cloudinary'
import { AppError } from '../../lib/errors'
import { SubmitTicketRequestSchema } from '../../schemas/ticketRequest'

const router = Router()

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter(_req, file, cb) {
    const allowed = ['image/jpeg', 'image/png', 'application/pdf']
    if (allowed.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new AppError('Payment slip must be JPG, PNG, or PDF', 400))
    }
  },
})

// Per-email rate limiter: max 3 submissions per email per hour
const emailSubmissions = new Map<string, number[]>()
const EMAIL_WINDOW_MS = 60 * 60 * 1000
const EMAIL_MAX = 3

function checkEmailRateLimit(email: string): boolean {
  const now = Date.now()
  const times = (emailSubmissions.get(email) ?? []).filter(
    (t) => now - t < EMAIL_WINDOW_MS
  )
  if (times.length >= EMAIL_MAX) return false
  times.push(now)
  emailSubmissions.set(email, times)
  return true
}

// POST /api/ticket-requests
router.post(
  '/',
  upload.single('paymentSlip'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validate body fields (parsed after multer)
      const body = SubmitTicketRequestSchema.safeParse(req.body)
      if (!body.success) {
        return next(body.error)
      }
      const { eventId, phaseId, email } = body.data

      // Validate file
      if (!req.file) {
        return next(new AppError('Payment slip file is required', 400))
      }

      // Per-email rate limit (applied after body parse so email is available)
      if (!checkEmailRateLimit(email)) {
        return next(
          new AppError(
            `Too many requests from this email address. Max ${EMAIL_MAX} per hour.`,
            429
          )
        )
      }

      // Validate event exists and is UPCOMING
      const event = await prisma.event.findUnique({
        where: { id: eventId },
        select: { id: true, status: true },
      })
      if (!event) return next(new AppError('Event not found', 404))
      if (event.status !== 'UPCOMING') {
        return next(new AppError('This event is not accepting ticket requests', 400))
      }

      // Validate phase belongs to event and is active
      const phase = await prisma.ticketPhase.findUnique({
        where: { id: phaseId },
        select: { id: true, eventId: true, isActive: true, price: true },
      })
      if (!phase || phase.eventId !== eventId) {
        return next(new AppError('Ticket phase not found for this event', 404))
      }
      if (!phase.isActive) {
        return next(new AppError('This ticket phase is no longer available', 400))
      }

      // Upload payment slip to Cloudinary (proxied — never exposed to client)
      const resourceType = req.file.mimetype === 'application/pdf' ? 'raw' : 'image'
      const { url: paymentSlipUrl, publicId: paymentSlipPublicId } = await uploadBuffer(
        req.file.buffer,
        resourceType,
        { folder: 'snt/payment-slips' }
      )

      // Atomic: increment quantitySold and create TicketRequest in one transaction.
      // If quantitySold would exceed quantityAvailable the UPDATE affects 0 rows → sold out.
      let ticketRequest: { id: string; status: string; createdAt: Date } | null = null
      let soldOut = false

      try {
        ticketRequest = await prisma.$transaction(async (tx) => {
          const affected = await tx.$executeRaw`
            UPDATE "TicketPhase"
            SET "quantitySold" = "quantitySold" + 1
            WHERE id = ${phaseId}
              AND "quantitySold" < "quantityAvailable"
          `

          if (affected === 0) {
            soldOut = true
            throw new Error('SOLD_OUT')
          }

          return tx.ticketRequest.create({
            data: {
              eventId,
              phaseId,
              email,
              priceAtRequest: phase.price,
              paymentSlipUrl,
              paymentSlipPublicId,
              status: 'PENDING',
            },
            select: { id: true, status: true, createdAt: true },
          })
        })
      } catch (txErr) {
        // Clean up the uploaded slip regardless of why the transaction failed
        await deleteAsset(paymentSlipPublicId, resourceType)

        if (soldOut) {
          return next(new AppError('Sorry, this ticket phase is sold out', 409))
        }
        throw txErr
      }

      res.status(201).json({ data: ticketRequest })
    } catch (err) {
      next(err)
    }
  }
)

export default router
