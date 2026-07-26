'use client'

import { Suspense, useEffect, useState, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import { getPastEventsWithMedia } from '@/lib/api'
import PastEventsCoverflow from '@/components/events/PastEventsCoverflow'
import LoadingGate from '@/components/ui/LoadingGate'
import type { PastApiEvent } from '@/lib/types'

function PastEventsContent() {
  const searchParams = useSearchParams()
  const initialSlug = searchParams.get('event') ?? undefined
  const [events, setEvents] = useState<PastApiEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const fetchData = useCallback(() => {
    setLoading(true)
    setError(false)

    const timeout = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('timeout')), 12000)
    )

    Promise.race([getPastEventsWithMedia(), timeout])
      .then((data) => {
        setEvents(data)
        setLoading(false)
      })
      .catch(() => {
        setError(true)
        setLoading(false)
      })
  }, [])

  useEffect(() => {
    document.title = 'Past Events | SNT Live Events'
    fetchData()
  }, [fetchData])

  return (
    <>
      <LoadingGate loading={loading} error={error} onRetry={fetchData} />
      <main className="min-h-screen bg-black">
        <PastEventsCoverflow events={events} initialSlug={initialSlug} />
      </main>
    </>
  )
}

export default function PastEventsPage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-black" />}>
      <PastEventsContent />
    </Suspense>
  )
}
