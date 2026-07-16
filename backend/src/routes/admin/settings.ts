import { Router, Request, Response, NextFunction } from 'express'
import { prisma } from '../../lib/prisma'
import { AppError } from '../../lib/errors'
import { ALLOWED_SETTING_KEYS, UpdateSettingSchema } from '../../schemas/settings'

const router = Router()

// GET /api/admin/settings
router.get('/', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const settings = await prisma.setting.findMany({
      where: { key: { in: [...ALLOWED_SETTING_KEYS] } },
    })
    const data = Object.fromEntries(settings.map((s) => [s.key, s.value]))
    res.json({ data })
  } catch (err) {
    next(err)
  }
})

// PUT /api/admin/settings/:key
router.put('/:key', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const key = req.params.key
    if (!(ALLOWED_SETTING_KEYS as readonly string[]).includes(key)) {
      return next(new AppError(`Unknown setting key: ${key}`, 400))
    }

    const body = UpdateSettingSchema.safeParse(req.body)
    if (!body.success) return next(body.error)

    const setting = await prisma.setting.upsert({
      where: { key },
      update: { value: body.data.value },
      create: { key, value: body.data.value },
    })

    res.json({ data: setting })
  } catch (err) {
    next(err)
  }
})

export default router
