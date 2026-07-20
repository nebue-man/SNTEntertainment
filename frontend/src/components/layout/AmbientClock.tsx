'use client'

import { useEffect, useState } from 'react'

function formatCityTime(date: Date, timezone: string): string {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: timezone,
    hour:     '2-digit',
    minute:   '2-digit',
    second:   '2-digit',
    hour12:   false,
  }).formatToParts(date)
  const get = (type: string) => parts.find(p => p.type === type)?.value ?? '00'
  return `${get('hour')}:${get('minute')}:${get('second')}`
}

// Hook reused by VisitorClock — returns "CITY_HH:MM:SS" updated every second.
// Returns empty string until mounted (avoids SSR/hydration mismatch).
export function useCityTime(city: string, timezone: string): string {
  const [label, setLabel] = useState('')

  useEffect(() => {
    if (!city || !timezone) return
    function tick() {
      setLabel(`${city}_${formatCityTime(new Date(), timezone)}`)
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [city, timezone])

  return label
}

export default function AmbientClock() {
  const label = useCityTime('COLOMBO', 'Asia/Colombo')

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
