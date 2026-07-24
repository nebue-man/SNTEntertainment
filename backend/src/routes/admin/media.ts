import { Router, Request, Response, NextFunction } from 'express'
import multer from 'multer'
import { prisma } from '../../lib/prisma'
import { AppError } from '../../lib/errors'
import { uploadBuffer, deleteAsset } from '../../lib/cloudinary'
import { ReorderMediaSchema } from '../../schemas/media'

const router = Router({ mergeParams: true })

const mediaUpload = multer({
  storage: multer.memoryStorage(),
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
      if (!event) return next(new AppError('Event not found', 404))

      const maxOrder = await prisma.eventMedia.aggregate({
        where: { eventId: req.params.eventId },
        _max: { sortOrder: true },
      })
      let nextOrder = (maxOrder._max.sortOrder ?? -1) + 1

      // Upload all files to Cloudinary in parallel
      const uploads = await Promise.all(
        files.map((file) => uploadBuffer(file.buffer, 'image', { folder: 'snt/events' }))
      )

      // Persist DB records; clean up Cloudinary assets on failure
      let created
      try {
        created = await prisma.$transaction(
          uploads.map(({ url, publicId }) =>
            prisma.eventMedia.create({
              data: {
                eventId: req.params.eventId,
                type: 'PHOTO',
                url,
                cloudinaryPublicId: publicId,
                sortOrder: nextOrder++,
              },
            })
          )
        )
      } catch (err) {
        await Promise.all(uploads.map(({ publicId }) => deleteAsset(publicId, 'image')))
        throw err
      }

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
      select: { eventId: true, cloudinaryPublicId: true },
    })
    if (!media || media.eventId !== req.params.eventId) {
      return next(new AppError('Media not found for this event', 404))
    }

    await prisma.eventMedia.delete({ where: { id: req.params.mediaId } })

    if (media.cloudinaryPublicId) {
      await deleteAsset(media.cloudinaryPublicId, 'image')
    }

    res.json({ data: { ok: true } })
  } catch (err) {
    next(err)
  }
})

export default router
