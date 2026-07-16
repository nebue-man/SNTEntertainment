'use client'

import { useState } from 'react'
import { Play } from 'lucide-react'
import type { MediaItem } from '@/lib/types'
import PlaceholderMedia from '@/components/ui/PlaceholderMedia'
import Lightbox from '@/components/events/Lightbox'

interface Props { item: MediaItem }

export default function MediaCard({ item }: Props) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        className="group relative w-full border border-pewter/20 hover:border-ghost-white/60 transition-colors duration-300 overflow-hidden text-left"
        onClick={() => setOpen(true)}
        aria-label={`View ${item.eventTitle}`}
      >
        <div className="aspect-video relative">
          {(item.thumbnail || item.src) ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={item.thumbnail ?? item.src}
              alt={item.alt}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <PlaceholderMedia label={item.eventTitle} type={item.type === 'photo' ? 'image' : 'video'} aspectRatio="16/9" />
          )}
          {item.type === 'video' && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-12 h-12 rounded-full border border-ghost-white flex items-center justify-center bg-absolute-zero/60 group-hover:bg-electric-lime/20 transition-colors">
                <Play size={20} className="text-ghost-white ml-1" fill="white" />
              </div>
            </div>
          )}
        </div>
        <div className="p-4 border-t border-pewter/20">
          <p className="text-body-sm text-ghost-white truncate">{item.eventTitle}</p>
          <p className="text-caption text-pewter">{item.year}</p>
        </div>
      </button>

      <Lightbox
        open={open}
        onClose={() => setOpen(false)}
        item={item}
      />
    </>
  )
}
