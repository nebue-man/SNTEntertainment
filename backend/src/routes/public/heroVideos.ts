import { Router, Request, Response, NextFunction } from 'express'
import { prisma } from '../../lib/prisma'

const router = Router()

// GET /api/hero-videos — only filled slots, ordered by slotNumber
router.get('/', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const slots = await prisma.heroVideoSlot.findMany({
      where: { videoUrl: { not: null } },
      select: { slotNumber: true, videoUrl: true },
      orderBy: { slotNumber: 'asc' },
    })
    res.json({ data: slots })
  } catch (err) {
    next(err)
  }
})

export default router
