'use client'

import { useEffect, useState } from 'react'

interface Props {
  loading: boolean
  error: boolean
  onRetry: () => void
}

export default function LoadingGate({ loading, error, onRetry }: Props) {
  const [mounted, setMounted] = useState(true)
  const [fading, setFading] = useState(false)

  useEffect(() => {
    if (!loading && !error) {
      setFading(true)
    }
  }, [loading, error])

  if (!mounted) return null

  return (
    <div
      className={`fixed inset-0 z-[9999] bg-absolute-zero transition-opacity duration-[350ms] ease-in-out ${
        fading ? 'opacity-0 pointer-events-none' : 'opacity-100 pointer-events-auto'
      }`}
      onTransitionEnd={() => {
        if (fading) setMounted(false)
      }}
    >
      {/* Thin shimmer bar — only while loading, not in error state */}
      {!error && (
        <div className="absolute top-0 left-0 right-0 h-px overflow-hidden bg-pewter/10">
          <div
            className="absolute top-0 left-0 h-full w-1/3 animate-progress-shimmer"
            style={{
              background: 'linear-gradient(90deg, transparent, #d3fd50 40%, #d3fd50 60%, transparent)',
            }}
          />
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-8">
          <p className="text-caption text-pewter tracking-widest uppercase">
            Connection failed
          </p>
          <button
            onClick={onRetry}
            className="text-caption text-electric-lime tracking-widest uppercase border border-electric-lime/40 px-8 py-3 hover:border-electric-lime hover:bg-electric-lime/5 transition-colors duration-200 cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}
    </div>
  )
}
