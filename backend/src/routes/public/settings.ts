import { Router, Request, Response, NextFunction } from 'express'
import { prisma } from '../../lib/prisma'
import { ALLOWED_SETTING_KEYS } from '../../schemas/settings'

const router = Router()

// GET /api/settings — return bank / payment settings for the ticket request form
router.get('/', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const settings = await prisma.setting.findMany({
      where: { key: { in: [...ALLOWED_SETTING_KEYS] } },
      select: { key: true, value: true },
    })

    const data = Object.fromEntries(settings.map((s) => [s.key, s.value]))
    res.json({ data })
  } catch (err) {
    next(err)
  }
})

export default router
