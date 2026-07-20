'use client'

import { useEffect, useState } from 'react'
import { useCityTime } from '@/components/layout/AmbientClock'

interface GeoResult {
  city:     string
  timezone: string
}

// Fetches the visitor's city + timezone via IP geolocation (no permission prompt).
// Returns null while loading or if the lookup fails.
function useVisitorGeo(): GeoResult | null {
  const [geo, setGeo] = useState<GeoResult | null>(null)

  useEffect(() => {
    let cancelled = false

    async function fetchGeo() {
      try {
        const res = await fetch('https://ipapi.co/json/', {
          signal: AbortSignal.timeout(5000),
        })
        if (!res.ok || cancelled) return
        const data = await res.json()
        const city     = typeof data.city     === 'string' ? data.city     : ''
        const timezone = typeof data.timezone === 'string' ? data.timezone : ''
        if (!city || !timezone) return
        if (!cancelled) setGeo({ city: city.toUpperCase().replace(/\s+/g, '_'), timezone })
      } catch {
        // Network error or timeout — hide label gracefully
      }
    }

    fetchGeo()
    return () => { cancelled = true }
  }, [])

  return geo
}

export default function VisitorClock() {
  const geo   = useVisitorGeo()
  const label = useCityTime(geo?.city ?? '', geo?.timezone ?? '')

  if (!label) return null

  return (
    <span
      className="text-caption font-light tracking-widest tabular-nums"
      style={{ color: 'var(--color-pewter)', opacity: 0.6 }}
      aria-hidden="true"
    >
      {label}
    </span>
  )
}
