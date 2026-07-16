import { Router, Request, Response, NextFunction } from 'express'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { randomUUID } from 'crypto'
import { prisma } from '../../lib/prisma'
import { AppError } from '../../lib/errors'
import { ReorderMediaSchema } from '../../schemas/media'

const router = Router({ mergeParams: true })

const UPLOADS_DIR = path.join(__dirname, '../../../uploads/events')
fs.mkdirSync(UPLOADS_DIR, { recursive: true })

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOADS_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || '.jpg'
    cb(null, randomUUID() + ext)
  },
})

const mediaUpload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter(_req, file, cb) {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (allowed.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new AppError('File must be JPG, PNG, WEBP, or GIF', 400))
    }
  },
})

function deleteLocalFile(url: string) {
  try {
    const filename = path.basename(new URL(url).pathname)
    fs.unlink(path.join(UPLOADS_DIR, filename), (err) => {
      if (err && err.code !== 'ENOENT') console.error('Failed to delete file:', err)
    })
  } catch {
    // ignore parse errors
  }
}

// GET /api/admin/events/:eventId/media
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const media = await prisma.eventMedia.findMany({
      where: { eventId: req.params.eventId },
      orderBy: { sortOrder: 'asc' },
    })
    res.json({ data: media })
  } catch (err) {
    next(err)
  }
})

// POST /api/admin/events/:eventId/media — upload multiple photos (field: "photos")
router.post(
  '/',
  mediaUpload.array('photos', 20),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const files = req.files as Express.Multer.File[] | undefined
      if (!files || files.length === 0) return next(new AppError('At least one photo file is required', 400))

      const event = await prisma.event.findUnique({
        where: { id: req.params.eventId },
        select: { id: true },
      })
      if (!event) {
        // Clean up already-saved files before erroring
        for (const f of files) fs.unlink(f.path, () => {})
        return next(new AppError('Event not found', 404))
      }

      const maxOrder = await prisma.eventMedia.aggregate({
        where: { eventId: req.params.eventId },
        _max: { sortOrder: true },
      })
      let nextOrder = (maxOrder._max.sortOrder ?? -1) + 1

      const baseUrl = `${req.protocol}://${req.get('host')}`

      const created = await prisma.$transaction(
        files.map((file) => {
          const url = `${baseUrl}/uploads/events/${file.filename}`
          return prisma.eventMedia.create({
            data: {
              eventId: req.params.eventId,
              type: 'PHOTO',
              url,
              cloudinaryPublicId: '',
              sortOrder: nextOrder++,
            },
          })
        })
      )

      res.status(201).json({ data: created })
    } catch (err) {
      next(err)
    }
  }
)

// PATCH /api/admin/events/:eventId/media/reorder
router.patch('/reorder', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = ReorderMediaSchema.safeParse(req.body)
    if (!body.success) return next(body.error)

    const existing = await prisma.eventMedia.findMany({
      where: { eventId: req.params.eventId },
      select: { id: true },
    })
    const existingIds = new Set(existing.map((m) => m.id))
    for (const id of body.data.order) {
      if (!existingIds.has(id)) {
        return next(new AppError(`Media item ${id} not found for this event`, 400))
      }
    }

    await prisma.$transaction(
      body.data.order.map((id, idx) =>
        prisma.eventMedia.update({ where: { id }, data: { sortOrder: idx } })
      )
    )

    res.json({ data: { ok: true } })
  } catch (err) {
    next(err)
  }
})

// DELETE /api/admin/events/:eventId/media/:mediaId
router.delete('/:mediaId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const media = await prisma.eventMedia.findUnique({
      where: { id: req.params.mediaId },
      select: { eventId: true, url: true },
    })
    if (!media || media.eventId !== req.params.eventId) {
      return next(new AppError('Media not found for this event', 404))
    }

    deleteLocalFile(media.url)
    await prisma.eventMedia.delete({ where: { id: req.params.mediaId } })
    res.json({ data: { ok: true } })
  } catch (err) {
    next(err)
  }
})

export default router
