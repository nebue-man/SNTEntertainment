import { z } from 'zod'

export const ALLOWED_SETTING_KEYS = [
  'bank_name',
  'account_name',
  'account_number',
  'branch',
  'payment_instructions',
] as const

export type SettingKey = typeof ALLOWED_SETTING_KEYS[number]

export const UpdateSettingSchema = z.object({
  value: z.string().min(1),
})

export type UpdateSettingInput = z.infer<typeof UpdateSettingSchema>
