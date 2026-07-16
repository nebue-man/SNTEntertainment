'use client'

import { useEffect, useState } from 'react'

export default function AmbientClock() {
  const [time, setTime] = useState('')

  useEffect(() => {
    function update() {
      const now = new Date()
      const hh = String(now.getHours()).padStart(2, '0')
      const mm = String(now.getMinutes()).padStart(2, '0')
      const ss = String(now.getSeconds()).padStart(2, '0')
      setTime(`COLOMBO_${hh}:${mm}:${ss}`)
    }
    update()
    const id = setInterval(update, 1000)
    return () => clearInterval(id)
  }, [])

  if (!time) return null

  return (
    <span
      className="text-caption font-light tracking-widest tabular-nums"
      style={{ color: 'var(--color-pewter)', opacity: 0.6 }}
      aria-hidden="true"
    >
      {time}
    </span>
  )
}
