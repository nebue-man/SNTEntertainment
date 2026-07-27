import { Request, Response, NextFunction } from 'express'
import { ZodError } from 'zod'
import { AppError } from '../lib/errors'

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  const isProd = process.env.NODE_ENV === 'production'

  if (err instanceof ZodError) {
    res.status(400).json({
      error: 'Validation failed',
      details: err.errors.map((e) => ({ path: e.path.join('.'), message: e.message })),
    })
    return
  }

  if (err instanceof AppError && err.isOperational) {
    res.status(err.statusCode).json({ error: err.message })
    return
  }

  // Unexpected error — log internally, never leak stack trace
  console.error('[unhandled error]', err)

  // Extract a readable message even when err is a plain object (e.g. Cloudinary
  // error objects which are not Error instances but do have a .message property).
  const devMessage =
    err instanceof Error
      ? err.message
      : err !== null && typeof err === 'object' && 'message' in err
      ? String((err as { message: unknown }).message)
      : String(err)

  res.status(500).json({
    error: isProd ? 'Internal server error' : devMessage,
  })
}
