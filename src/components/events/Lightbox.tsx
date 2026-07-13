'use client'

import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import type { MediaItem } from '@/lib/types'
import PlaceholderMedia from '@/components/ui/PlaceholderMedia'

interface Props {
  open: boolean
  onClose: () => void
  item: MediaItem | null
}

export default function Lightbox({ open, onClose, item }: Props) {
  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  return (
    <AnimatePresence>
      {open && item && (
        <motion.div
          className="fixed inset-0 z-[200] bg-absolute-zero/95 flex items-center justify-center p-4 md:p-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          role="dialog"
          aria-modal="true"
          aria-label={item.eventTitle}
          onClick={onClose}
        >
          <button
            className="absolute top-6 right-6 text-ghost-white hover:text-electric-lime transition-colors"
            onClick={onClose}
            aria-label="Close lightbox"
          >
            <X size={28} />
          </button>

          <motion.div
            className="w-full max-w-5xl"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
          >
            {item.src ? (
              item.type === 'video' ? (
                <video
                  src={item.src}
                  controls
                  autoPlay
                  className="w-full aspect-video"
                  aria-label={item.alt}
                />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={item.src} alt={item.alt} className="w-full max-h-[80vh] object-contain" />
              )
            ) : (
              <PlaceholderMedia label={item.eventTitle} type={item.type === 'photo' ? 'image' : 'video'} aspectRatio="16/9" />
            )}
            <div className="mt-4">
              <p className="text-body-sm text-ghost-white">{item.eventTitle}</p>
              <p className="text-caption text-pewter">{item.year}</p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
