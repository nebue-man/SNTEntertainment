import type { MediaItem } from '@/lib/types'

interface Props { item: MediaItem }

export default function MediaCard({ item }: Props) {
  return (
    <div className="aspect-video border border-pewter/30 flex items-center justify-center">
      <p className="text-caption text-pewter text-center px-4">{item.eventTitle}</p>
    </div>
  )
}
