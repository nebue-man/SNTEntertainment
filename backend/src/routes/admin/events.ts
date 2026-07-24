import { Router, Request, Response, NextFunction } from 'express'
import multer from 'multer'
import { prisma } from '../../lib/prisma'
import { AppError } from '../../lib/errors'
import { uploadBuffer, deleteAsset } from '../../lib/cloudinary'
import { CreateEventSchema, UpdateEventSchema } from '../../schemas/event'

const router = Router()

const flyerUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter(_req, file, cb) {
    if (['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new AppError('Flyer must be JPG, PNG, or WEBP', 400))
    }
  },
})

function makeSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/[\s]+/g, '-')
}

// GET /api/admin/events
router.get('/', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const events = await prisma.event.findMany({
      select: {
        id: true,
        slug: true,
        title: true,
        venue: true,
        eventDate: true,
        status: true,
        flyerUrl: true,
        createdAt: true,
        _count: { select: { ticketRequests: true } },
      },
      orderBy: [{ status: 'asc' }, { eventDate: 'desc' }],
    })
    res.json({ data: events })
  } catch (err) {
    next(err)
  }
})

// GET /api/admin/events/:id
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const event = await prisma.event.findUnique({
      where: { id: req.params.id },
      include: {
        artists: true,
        media: { orderBy: { sortOrder: 'asc' } },
        phases: { orderBy: { sortOrder: 'asc' } },
        _count: { select: { ticketRequests: true } },
      },
    })
    if (!event) return next(new AppError('Event not found', 404))
    res.json({ data: event })
  } catch (err) {
    next(err)
  }
})

// POST /api/admin/events
router.post(
  '/',
  flyerUpload.single('flyer'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const body = CreateEventSchema.safeParse(req.body)
      if (!body.success) return next(body.error)

      const { title, description, venue, eventDate, status, flyerUrl } = body.data
      let { slug } = body.data
      slug = slug ?? makeSlug(title)

      let resolvedFlyerUrl: string | null = flyerUrl ?? null
      let resolvedFlyerPublicId: string | null = null

      if (req.file) {
        const result = await uploadBuffer(req.file.buffer, 'image', { folder: 'snt/flyers' })
        resolvedFlyerUrl = result.url
        resolvedFlyerPublicId = result.publicId
      }

      let event
      try {
        event = await prisma.event.create({
          data: {
            slug,
            title,
            description,
            venue,
            eventDate: new Date(eventDate),
            status,
            flyerUrl: resolvedFlyerUrl,
            flyerPublicId: resolvedFlyerPublicId,
          },
        })
      } catch (err) {
        if (resolvedFlyerPublicId) await deleteAsset(resolvedFlyerPublicId, 'image')
        throw err
      }

      res.status(201).json({ data: event })
    } catch (err) {
      next(err)
    }
  }
)

// PATCH /api/admin/events/:id
router.patch(
  '/:id',
  flyerUpload.single('flyer'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const body = UpdateEventSchema.safeParse(req.body)
      if (!body.success) return next(body.error)

      const existing = await prisma.event.findUnique({
        where: { id: req.params.id },
        select: { id: true, flyerUrl: true, flyerPublicId: true },
      })
      if (!existing) return next(new AppError('Event not found', 404))

      const updateData: Record<string, unknown> = { ...body.data }
      if (body.data.eventDate) updateData.eventDate = new Date(body.data.eventDate)

      if (req.file) {
        // Upload new flyer; delete old Cloudinary asset if there was one
        const result = await uploadBuffer(req.file.buffer, 'image', { folder: 'snt/flyers' })

        if (existing.flyerPublicId) {
          await deleteAsset(existing.flyerPublicId, 'image')
        }

        updateData.flyerUrl = result.url
        updateData.flyerPublicId = result.publicId
      }

      let event
      try {
        event = await prisma.event.update({
          where: { id: req.params.id },
          data: updateData,
        })
      } catch (err) {
        // DB write failed — clean up the newly uploaded flyer
        if (req.file && updateData.flyerPublicId) {
          await deleteAsset(updateData.flyerPublicId as string, 'image')
        }
        throw err
      }

      res.json({ data: event })
    } catch (err) {
      next(err)
    }
  }
)

// DELETE /api/admin/events/:id
router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const event = await prisma.event.findUnique({
      where: { id: req.params.id },
      select: {
        id: true,
        flyerPublicId: true,
        media: { select: { cloudinaryPublicId: true, type: true } },
      },
    })
    if (!event) return next(new AppError('Event not found', 404))

    await prisma.event.delete({ where: { id: req.params.id } })

    // Best-effort Cloudinary cleanup after DB delete succeeds
    if (event.flyerPublicId) {
      await deleteAsset(event.flyerPublicId, 'image')
    }
    await Promise.all(
      event.media
        .filter((m) => m.cloudinaryPublicId)
        .map((m) => deleteAsset(m.cloudinaryPublicId, m.type === 'VIDEO' ? 'video' : 'image'))
    )

    res.json({ data: { ok: true } })
  } catch (err) {
    next(err)
  }
})

export default router
