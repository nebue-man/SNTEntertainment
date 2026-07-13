'use client'

import { useState, useMemo } from 'react'
import type { MediaItem } from '@/lib/types'
import EventFilter from '@/components/events/EventFilter'
import MediaCard from '@/components/media/MediaCard'

interface Props { items: MediaItem[] }

export default function EventsGallery({ items }: Props) {
  const [activeYear, setActiveYear] = useState<number | null>(null)
  const [activeType, setActiveType] = useState<'video' | 'photo' | null>(null)

  const years = useMemo(
    () => [...new Set(items.map((i) => i.year))].sort((a, b) => b - a),
    [items]
  )

  const filtered = useMemo(
    () =>
      items.filter(
        (i) =>
          (!activeYear || i.year === activeYear) &&
          (!activeType || i.type === activeType)
      ),
    [items, activeYear, activeType]
  )

  return (
    <div>
      <div className="mb-8">
        <EventFilter
          years={years}
          activeYear={activeYear}
          activeType={activeType}
          onYear={setActiveYear}
          onType={setActiveType}
        />
      </div>

      {filtered.length === 0 ? (
        <p className="text-body text-pewter py-16 text-center">No items match the selected filters.</p>
      ) : (
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
          {filtered.map((item) => (
            <div key={item.id} className="break-inside-avoid">
              <MediaCard item={item} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
