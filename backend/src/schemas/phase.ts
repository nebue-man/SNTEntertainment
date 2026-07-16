import { z } from 'zod'

export const CreatePhaseSchema = z.object({
  name: z.string().min(1).max(100),
  price: z.number().positive(),
  currency: z.string().length(3).default('LKR'),
  quantityAvailable: z.number().int().positive(),
  isActive: z.boolean().default(true),
  sortOrder: z.number().int().min(0),
})

export const UpdatePhaseSchema = CreatePhaseSchema.partial()

export type CreatePhaseInput = z.infer<typeof CreatePhaseSchema>
export type UpdatePhaseInput = z.infer<typeof UpdatePhaseSchema>
