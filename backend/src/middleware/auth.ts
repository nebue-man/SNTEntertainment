import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { AppError } from '../lib/errors'

interface JwtPayload {
  adminId: string
}

declare global {
  namespace Express {
    interface Request {
      admin?: { id: string }
    }
  }
}

export function requireAuth(req: Request, _res: Response, next: NextFunction): void {
  try {
    const secret = process.env.JWT_SECRET!

    // Prefer httpOnly cookie; fall back to Bearer header
    let token: string | undefined = req.cookies?.token

    if (!token) {
      const authHeader = req.headers.authorization
      if (authHeader?.startsWith('Bearer ')) {
        token = authHeader.slice(7)
      }
    }

    if (!token) {
      return next(new AppError('Authentication required', 401))
    }

    const payload = jwt.verify(token, secret) as JwtPayload
    req.admin = { id: payload.adminId }
    next()
  } catch {
    next(new AppError('Invalid or expired token', 401))
  }
}
