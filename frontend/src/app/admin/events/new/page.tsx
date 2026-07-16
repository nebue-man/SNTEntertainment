'use client'
import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createEvent } from '@/lib/adminApi'

const inputCls = 'w-full bg-transparent border border-[#4d4d4d] px-4 py-2.5 text-sm focus:outline-none focus:border-white transition-colors'
const labelCls = 'block text-[11px] tracking-[0.2em] uppercase text-white/40 mb-2'

export default function NewEventPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [flyer, setFlyer] = useState<File | null>(null)
  const dateRef = useRef<HTMLInputElement>(null)

  const [fields, setFields] = useState({
    title: '',
    slug: '',
    description: '',
    venue: '',
    status: 'UPCOMING',
  })

  function set(k: keyof typeof fields) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setFields(prev => ({ ...prev, [k]: e.target.value }))
  }

  function autoSlug(title: string) {
    return title.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSaving(true)
    try {
      const form = new FormData()
      form.append('title', fields.title)
      form.append('slug', fields.slug || autoSlug(fields.title))
      form.append('description', fields.description)
      form.append('venue', fields.venue)
      form.append('eventDate', new Date(dateRef.current?.value || '').toISOString())
      form.append('status', fields.status)
      if (flyer) form.append('flyer', flyer)

      const res = await createEvent(form)
      router.push(`/admin/events/${res.data.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create event')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <div className="px-8 py-6 border-b border-[#4d4d4d] flex items-center gap-4">
        <Link href="/admin/events" className="text-white/30 hover:text-white transition-colors text-sm">
          ← Events
        </Link>
        <h1 className="text-xl font-light tracking-wide">New Event</h1>
      </div>

      <div className="p-8 max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className={labelCls}>Title</label>
            <input
              value={fields.title}
              onChange={set('title')}
              required
              className={inputCls}
              placeholder="Sound of Colombo 2026"
            />
          </div>

          <div>
            <label className={labelCls}>Slug <span className="normal-case text-white/20">(auto-generated if blank)</span></label>
            <input
              value={fields.slug}
              onChange={set('slug')}
              className={inputCls}
              placeholder={fields.title ? autoSlug(fields.title) : 'sound-of-colombo-2026'}
            />
          </div>

          <div>
            <label className={labelCls}>Description</label>
            <textarea
              value={fields.description}
              onChange={set('description')}
              required
              rows={4}
              className={`${inputCls} resize-none`}
            />
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
              type="datetime-local"
              ref={dateRef}
              required
              className={`${inputCls} [color-scheme:dark]`}
            />
          </div>

          <div>
            <label className={labelCls}>Flyer <span className="normal-case text-white/20">(optional — JPG, PNG, WEBP)</span></label>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={e => setFlyer(e.target.files?.[0] ?? null)}
              className="w-full text-sm text-white/50 file:mr-4 file:py-2 file:px-4 file:border file:border-[#4d4d4d] file:bg-transparent file:text-white/50 file:text-xs file:tracking-widest file:uppercase hover:file:border-white hover:file:text-white file:transition-colors"
            />
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-[#d3fd50] text-black text-[11px] tracking-[0.2em] uppercase hover:opacity-80 transition-opacity disabled:opacity-40"
            >
              {saving ? 'Creating…' : 'Create Event'}
            </button>
            <Link
              href="/admin/events"
              className="px-6 py-2.5 border border-[#4d4d4d] text-white/50 text-[11px] tracking-[0.2em] uppercase hover:border-white hover:text-white transition-colors"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
