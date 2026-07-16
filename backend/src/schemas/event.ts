import { z } from 'zod'

const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

export const CreateEventSchema = z.object({
  title: z.string().min(1).max(200),
  slug: z.string().regex(slugRegex, 'Slug must be lowercase-hyphenated').optional(),
  description: z.string().min(1),
  venue: z.string().min(1).max(300),
  eventDate: z.string().datetime({ offset: true }),
  status: z.enum(['UPCOMING', 'PAST']),
  flyerUrl: z.string().url().nullable().optional(),
})

export const UpdateEventSchema = CreateEventSchema.partial()

export type CreateEventInput = z.infer<typeof CreateEventSchema>
export type UpdateEventInput = z.infer<typeof UpdateEventSchema>
