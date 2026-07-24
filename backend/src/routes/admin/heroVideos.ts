import { Router, Request, Response, NextFunction } from 'express'
import multer from 'multer'
import { prisma } from '../../lib/prisma'
import { AppError } from '../../lib/errors'
import { uploadBuffer, deleteAsset } from '../../lib/cloudinary'

const router = Router()

const heroUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 200 * 1024 * 1024 },
  fileFilter(_req, file, cb) {
    if (file.mimetype.startsWith('video/')) {
      cb(null, true)
    } else {
      cb(new AppError('File must be a video (MP4, WebM, MOV, etc.)', 400))
    }
  },
})

function parseSlot(raw: string): number {
  const n = parseInt(raw, 10)
  if (!Number.isInteger(n) || n < 1 || n > 5) throw new AppError('slotNumber must be 1–5', 400)
  return n
}

// GET /api/admin/hero-videos — all 5 slots (including empty)
router.get('/', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const slots = await prisma.heroVideoSlot.findMany({
      orderBy: { slotNumber: 'asc' },
    })
    res.json({ data: slots })
  } catch (err) {
    next(err)
  }
})

// PATCH /api/admin/hero-videos/:slotNumber — upload video file (field: "video")
router.patch(
  '/:slotNumber',
  heroUpload.single('video'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const slotNumber = parseSlot(req.params.slotNumber)
      if (!req.file) return next(new AppError('Video file is required', 400))

      const existing = await prisma.heroVideoSlot.findUnique({ where: { slotNumber } })
      if (!existing) return next(new AppError('Slot not found', 404))

      // Upload new video to Cloudinary
      const { url, publicId } = await uploadBuffer(req.file.buffer, 'video', { folder: 'snt/hero' })

      // Delete previous Cloudinary asset (best-effort, after new upload succeeds)
      if (existing.cloudinaryPublicId) {
        await deleteAsset(existing.cloudinaryPublicId, 'video')
      }

      let updated
      try {
        updated = await prisma.heroVideoSlot.update({
          where: { slotNumber },
          data: { videoUrl: url, cloudinaryPublicId: publicId },
        })
      } catch (err) {
        // DB write failed — clean up the just-uploaded Cloudinary asset
        await deleteAsset(publicId, 'video')
        throw err
      }

      res.json({ data: updated })
    } catch (err) {
      next(err)
    }
  }
)

// DELETE /api/admin/hero-videos/:slotNumber — clears the slot and deletes Cloudinary asset
router.delete('/:slotNumber', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const slotNumber = parseSlot(req.params.slotNumber)

    const existing = await prisma.heroVideoSlot.findUnique({ where: { slotNumber } })
    if (!existing) return next(new AppError('Slot not found', 404))

    const cleared = await prisma.heroVideoSlot.update({
      where: { slotNumber },
      data: { videoUrl: null, cloudinaryPublicId: null },
    })

    if (existing.cloudinaryPublicId) {
      await deleteAsset(existing.cloudinaryPublicId, 'video')
    }

    res.json({ data: cleared })
  } catch (err) {
    next(err)
  }
})

export default router
