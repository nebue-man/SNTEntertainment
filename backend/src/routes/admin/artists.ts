import { Router, Request, Response, NextFunction } from 'express'
import { prisma } from '../../lib/prisma'
import { AppError } from '../../lib/errors'
import { ReplaceArtistsSchema } from '../../schemas/artist'

const router = Router({ mergeParams: true })

// GET /api/admin/events/:eventId/artists
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const artists = await prisma.artist.findMany({
      where: { eventId: req.params.eventId },
      orderBy: { name: 'asc' },
    })
    res.json({ data: artists })
  } catch (err) {
    next(err)
  }
})

// PUT /api/admin/events/:eventId/artists — replace all artists for the event
router.put('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = ReplaceArtistsSchema.safeParse(req.body)
    if (!body.success) return next(body.error)

    const event = await prisma.event.findUnique({
      where: { id: req.params.eventId },
      select: { id: true },
    })
    if (!event) return next(new AppError('Event not found', 404))

    await prisma.$transaction([
      prisma.artist.deleteMany({ where: { eventId: req.params.eventId } }),
      prisma.artist.createMany({
        data: body.data.artists.map((a) => ({ ...a, eventId: req.params.eventId })),
      }),
    ])

    const artists = await prisma.artist.findMany({
      where: { eventId: req.params.eventId },
      orderBy: { name: 'asc' },
    })

    res.json({ data: artists })
  } catch (err) {
    next(err)
  }
})

export default router
