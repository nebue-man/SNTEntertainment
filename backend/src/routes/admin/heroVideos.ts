import { Router, Request, Response, NextFunction } from 'express'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { randomUUID } from 'crypto'
import { prisma } from '../../lib/prisma'
import { AppError } from '../../lib/errors'

const router = Router()

const HERO_DIR = path.join(__dirname, '../../../uploads/hero')
fs.mkdirSync(HERO_DIR, { recursive: true })

const heroStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, HERO_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || '.mp4'
    cb(null, randomUUID() + ext)
  },
})

const heroUpload = multer({
  storage: heroStorage,
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

function deleteLocalFile(url: string | null) {
  if (!url) return
  try {
    const filename = path.basename(new URL(url).pathname)
    fs.unlink(path.join(HERO_DIR, filename), (err) => {
      if (err && err.code !== 'ENOENT') console.error('Failed to delete hero file:', err)
    })
  } catch {
    // ignore
  }
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
      if (!existing) {
        fs.unlink(req.file.path, () => {})
        return next(new AppError('Slot not found', 404))
      }

      // Delete previous file before overwriting
      deleteLocalFile(existing.videoUrl)

      const baseUrl = `${req.protocol}://${req.get('host')}`
      const videoUrl = `${baseUrl}/uploads/hero/${req.file.filename}`

      const updated = await prisma.heroVideoSlot.update({
        where: { slotNumber },
        data: { videoUrl, cloudinaryPublicId: null },
      })

      res.json({ data: updated })
    } catch (err) {
      // Clean up uploaded file if DB write fails
      if (req.file) fs.unlink(req.file.path, () => {})
      next(err)
    }
  }
)

// DELETE /api/admin/hero-videos/:slotNumber — clears the slot and deletes local file
router.delete('/:slotNumber', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const slotNumber = parseSlot(req.params.slotNumber)

    const existing = await prisma.heroVideoSlot.findUnique({ where: { slotNumber } })
    if (!existing) return next(new AppError('Slot not found', 404))

    deleteLocalFile(existing.videoUrl)

    const cleared = await prisma.heroVideoSlot.update({
      where: { slotNumber },
      data: { videoUrl: null, cloudinaryPublicId: null },
    })

    res.json({ data: cleared })
  } catch (err) {
    next(err)
  }
})

export default router
