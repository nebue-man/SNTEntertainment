import { z } from 'zod'

export const ReorderMediaSchema = z.object({
  order: z.array(z.string()).min(1),
})

export type ReorderMediaInput = z.infer<typeof ReorderMediaSchema>
