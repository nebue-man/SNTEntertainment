import { Router, Request, Response, NextFunction } from 'express'
import { prisma } from '../../lib/prisma'
import { AppError } from '../../lib/errors'

const router = Router()

// GET /api/events?status=upcoming|past — list events filtered by status
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const rawStatus = (req.query.status as string | undefined)?.toUpperCase()
    const statusFilter =
      rawStatus === 'UPCOMING' || rawStatus === 'PAST' ? rawStatus : undefined

    const events = await prisma.event.findMany({
      where: statusFilter ? { status: statusFilter } : undefined,
      select: {
        id: true,
        slug: true,
        title: true,
        venue: true,
        eventDate: true,
        status: true,
        flyerUrl: true,
        artists: { select: { name: true, role: true }, orderBy: { name: 'asc' } },
        media: {
          where: { type: 'PHOTO' },
          select: { id: true, type: true, url: true, sortOrder: true },
          orderBy: { sortOrder: 'asc' },
        },
        phases: {
          where: { isActive: true },
          select: {
            id: true,
            name: true,
            price: true,
            currency: true,
            quantityAvailable: true,
            quantitySold: true,
            sortOrder: true,
          },
          orderBy: { sortOrder: 'asc' },
        },
      },
      orderBy: [{ status: 'asc' }, { eventDate: 'desc' }],
    })

    res.json({ data: events })
  } catch (err) {
    next(err)
  }
})

// GET /api/events/:slug — single event with full media
router.get('/:slug', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const event = await prisma.event.findUnique({
      where: { slug: req.params.slug },
      select: {
        id: true,
        slug: true,
        title: true,
        description: true,
        venue: true,
        eventDate: true,
        status: true,
        flyerUrl: true,
        artists: { select: { name: true, role: true }, orderBy: { name: 'asc' } },
        media: {
          select: { id: true, type: true, url: true, sortOrder: true },
          orderBy: { sortOrder: 'asc' },
        },
        phases: {
          where: { isActive: true },
          select: {
            id: true,
            name: true,
            price: true,
            currency: true,
            quantityAvailable: true,
            quantitySold: true,
            sortOrder: true,
          },
          orderBy: { sortOrder: 'asc' },
        },
      },
    })

    if (!event) {
      return next(new AppError('Event not found', 404))
    }

    res.json({ data: event })
  } catch (err) {
    next(err)
  }
})

export default router
