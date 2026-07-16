'use client'
import { use, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { toDateTimeLocal } from '@/lib/dateUtils'
import {
  getAdminEvent,
  updateEvent,
  replaceArtists,
  createPhase,
  updatePhase,
  deletePhase,
  uploadPhotosWithProgress,
  reorderMedia,
  deleteMedia,
  type AdminEventDetail,
  type Artist,
  type Phase,
  type MediaItem,
} from '@/lib/adminApi'

const inputCls = 'w-full bg-transparent border border-[#4d4d4d] px-4 py-2.5 text-sm focus:outline-none focus:border-white transition-colors'
const labelCls = 'block text-[11px] tracking-[0.2em] uppercase text-white/40 mb-2'

// ── Details Tab ────────────────────────────────────────────────────────────────

function DetailsTab({ event, onSaved }: { event: AdminEventDetail; onSaved: () => void }) {
  const [fields, setFields] = useState({
    title: event.title,
    slug: event.slug,
    description: event.description,
    venue: event.venue,
    status: event.status,
  })
  const dateRef = useRef<HTMLInputElement>(null)
  const [flyer, setFlyer] = useState<File | null>(null)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

  function set(k: keyof typeof fields) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setFields(prev => ({ ...prev, [k]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setMsg('')
    try {
      const form = new FormData()
      Object.entries(fields).forEach(([k, v]) => form.append(k, v))
      const rawDate = dateRef.current?.value
      if (rawDate) form.append('eventDate', new Date(rawDate).toISOString())
      if (flyer) form.append('flyer', flyer)
      await updateEvent(event.id, form)
      setMsg('Saved.')
      onSaved()
    } catch (err) {
      setMsg(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      <div>
        <label className={labelCls}>Title</label>
        <input value={fields.title} onChange={set('title')} required className={inputCls} />
      </div>
      <div>
        <label className={labelCls}>Slug</label>
        <input value={fields.slug} onChange={set('slug')} required className={inputCls} />
      </div>
      <div>
        <label className={labelCls}>Description</label>
        <textarea value={fields.description} onChange={set('description')} required rows={4} className={`${inputCls} resize-none`} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Venue</label>
          <input value={fields.venue} onChange={set('venue')} required className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Status</label>
          <select value={fields.status} onChange={set('status')} className={`${inputCls} bg-black`}>
            <option value="UPCOMING">Upcoming</option>
            <option value="PAST">Past</option>
          </select>
        </div>
      </div>
      <div>
        <label className={labelCls}>Event Date &amp; Time</label>
        <input
          key={event.eventDate}
          type="datetime-local"
          defaultValue={toDateTimeLocal(event.eventDate)}
          ref={dateRef}
          required
          className={`${inputCls} [color-scheme:dark]`}
        />
      </div>
      <div>
        <label className={labelCls}>Flyer <span className="normal-case text-white/20">(upload to replace)</span></label>
        {event.flyerUrl && (
          <div className="mb-3">
            <img src={event.flyerUrl} alt="Current flyer" className="h-24 object-contain opacity-60" />
          </div>
        )}
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={e => setFlyer(e.target.files?.[0] ?? null)}
          className="w-full text-sm text-white/50 file:mr-4 file:py-2 file:px-4 file:border file:border-[#4d4d4d] file:bg-transparent file:text-white/50 file:text-xs file:tracking-widest file:uppercase hover:file:border-white hover:file:text-white file:transition-colors"
        />
      </div>
      <div className="flex items-center gap-4">
        <button type="submit" disabled={saving} className="px-6 py-2.5 bg-[#d3fd50] text-black text-[11px] tracking-[0.2em] uppercase hover:opacity-80 transition-opacity disabled:opacity-40">
          {saving ? 'Saving…' : 'Save Changes'}
        </button>
        {msg && <span className={`text-sm ${msg === 'Saved.' ? 'text-[#d3fd50]' : 'text-red-400'}`}>{msg}</span>}
      </div>
    </form>
  )
}

// ── Artists Tab ────────────────────────────────────────────────────────────────

function ArtistsTab({ event, onSaved }: { event: AdminEventDetail; onSaved: () => void }) {
  const [rows, setRows] = useState<{ name: string; role: string }[]>(
    event.artists.map(a => ({ name: a.name, role: a.role }))
  )
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

  function setRow(i: number, k: 'name' | 'role', v: string) {
    setRows(prev => prev.map((r, idx) => idx === i ? { ...r, [k]: v } : r))
  }

  async function handleSave() {
    setSaving(true)
    setMsg('')
    try {
      await replaceArtists(event.id, rows.filter(r => r.name.trim()))
      setMsg('Saved.')
      onSaved()
    } catch (err) {
      setMsg(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-2xl space-y-4">
      <div className="space-y-2">
        {rows.map((row, i) => (
          <div key={i} className="flex gap-3 items-center">
            <input
              value={row.name}
              onChange={e => setRow(i, 'name', e.target.value)}
              placeholder="Artist name"
              className={`${inputCls} flex-1`}
            />
            <input
              value={row.role}
              onChange={e => setRow(i, 'role', e.target.value)}
              placeholder="Role (Headliner / Supporting Act)"
              className={`${inputCls} w-[220px]`}
            />
            <button
              type="button"
              onClick={() => setRows(prev => prev.filter((_, idx) => idx !== i))}
              className="text-white/20 hover:text-red-400 transition-colors text-lg leading-none"
            >
              ×
            </button>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={() => setRows(prev => [...prev, { name: '', role: '' }])}
        className="text-[11px] tracking-[0.15em] uppercase text-white/40 hover:text-white transition-colors border border-[#4d4d4d] hover:border-white px-4 py-2"
      >
        + Add Artist
      </button>

      <div className="flex items-center gap-4 pt-2">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2.5 bg-[#d3fd50] text-black text-[11px] tracking-[0.2em] uppercase hover:opacity-80 transition-opacity disabled:opacity-40"
        >
          {saving ? 'Saving…' : 'Save Artists'}
        </button>
        {msg && <span className={`text-sm ${msg === 'Saved.' ? 'text-[#d3fd50]' : 'text-red-400'}`}>{msg}</span>}
      </div>
    </div>
  )
}

// ── Phases Tab ─────────────────────────────────────────────────────────────────

function PhasesTab({ event, onSaved }: { event: AdminEventDetail; onSaved: () => void }) {
  const [phases, setPhases] = useState<Phase[]>(event.phases)
  const [editing, setEditing] = useState<string | null>(null)
  const [editVals, setEditVals] = useState<Partial<Phase>>({})
  const [adding, setAdding] = useState(false)
  const [newPhase, setNewPhase] = useState({ name: '', price: '', quantityAvailable: '', sortOrder: String(event.phases.length), isActive: true })
  const [msg, setMsg] = useState('')

  function setEV(k: keyof typeof editVals) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setEditVals(prev => ({ ...prev, [k]: e.target.value }))
  }

  async function handleUpdate(phase: Phase) {
    setMsg('')
    try {
      const res = await updatePhase(event.id, phase.id, {
        name: editVals.name ?? phase.name,
        price: Number(editVals.price ?? phase.price),
        quantityAvailable: Number(editVals.quantityAvailable ?? phase.quantityAvailable),
        isActive: editVals.isActive !== undefined ? editVals.isActive : phase.isActive,
        sortOrder: Number(editVals.sortOrder ?? phase.sortOrder),
      })
      setPhases(prev => prev.map(p => p.id === phase.id ? res.data : p))
      setEditing(null)
      setMsg('Saved.')
      onSaved()
    } catch (err) {
      setMsg(err instanceof Error ? err.message : 'Save failed')
    }
  }

  async function handleDelete(phaseId: string) {
    if (!confirm('Delete this phase?')) return
    setMsg('')
    try {
      await deletePhase(event.id, phaseId)
      setPhases(prev => prev.filter(p => p.id !== phaseId))
      onSaved()
    } catch (err) {
      setMsg(err instanceof Error ? err.message : 'Delete failed')
    }
  }

  async function handleAdd() {
    setMsg('')
    try {
      const res = await createPhase(event.id, {
        name: newPhase.name,
        price: Number(newPhase.price),
        quantityAvailable: Number(newPhase.quantityAvailable),
        sortOrder: Number(newPhase.sortOrder),
        isActive: newPhase.isActive,
      })
      setPhases(prev => [...prev, res.data])
      setAdding(false)
      setNewPhase({ name: '', price: '', quantityAvailable: '', sortOrder: String(phases.length + 1), isActive: true })
      onSaved()
    } catch (err) {
      setMsg(err instanceof Error ? err.message : 'Failed to add phase')
    }
  }

  const thCls = 'text-left text-[10px] tracking-[0.2em] uppercase text-white/30 font-normal pb-3 px-3 first:pl-0'
  const tdCls = 'px-3 py-3 text-sm first:pl-0'

  return (
    <div className="max-w-3xl space-y-6">
      {msg && <p className={`text-sm ${msg === 'Saved.' ? 'text-[#d3fd50]' : 'text-red-400'}`}>{msg}</p>}

      {phases.length > 0 && (
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#4d4d4d]">
              {['Name', 'Price', 'Sold / Avail', 'Active', 'Order', ''].map(h => (
                <th key={h} className={thCls}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {phases.map(phase => (
              <tr key={phase.id} className="border-b border-[#4d4d4d]/40">
                {editing === phase.id ? (
                  <>
                    <td className={tdCls}><input defaultValue={phase.name} onChange={setEV('name')} className={`${inputCls} py-1.5`} /></td>
                    <td className={tdCls}><input defaultValue={phase.price} onChange={setEV('price')} type="number" className={`${inputCls} py-1.5 w-28`} /></td>
                    <td className={tdCls}>
                      <span className="text-white/30">{phase.quantitySold} / </span>
                      <input defaultValue={phase.quantityAvailable} onChange={setEV('quantityAvailable')} type="number" className={`${inputCls} py-1.5 w-20 inline-block`} />
                    </td>
                    <td className={tdCls}>
                      <select defaultValue={String(phase.isActive)} onChange={e => setEditVals(prev => ({ ...prev, isActive: e.target.value === 'true' }))} className={`${inputCls} py-1.5 bg-black w-24`}>
                        <option value="true">Yes</option>
                        <option value="false">No</option>
                      </select>
                    </td>
                    <td className={tdCls}><input defaultValue={phase.sortOrder} onChange={setEV('sortOrder')} type="number" className={`${inputCls} py-1.5 w-16`} /></td>
                    <td className={`${tdCls} text-right`}>
                      <button onClick={() => handleUpdate(phase)} className="text-[#d3fd50] text-xs mr-3">Save</button>
                      <button onClick={() => setEditing(null)} className="text-white/30 text-xs">Cancel</button>
                    </td>
                  </>
                ) : (
                  <>
                    <td className={tdCls}>{phase.name}</td>
                    <td className={tdCls}>LKR {Number(phase.price).toLocaleString()}</td>
                    <td className={tdCls}><span className="text-[#d3fd50]">{phase.quantitySold}</span><span className="text-white/30"> / {phase.quantityAvailable}</span></td>
                    <td className={tdCls}><span className={phase.isActive ? 'text-[#d3fd50]' : 'text-white/30'}>{phase.isActive ? 'Yes' : 'No'}</span></td>
                    <td className={tdCls}>{phase.sortOrder}</td>
                    <td className={`${tdCls} text-right`}>
                      <button onClick={() => { setEditing(phase.id); setEditVals({}) }} className="text-white/40 hover:text-white text-xs mr-3 transition-colors">Edit</button>
                      <button onClick={() => handleDelete(phase.id)} className="text-white/20 hover:text-red-400 text-xs transition-colors">Delete</button>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {adding ? (
        <div className="border border-[#4d4d4d] p-5 space-y-4">
          <p className="text-[11px] tracking-[0.2em] uppercase text-white/40">New Phase</p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Name</label>
              <input value={newPhase.name} onChange={e => setNewPhase(p => ({ ...p, name: e.target.value }))} className={inputCls} placeholder="Early Bird" />
            </div>
            <div>
              <label className={labelCls}>Price (LKR)</label>
              <input value={newPhase.price} onChange={e => setNewPhase(p => ({ ...p, price: e.target.value }))} type="number" className={inputCls} placeholder="2500" />
            </div>
            <div>
              <label className={labelCls}>Quantity Available</label>
              <input value={newPhase.quantityAvailable} onChange={e => setNewPhase(p => ({ ...p, quantityAvailable: e.target.value }))} type="number" className={inputCls} placeholder="200" />
            </div>
            <div>
              <label className={labelCls}>Sort Order</label>
              <input value={newPhase.sortOrder} onChange={e => setNewPhase(p => ({ ...p, sortOrder: e.target.value }))} type="number" className={inputCls} />
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={handleAdd} className="px-5 py-2 bg-[#d3fd50] text-black text-[11px] tracking-[0.2em] uppercase hover:opacity-80 transition-opacity">Add</button>
            <button onClick={() => setAdding(false)} className="px-5 py-2 border border-[#4d4d4d] text-white/40 text-[11px] tracking-[0.2em] uppercase hover:border-white hover:text-white transition-colors">Cancel</button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setAdding(true)}
          className="text-[11px] tracking-[0.15em] uppercase text-white/40 hover:text-white border border-[#4d4d4d] hover:border-white px-4 py-2 transition-colors"
        >
          + Add Phase
        </button>
      )}
    </div>
  )
}

// ── Media Tab ──────────────────────────────────────────────────────────────────

function MediaTab({ event, onSaved }: { event: AdminEventDetail; onSaved: () => void }) {
  const [items, setItems] = useState<MediaItem[]>(event.media)
  const [uploading, setUploading] = useState(false)
  const [msg, setMsg] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setMsg('')
    try {
      const res = await uploadPhotosWithProgress(event.id, [file], () => {})
      setItems(prev => [...prev, ...res.data])
      onSaved()
    } catch (err) {
      setMsg(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  async function handleDelete(item: MediaItem) {
    if (!confirm('Delete this media item?')) return
    setMsg('')
    try {
      await deleteMedia(event.id, item.id)
      setItems(prev => prev.filter(m => m.id !== item.id))
      onSaved()
    } catch (err) {
      setMsg(err instanceof Error ? err.message : 'Delete failed')
    }
  }

  async function handleMove(index: number, dir: -1 | 1) {
    const newItems = [...items]
    const target = index + dir
    if (target < 0 || target >= newItems.length) return
    ;[newItems[index], newItems[target]] = [newItems[target], newItems[index]]
    setItems(newItems)
    try {
      await reorderMedia(event.id, newItems.map(m => m.id))
    } catch (err) {
      setMsg(err instanceof Error ? err.message : 'Reorder failed')
    }
  }

  return (
    <div className="max-w-3xl space-y-6">
      {msg && <p className="text-red-400 text-sm">{msg}</p>}

      <div className="flex items-center gap-4">
        <button
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="px-5 py-2.5 border border-[#d3fd50] text-[#d3fd50] text-[11px] tracking-[0.2em] uppercase hover:bg-[#d3fd50] hover:text-black transition-colors disabled:opacity-40"
        >
          {uploading ? 'Uploading…' : '+ Upload Media'}
        </button>
        <span className="text-white/30 text-xs">JPG, PNG, WEBP, MP4, MOV — max 50 MB</span>
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,video/mp4,video/quicktime"
          onChange={handleUpload}
          className="hidden"
        />
      </div>

      {items.length === 0 && (
        <p className="text-white/30 text-sm">No media yet. Upload images or videos above.</p>
      )}

      <div className="grid grid-cols-3 gap-4">
        {items.map((item, i) => (
          <div key={item.id} className="relative group border border-[#4d4d4d] overflow-hidden">
            {item.type === 'PHOTO' ? (
              <img src={item.url} alt="" className="w-full aspect-video object-cover" />
            ) : (
              <div className="w-full aspect-video bg-[#111] flex items-center justify-center">
                <span className="text-white/30 text-xs tracking-widest uppercase">Video</span>
              </div>
            )}
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <button
                onClick={() => handleMove(i, -1)}
                disabled={i === 0}
                className="text-white/60 hover:text-white disabled:opacity-20 text-lg"
                title="Move left"
              >←</button>
              <button
                onClick={() => handleDelete(item)}
                className="text-red-400/80 hover:text-red-400 text-xs border border-red-400/40 hover:border-red-400 px-2 py-1 transition-colors"
              >
                Delete
              </button>
              <button
                onClick={() => handleMove(i, 1)}
                disabled={i === items.length - 1}
                className="text-white/60 hover:text-white disabled:opacity-20 text-lg"
                title="Move right"
              >→</button>
            </div>
            <div className="px-2 py-1 border-t border-[#4d4d4d] flex justify-between items-center">
              <span className="text-[10px] text-white/30 uppercase tracking-wide">{item.type}</span>
              <span className="text-[10px] text-white/20">{i + 1}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Page ───────────────────────────────────────────────────────────────────────

const TABS = ['Details', 'Artists', 'Phases', 'Media'] as const
type Tab = typeof TABS[number]


export default function EventEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [event, setEvent] = useState<AdminEventDetail | null>(null)
  const [tab, setTab] = useState<Tab>('Details')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function load() {
    try {
      const res = await getAdminEvent(id)
      setEvent(res.data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load event')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [id])

  if (loading) return <div className="p-8 text-white/30 text-sm">Loading…</div>
  if (error || !event) return <div className="p-8 text-red-400 text-sm">{error || 'Not found'}</div>

  return (
    <div>
      {/* Header */}
      <div className="px-8 py-6 border-b border-[#4d4d4d]">
        <div className="flex items-center gap-4 mb-1">
          <Link href="/admin/events" className="text-white/30 hover:text-white transition-colors text-sm">
            ← Events
          </Link>
        </div>
        <h1 className="text-xl font-light tracking-wide">{event.title}</h1>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#4d4d4d] px-8">
        {TABS.map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`py-3 px-5 text-[12px] tracking-[0.15em] uppercase transition-colors border-b-2 -mb-[1px] ${
              tab === t
                ? 'border-[#d3fd50] text-[#d3fd50]'
                : 'border-transparent text-white/40 hover:text-white'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="p-8">
        {tab === 'Details' && <DetailsTab event={event} onSaved={load} />}
        {tab === 'Artists' && <ArtistsTab event={event} onSaved={load} />}
        {tab === 'Phases'  && <PhasesTab  event={event} onSaved={load} />}
        {tab === 'Media'   && <MediaTab   event={event} onSaved={load} />}
      </div>
    </div>
  )
}
