import { Router, Request, Response, NextFunction } from 'express'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { z } from 'zod'
import { prisma } from '../../lib/prisma'
import { AppError } from '../../lib/errors'
import { requireAuth } from '../../middleware/auth'

const router = Router()

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

// POST /api/admin/auth/login
router.post('/login', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = LoginSchema.safeParse(req.body)
    if (!body.success) return next(body.error)

    const { email, password } = body.data

    const admin = await prisma.admin.findUnique({ where: { email } })

    // Constant-time comparison even on miss — prevents user-enumeration timing attacks
    const hash = admin?.passwordHash ?? '$2b$12$invalidhashpadding000000000000000000000000000000000000'
    const match = await bcrypt.compare(password, hash)

    if (!admin || !match) {
      return next(new AppError('Invalid credentials', 401))
    }

    const secret = process.env.JWT_SECRET!
    const expiresIn = process.env.JWT_EXPIRES_IN ?? '10h'
    const token = jwt.sign({ adminId: admin.id }, secret, { expiresIn } as jwt.SignOptions)

    res
      .cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 10 * 60 * 60 * 1000, // 10 h in ms
      })
      .json({ data: { token } })
  } catch (err) {
    next(err)
  }
})

// POST /api/admin/auth/logout
router.post('/logout', requireAuth, (_req: Request, res: Response) => {
  res.clearCookie('token').json({ data: { ok: true } })
})

// GET /api/admin/auth/me
router.get('/me', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const admin = await prisma.admin.findUnique({
      where: { id: req.admin!.id },
      select: { id: true, email: true, createdAt: true },
    })
    if (!admin) return next(new AppError('Admin not found', 404))
    res.json({ data: admin })
  } catch (err) {
    next(err)
  }
})

export default router
