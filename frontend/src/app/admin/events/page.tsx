'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getAdminEvents, deleteEvent, type AdminEvent } from '@/lib/adminApi'

function StatusBadge({ status }: { status: 'UPCOMING' | 'PAST' }) {
  return (
    <span
      className={`inline-block text-[10px] tracking-[0.15em] uppercase px-2.5 py-0.5 ${
        status === 'UPCOMING'
          ? 'text-[#d3fd50] border border-[#d3fd50]/40'
          : 'text-white/30 border border-white/10'
      }`}
    >
      {status}
    </span>
  )
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function AdminEventsPage() {
  const [events, setEvents] = useState<AdminEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function load() {
    try {
      const res = await getAdminEvents()
      setEvents(res.data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load events')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  async function handleDelete(event: AdminEvent) {
    if (!confirm(`Delete "${event.title}"? This also deletes all artists, phases and media.`)) return
    try {
      await deleteEvent(event.id)
      setEvents(prev => prev.filter(e => e.id !== event.id))
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Delete failed')
    }
  }

  return (
    <div>
      {/* Page header */}
      <div className="px-8 py-6 border-b border-[#4d4d4d] flex items-center justify-between">
        <h1 className="text-xl font-light tracking-wide">Events</h1>
        <Link
          href="/admin/events/new"
          className="px-5 py-2.5 bg-[#d3fd50] text-black text-[11px] tracking-[0.2em] uppercase hover:opacity-80 transition-opacity"
        >
          New Event
        </Link>
      </div>

      <div className="p-8">
        {loading && (
          <div className="text-white/30 text-sm">Loading…</div>
        )}

        {error && (
          <div className="text-red-400 text-sm">{error}</div>
        )}

        {!loading && !error && events.length === 0 && (
          <div className="text-white/30 text-sm">No events yet. <Link href="/admin/events/new" className="text-[#d3fd50] hover:underline">Create one</Link>.</div>
        )}

        {!loading && events.length > 0 && (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#4d4d4d]">
                {['Title', 'Status', 'Date', 'Venue', 'Requests', ''].map(h => (
                  <th
                    key={h}
                    className="text-left px-4 py-3 text-[10px] tracking-[0.2em] uppercase text-white/30 font-normal first:pl-0 last:pr-0"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {events.map(event => (
                <tr key={event.id} className="border-b border-[#4d4d4d]/50 hover:bg-white/[0.02] transition-colors">
                  <td className="px-4 py-4 first:pl-0 font-light">
                    <Link href={`/admin/events/${event.id}`} className="hover:text-[#d3fd50] transition-colors">
                      {event.title}
                    </Link>
                  </td>
                  <td className="px-4 py-4">
                    <StatusBadge status={event.status} />
                  </td>
                  <td className="px-4 py-4 text-white/50 whitespace-nowrap">{fmtDate(event.eventDate)}</td>
                  <td className="px-4 py-4 text-white/50">{event.venue}</td>
                  <td className="px-4 py-4 text-white/50 text-center">{event._count.ticketRequests}</td>
                  <td className="px-4 py-4 last:pr-0">
                    <div className="flex items-center gap-4 justify-end">
                      <Link
                        href={`/admin/events/${event.id}`}
                        className="text-[12px] text-white/40 hover:text-white transition-colors"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(event)}
                        className="text-[12px] text-white/20 hover:text-red-400 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
