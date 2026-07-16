'use client'
import { useEffect, useState, useCallback } from 'react'
import { getTicketRequests, getAdminEvents, updateTicketStatus, type TicketRequest, type AdminEvent } from '@/lib/adminApi'

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'text-yellow-400 border-yellow-400/40',
  CONFIRMED: 'text-[#d3fd50] border-[#d3fd50]/40',
  REJECTED: 'text-red-400 border-red-400/40',
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`inline-block text-[10px] tracking-[0.12em] uppercase px-2 py-0.5 border ${STATUS_COLORS[status] ?? 'text-white/30 border-white/10'}`}>
      {status}
    </span>
  )
}

export default function TicketRequestsPage() {
  const [requests, setRequests] = useState<TicketRequest[]>([])
  const [events, setEvents] = useState<AdminEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filterEvent, setFilterEvent] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [notesModal, setNotesModal] = useState<{ id: string; action: 'CONFIRMED' | 'REJECTED' } | null>(null)
  const [adminNotes, setAdminNotes] = useState('')
  const [updating, setUpdating] = useState(false)
  const LIMIT = 20

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [reqRes, evtRes] = await Promise.all([
        getTicketRequests({ eventId: filterEvent || undefined, status: filterStatus || undefined, page }),
        events.length === 0 ? getAdminEvents() : Promise.resolve(null),
      ])
      setRequests(reqRes.data)
      setTotal(reqRes.meta.total)
      if (evtRes) setEvents(evtRes.data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load')
    } finally {
      setLoading(false)
    }
  }, [filterEvent, filterStatus, page])

  useEffect(() => { load() }, [load])

  async function handleStatusUpdate() {
    if (!notesModal) return
    setUpdating(true)
    try {
      await updateTicketStatus(notesModal.id, notesModal.action, adminNotes || undefined)
      setNotesModal(null)
      setAdminNotes('')
      load()
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Update failed')
    } finally {
      setUpdating(false)
    }
  }

  const selectCls = 'bg-transparent border border-[#4d4d4d] px-3 py-2 text-sm focus:outline-none focus:border-white text-white'

  return (
    <div>
      <div className="px-8 py-6 border-b border-[#4d4d4d]">
        <h1 className="text-xl font-light tracking-wide">Ticket Requests</h1>
      </div>

      {/* Filters */}
      <div className="px-8 py-4 border-b border-[#4d4d4d]/50 flex gap-3 items-center flex-wrap">
        <select
          value={filterEvent}
          onChange={e => { setFilterEvent(e.target.value); setPage(1) }}
          className={`${selectCls} min-w-[200px]`}
        >
          <option value="">All Events</option>
          {events.map(e => <option key={e.id} value={e.id}>{e.title}</option>)}
        </select>

        <select
          value={filterStatus}
          onChange={e => { setFilterStatus(e.target.value); setPage(1) }}
          className={selectCls}
        >
          <option value="">All Statuses</option>
          <option value="PENDING">Pending</option>
          <option value="CONFIRMED">Confirmed</option>
          <option value="REJECTED">Rejected</option>
        </select>

        <span className="text-white/30 text-sm ml-auto">{total} total</span>
      </div>

      <div className="p-8">
        {loading && <div className="text-white/30 text-sm">Loading…</div>}
        {error && <div className="text-red-400 text-sm">{error}</div>}

        {!loading && requests.length === 0 && (
          <div className="text-white/30 text-sm">No requests found.</div>
        )}

        {!loading && requests.length > 0 && (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#4d4d4d]">
                {['Email', 'Event', 'Phase', 'Price', 'Date', 'Status', 'Actions'].map(h => (
                  <th key={h} className="text-left px-3 py-3 text-[10px] tracking-[0.2em] uppercase text-white/30 font-normal first:pl-0 last:pr-0">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {requests.map(req => (
                <tr key={req.id} className="border-b border-[#4d4d4d]/40 hover:bg-white/[0.02] transition-colors">
                  <td className="px-3 py-3.5 first:pl-0 font-light text-white/80">{req.email}</td>
                  <td className="px-3 py-3.5 text-white/50 max-w-[160px] truncate">{req.event.title}</td>
                  <td className="px-3 py-3.5 text-white/50">{req.phase.name}</td>
                  <td className="px-3 py-3.5 text-white/50 whitespace-nowrap">LKR {Number(req.priceAtRequest).toLocaleString()}</td>
                  <td className="px-3 py-3.5 text-white/50 whitespace-nowrap">{fmtDate(req.createdAt)}</td>
                  <td className="px-3 py-3.5"><StatusBadge status={req.status} /></td>
                  <td className="px-3 py-3.5 last:pr-0">
                    {req.status === 'PENDING' && (
                      <div className="flex gap-3">
                        <button
                          onClick={() => { setNotesModal({ id: req.id, action: 'CONFIRMED' }); setAdminNotes('') }}
                          className="text-[11px] text-[#d3fd50] hover:underline"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => { setNotesModal({ id: req.id, action: 'REJECTED' }); setAdminNotes('') }}
                          className="text-[11px] text-red-400 hover:underline"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                    {req.adminNotes && req.status !== 'PENDING' && (
                      <span className="text-white/20 text-[11px] italic truncate max-w-[120px] block" title={req.adminNotes}>
                        {req.adminNotes}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Pagination */}
        {total > LIMIT && (
          <div className="flex gap-2 items-center mt-6">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 border border-[#4d4d4d] text-xs text-white/40 hover:border-white hover:text-white disabled:opacity-20 transition-colors"
            >
              ← Prev
            </button>
            <span className="text-white/30 text-sm px-2">Page {page} of {Math.ceil(total / LIMIT)}</span>
            <button
              onClick={() => setPage(p => p + 1)}
              disabled={page >= Math.ceil(total / LIMIT)}
              className="px-3 py-1.5 border border-[#4d4d4d] text-xs text-white/40 hover:border-white hover:text-white disabled:opacity-20 transition-colors"
            >
              Next →
            </button>
          </div>
        )}
      </div>

      {/* Confirm/Reject modal */}
      {notesModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-[#0a0a0a] border border-[#4d4d4d] w-full max-w-md p-6 space-y-4">
            <h2 className="text-sm tracking-widest uppercase text-white/60">
              {notesModal.action === 'CONFIRMED' ? 'Confirm' : 'Reject'} Request
            </h2>
            <div>
              <label className="block text-[11px] tracking-[0.2em] uppercase text-white/40 mb-2">
                Admin Notes <span className="normal-case text-white/20">(optional)</span>
              </label>
              <textarea
                value={adminNotes}
                onChange={e => setAdminNotes(e.target.value)}
                rows={3}
                placeholder={notesModal.action === 'CONFIRMED' ? 'e.g. Payment verified.' : 'e.g. Payment not received.'}
                className="w-full bg-transparent border border-[#4d4d4d] px-4 py-2.5 text-sm focus:outline-none focus:border-white transition-colors resize-none"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleStatusUpdate}
                disabled={updating}
                className={`px-5 py-2.5 text-[11px] tracking-[0.2em] uppercase transition-colors disabled:opacity-40 ${
                  notesModal.action === 'CONFIRMED'
                    ? 'bg-[#d3fd50] text-black hover:opacity-80'
                    : 'bg-red-600 text-white hover:opacity-80'
                }`}
              >
                {updating ? 'Saving…' : notesModal.action === 'CONFIRMED' ? 'Confirm' : 'Reject'}
              </button>
              <button
                onClick={() => setNotesModal(null)}
                className="px-5 py-2.5 border border-[#4d4d4d] text-white/40 text-[11px] tracking-[0.2em] uppercase hover:border-white hover:text-white transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
