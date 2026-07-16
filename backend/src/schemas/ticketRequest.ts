import { z } from 'zod'

export const SubmitTicketRequestSchema = z.object({
  eventId: z.string().cuid(),
  phaseId: z.string().cuid(),
  email: z.string().email(),
})

export const UpdateTicketStatusSchema = z.object({
  status: z.enum(['CONFIRMED', 'REJECTED']),
  adminNotes: z.string().max(1000).optional(),
})

export type SubmitTicketRequestInput = z.infer<typeof SubmitTicketRequestSchema>
export type UpdateTicketStatusInput = z.infer<typeof UpdateTicketStatusSchema>
