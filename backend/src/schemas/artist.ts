import { z } from 'zod'

export const ArtistSchema = z.object({
  name: z.string().min(1).max(200),
  role: z.string().min(1).max(100),
})

export const ReplaceArtistsSchema = z.object({
  artists: z.array(ArtistSchema).min(1),
})

export type ArtistInput = z.infer<typeof ArtistSchema>
export type ReplaceArtistsInput = z.infer<typeof ReplaceArtistsSchema>
