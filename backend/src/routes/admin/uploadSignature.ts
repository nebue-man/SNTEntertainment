import { Router, Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import { generateUploadSignature } from '../../lib/cloudinary'
import { AppError } from '../../lib/errors'

const router = Router()

const QuerySchema = z.object({
  resourceType: z.enum(['image', 'video']).default('image'),
  folder: z.string().min(1).max(200).default('snt/uploads'),
})

// GET /api/admin/upload-signature?resourceType=image|video&folder=snt/hero-videos
router.get('/', (req: Request, res: Response, next: NextFunction) => {
  try {
    const query = QuerySchema.safeParse(req.query)
    if (!query.success) return next(query.error)

    const { resourceType, folder } = query.data
    const signature = generateUploadSignature(folder, resourceType)
    res.json({ data: signature })
  } catch (err) {
    next(new AppError('Failed to generate upload signature', 500))
  }
})

export default router
