import { Router, Request, Response, NextFunction } from 'express'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { randomUUID } from 'crypto'
import { prisma } from '../../lib/prisma'
import { AppError } from '../../lib/errors'
import { CreateEventSchema, UpdateEventSchema } from '../../schemas/event'

const router = Router()

const FLYERS_DIR = path.join(__dirname, '../../../uploads/flyers')
const EVENTS_DIR = path.join(__dirname, '../../../uploads/events')
fs.mkdirSync(FLYERS_DIR, { recursive: true })

const flyerStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, FLYERS_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || '.jpg'
    cb(null, randomUUID() + ext)
  },
})

const flyerUpload = multer({
  storage: flyerStorage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter(_req, file, cb) {
    if (['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new AppError('Flyer must be JPG, PNG, or WEBP', 400))
    }
  },
})

function deleteLocalFile(dir: string, url: string | null) {
  if (!url) return
  try {
    const filename = path.basename(new URL(url).pathname)
    fs.unlink(path.join(dir, filename), (err) => {
      if (err && err.code !== 'ENOENT') console.error('Failed to delete file:', err)
    })
  } catch {
    // ignore URL parse errors
  }
}

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
      if (!body.success) {
        if (req.file) fs.unlink(req.file.path, () => {})
        return next(body.error)
      }

      const { title, description, venue, eventDate, status, flyerUrl } = body.data
      let { slug } = body.data
      slug = slug ?? makeSlug(title)

      let resolvedFlyerUrl: string | null = flyerUrl ?? null
      if (req.file) {
        const baseUrl = `${req.protocol}://${req.get('host')}`
        resolvedFlyerUrl = `${baseUrl}/uploads/flyers/${req.file.filename}`
      }

      const event = await prisma.event.create({
        data: {
          slug,
          title,
          description,
          venue,
          eventDate: new Date(eventDate),
          status,
          flyerUrl: resolvedFlyerUrl,
        },
      })

      res.status(201).json({ data: event })
    } catch (err) {
      if (req.file) fs.unlink(req.file.path, () => {})
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
      if (!body.success) {
        if (req.file) fs.unlink(req.file.path, () => {})
        return next(body.error)
      }

      const existing = await prisma.event.findUnique({
        where: { id: req.params.id },
        select: { id: true, flyerUrl: true },
      })
      if (!existing) {
        if (req.file) fs.unlink(req.file.path, () => {})
        return next(new AppError('Event not found', 404))
      }

      const updateData: Record<string, unknown> = { ...body.data }
      if (body.data.eventDate) updateData.eventDate = new Date(body.data.eventDate)

      if (req.file) {
        deleteLocalFile(FLYERS_DIR, existing.flyerUrl)
        const baseUrl = `${req.protocol}://${req.get('host')}`
        updateData.flyerUrl = `${baseUrl}/uploads/flyers/${req.file.filename}`
      }

      const event = await prisma.event.update({
        where: { id: req.params.id },
        data: updateData,
      })

      res.json({ data: event })
    } catch (err) {
      if (req.file) fs.unlink(req.file.path, () => {})
      next(err)
    }
  }
)

// DELETE /api/admin/events/:id
router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const event = await prisma.event.findUnique({
      where: { id: req.params.id },
      include: { media: { select: { url: true } } },
    })
    if (!event) return next(new AppError('Event not found', 404))

    deleteLocalFile(FLYERS_DIR, event.flyerUrl)
    for (const m of event.media) {
      deleteLocalFile(EVENTS_DIR, m.url)
    }

    await prisma.event.delete({ where: { id: req.params.id } })
    res.json({ data: { ok: true } })
  } catch (err) {
    next(err)
  }
})

export default router
