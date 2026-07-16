import { Router, Request, Response, NextFunction } from 'express'
import { prisma } from '../../lib/prisma'
import { AppError } from '../../lib/errors'
import { CreatePhaseSchema, UpdatePhaseSchema } from '../../schemas/phase'

const router = Router({ mergeParams: true })

// GET /api/admin/events/:eventId/phases
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const phases = await prisma.ticketPhase.findMany({
      where: { eventId: req.params.eventId },
      orderBy: { sortOrder: 'asc' },
    })
    res.json({ data: phases })
  } catch (err) {
    next(err)
  }
})

// POST /api/admin/events/:eventId/phases
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = CreatePhaseSchema.safeParse(req.body)
    if (!body.success) return next(body.error)

    const event = await prisma.event.findUnique({
      where: { id: req.params.eventId },
      select: { id: true },
    })
    if (!event) return next(new AppError('Event not found', 404))

    const phase = await prisma.ticketPhase.create({
      data: { ...body.data, eventId: req.params.eventId },
    })
    res.status(201).json({ data: phase })
  } catch (err) {
    next(err)
  }
})

// PATCH /api/admin/events/:eventId/phases/:phaseId
router.patch('/:phaseId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = UpdatePhaseSchema.safeParse(req.body)
    if (!body.success) return next(body.error)

    const phase = await prisma.ticketPhase.findUnique({
      where: { id: req.params.phaseId },
      select: { eventId: true },
    })
    if (!phase || phase.eventId !== req.params.eventId) {
      return next(new AppError('Phase not found for this event', 404))
    }

    const updated = await prisma.ticketPhase.update({
      where: { id: req.params.phaseId },
      data: body.data,
    })
    res.json({ data: updated })
  } catch (err) {
    next(err)
  }
})

// DELETE /api/admin/events/:eventId/phases/:phaseId
router.delete('/:phaseId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const phase = await prisma.ticketPhase.findUnique({
      where: { id: req.params.phaseId },
      select: { eventId: true, _count: { select: { requests: true } } },
    })
    if (!phase || phase.eventId !== req.params.eventId) {
      return next(new AppError('Phase not found for this event', 404))
    }
    if (phase._count.requests > 0) {
      return next(
        new AppError(
          'Cannot delete a phase that has ticket requests. Deactivate it instead.',
          409
        )
      )
    }

    await prisma.ticketPhase.delete({ where: { id: req.params.phaseId } })
    res.json({ data: { ok: true } })
  } catch (err) {
    next(err)
  }
})

export default router
