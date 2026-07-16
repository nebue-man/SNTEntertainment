import { Router, Request, Response, NextFunction } from 'express'
import { prisma } from '../../lib/prisma'
import { AppError } from '../../lib/errors'
import { UpdateTicketStatusSchema } from '../../schemas/ticketRequest'

const router = Router()

// GET /api/admin/ticket-requests?eventId=&status=&page=&limit=
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { eventId, status, page = '1', limit = '20' } = req.query as Record<string, string>

    const take = Math.min(parseInt(limit) || 20, 100)
    const skip = (Math.max(parseInt(page) || 1, 1) - 1) * take

    const where: Record<string, unknown> = {}
    if (eventId) where.eventId = eventId
    if (status && ['PENDING', 'CONFIRMED', 'REJECTED'].includes(status)) {
      where.status = status
    }

    const [requests, total] = await Promise.all([
      prisma.ticketRequest.findMany({
        where,
        select: {
          id: true,
          email: true,
          status: true,
          priceAtRequest: true,
          adminNotes: true,
          createdAt: true,
          updatedAt: true,
          event: { select: { id: true, slug: true, title: true } },
          phase: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: 'desc' },
        take,
        skip,
      }),
      prisma.ticketRequest.count({ where }),
    ])

    res.json({ data: requests, meta: { total, page: parseInt(page) || 1, limit: take } })
  } catch (err) {
    next(err)
  }
})

// GET /api/admin/ticket-requests/:id
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const request = await prisma.ticketRequest.findUnique({
      where: { id: req.params.id },
      include: {
        event: { select: { id: true, slug: true, title: true } },
        phase: { select: { id: true, name: true, price: true } },
      },
    })
    if (!request) return next(new AppError('Ticket request not found', 404))

    res.json({ data: request })
  } catch (err) {
    next(err)
  }
})

// PATCH /api/admin/ticket-requests/:id/status
router.patch('/:id/status', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = UpdateTicketStatusSchema.safeParse(req.body)
    if (!body.success) return next(body.error)

    const existing = await prisma.ticketRequest.findUnique({
      where: { id: req.params.id },
      select: { id: true },
    })
    if (!existing) return next(new AppError('Ticket request not found', 404))

    const updated = await prisma.ticketRequest.update({
      where: { id: req.params.id },
      data: { status: body.data.status, adminNotes: body.data.adminNotes },
      select: {
        id: true,
        status: true,
        adminNotes: true,
        updatedAt: true,
      },
    })

    res.json({ data: updated })
  } catch (err) {
    next(err)
  }
})

export default router
